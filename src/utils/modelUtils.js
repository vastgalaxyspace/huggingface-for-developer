// src/utils/modelUtils.js

// Parse model size from name
export const parseModelSize = (modelId) => {
  if (!modelId) return null;
  let paramsInB = null;
  const matchB = modelId.match(/(?:^|[-_])(\d+(?:\.\d+)?)[bB](?:[-_]|$)/);
  const matchM = modelId.match(/(?:^|[-_])(\d+(?:\.\d+)?)[mM](?:[-_]|$)/);
  const matchB_generic = modelId.match(/(\d+(?:\.\d+)?)\s*[bB]/);
  const matchM_generic = modelId.match(/(\d+(?:\.\d+)?)\s*[mM](?!in)/);

  if (matchB) paramsInB = parseFloat(matchB[1]);
  else if (matchM) paramsInB = parseFloat(matchM[1]) / 1000;
  else if (matchB_generic) paramsInB = parseFloat(matchB_generic[1]);
  else if (matchM_generic) paramsInB = parseFloat(matchM_generic[1]) / 1000;

  if (paramsInB === null) return null;

  if (paramsInB >= 1000) return `${(paramsInB / 1000).toFixed(1).replace(/\.0$/, '')}T`;
  if (paramsInB >= 1) return `${paramsInB.toFixed(1).replace(/\.0$/, '')}B`;
  return `${(paramsInB * 1000).toFixed(0)}M`;
};

export const formatNumber = (num) => {
  if (!num) return '0';
  const n = typeof num === 'string' ? parseFloat(num) : num;
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n.toString();
};

const detectArchitecture = (model) => {
  const haystack = [
    model.id,
    ...(model.tags || []),
    model.library_name,
    model.transformersInfo?.auto_model,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  if (haystack.includes('qwen')) return 'Qwen';
  if (haystack.includes('mistral') || haystack.includes('mixtral')) return 'Mistral';
  if (haystack.includes('llama')) return 'Llama';
  if (haystack.includes('phi')) return 'Phi';
  if (haystack.includes('gemma')) return 'Gemma';
  if (haystack.includes('transformer')) return 'Transformer';
  return 'Transformer';
};

const detectLicense = (model) => {
  const rawLicense = String(model.license || '').toLowerCase();
  const tagText = (model.tags || []).join(' ').toLowerCase();
  const haystack = `${rawLicense} ${tagText} ${String(model.id || '').toLowerCase()}`;

  if (haystack.includes('apache')) return 'Apache-2.0';
  if (haystack.includes('mit')) return 'MIT';
  if (haystack.includes('llama')) return 'Llama-3';
  if (haystack.includes('creativeml') || haystack.includes('openrail') || haystack.includes('stable-diffusion')) return 'CreativeML';
  if (haystack.includes('gemma')) return 'Gemma';
  return model.license || 'Other';
};

export const enrichModelData = (model) => {
  if (!model || !model.id) return model;
  let paramsInB = null;
  const matchB = model.id.match(/(?:^|[-_])(\d+(?:\.\d+)?)[bB](?:[-_]|$)/);
  const matchM = model.id.match(/(?:^|[-_])(\d+(?:\.\d+)?)[mM](?:[-_]|$)/);
  const matchB_generic = model.id.match(/(\d+(?:\.\d+)?)\s*[bB]/);
  const matchM_generic = model.id.match(/(\d+(?:\.\d+)?)\s*[mM](?!in)/);

  if (matchB) paramsInB = parseFloat(matchB[1]);
  else if (matchM) paramsInB = parseFloat(matchM[1]) / 1000;
  else if (matchB_generic) paramsInB = parseFloat(matchB_generic[1]);
  else if (matchM_generic) paramsInB = parseFloat(matchM_generic[1]) / 1000;

  if (paramsInB === null) {
    if (model.id.toLowerCase().includes('phi-3')) paramsInB = 3.8;
    else if (model.id.toLowerCase().includes('phi-4')) paramsInB = 14;
    else if (model.id.toLowerCase().includes('mixtral-8x7b')) paramsInB = 46.7; // Example specific handler
    else paramsInB = 7;
  }

  const formatParams = (b) => {
    if (b >= 1000) return `${(b / 1000).toFixed(1).replace(/\.0$/, '')}T`;
    if (b >= 1) return `${b.toFixed(1).replace(/\.0$/, '')}B`;
    return `${(b * 1000).toFixed(0)}M`;
  };

  const isCommercial = model.tags?.some((tag) =>
    ['mit', 'apache-2.0', 'openrail', 'cc-by'].includes(tag.toLowerCase())
  ) ?? true;
  
  let estimatedContext = 4096;
  if (model.id.includes('128k') || model.id.includes('128K')) estimatedContext = 128000;
  else if (model.id.includes('32k') || model.id.includes('32K')) estimatedContext = 32000;
  else if (model.id.includes('16k') || model.id.includes('16K')) estimatedContext = 16000;
  else if (model.id.includes('8k') || model.id.includes('8K')) estimatedContext = 8000;

  const licenseDisp = detectLicense(model);
  const architectureLabel = detectArchitecture(model);

  let pipelineText = 'Other';
  const rawTag = model.pipeline_tag || '';
  if (rawTag === 'text-generation' || model.id.includes('Llama') || model.id.includes('Mistral')) pipelineText = 'Text Generation';
  else if (rawTag === 'text-to-image' || model.id.includes('diffusion')) pipelineText = 'Text-to-Image';
  else if (rawTag === 'image-to-text') pipelineText = 'Image-to-Text';
  else if (rawTag === 'text-to-speech') pipelineText = 'Text-to-Speech';
  else if (rawTag === 'automatic-speech-recognition') pipelineText = 'Speech Recognition';
  else if (rawTag === 'image-classification') pipelineText = 'Image Classification';
  else if (rawTag === 'object-detection') pipelineText = 'Object Detection';
  else if (rawTag === 'conversational') pipelineText = 'Conversational';
  else if (model.id.includes('Phi')) pipelineText = 'Code Generation';
  else if (rawTag) {
    pipelineText = rawTag.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  }

  return {
    ...model,
    modelId: model.id,
    vramEstimates: { fp16: Number((paramsInB * 2).toFixed(1)), totalParams: paramsInB },
    licenseInfo: { commercial: isCommercial, name: licenseDisp },
    config: { max_position_embeddings: estimatedContext },
    name: model.id,
    rawParams: formatParams(paramsInB),
    pipelineText,
    architectureLabel,
  };
};

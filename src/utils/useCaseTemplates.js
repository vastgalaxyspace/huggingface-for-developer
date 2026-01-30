// Use-Case Templates
// Pre-configured filter sets for common scenarios

export const USE_CASE_TEMPLATES = {
  mobile: {
    id: 'mobile',
    name: '📱 Mobile / Edge Deployment',
    icon: '📱',
    description: 'Lightweight models for mobile apps and edge devices',
    emoji: '📱',
    color: 'from-blue-500 to-cyan-500',
    filters: {
      maxVRAM: 4,
      maxParams: 3,
      license: 'commercial',
      sortBy: 'vram_low'
    },
    explanation: 'Models under 4GB VRAM, optimized for mobile and edge devices with commercial licenses.',
    idealFor: ['Mobile apps', 'IoT devices', 'Browser-based AI', 'Low-power devices'],
    requirements: {
      vram: '≤ 4GB',
      params: '≤ 3B',
      license: 'Commercial',
      formats: 'GGUF, INT4 preferred'
    }
  },

  chatbot: {
    id: 'chatbot',
    name: '💬 Customer Support Chatbot',
    icon: '💬',
    description: 'Fast, reliable models for customer support',
    emoji: '💬',
    color: 'from-green-500 to-emerald-500',
    filters: {
      maxVRAM: 16,
      minContext: 4096,
      license: 'commercial',
      sortBy: 'vram_low'
    },
    explanation: 'Commercial-friendly models optimized for conversational AI with good speed/quality balance.',
    idealFor: ['Customer support', 'FAQ bots', 'Virtual assistants', 'Live chat'],
    requirements: {
      vram: '≤ 16GB',
      context: '≥ 4k tokens',
      license: 'Commercial',
      priority: 'Speed & reliability'
    }
  },

  rag: {
    id: 'rag',
    name: '📚 RAG / Document Analysis',
    icon: '📚',
    description: 'Long-context models for document Q&A',
    emoji: '📚',
    color: 'from-purple-500 to-pink-500',
    filters: {
      minContext: 16384,
      maxVRAM: 24,
      sortBy: 'context'
    },
    explanation: 'Models with extended context windows (16k+) ideal for retrieval-augmented generation.',
    idealFor: ['Document Q&A', 'Knowledge bases', 'Research assistants', 'Contract analysis'],
    requirements: {
      context: '≥ 16k tokens',
      vram: '≤ 24GB',
      priority: 'Long context support'
    }
  },

  code: {
    id: 'code',
    name: '💻 Code Generation Assistant',
    icon: '💻',
    description: 'Code-specialized models for developers',
    emoji: '💻',
    color: 'from-orange-500 to-red-500',
    filters: {
      maxVRAM: 24,
      minContext: 8192,
      license: 'commercial'
    },
    explanation: 'Code-trained models with good context length for code completion and generation.',
    idealFor: ['Code completion', 'Code review', 'Bug fixing', 'Documentation generation'],
    requirements: {
      context: '≥ 8k tokens',
      vram: '≤ 24GB',
      license: 'Commercial',
      specialty: 'Code-trained'
    },
    modelHints: ['codellama', 'deepseek-coder', 'starcoder', 'code']
  },

  research: {
    id: 'research',
    name: '🔬 Research & Experimentation',
    icon: '🔬',
    description: 'All models for research and testing',
    emoji: '🔬',
    color: 'from-indigo-500 to-purple-500',
    filters: {
      license: 'any',
      sortBy: 'downloads'
    },
    explanation: 'Most popular models without restrictions. Perfect for research and learning.',
    idealFor: ['Research', 'Benchmarking', 'Model comparison', 'Learning about LLMs'],
    requirements: {
      license: 'Any',
      priority: 'Popularity & quality'
    }
  },

  enterprise: {
    id: 'enterprise',
    name: '🏢 Enterprise Production',
    icon: '🏢',
    description: 'Production-ready models for business',
    emoji: '🏢',
    color: 'from-gray-600 to-gray-800',
    filters: {
      license: 'commercial',
      minParams: 7,
      sortBy: 'downloads'
    },
    explanation: 'Battle-tested models with permissive licenses and strong community support.',
    idealFor: ['Business applications', 'SaaS products', 'Internal tools', 'Production systems'],
    requirements: {
      license: 'Permissive (Apache/MIT)',
      params: '≥ 7B',
      priority: 'Reliability & support'
    }
  },

  longContext: {
    id: 'longContext',
    name: '📄 Ultra Long Context',
    icon: '📄',
    description: 'Models with massive context windows',
    emoji: '📄',
    color: 'from-yellow-500 to-orange-500',
    filters: {
      minContext: 32768,
      sortBy: 'context'
    },
    explanation: 'Specialized models with 32k+ token context for processing very long documents.',
    idealFor: ['Book analysis', 'Legal documents', 'Academic papers', 'Long conversations'],
    requirements: {
      context: '≥ 32k tokens',
      priority: 'Maximum context length'
    }
  },

  budget: {
    id: 'budget',
    name: '💰 Budget-Friendly',
    icon: '💰',
    description: 'Most cost-effective models',
    emoji: '💰',
    color: 'from-green-600 to-teal-600',
    filters: {
      maxVRAM: 8,
      license: 'commercial',
      sortBy: 'vram_low'
    },
    explanation: 'Low VRAM requirements mean lower cloud costs and ability to run on consumer hardware.',
    idealFor: ['Startups', 'Side projects', 'Self-hosting', 'Cost optimization'],
    requirements: {
      vram: '≤ 8GB',
      license: 'Commercial',
      priority: 'Minimal hardware cost'
    }
  },

  quality: {
    id: 'quality',
    name: '⭐ Best Quality',
    icon: '⭐',
    description: 'Highest performing models',
    emoji: '⭐',
    color: 'from-yellow-400 to-amber-500',
    filters: {
      minParams: 13,
      sortBy: 'likes'
    },
    explanation: 'Larger, more capable models prioritizing quality over efficiency.',
    idealFor: ['High-stakes applications', 'Complex reasoning', 'Creative writing', 'Advanced analysis'],
    requirements: {
      params: '≥ 13B',
      priority: 'Maximum quality'
    }
  }
};

/**
 * Get all templates
 */
export const getAllTemplates = () => {
  return Object.values(USE_CASE_TEMPLATES);
};

/**
 * Get template by ID
 */
export const getTemplate = (templateId) => {
  return USE_CASE_TEMPLATES[templateId];
};

/**
 * Apply template to current filters
 */
export const applyTemplate = (templateId, currentFilters = {}) => {
  const template = getTemplate(templateId);
  if (!template) return currentFilters;
  
  return {
    ...currentFilters,
    ...template.filters
  };
};

/**
 * Filter models by template hints
 */
export const filterByTemplateHints = (models, template) => {
  if (!template.modelHints || template.modelHints.length === 0) {
    return models;
  }
  
  return models.filter(model => {
    const modelIdLower = model.modelId.toLowerCase();
    return template.modelHints.some(hint => modelIdLower.includes(hint.toLowerCase()));
  });
};
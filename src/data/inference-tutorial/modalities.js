export const MODALITIES_CHAPTER = 
  {
    id: 'modalities',
    number: 6,
    title: 'Modalities',
    icon: '🎨',
    color: '#06b6d4',
    description: 'Inference across modalities — vision-language models, embeddings, speech recognition, text-to-speech, and image/video generation.',
    sections: [
      {
        id: 'vision-language-models',
        title: 'Vision Language Models',
        content: `Vision Language Models (VLMs) process both images and text, enabling multimodal understanding.

**Architecture**
Most VLMs combine a vision encoder with an LLM:
1. **Vision encoder** (e.g., CLIP ViT) converts images to feature vectors
2. **Projection layer** maps vision features into the LLM's embedding space
3. **LLM decoder** generates text conditioned on both image and text tokens

Models: LLaVA, GPT-4V, Gemini, Qwen-VL, InternVL

**Video Processing for VLMs**
Processing video requires handling temporal information:
- **Frame sampling**: Extract N frames uniformly (e.g., 1 frame/second)
- **Video tokens**: Each frame generates ~256-576 tokens → a 1-minute 1fps video = 15K-35K tokens
- Memory and compute scale linearly with frame count
- Optimization: Use temporal pooling to reduce tokens per frame

**Omni-Modal Models**
Next-generation models that handle text, image, audio, and video natively:
- Single model architecture for all modalities
- Examples: Gemini, GPT-4o (with audio), AnyGPT
- Inference challenge: Must load all modality-specific components even for single-modality requests`
      },
      {
        id: 'embedding-models',
        title: 'Embedding Models',
        content: `Embedding models convert text into dense vector representations for search and retrieval.

**Embedding Model Architecture**
- Based on encoder-only transformers (BERT-style) or encoder-decoder models
- Output: A fixed-size vector (e.g., 384, 768, or 1024 dimensions) representing the semantic meaning
- Popular models: all-MiniLM-L6-v2 (fast), GTE-large (accurate), E5-mistral-7b (state-of-art)

**Embedding Model Inference**
Embedding inference is fundamentally different from LLM inference:
- **No autoregressive generation**: Single forward pass produces the embedding
- **Highly parallelizable**: Process thousands of documents simultaneously
- **Compute-bound**: Large batches fully saturate GPU compute
- **Throughput-focused**: Latency per-item matters less than total throughput

Optimization tips:
- Use large batch sizes (256-1024) for maximum GPU utilization
- FP16/INT8 quantization with minimal quality impact
- CPU inference is viable for smaller models (< 100M parameters)
- Batch processing overnight for large corpus embedding`,
        code: `# Efficient batch embedding with sentence-transformers
from sentence_transformers import SentenceTransformer

model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2", device="cuda")

# Process in large batches for maximum throughput
documents = ["Document 1...", "Document 2...", ...]  # thousands of docs
embeddings = model.encode(
    documents,
    batch_size=256,        # Large batch for GPU utilization
    show_progress_bar=True,
    normalize_embeddings=True  # For cosine similarity
)
print(f"Shape: {embeddings.shape}")  # (N, 384)`
      },
      {
        id: 'asr-models',
        title: 'ASR (Automatic Speech Recognition)',
        content: `ASR models convert speech audio to text — powering transcription, subtitles, and voice interfaces.

**Key Model: Whisper**
OpenAI's Whisper is the most popular open ASR model:
- Available in multiple sizes: tiny (39M) to large-v3 (1.5B)
- Supports 100+ languages and translation
- Encoder-decoder architecture: Audio encoder + text decoder

**Single-Chunk Latency Optimization**
For real-time transcription (e.g., live meetings):
- Process audio in small chunks (5-10 seconds)
- Use Whisper large-v3 with CTranslate2 or whisper.cpp for optimized inference
- Faster Whisper (CTranslate2) is 4x faster than original PyTorch implementation
- Batch multiple audio streams on a single GPU

**Long File Latency Optimization**
For processing long recordings (podcasts, calls):
- Split audio into chunks with overlap (to avoid word boundary issues)
- Process chunks in parallel across GPUs
- Use VAD (Voice Activity Detection) to skip silence
- WhisperX adds word-level timestamps and speaker diarization

**Diarization**
Speaker diarization identifies WHO speaks WHEN:
- Models: pyannote.audio, NeMo MSDD
- Pipeline: VAD → Segmentation → Embedding → Clustering
- Can be combined with Whisper for speaker-attributed transcriptions`
      },
      {
        id: 'tts-models',
        title: 'TTS (Text-to-Speech) Models',
        content: `TTS models generate natural-sounding speech from text.

**Streaming Real-Time Text to Speech**
For conversational AI, TTS must be fast and streamable:
- **VITS/VITS2**: End-to-end TTS, fast inference. Single model from text → waveform.
- **XTTS**: Coqui's model with zero-shot voice cloning from 6-second reference
- **Bark**: Suno's model — generates speech with non-verbal sounds (laughter, sighs)
- Streaming: Generate audio chunks as text becomes available → reduces first-byte latency

**Speech-to-Speech Models**
New models that skip text entirely:
- **GPT-4o**: Native audio-to-audio with natural prosody
- **Moshi**: Real-time duplex speech model
- Architecture: Audio encoder → Language model → Audio decoder
- Advantage: Preserves intonation, emotion, and speaking style

**Latency targets:**
- Conversational AI: <500ms TTFB (time to first audio byte)
- Voice assistants: <300ms for responsive feel
- Batch TTS (audiobooks): Throughput matters more than latency`
      },
      {
        id: 'image-generation-models',
        title: 'Image Generation Optimization',
        content: `Optimizing image generation inference for speed and quality.

**Image Generation Kernel Optimization**
Key optimizations for diffusion models:
- **Attention optimization**: Use Flash Attention in the U-Net/DiT attention layers
- **Conv2d optimization**: cuDNN autotuning for convolution kernels
- **VAE optimization**: The VAE decoder can be tiled for high-res images to reduce memory
- **torch.compile**: Can provide 10-30% speedup on diffusion model forward passes

**One Weird Trick for Faster Image Generation**
Progressive resolution / cascade models:
- Generate at low resolution first (256×256)
- Upscale with a specialized super-resolution model
- Total time is less than generating at high resolution directly
- SDXL Refiner: Uses a two-stage approach for better quality

**Batch optimization:**
- Generate multiple images simultaneously for higher GPU utilization
- Use classifier-free guidance with batched positive/negative prompts
- SDXL on H100: ~1-2 seconds per image at 1024×1024 with 30 steps`
      },
      {
        id: 'video-generation-models',
        title: 'Video Generation Models',
        content: `Video generation is one of the most compute-intensive inference workloads.

**Architecture**
Modern video generation models extend image diffusion:
- **Temporal attention**: Cross-frame attention to ensure consistency
- **3D convolutions**: Process spatial and temporal dimensions together
- **DiT (Diffusion Transformers)**: Scaling better than U-Net for video (Sora, CogVideo)

**Attention Optimization and Quantization**
Video models have massive attention maps:
- A 16-frame video at 512×512 has ~65K spatial tokens per frame × 16 frames
- Flash Attention is essential — without it, memory would be prohibitive
- INT8/FP8 quantization for attention values with minimal quality impact
- Window attention: Only attend to nearby frames for efficiency

**Context Parallelism**
Distribute frames across GPUs:
- Each GPU processes a subset of frames
- Cross-GPU communication only during temporal attention layers
- Linear scaling: 4 GPUs ≈ 4x longer videos in constant time
- Used by Sora and similar large-scale video generation systems`
      }
    ]
  }
;


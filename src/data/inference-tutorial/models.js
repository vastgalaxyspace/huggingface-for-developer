export const MODELS_CHAPTER = 
  {
    id: 'models',
    number: 2,
    title: 'Models',
    icon: '🧠',
    color: '#8b5cf6',
    description: 'Deep dive into neural network architectures, LLM mechanics, image generation, and understanding inference bottlenecks.',
    sections: [
      {
        id: 'neural-networks',
        title: 'Neural Networks',
        content: `Inference engineering is the practice of making generative AI models faster, less expensive, and more reliable – without sacrificing the quality that makes them so valuable. Both improving performance and preserving quality require a strong intuition for how models work under the hood.

Generative AI models are a composition of big, complex neural networks. The history of neural networks stretches back to the 1950s, when the first perceptrons for simple binary classification were implemented in hardware. In the following decades, perceptrons were abandoned but then reinvented from single to multi-layer perceptrons with a new concept, back-propagation, which introduced hidden states between layers and a learning procedure that repeatedly adjusts weights within the network. These neural networks had only a few layers. In the 2000s, research began into deep neural networks with dozens of layers. In 2012, AlexNet became the first deep neural network to show promising real-world capabilities and the effectiveness of GPUs for deep learning, leading to new architectures like word embedding models for text and Generative Adversarial Networks (GANs) for images.

But the story truly starts in 2017, when Vaswani and colleagues published the seminal paper “Attention Is All You Need,” introducing the transformer. A transformer is a neural network with an attention mechanism that can learn relationships between various parts of a sequence. Transformers are the foundation of generative AI. Transformers aren’t just for LLMs, they power every modality of model from embedding to voice to image and video generation.

Across modalities, there are two important styles of transformer-based models:
- **Autoregressive token generation**: Start from a tokenized sequence and predict the most likely next token.
- **Iterative denoising**: Start from random noise and refine toward the most likely output via diffusion.

**Neural Networks Fundamentals**
To be a productive inference engineer, you need a basic intuition for essential concepts in neural networks. The fundamental unit of a neural network is a node (a.k.a., neuron). A node is a short program that takes an input, multiplies it by some weights, adds some bias, and returns the result.

A group of nodes forms a layer. Nodes within a layer are independent of each other – they do their own calculations. The connection between nodes, or the “network” in a neural network, is between layers, where the nodes in a layer receive the output of the previous layer.

The neural networks behind LLMs contain dozens to hundreds of layers. There are three types of layers:
- **Input layer**: The first layer, which accepts and processes the input to the neural network.
- **Hidden layers**: Every layer between the first and last, which iteratively transform the input to arrive at an output.
- **Output layer**: The final layer, which returns the prediction from the network.

Each layer produces an output that the next layer reads as input. For the hidden layers, these outputs are called hidden states. Internal representations for text input increase the dimensionality, encoding text chunks into vectors of hundreds or thousands of numbers to capture semantic meaning. But internal representations for image models reduce the dimensionality from millions of pixels down to a manageable size.

There are neural networks for creating these internal representations, and there are neural networks for using them:
- **Encoder**: Takes an input like text or an image and creates an internal representation of the input that includes additional information and semantic meaning.
- **Decoder**: Uses the internal representation to generate an output like text or an image.

Modern LLMs are decoder-only, while encoder-only models are somewhat rare today, with old-school text embedding models from the BERT family as a prominent example. Many models in other modalities use an encoder-decoder architecture. Whisper, a popular open model for audio transcription, uses an encoder to process audio input and a decoder to generate text tokens.

**Linear Layers and Matmul**
The most essential operation within a neural network is a matrix multiplication, or matmul. A matmul takes an input vector (a list of numbers) and a matrix (a grid of numbers) and multiplies the vector through the matrix to produce an output vector.

Within a neural network, a linear layer is the simplest form of matmul. Given an input vector, the linear layer applies a weight matrix and adds a bias vector. The weights of any given linear layer are a small part of a generative AI model’s total weights, and the individual values within the weights matrix are set during training.

**Activation Functions**
Matrix multiplication is composable, meaning that multiplying a vector by two matrices is equivalent to multiplying that vector by the product of those matrices. This is a problem for multi-layer neural networks because a series of linear layers, each one a matmul, would collapse into a single layer with all of the matrices multiplied together.

Neural networks separate layers by breaking linearity with an activation function. Activation functions are non-linear to prevent composable matmul from collapsing layers, and are differentiable or mostly-differentiable to support back propagation.

One of the most basic activation functions in inference is ReLU, which stands for Rectified Linear Unit. ReLU is a simple function: if X is greater than zero, return X, else return zero. There are dozens of activation functions – including one named “Swish” thanks to its resemblance to the Nike logo – but most follow the same general pattern of mapping negative values to zero or near-zero, while keeping positive values unchanged.

Activation functions like ReLU, SiLU, Swish, and SwiGLU are fast to run, easy to train on (as they are mostly differentiable, they have a gradient at least for most values), and break linearity to support multi-layer neural networks.`,
        code: `# Matrix multiplication is the core of inference
import torch

# Simulating a single linear layer
input_tensor = torch.randn(1, 4096)      # batch of 1, hidden dim 4096
weight_matrix = torch.randn(4096, 11008)  # projecting to FFN dim

# This single operation dominates inference time
output = input_tensor @ weight_matrix  # Matrix multiplication
print(f"Input: {input_tensor.shape}")
print(f"Weight: {weight_matrix.shape}")
print(f"Output: {output.shape}")
# FLOPs = 2 × 1 × 4096 × 11008 ≈ 90M floating point operations`
      },
      {
        id: 'llm-inference-mechanics',
        title: 'LLM Inference Mechanics',
        content: `LLMs are autoregressive token generation models. An LLM generates new tokens one at a time based on every previous token.

These tokens, the atomic units of language models, are numbers that represent chunks of text. Modern LLMs use subword tokenization, meaning that each token is a word or a fraction of a word. Converting text into tokens and tokens into text does not require any neural networks. Instead, a tokenizer is a simple mapping between strings and their numerical token representation.

A language model’s vocabulary is the complete mapping between tokens and strings. Vocabularies and tokenizers vary from model to model, with more recent models employing more efficient tokenization schemes; the fewer tokens required to generate an output, the faster the end-to-end inference.

**Inference Sequences**
Inference involves two or three sequences of tokens:
- **Input sequence**: The prompt, chat, context, functions, and other input passed into the LLM.
- **Reasoning sequence**: Optionally, for reasoning models, an intermediate output sequence for thinking.
- **Output sequence**: The response generated by the LLM.

Combined, these sequences are limited to the model’s context window (the total number of tokens the model can process and generate per request). A request may further limit the output sequence length with a \`max_tokens\` argument.

While the input sequence is a single string, LLMs are trained to accept varied inputs like multi-turn chat sequences with roles, function signatures for tool calls, and, in some cases, multimodal inputs. These inputs need to be combined into a single sequence. This is handled by the **chat template**, which differs subtly from model to model and must be implemented correctly in the inference engine.

**Phases of Inference**
Tokenizing the input sequence with the chat template applied is step zero for inference. Then, there are two primary phases of inference:
- **Prefill**: Process the input sequence to calculate attention for each input token and store those values in a KV cache.
- **Decode**: Perform forward passes through the model to generate tokens autoregressively.

Each forward pass in the decode phase must generate a token. This takes a few extra steps, as neural networks output vectors, not tokens. The output layer of the neural network used in LLM decode generates a vector of logits. The length of this vector equals the model’s vocabulary size. After normalization, these logits represent the probability of each potential token in the vocabulary being the correct output.

The output token is selected via a weighted random number generation based on the normalized probability vector. You can nudge that process via inference arguments:
- **Temperature**: Adjust the logits themselves before normalization.
- **Top-k**: Select the k most likely tokens after normalization, then re-normalize among them.
- **Top-p**: Select the smallest set of tokens after normalization whose probabilities add up to p.

A lower temperature, top-k, or top-p makes LLM output more predictable as the model is constrained to selecting highly likely tokens. Setting the temperature to 0 or top-k to 1 makes token selection deterministic (always select the highest-probability token).

**LLM Architecture**
Every LLM on Hugging Face includes a \`config.json\` file: a few dozen lines detailing the model’s architecture. The architecture of a model is a collection of decisions made during the training process about the nature and shape of each component of the model. Within a single architecture, there may be:
- **Multiple sizes**: Models at different parameter counts, like Llama 8B and 70B.
- **Multiple variants**: The “base” and “instruct” variants of a given model share the same architecture.
- **Unlimited fine-tunes**: Methods like LoRA (Low-Rank Adaptation) change behavior, not architecture.

Model architecture is one of the first lines in most configuration files. To parse an architecture name like \`Qwen3MoeForCausalLM\`:
- **Qwen**: The model family, or the brand name of the model.
- **3**: The major version of the architecture within the family.
- **MoE**: Indicates a Mixture of Experts model.
- **CausalLM**: Indicates a causal language model.

A causal language model predicts the next token in a sequence based on previous tokens, as opposed to, for example, a masked language model which fills in the blank based on surrounding tokens to the left and right. All generative LLMs today are causal language models.

**Transformer Blocks**
The main body of an LLM is a series of dozens to hundreds of transformer blocks. These blocks form the core of a large neural network with three kinds of layers:
- **Embedding layer**: The input layer of the neural network takes tokens and returns embeddings.
- **Transformer blocks**: The hidden layers within the network are transformer blocks that generate a prediction.
- **Output layer**: Also known as a language modeling head or LMHead, converts the hidden states from the transformer blocks into a vector of logits, one for each token in the model’s vocabulary.

Within the transformer blocks, there are sublayers for attention, a feed-forward neural network, and normalization. The feed-forward neural network is a multi-layer perceptron. These linear sublayers make up the majority of the trainable weights within an LLM, while the attention sublayers are the second-largest component. Other components like normalization and activation functions are a rounding error in the model’s size.

While linear sublayers are the largest portion of the weights, the more complex operation for inference is attention.`
      },
      {
        id: 'image-generation-inference',
        title: 'Image Generation Inference',
        content: `Image generation models work fundamentally differently from LLMs.

**Image Generation Model Architecture**
Diffusion models (Stable Diffusion, FLUX) generate images through iterative denoising:
1. Start with random noise
2. A U-Net or DiT (Diffusion Transformer) predicts the noise to remove
3. Subtract predicted noise, repeat for 20-50 steps
4. The final result is a clean image

Each step requires a full forward pass through the model — making image generation inherently slower than single-pass models.

**Few-Step Models**
Recent advances reduce the number of steps needed:
- **LCM (Latent Consistency Models)**: 4-8 steps instead of 50
- **SDXL Turbo**: 1-4 steps using adversarial training
- **Lightning/Hyper**: Distilled models achieving good quality in 2-4 steps

**Video Generation**
Video generation extends image diffusion to the temporal dimension:
- Models like Sora, Runway Gen-3 generate multiple frames
- Computational cost scales linearly (or worse) with frame count
- Typical approach: Generate keyframes, then interpolate`
      },
      {
        id: 'calculating-inference-bottlenecks',
        title: 'Calculating Inference Bottlenecks',
        content: `Understanding bottlenecks lets you predict inference speed before even running the model.

**Ops:Byte Ratio and Arithmetic Intensity**
Every operation is either:
- **Compute-bound**: GPU cores are the bottleneck (high arithmetic intensity)
- **Memory-bound**: Memory bandwidth is the bottleneck (low arithmetic intensity)

Arithmetic Intensity = FLOPs / Bytes loaded from memory

For a GPU with 990 TFLOPS and 3.35 TB/s bandwidth (H100):
- Operations ratio = 990,000 / 3,350 ≈ 295 ops/byte
- If your operation does fewer than 295 ops per byte loaded → memory-bound

**LLM Inference Bottlenecks**
- **Prefill phase** (processing prompt): Compute-bound. Large batch matmul with high arithmetic intensity.
- **Decode phase** (generating tokens): Memory-bound. Each token requires loading ALL model weights for a single vector-matrix multiply.
- This is why decode is slow — a 7B model must load ~14GB of weights for EACH generated token.

**Image Generation Bottlenecks**
- Diffusion steps are generally compute-bound (large batch convolutions)
- The VAE decoder (latent → pixel space) can be a bottleneck for high-res images
- Cross-attention with long text prompts adds memory pressure`
      },
      {
        id: 'optimizing-attention',
        title: 'Optimizing Attention',
        content: `Attention is the most critical component to optimize in transformer inference.

**Flash Attention**
The breakthrough optimization that fuses attention computation:
- Standard attention materializes the full N×N attention matrix in GPU memory
- Flash Attention computes attention in tiles, never materializing the full matrix
- Result: 2-4x speedup and dramatically lower memory usage
- Flash Attention 2 & 3 add further optimizations for newer GPU architectures

**Multi-Query Attention (MQA) & Grouped-Query Attention (GQA)**
Reduce the KV cache memory footprint:
- **Standard MHA**: Separate K, V heads for each attention head (e.g., 32 heads)
- **MQA**: All heads share a single K, V pair → 32x less KV cache memory
- **GQA**: Compromise — groups of heads share K, V (e.g., 8 KV heads for 32 query heads, used in Llama 3)

**Paged Attention**
Used by vLLM — manages KV cache like virtual memory:
- Allocates KV cache in fixed-size "pages" instead of contiguous blocks
- Eliminates memory fragmentation
- Enables efficient memory sharing across requests
- Critical for serving many concurrent requests`
      }
    ]
  }
;


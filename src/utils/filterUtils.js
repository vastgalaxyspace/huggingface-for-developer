// Filter and Sort Utilities for Models

/**
 * Filter models by VRAM requirements
 * @param {array} models - List of models
 * @param {number} maxVRAM - Maximum VRAM in GB
 * @returns {array} Filtered models
 */
export const filterByVRAM = (models, maxVRAM) => {
  return models.filter(model => {
    const vram = parseFloat(model.vramEstimates?.fp16 || 999);
    return vram <= maxVRAM;
  });
};

/**
 * Filter models by license type
 * @param {array} models - List of models
 * @param {string} licenseType - 'commercial' | 'non-commercial' | 'all'
 * @returns {array} Filtered models
 */
export const filterByLicense = (models, licenseType) => {
  if (licenseType === 'all') return models;
  
  return models.filter(model => {
    if (licenseType === 'commercial') {
      return model.licenseInfo?.commercial === true;
    } else if (licenseType === 'non-commercial') {
      return model.licenseInfo?.commercial === false;
    }
    return true;
  });
};

/**
 * Filter models by context length
 * @param {array} models - List of models
 * @param {number} minContext - Minimum context length
 * @returns {array} Filtered models
 */
export const filterByContext = (models, minContext) => {
  return models.filter(model => {
    const context = model.config?.max_position_embeddings || 0;
    return context >= minContext;
  });
};

/**
 * Filter models by parameter count
 * @param {array} models - List of models
 * @param {number} minParams - Minimum parameters (in billions)
 * @param {number} maxParams - Maximum parameters (in billions)
 * @returns {array} Filtered models
 */
export const filterByParameters = (models, minParams, maxParams) => {
  return models.filter(model => {
    const params = parseFloat(model.vramEstimates?.totalParams || 0);
    return params >= minParams && params <= maxParams;
  });
};

/**
 * Sort models
 * @param {array} models - List of models
 * @param {string} sortBy - Sort criteria
 * @returns {array} Sorted models
 */
export const sortModels = (models, sortBy) => {
  const sorted = [...models];
  
  switch (sortBy) {
    case 'downloads':
      return sorted.sort((a, b) => (b.downloads || 0) - (a.downloads || 0));
    
    case 'likes':
      return sorted.sort((a, b) => (b.likes || 0) - (a.likes || 0));
    
    case 'name':
      return sorted.sort((a, b) => a.modelId.localeCompare(b.modelId));
    
    case 'vram_low':
      return sorted.sort((a, b) => {
        const vramA = parseFloat(a.vramEstimates?.fp16 || 999);
        const vramB = parseFloat(b.vramEstimates?.fp16 || 999);
        return vramA - vramB;
      });
    
    case 'vram_high':
      return sorted.sort((a, b) => {
        const vramA = parseFloat(a.vramEstimates?.fp16 || 999);
        const vramB = parseFloat(b.vramEstimates?.fp16 || 999);
        return vramB - vramA;
      });
    
    case 'context':
      return sorted.sort((a, b) => {
        const ctxA = a.config?.max_position_embeddings || 0;
        const ctxB = b.config?.max_position_embeddings || 0;
        return ctxB - ctxA;
      });
    
    default:
      return sorted;
  }
};

/**
 * Apply all filters to model list
 * @param {array} models - List of models
 * @param {object} filters - Filter criteria
 * @returns {array} Filtered and sorted models
 */
export const applyFilters = (models, filters) => {
  let filtered = [...models];
  
  // Apply VRAM filter
  if (filters.maxVRAM) {
    filtered = filterByVRAM(filtered, filters.maxVRAM);
  }
  
  // Apply license filter
  if (filters.license) {
    filtered = filterByLicense(filtered, filters.license);
  }
  
  // Apply context filter
  if (filters.minContext) {
    filtered = filterByContext(filtered, filters.minContext);
  }
  
  // Apply parameter filter
  if (filters.minParams || filters.maxParams) {
    filtered = filterByParameters(
      filtered,
      filters.minParams || 0,
      filters.maxParams || 999
    );
  }
  
  // Apply sorting
  if (filters.sortBy) {
    filtered = sortModels(filtered, filters.sortBy);
  }
  
  return filtered;
};

/**
 * Get preset filter configurations
 * @returns {object} Preset filters
 */
export const getFilterPresets = () => {
  return {
    lowEnd: {
      name: '💻 Low-End GPU',
      description: 'Models that run on consumer GPUs (≤16GB VRAM)',
      filters: {
        maxVRAM: 16,
        license: 'all'
      }
    },
    commercial: {
      name: '💼 Production Ready',
      description: 'Commercial-friendly licenses only',
      filters: {
        license: 'commercial'
      }
    },
    longContext: {
      name: '📄 Long Context',
      description: 'Models with 32k+ context window',
      filters: {
        minContext: 32768
      }
    },
    efficient: {
      name: '⚡ Most Efficient',
      description: 'Best performance per VRAM',
      filters: {
        maxVRAM: 24,
        sortBy: 'vram_low'
      }
    },
    popular: {
      name: '⭐ Most Popular',
      description: 'Highest downloads',
      filters: {
        sortBy: 'downloads'
      }
    },
    small: {
      name: '🎯 Small Models',
      description: '1B-7B parameters',
      filters: {
        minParams: 1,
        maxParams: 7
      }
    },
    medium: {
      name: '🚀 Medium Models',
      description: '7B-15B parameters',
      filters: {
        minParams: 7,
        maxParams: 15
      }
    },
    large: {
      name: '💪 Large Models',
      description: '15B+ parameters',
      filters: {
        minParams: 15,
        maxParams: 999
      }
    }
  };
};
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronDownIcon,
  DocumentTextIcon,
  ChatBubbleLeftRightIcon,
  SparklesIcon,
  Cog6ToothIcon,
  CpuChipIcon
} from '@heroicons/react/24/outline';

const ModelSelector = ({ 
  models, 
  selectedModel, 
  onModelChange, 
  loading, 
  parameters, 
  onParametersChange 
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const getModelIcon = (modelType) => {
    switch (modelType) {
      case 'summarizer':
        return <DocumentTextIcon className="w-5 h-5" />;
      case 'classifier':
        return <ChatBubbleLeftRightIcon className="w-5 h-5" />;
      case 'generator':
        return <SparklesIcon className="w-5 h-5" />;
      default:
        return <CpuChipIcon className="w-5 h-5" />;
    }
  };

  const getModelDescription = (modelType) => {
    switch (modelType) {
      case 'summarizer':
        return 'Condenses long text into concise summaries';
      case 'classifier':
        return 'Analyzes sentiment and classifies text';
      case 'generator':
        return 'Generates creative text continuations';
      default:
        return 'AI-powered text processing';
    }
  };

  const selectedModelData = models.find(m => m.name === selectedModel);

  const dropdownVariants = {
    hidden: {
      opacity: 0,
      scale: 0.95,
      transformOrigin: "top right"
    },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.2,
        ease: "easeOut"
      }
    }
  };

  return (
    <div className="glass-dark rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <CpuChipIcon className="w-5 h-5 text-primary-400" />
          AI Model
        </h3>
        <div className="flex items-center gap-2">
          {selectedModelData?.is_loaded && (
            <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full">
              Loaded
            </span>
          )}
          {loading && (
            <div className="loading-dots flex gap-1">
              <span className="w-1.5 h-1.5 bg-primary-400 rounded-full"></span>
              <span className="w-1.5 h-1.5 bg-primary-400 rounded-full"></span>
              <span className="w-1.5 h-1.5 bg-primary-400 rounded-full"></span>
            </div>
          )}
        </div>
      </div>

      {/* Model Selector Dropdown */}
      <div className="relative">
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full glass rounded-lg p-4 text-left flex items-center justify-between hover:bg-white/10 transition-all duration-300"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-center gap-3">
            {selectedModelData && getModelIcon(selectedModelData.type)}
            <div>
              <p className="font-medium capitalize">{selectedModel}</p>
              <p className="text-xs text-gray-400">
                {selectedModelData?.type} • v{selectedModelData?.version}
              </p>
            </div>
          </div>
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <ChevronDownIcon className="w-4 h-4" />
          </motion.div>
        </motion.button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              variants={dropdownVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="absolute top-full left-0 right-0 mt-2 glass-dark rounded-lg border border-white/20 z-50 max-h-80 overflow-y-auto custom-scrollbar"
            >
              {models.map((model) => (
                <motion.button
                  key={`${model.name}:${model.version}`}
                  onClick={() => {
                    onModelChange(model.name);
                    setIsOpen(false);
                  }}
                  className={`w-full p-3 text-left flex items-center gap-3 hover:bg-white/10 transition-colors duration-200 ${
                    selectedModel === model.name ? 'bg-primary-500/20' : ''
                  }`}
                  whileHover={{ x: 4 }}
                >
                  {getModelIcon(model.type)}
                  <div className="flex-1">
                    <p className="font-medium capitalize">{model.name}</p>
                    <p className="text-xs text-gray-400">
                      {model.type} • v{model.version}
                    </p>
                  </div>
                  {model.is_loaded && (
                    <div className="w-2 h-2 bg-green-400 rounded-full" />
                  )}
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Model Description */}
      <AnimatePresence mode="wait">
        {selectedModelData && (
          <motion.div
            key={selectedModelData.name}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="mt-4 p-3 bg-primary-500/10 rounded-lg border border-primary-500/30"
          >
            <p className="text-sm text-primary-200">
              {getModelDescription(selectedModelData.type)}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Model Parameters */}
      {selectedModelData && Object.keys(selectedModelData.parameters || {}).length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-4 space-y-3"
        >
          <h4 className="text-sm font-medium text-gray-300 flex items-center gap-2">
            <Cog6ToothIcon className="w-4 h-4" />
            Model Parameters
          </h4>
          {Object.entries(selectedModelData.parameters).map(([key, value]) => (
            <div key={key} className="space-y-1">
              <label className="text-xs text-gray-400 capitalize">
                {key.replace(/_/g, ' ')}
              </label>
              <input
                type="number"
                value={parameters[key] || value}
                onChange={(e) => onParametersChange({
                  ...parameters,
                  [key]: parseInt(e.target.value) || value
                })}
                className="w-full bg-dark-700/50 border border-dark-600 rounded-lg px-3 py-2 text-sm focus:border-primary-500 focus:outline-none transition-colors"
                min="1"
                max="500"
              />
            </div>
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default ModelSelector;

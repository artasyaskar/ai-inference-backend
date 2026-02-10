import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  SparklesIcon, 
  DocumentTextIcon,
  ChatBubbleLeftRightIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import { 
  PlayIcon, 
  StopIcon,
  Cog6ToothIcon,
  ChartBarIcon
} from '@heroicons/react/24/solid';

import Header from './components/Header';
import ModelSelector from './components/ModelSelector';
import TextInput from './components/TextInput';
import ResultDisplay from './components/ResultDisplay';
import MetricsPanel from './components/MetricsPanel';
import { useInference } from './hooks/useInference';
import { useModels } from './hooks/useModels';

function App() {
  const [selectedModel, setSelectedModel] = useState('summarizer');
  const [parameters, setParameters] = useState({});
  const [showMetrics, setShowMetrics] = useState(false);
  
  const { 
    text, 
    setText, 
    result, 
    loading, 
    error, 
    inferenceHistory,
    processInference,
    stopInference 
  } = useInference();
  
  const { models, loading: modelsLoading } = useModels();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-bg text-white overflow-hidden">
      {/* Animated background particles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-primary-400/30 rounded-full"
            animate={{
              x: [0, Math.random() * 100 - 50],
              y: [0, Math.random() * 100 - 50],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 10 + Math.random() * 20,
              repeat: Infinity,
              delay: Math.random() * 5,
            }}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10">
        <Header />
        
        <motion.div
          className="container mx-auto px-4 py-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content Area */}
            <div className="lg:col-span-2 space-y-6">
              {/* Model Selector */}
              <motion.div variants={itemVariants}>
                <ModelSelector
                  models={models}
                  selectedModel={selectedModel}
                  onModelChange={setSelectedModel}
                  loading={modelsLoading}
                  parameters={parameters}
                  onParametersChange={setParameters}
                />
              </motion.div>

              {/* Text Input */}
              <motion.div variants={itemVariants}>
                <TextInput
                  text={text}
                  onTextChange={setText}
                  onSubmit={() => processInference(selectedModel, parameters)}
                  loading={loading}
                  disabled={!text.trim()}
                />
              </motion.div>

              {/* Result Display */}
              <AnimatePresence mode="wait">
                {(result || error || loading) && (
                  <motion.div
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                  >
                    <ResultDisplay
                      result={result}
                      error={error}
                      loading={loading}
                      onRetry={() => processInference(selectedModel, parameters)}
                      onStop={stopInference}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* History */}
              {inferenceHistory.length > 0 && (
                <motion.div variants={itemVariants} className="glass-dark rounded-xl p-6">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <SparklesIcon className="w-5 h-5" />
                    Recent Inferences
                  </h3>
                  <div className="space-y-3 max-h-60 overflow-y-auto custom-scrollbar">
                    {inferenceHistory.slice(-5).reverse().map((item, index) => (
                      <motion.div
                        key={item.requestId}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="glass rounded-lg p-3"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="text-sm text-gray-300 truncate">
                              {item.text.substring(0, 100)}...
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              {item.model} • {item.latencyMs}ms
                            </p>
                          </div>
                          <div className="ml-2">
                            {item.success ? (
                              <CheckCircleIcon className="w-4 h-4 text-green-400" />
                            ) : (
                              <ExclamationCircleIcon className="w-4 h-4 text-red-400" />
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Stats */}
              <motion.div variants={itemVariants} className="glass-dark rounded-xl p-6">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <SparklesIcon className="w-5 h-5" />
                  System Status
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Models Loaded</span>
                    <span className="text-primary-400 font-mono">
                      {models.filter(m => m.is_loaded).length}/{models.length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">API Status</span>
                    <span className="text-green-400 flex items-center gap-1">
                      <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                      Online
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Total Requests</span>
                    <span className="text-primary-400 font-mono">
                      {inferenceHistory.length}
                    </span>
                  </div>
                </div>
              </motion.div>

              {/* Metrics Toggle */}
              <motion.div variants={itemVariants}>
                <button
                  onClick={() => setShowMetrics(!showMetrics)}
                  className="w-full glass-dark rounded-xl p-4 text-left hover:bg-white/10 transition-all duration-300 flex items-center justify-between group"
                >
                  <span className="flex items-center gap-2">
                    <ChartBarIcon className="w-5 h-5" />
                    Performance Metrics
                  </span>
                  <motion.div
                    animate={{ rotate: showMetrics ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Cog6ToothIcon className="w-4 h-4" />
                  </motion.div>
                </button>
              </motion.div>

              {/* Metrics Panel */}
              <AnimatePresence>
                {showMetrics && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <MetricsPanel />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default App;

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircleIcon,
  ExclamationCircleIcon,
  DocumentDuplicateIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';
import { PlayIcon, StopIcon } from '@heroicons/react/24/solid';

const ResultDisplay = ({ result, error, loading, onRetry, onStop }) => {
  const [showFullResult, setShowFullResult] = useState(false);

  const copyResult = () => {
    if (result?.result) {
      navigator.clipboard.writeText(result.result);
      // Could add toast notification here
    }
  };

  const downloadResult = () => {
    if (result?.result) {
      const element = document.createElement('a');
      const file = new Blob([result.result], { type: 'text/plain' });
      element.href = URL.createObjectURL(file);
      element.download = `inference-result-${Date.now()}.txt`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    }
  };

  // Debug logging
  console.log('ResultDisplay - result:', result);
  console.log('ResultDisplay - error:', error);
  console.log('ResultDisplay - loading:', loading);

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  const contentVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.3,
        delay: 0.2
      }
    }
  };

  const loadingVariants = {
    initial: { rotate: 0 },
    animate: {
      rotate: 360,
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "linear"
      }
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      className="glass-dark rounded-xl overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          {loading ? (
            <motion.div
              variants={loadingVariants}
              animate="animate"
              className="w-6 h-6"
            >
              <div className="w-full h-full border-2 border-primary-400 border-t-transparent rounded-full" />
            </motion.div>
          ) : error ? (
            <ExclamationCircleIcon className="w-6 h-6 text-red-400" />
          ) : (
            <CheckCircleIcon className="w-6 h-6 text-green-400" />
          )}
          
          <div>
            <h3 className="text-lg font-bold">
              {loading ? 'Processing...' : error ? 'Error' : 'Result'}
            </h3>
            {result && !loading && (
              <p className="text-sm text-gray-400">
                {result.model_used} • {result.latency_ms}ms
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {result && !loading && (
            <>
              <motion.button
                onClick={copyResult}
                className="p-2 glass rounded-lg hover:bg-white/10 transition-all duration-300"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                title="Copy Result"
              >
                <DocumentDuplicateIcon className="w-4 h-4" />
              </motion.button>

              <motion.button
                onClick={downloadResult}
                className="p-2 glass rounded-lg hover:bg-white/10 transition-all duration-300"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                title="Download Result"
              >
                <ArrowDownTrayIcon className="w-4 h-4" />
              </motion.button>
            </>
          )}

          {loading && (
            <motion.button
              onClick={onStop}
              className="p-2 glass rounded-lg hover:bg-red-500/20 transition-all duration-300"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              title="Stop Processing"
            >
              <StopIcon className="w-4 h-4 text-red-400" />
            </motion.button>
          )}

          {error && !loading && (
            <motion.button
              onClick={onRetry}
              className="p-2 glass rounded-lg hover:bg-white/10 transition-all duration-300"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              title="Retry"
            >
              <PlayIcon className="w-4 h-4" />
            </motion.button>
          )}
        </div>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {loading && (
          <motion.div
            key="loading"
            variants={contentVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="p-6"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <motion.div
                    className="w-16 h-16 mx-auto mb-4"
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.5, 1, 0.5],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                    }}
                  >
                    <div className="w-full h-full border-4 border-primary-400 border-t-transparent rounded-full" />
                  </motion.div>
                  <p className="text-gray-400">AI is processing your text...</p>
                  <p className="text-sm text-gray-500 mt-2">This may take a few seconds</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {error && !loading && (
          <motion.div
            key="error"
            variants={contentVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="p-6"
          >
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <ExclamationCircleIcon className="w-5 h-5 text-red-400 mt-0.5" />
                <div>
                  <h4 className="font-medium text-red-400">Processing Failed</h4>
                  <p className="text-sm text-red-300 mt-1">{error}</p>
                  <p className="text-xs text-red-400 mt-2">
                    Please check your input and try again.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {result && !loading && (
          <motion.div
            key="result"
            variants={contentVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="p-6"
          >
            <div className="space-y-4">
              {/* Result Text */}
              <div className="bg-dark-700/30 rounded-lg p-4 border border-dark-600/50">
                <pre className="whitespace-pre-wrap text-sm text-gray-200 font-mono leading-relaxed">
                  {showFullResult 
                    ? result?.result 
                    : result?.result?.slice(0, 500) + (result?.result?.length > 500 ? '...' : '')
                  }
                </pre>
              </div>

              {/* Show More/Less Button */}
              {result?.result?.length > 500 && (
                <motion.button
                  onClick={() => setShowFullResult(!showFullResult)}
                  className="text-primary-400 hover:text-primary-300 text-sm transition-colors duration-200"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {showFullResult ? 'Show Less' : `Show ${result?.result?.length - 500} More Characters`}
                </motion.button>
              )}

              {/* Metadata */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-dark-700/30 rounded-lg p-3 border border-dark-600/50">
                  <p className="text-gray-400 mb-1">Model Used</p>
                  <p className="font-medium text-primary-400">{result.model_used}</p>
                </div>
                <div className="bg-dark-700/30 rounded-lg p-3 border border-dark-600/50">
                  <p className="text-gray-400 mb-1">Processing Time</p>
                  <p className="font-medium text-primary-400">{result.latency_ms}ms</p>
                </div>
                <div className="bg-dark-700/30 rounded-lg p-3 border border-dark-600/50">
                  <p className="text-gray-400 mb-1">Request ID</p>
                  <p className="font-medium text-primary-400 font-mono text-xs">
                    {result.request_id.slice(0, 8)}...
                  </p>
                </div>
                <div className="bg-dark-700/30 rounded-lg p-3 border border-dark-600/50">
                  <p className="text-gray-400 mb-1">Timestamp</p>
                  <p className="font-medium text-primary-400 text-xs">
                    {new Date(result.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ResultDisplay;

import React from 'react';
import { motion } from 'framer-motion';
import { CpuChipIcon } from '@heroicons/react/24/outline';

const SystemStatus = ({ models, loading, inferenceHistory, selectedModel }) => {
  const loadedCount = models.filter(m => m.is_loaded).length;
  const totalCount = models.length;
  
  // Find the index of selected model to show position (1-based)
  const selectedIndex = models.findIndex(m => m.name === selectedModel) + 1;

  const statusVariants = {
    idle: { scale: 1 },
    pulse: { 
      scale: [1, 1.05, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
      }
    }
  };

  return (
    <motion.div
      variants={statusVariants}
      animate={loading ? "pulse" : "idle"}
      className="glass-dark rounded-xl p-6"
    >
      <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
        <CpuChipIcon className="w-5 h-5 text-primary-400" />
        System Status
      </h3>
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-gray-300">Model Selected</span>
          <motion.span 
            className="text-primary-400 font-mono font-bold"
            key={selectedIndex}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            {selectedIndex}/{totalCount}
          </motion.span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-300">Models Loaded</span>
          <motion.span 
            className="text-green-400 font-mono font-bold"
            key={loadedCount}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            {loadedCount}/{totalCount}
          </motion.span>
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
          <motion.span 
            className="text-primary-400 font-mono font-bold"
            key={inferenceHistory?.length || 0}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            {inferenceHistory?.length || 0}
          </motion.span>
        </div>
      </div>
    </motion.div>
  );
};

export default SystemStatus;

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ChartBarIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

const MetricsPanel = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await fetch('/metrics');
        const data = await response.json();
        setMetrics(data);
      } catch (error) {
        console.error('Failed to fetch metrics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
    const interval = setInterval(fetchMetrics, 5000); // Update every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0, height: 0 },
    visible: {
      opacity: 1,
      height: 'auto',
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    }
  };

  const statVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        delay: 0.1
      }
    }
  };

  if (loading) {
    return (
      <motion.div
        variants={containerVariants}
        className="glass-dark rounded-xl p-6"
      >
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-dark-600 rounded w-1/2"></div>
          <div className="h-8 bg-dark-600 rounded w-full"></div>
          <div className="h-8 bg-dark-600 rounded w-full"></div>
        </div>
      </motion.div>
    );
  }

  if (!metrics) {
    return (
      <motion.div
        variants={containerVariants}
        className="glass-dark rounded-xl p-6"
      >
        <div className="text-center text-gray-400">
          <ChartBarIcon className="w-8 h-8 mx-auto mb-2" />
          <p>Unable to load metrics</p>
        </div>
      </motion.div>
    );
  }

  const successRate = metrics.total_requests > 0 
    ? ((metrics.successful_requests / metrics.total_requests) * 100).toFixed(1)
    : 0;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="glass-dark rounded-xl p-6 space-y-4"
    >
      <h3 className="text-xl font-bold flex items-center gap-2 mb-4">
        <ChartBarIcon className="w-5 h-5 text-primary-400" />
        Performance Metrics
      </h3>

      {/* Key Stats */}
      <div className="grid grid-cols-2 gap-3">
        <motion.div
          variants={statVariants}
          className="bg-dark-700/30 rounded-lg p-3 border border-dark-600/50"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-400">Total Requests</span>
            <ChartBarIcon className="w-3 h-3 text-primary-400" />
          </div>
          <p className="text-2xl font-bold text-primary-400">
            {metrics.total_requests.toLocaleString()}
          </p>
        </motion.div>

        <motion.div
          variants={statVariants}
          className="bg-dark-700/30 rounded-lg p-3 border border-dark-600/50"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-400">Success Rate</span>
            <CheckCircleIcon className="w-3 h-3 text-green-400" />
          </div>
          <p className="text-2xl font-bold text-green-400">
            {successRate}%
          </p>
        </motion.div>

        <motion.div
          variants={statVariants}
          className="bg-dark-700/30 rounded-lg p-3 border border-dark-600/50"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-400">Avg Latency</span>
            <ClockIcon className="w-3 h-3 text-yellow-400" />
          </div>
          <p className="text-2xl font-bold text-yellow-400">
            {metrics.average_latency_ms.toFixed(0)}ms
          </p>
        </motion.div>

        <motion.div
          variants={statVariants}
          className="bg-dark-700/30 rounded-lg p-3 border border-dark-600/50"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-400">Failed Requests</span>
            <XCircleIcon className="w-3 h-3 text-red-400" />
          </div>
          <p className="text-2xl font-bold text-red-400">
            {metrics.failed_requests}
          </p>
        </motion.div>
      </div>

      {/* Model Usage */}
      {Object.keys(metrics.requests_per_model).length > 0 && (
        <motion.div
          variants={statVariants}
          className="mt-4"
        >
          <h4 className="text-sm font-medium text-gray-300 mb-3">Model Usage</h4>
          <div className="space-y-2">
            {Object.entries(metrics.requests_per_model).map(([model, count]) => {
              const percentage = metrics.total_requests > 0 
                ? ((count / metrics.total_requests) * 100).toFixed(1)
                : 0;
              
              return (
                <div key={model} className="flex items-center gap-3">
                  <span className="text-sm text-gray-400 flex-1 truncate">
                    {model}
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-dark-600 rounded-full h-2 overflow-hidden">
                      <motion.div
                        className="h-full bg-primary-400"
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 1, delay: 0.2 }}
                      />
                    </div>
                    <span className="text-xs text-gray-400 w-12 text-right">
                      {percentage}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Last Updated */}
      <div className="mt-4 pt-4 border-t border-white/10">
        <p className="text-xs text-gray-500 text-center">
          Last updated: {new Date(metrics.timestamp).toLocaleString()}
        </p>
      </div>
    </motion.div>
  );
};

export default MetricsPanel;

import React from 'react';
import { motion } from 'framer-motion';
import { CpuChipIcon } from '@heroicons/react/24/outline';

const Header = () => {
  const headerVariants = {
    hidden: { y: -50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: [0.6, -0.05, 0.01, 0.99]
      }
    }
  };

  const logoVariants = {
    hover: {
      scale: 1.05,
      transition: {
        duration: 0.2,
        ease: "easeInOut"
      }
    }
  };

  return (
    <motion.header
      variants={headerVariants}
      initial="hidden"
      animate="visible"
      className="glass-dark border-b border-white/10 sticky top-0 z-50"
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <motion.div
            variants={logoVariants}
            whileHover="hover"
          >
            <div className="flex items-center gap-3 cursor-pointer">
              <div className="relative">
                <CpuChipIcon className="w-8 h-8 text-primary-400" />
                <motion.div
                  className="absolute -top-1 -right-1 w-3 h-3 bg-accent-500 rounded-full"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [1, 0.5, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                  }}
                />
              </div>
              <div>
                <h1 className="text-xl font-bold gradient-text">AI Inference</h1>
                <p className="text-xs text-gray-400">Production AI Platform</p>
              </div>
            </div>
          </motion.div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {['Features', 'Models', 'Docs', 'API'].map((item, index) => (
              <motion.a
                key={item}
                href="#"
                className="text-gray-300 hover:text-white transition-colors duration-200 relative group"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                {item}
                <motion.div
                  className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary-400"
                  whileHover={{ width: "100%" }}
                  transition={{ duration: 0.3 }}
                />
              </motion.a>
            ))}
          </nav>

          {/* Status Badge */}
          <motion.div
            className="flex items-center gap-2 glass px-3 py-1.5 rounded-full"
            animate={{
              backgroundColor: [
                "rgba(34, 197, 94, 0.1)",
                "rgba(34, 197, 94, 0.2)",
                "rgba(34, 197, 94, 0.1)",
              ],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
            }}
          >
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-sm text-green-400">Live</span>
          </motion.div>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;

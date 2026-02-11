import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  MicrophoneIcon,
  DocumentDuplicateIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { PlayIcon } from '@heroicons/react/24/solid';

const TextInput = ({ text, onTextChange, onSubmit, loading, disabled }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const textareaRef = useRef(null);

  useEffect(() => {
    setWordCount(text.trim().split(/\s+/).filter(word => word.length > 0).length);
  }, [text]);

  const handleSubmit = () => {
    if (!disabled && text.trim()) {
      onSubmit();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const clearText = () => {
    onTextChange('');
    textareaRef.current?.focus();
  };

  const copyText = () => {
    navigator.clipboard.writeText(text);
    // Could add toast notification here
  };

  const startRecording = () => {
    setIsRecording(true);
    // Speech recognition implementation would go here
    setTimeout(() => setIsRecording(false), 3000); // Mock recording
  };

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  const buttonVariants = {
    idle: { scale: 1 },
    loading: {
      scale: [1, 1.05, 1],
      transition: {
        duration: 1,
        repeat: Infinity
      }
    },
    recording: {
      scale: [1, 1.1, 1],
      backgroundColor: ["#ef4444", "#dc2626", "#ef4444"],
      transition: {
        duration: 0.8,
        repeat: Infinity
      }
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      className="glass-dark rounded-xl p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold">Input Text</h3>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-400">
            {wordCount} words
          </span>
          <span className="text-sm text-gray-400">
            {text.length}/10000
          </span>
        </div>
      </div>

      {/* Text Input Area */}
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => onTextChange(e.target.value.slice(0, 10000))}
          onKeyPress={handleKeyPress}
          placeholder="Enter your text here... Try pasting an article, email, or any text you'd like to process with AI."
          className="w-full h-40 bg-dark-700/50 border border-dark-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all duration-300 resize-none custom-scrollbar"
          disabled={loading}
        />

        {/* Character limit indicator */}
        <div className="absolute bottom-2 right-2">
          <div className={`w-2 h-2 rounded-full transition-colors duration-300 ${
            text.length > 9000 ? 'bg-red-400' : 
            text.length > 7000 ? 'bg-yellow-400' : 'bg-green-400'
          }`} />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center gap-2">
          {/* Voice Input */}
          <motion.button
            variants={buttonVariants}
            animate={isRecording ? "recording" : "idle"}
            onClick={startRecording}
            className="p-2 glass rounded-lg hover:bg-white/10 transition-all duration-300 relative"
            disabled={loading}
            title="Voice Input (Coming Soon)"
          >
            {isRecording && (
              <motion.div
                className="absolute inset-0 bg-red-500/20 rounded-lg"
                animate={{
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity
                }}
              />
            )}
            <MicrophoneIcon className="w-4 h-4" />
          </motion.button>

          {/* Copy Text */}
          <motion.button
            onClick={copyText}
            className="p-2 glass rounded-lg hover:bg-white/10 transition-all duration-300"
            disabled={!text.trim() || loading}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            title="Copy Text"
          >
            <DocumentDuplicateIcon className="w-4 h-4" />
          </motion.button>

          {/* Clear Text */}
          <motion.button
            onClick={clearText}
            className="p-2 glass rounded-lg hover:bg-white/10 transition-all duration-300"
            disabled={!text.trim() || loading}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            title="Clear Text"
          >
            <TrashIcon className="w-4 h-4" />
          </motion.button>
        </div>

        {/* Submit Button */}
        <motion.button
          variants={buttonVariants}
          animate={loading ? "loading" : "idle"}
          onClick={handleSubmit}
          disabled={disabled || loading}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium transition-all duration-300 ${
            disabled || loading
              ? 'bg-gray-600 cursor-not-allowed'
              : 'bg-primary-500 hover:bg-primary-600 hover:shadow-lg hover:shadow-primary-500/25'
          }`}
          whileHover={!disabled && !loading ? { scale: 1.05 } : {}}
          whileTap={!disabled && !loading ? { scale: 0.95 } : {}}
        >
          {loading ? (
            <>
              <motion.div
                className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
              Processing...
            </>
          ) : (
            <>
              <PlayIcon className="w-4 h-4" />
              Process Text
            </>
          )}
        </motion.button>
      </div>

      {/* Keyboard Shortcut Hint */}
      <div className="mt-3 text-xs text-gray-500 text-center">
        💡 Press <kbd className="px-1 py-0.5 bg-dark-600 rounded text-xs">Ctrl</kbd> + <kbd className="px-1 py-0.5 bg-dark-600 rounded text-xs">Enter</kbd> to process
      </div>
    </motion.div>
  );
};

export default TextInput;

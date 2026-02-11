import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  SparklesIcon,
  CpuChipIcon,
  DocumentTextIcon,
  BookOpenIcon,
  CodeBracketIcon
} from '@heroicons/react/24/outline';

const NavigationContent = ({ activeSection }) => {
  const contentVariants = {
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

  const sections = {
    features: {
      title: "Platform Features",
      icon: <SparklesIcon className="w-6 h-6" />,
      content: (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="glass-dark rounded-xl p-6">
            <h3 className="text-lg font-bold mb-3 text-primary-400">Real-Time Processing</h3>
            <p className="text-gray-300 mb-4">
              Experience lightning-fast AI inference with our optimized backend infrastructure. 
              Get results in milliseconds, not seconds.
            </p>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>• Sub-100ms response times</li>
              <li>• Concurrent model support</li>
              <li>• Automatic load balancing</li>
            </ul>
          </div>
          
          <div className="glass-dark rounded-xl p-6">
            <h3 className="text-lg font-bold mb-3 text-primary-400">Multiple AI Models</h3>
            <p className="text-gray-300 mb-4">
              Choose from specialized models for different tasks. 
              From text summarization to sentiment analysis and generation.
            </p>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>• Text Summarization</li>
              <li>• Sentiment Analysis</li>
              <li>• Text Generation</li>
            </ul>
          </div>
          
          <div className="glass-dark rounded-xl p-6">
            <h3 className="text-lg font-bold mb-3 text-primary-400">Live Metrics</h3>
            <p className="text-gray-300 mb-4">
              Monitor performance in real-time with comprehensive analytics 
              and usage statistics.
            </p>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>• Request tracking</li>
              <li>• Performance metrics</li>
              <li>• Error monitoring</li>
            </ul>
          </div>
          
          <div className="glass-dark rounded-xl p-6">
            <h3 className="text-lg font-bold mb-3 text-primary-400">Modern UI/UX</h3>
            <p className="text-gray-300 mb-4">
              Beautiful, responsive interface with real-time animations 
              and professional design.
            </p>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>• Glass morphism design</li>
              <li>• Real-time sparkles</li>
              <li>• Smooth animations</li>
            </ul>
          </div>
        </div>
      )
    },
    
    models: {
      title: "AI Models",
      icon: <CpuChipIcon className="w-6 h-6" />,
      content: (
        <div className="grid md:grid-cols-3 gap-6">
          <div className="glass-dark rounded-xl p-6 border-l-4 border-primary-500">
            <h3 className="text-lg font-bold mb-3 text-primary-400">Summarizer</h3>
            <p className="text-gray-300 mb-4">
              Advanced text summarization using DistilBART. 
              Perfect for condensing long articles and documents.
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Model:</span>
                <span className="text-primary-400">sshleifer/distilbart-cnn-12-6</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Type:</span>
                <span className="text-primary-400">Summarization</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Max Length:</span>
                <span className="text-primary-400">150 tokens</span>
              </div>
            </div>
          </div>
          
          <div className="glass-dark rounded-xl p-6 border-l-4 border-accent-500">
            <h3 className="text-lg font-bold mb-3 text-accent-400">Sentiment Analyzer</h3>
            <p className="text-gray-300 mb-4">
              Emotion and sentiment detection using RoBERTa. 
              Analyze text for positive, negative, or neutral sentiment.
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Model:</span>
                <span className="text-accent-400">cardiffnlp/twitter-roberta-base-sentiment-latest</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Type:</span>
                <span className="text-accent-400">Classification</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Classes:</span>
                <span className="text-accent-400">3 (Pos/Neg/Neutral)</span>
              </div>
            </div>
          </div>
          
          <div className="glass-dark rounded-xl p-6 border-l-4 border-green-500">
            <h3 className="text-lg font-bold mb-3 text-green-400">Text Generator</h3>
            <p className="text-gray-300 mb-4">
              Creative text generation using DistilGPT2. 
              Generate creative content and continuations.
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Model:</span>
                <span className="text-green-400">distilgpt2</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Type:</span>
                <span className="text-green-400">Generation</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Max Length:</span>
                <span className="text-green-400">100 tokens</span>
              </div>
            </div>
          </div>
        </div>
      )
    },
    
    docs: {
      title: "Documentation",
      icon: <BookOpenIcon className="w-6 h-6" />,
      content: (
        <div className="space-y-6">
          <div className="glass-dark rounded-xl p-6">
            <h3 className="text-lg font-bold mb-4 text-primary-400">Getting Started</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-primary-300 mb-2">1. Choose a Model</h4>
                <p className="text-gray-300">
                  Select from our available AI models based on your needs. 
                  Each model is optimized for specific tasks.
                </p>
              </div>
              <div>
                <h4 className="font-medium text-primary-300 mb-2">2. Input Your Text</h4>
                <p className="text-gray-300">
                  Enter or paste your text in the input area. 
                  Support for up to 10,000 characters.
                </p>
              </div>
              <div>
                <h4 className="font-medium text-primary-300 mb-2">3. Process & Review</h4>
                <p className="text-gray-300">
                  Click "Process Text" and watch the AI work its magic. 
                  Results appear in real-time with performance metrics.
                </p>
              </div>
            </div>
          </div>
          
          <div className="glass-dark rounded-xl p-6">
            <h3 className="text-lg font-bold mb-4 text-primary-400">API Reference</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-primary-300 mb-2">POST /infer</h4>
                <pre className="bg-dark-800/50 p-3 rounded text-sm text-primary-300 overflow-x-auto">
{`{
  "text": "Your input text",
  "model": "summarizer",
  "version": "v1",
  "parameters": {
    "max_length": 150
  }
}`}
                </pre>
              </div>
              <div>
                <h4 className="font-medium text-primary-300 mb-2">Response</h4>
                <pre className="bg-dark-800/50 p-3 rounded text-sm text-green-300 overflow-x-auto">
{`{
  "request_id": "uuid",
  "model_used": "summarizer",
  "result": "Processed text",
  "latency_ms": 45,
  "success": true,
  "timestamp": "2024-01-01T00:00:00Z"
}`}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )
    },
    
    api: {
      title: "API Documentation",
      icon: <CodeBracketIcon className="w-6 h-6" />,
      content: (
        <div className="space-y-6">
          <div className="glass-dark rounded-xl p-6">
            <h3 className="text-lg font-bold mb-4 text-primary-400">Endpoints</h3>
            <div className="space-y-4">
              <div className="border-l-4 border-primary-500 pl-4">
                <h4 className="font-medium text-primary-300">GET /health</h4>
                <p className="text-gray-300 text-sm mb-2">Check API health status</p>
                <code className="text-xs bg-dark-800/50 px-2 py-1 rounded text-primary-400">Returns: 200 OK</code>
              </div>
              
              <div className="border-l-4 border-accent-500 pl-4">
                <h4 className="font-medium text-accent-300">GET /models</h4>
                <p className="text-gray-300 text-sm mb-2">List available models</p>
                <code className="text-xs bg-dark-800/50 px-2 py-1 rounded text-accent-400">Returns: Array of models</code>
              </div>
              
              <div className="border-l-4 border-green-500 pl-4">
                <h4 className="font-medium text-green-300">POST /infer</h4>
                <p className="text-gray-300 text-sm mb-2">Process text with AI</p>
                <code className="text-xs bg-dark-800/50 px-2 py-1 rounded text-green-400">Returns: Inference result</code>
              </div>
            </div>
          </div>
          
          <div className="glass-dark rounded-xl p-6">
            <h3 className="text-lg font-bold mb-4 text-primary-400">Rate Limits</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-dark-800/30 rounded p-4">
                <h4 className="font-medium text-primary-300 mb-2">Free Tier</h4>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>• 100 requests/hour</li>
                  <li>• 10,000 characters max</li>
                  <li>• Standard models only</li>
                </ul>
              </div>
              <div className="bg-dark-800/30 rounded p-4">
                <h4 className="font-medium text-primary-300 mb-2">Pro Tier</h4>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>• Unlimited requests</li>
                  <li>• 50,000 characters max</li>
                  <li>• All models + priority</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )
    }
  };

  const currentSection = sections[activeSection];

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={activeSection}
        variants={contentVariants}
        initial="hidden"
        animate="visible"
        exit="hidden"
        className="mt-8"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-primary-500/20 rounded-lg">
            {currentSection.icon}
          </div>
          <h2 className="text-2xl font-bold">{currentSection.title}</h2>
        </div>
        
        {currentSection.content}
      </motion.div>
    </AnimatePresence>
  );
};

export default NavigationContent;

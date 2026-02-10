import { useState, useCallback, useRef } from 'react';

export const useInference = () => {
  const [text, setText] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [inferenceHistory, setInferenceHistory] = useState([]);
  const abortControllerRef = useRef(null);

  const processInference = useCallback(async (model, parameters = {}) => {
    if (!text.trim()) {
      setError('Please enter some text to process');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    // Create new abort controller for this request
    abortControllerRef.current = new AbortController();

    try {
      const requestData = {
        text: text.trim(),
        model: model,
        version: 'v1',
        parameters: parameters
      };

      const response = await fetch('/infer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
        signal: abortControllerRef.current.signal
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      setResult(data);
      
      // Add to history
      setInferenceHistory(prev => [
        ...prev,
        {
          requestId: data.request_id,
          text: text.trim(),
          model: data.model_used,
          latencyMs: data.latency_ms,
          success: data.success,
          timestamp: new Date().toISOString(),
          result: data.result
        }
      ]);

    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(err.message || 'Failed to process inference');
        console.error('Inference error:', err);
      }
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
  }, [text]);

  const stopInference = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setLoading(false);
      setError('Request was cancelled');
    }
  }, []);

  const clearHistory = useCallback(() => {
    setInferenceHistory([]);
  }, []);

  const retryInference = useCallback((model, parameters) => {
    processInference(model, parameters);
  }, [processInference]);

  return {
    text,
    setText,
    result,
    loading,
    error,
    inferenceHistory,
    processInference,
    stopInference,
    clearHistory,
    retryInference
  };
};

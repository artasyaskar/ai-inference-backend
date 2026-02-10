import { useState, useEffect, useCallback } from 'react';

export const useModels = () => {
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchModels = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/models');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setModels(data);

    } catch (err) {
      setError(err.message || 'Failed to fetch models');
      console.error('Models fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadModel = useCallback(async (modelName, version = 'v1') => {
    try {
      const response = await fetch(`/models/${modelName}/load?version=${version}`, {
        method: 'POST'
      });

      if (!response.ok) {
        throw new Error(`Failed to load model: ${response.status}`);
      }

      // Refresh models list to update loaded status
      await fetchModels();
      return await response.json();

    } catch (err) {
      console.error('Model load error:', err);
      throw err;
    }
  }, [fetchModels]);

  const unloadModel = useCallback(async (modelName, version = 'v1') => {
    try {
      const response = await fetch(`/models/${modelName}/unload?version=${version}`, {
        method: 'POST'
      });

      if (!response.ok) {
        throw new Error(`Failed to unload model: ${response.status}`);
      }

      // Refresh models list to update loaded status
      await fetchModels();
      return await response.json();

    } catch (err) {
      console.error('Model unload error:', err);
      throw err;
    }
  }, [fetchModels]);

  useEffect(() => {
    fetchModels();
  }, [fetchModels]);

  return {
    models,
    loading,
    error,
    fetchModels,
    loadModel,
    unloadModel
  };
};

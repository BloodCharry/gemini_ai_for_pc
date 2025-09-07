const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const sendMessage = async (message: string) => {
  const response = await fetch(`${API_URL}/api/text`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ messages: [message] }),
  });
  return await response.json();
};

export const generateImage = async (prompt: string) => {
  const response = await fetch(`${API_URL}/api/image`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ prompt }),
  });
  return await response.json();
};

export const analyzeImage = async (file: File, question?: string) => {
  const formData = new FormData();
  formData.append('file', file);
  if (question) {
    formData.append('question', question);
  }

  const response = await fetch(`${API_URL}/api/vision`, {
    method: 'POST',
    body: formData,
  });
  return await response.json();
};

export const executeCode = async (prompt: string) => {
  const response = await fetch(`${API_URL}/api/execute-code`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ prompt }),
  });
  return await response.json();
};
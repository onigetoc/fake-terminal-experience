const API_URL = 'http://localhost:3001';

export const executeRemoteCommand = async (command: string) => {
  const response = await fetch(`${API_URL}/execute`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ command })
  });

  if (!response.ok) {
    throw new Error('Network response was not ok');
  }

  return response.json();
};

let API_PORT: number | null = null;

async function getApiUrl(): Promise<string> {
  if (API_PORT) {
    return `http://localhost:${API_PORT}`;
  }

  // Try ports from 3001 to 3010
  for (let port = 3001; port <= 3010; port++) {
    try {
      const response = await fetch(`http://localhost:${port}`, {
        method: 'GET',
      });
      if (response.ok) {
        API_PORT = port;
        return `http://localhost:${port}`;
      }
    } catch (error) {
      continue;
    }
  }
  throw new Error('Could not find running API server');
}

export const executeRemoteCommand = async (command: string) => {
  const API_URL = await getApiUrl();
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

const API_URL = 'http://localhost:3001';

interface CommandResponse {
  stdout: string;
  stderr: string;
  newCwd?: string;
}

export async function executeRemoteCommand(command: string): Promise<CommandResponse> {
  try {
    const response = await fetch(`${API_URL}/execute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ command }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Network response was not ok');
    }

    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

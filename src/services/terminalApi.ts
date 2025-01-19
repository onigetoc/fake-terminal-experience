const API_URL = 'http://localhost:3001';

interface CommandResponse {
  stdout: string;
  stderr: string;
  newCwd?: string;
}

export async function executeRemoteCommand(command: string, signal?: AbortSignal): Promise<CommandResponse> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000);

    const response = await fetch(`${API_URL}/execute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ command }),
      signal: signal || controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Network response was not ok');
    }

    return await response.json();
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error('Command execution timed out');
      }
      throw error;
    }
    throw new Error('Unknown error occurred');
  }
}

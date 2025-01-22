const API_URL = 'http://localhost:3001';

interface CommandResponse {
  stdout: string;
  stderr: string;
  newCwd?: string;
}

export const executeRemoteCommand = async (
  command: string,
  signal?: AbortSignal
): Promise<CommandResponse> => {
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
      throw new Error('Network response was not ok');
    }

    const data: CommandResponse = await response.json();
    return data;
  } catch (error) {
    if ((error as any).name === 'AbortError') {
      throw new Error('Command execution timed out');
    }
    throw error;
  }
}

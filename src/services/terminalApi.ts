const API_URL = 'http://localhost:3001';

interface CommandResponse {
  stdout: string;
  stderr: string;
  newCwd?: string;  // Ajout du nouveau répertoire courant
}

export async function executeRemoteCommand(command: string): Promise<CommandResponse> {
  try {
    // Envoyer la commande directement, sans encodage supplémentaire
    const response = await fetch(`${API_URL}/execute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
      body: JSON.stringify({ command }),
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { executeCommand } from './commandService.js';
import { createServer } from 'http';
import { AddressInfo } from 'net';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const DEFAULT_PORT = 3001;

app.use(cors());
app.use(express.json());

// Ajouter une route de test
app.get('/', (req, res) => {
  res.json({ message: 'Server is running!' });
});

// Supprimer la route system-locale
app.post('/execute', async (req, res) => {
  try {
    const { command } = req.body;
    const result = await executeCommand(command);
    res.json(result);
  } catch (error) {
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Internal Server Error' 
    });
  }
});

function findAvailablePort(startPort: number): Promise<number> {
  return new Promise((resolve, reject) => {
    const server = createServer();
    
    server.on('error', (err: NodeJS.ErrnoException) => {
      if (err.code === 'EADDRINUSE') {
        // Port is in use, try next port
        server.close(() => {
          resolve(findAvailablePort(startPort + 1));
        });
      } else {
        reject(err);
      }
    });

    server.listen(startPort, () => {
      const { port } = server.address() as AddressInfo;
      server.close(() => {
        resolve(port);
      });
    });
  });
}

async function startServer() {
  try {
    const port = await findAvailablePort(DEFAULT_PORT);
    app.listen(port, () => {
      console.log(`Server running at http://localhost:${port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

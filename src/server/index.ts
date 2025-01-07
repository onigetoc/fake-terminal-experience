import { serve } from "bun";
import { executeCommand } from './commandService';
import { config } from 'dotenv';
import { resolve } from 'path';

// Charger les variables d'environnement
config({ path: resolve(__dirname, '../../.env') });

// Forcer le port 3000
const server = serve({
  port: 3001,  // Changement du port par défaut à 3001
  async fetch(req) {
    // Enable CORS with proper encoding
    if (req.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Content-Type': 'application/json; charset=utf-8'
        }
      });
    }

    if (req.method === 'POST') {
      try {
        const body = await req.json();
        const { command } = body;
        const result = await executeCommand(command);
        
        return new Response(JSON.stringify(result), {
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Access-Control-Allow-Origin': '*'
          }
        });
      } catch (error) {
        return new Response(
          JSON.stringify({ error: 'Internal Server Error' }), 
          { 
            status: 500,
            headers: {
              'Content-Type': 'application/json; charset=utf-8'
            }
          }
        );
      }
    }

    return new Response('Method not allowed', { status: 405 });
  }
});

console.log(`Server running at http://localhost:${server.port}`);
console.log('Press Ctrl + C to stop the server');

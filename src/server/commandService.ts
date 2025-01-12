import { exec, spawn } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import * as os from 'os';
import iconv from 'iconv-lite';
import { isCustomCommand, executeCustomCommand } from '../services/customCommands';

const execAsync = promisify(exec);
let currentWorkingDirectory = process.cwd();

// Configuration de base
const isWindows = process.platform === 'win32';

// Liste des commandes qui nécessitent un traitement spécial pour l'encodage
const specialEncodingCommands = {
  tree: true,
  dir: true,
  type: true,
  chcp: true,
  fc: true  // Ajout de fc ici
};

// Fonction utilitaire pour détecter l'encodage approprié
function getProperEncoding(command: string): string {
  if (isWindows) {
    // Commandes spécifiques qui nécessitent un encodage différent
    if (command.startsWith('dir') || command.includes('tree')) {
      return 'cp850';  // Pour les commandes système Windows
    }
    return 'cp866';  // Pour les autres commandes Windows
  }
  return 'utf8';  // Pour Unix/Linux/MacOS
}

// Fonction utilitaire pour obtenir la langue système
function getSystemLocale(): string {
  return Intl.DateTimeFormat().resolvedOptions().locale || 'en-US';
}

// Liste des commandes qui nécessitent PowerShell sur Windows
const windowsSpecialCommands = ['dir', 'tree', 'type', 'systeminfo'];

async function executeWindowsCommand(command: string): Promise<CommandResult> {
  // Traitement spécial pour la commande fc
  if (command.startsWith('fc ')) {
    return new Promise((resolve) => {
      // Configuration avec encodage UTF-8 universel
      const child = spawn('cmd.exe', ['/d', '/u', '/c', command], {
        shell: false,
        windowsHide: true,
        cwd: currentWorkingDirectory,
        env: {
          ...process.env,
          LANG: `${getSystemLocale()}.UTF-8`,
          LC_ALL: `${getSystemLocale()}.UTF-8`,
        }
      });

      let stdout = Buffer.from([]);
      let stderr = Buffer.from([]);

      child.stdout.on('data', (data) => {
        stdout = Buffer.concat([stdout, data]);
      });

      child.stderr.on('data', (data) => {
        stderr = Buffer.concat([stderr, data]);
      });

      child.on('error', (err) => {
        // Ajouter l'erreur au stderr pour qu'elle soit renvoyée
        stderr = Buffer.concat([stderr, Buffer.from(err.message, 'utf8')]);
      });

      child.on('close', (code) => {
        // Si code != 0, ajouter un message d'erreur supplémentaire
        if (code !== 0 && stderr.length === 0) {
          stderr = Buffer.from(`Process exited with code ${code}\n`, 'utf8');
        }
        resolve({
          stdout: iconv.decode(stdout, 'cp437'),
          stderr: iconv.decode(stderr, 'cp437'),
          newCwd: currentWorkingDirectory
        });
      });
    });
  }

  // Configuration générale pour cmd.exe
  const setup = [
    'chcp 65001>nul', // Force UTF-8
    '@echo off',
    command
  ].join(' & ');

  return new Promise((resolve) => {
    const child = spawn('cmd.exe', ['/d', '/u', '/c', setup], {
      shell: false,
      windowsHide: true,
      cwd: currentWorkingDirectory,
      env: {
        ...process.env,
        LANG: `${getSystemLocale()}.UTF-8`,
        LC_ALL: `${getSystemLocale()}.UTF-8`,
      }
    });

    let stdout = Buffer.from([]);
    let stderr = Buffer.from([]);

    child.stdout.on('data', (data) => {
      stdout = Buffer.concat([stdout, data]);
    });

    child.stderr.on('data', (data) => {
      stderr = Buffer.concat([stderr, data]);
    });

    child.on('error', (err) => {
      // Ajouter l'erreur au stderr pour qu'elle soit renvoyée
      stderr = Buffer.concat([stderr, Buffer.from(err.message, 'utf8')]);
    });

    child.on('close', (code) => {
      // Forcer code=0 s’il s’agit d’explorer avec un lien
      if (command.toLowerCase().includes('explorer') && command.match(/https?:\/\//i)) {
        code = 0;
      }

      // Forcer code=0 si "explorer" renvoie une erreur en ouvrant un lien
      if (command.toLowerCase().includes('explorer') && command.match(/https?:\/\//i)) {
        code = 0;
      }

      // Si code != 0, ajouter un message d'erreur supplémentaire
      if (code !== 0 && stderr.length === 0) {
        stderr = Buffer.from(`Process exited with code ${code}\n`, 'utf8');
      }
      // Détecter si la commande nécessite un encodage spécial
      const baseCommand = command.split(' ')[0].toLowerCase();
      const encoding = specialEncodingCommands[baseCommand] ? 'cp437' : 'utf8';

      resolve({
        stdout: iconv.decode(stdout, encoding)
          .replace(/\r\n/g, '\n')  // Normaliser les sauts de ligne
          .replace(/[\x00-\x09\x0B-\x0C\x0E-\x1F\x7F-\x9F]/g, ''), // Nettoyer les caractères de contrôle
        stderr: iconv.decode(stderr, encoding),
        newCwd: currentWorkingDirectory
      });
    });
  });
}

export async function executeCommand(command: string): Promise<CommandResult> {
  try {
    const cmd = command.trim();

    // Configuration de base pour l'exécution
    const execOptions = {
      encoding: 'buffer' as const,
      cwd: currentWorkingDirectory,
      env: {
        ...process.env,
        FORCE_COLOR: '1',
        TERM: 'xterm-256color',
        LANG: `${getSystemLocale()}.UTF-8`,
        LC_ALL: `${getSystemLocale()}.UTF-8`,
      }
    };

    // Gestion des commandes spéciales
    if (isCustomCommand(cmd)) {
      return {
        stdout: executeCustomCommand(cmd),
        stderr: '',
        newCwd: currentWorkingDirectory
      };
    }

    // Gestion de cd
    if (cmd.startsWith('cd')) {
      const pathArg = cmd.slice(2).trim();
      let targetPath;

      if (!pathArg || pathArg === '~') {
        targetPath = os.homedir();
      } else if (pathArg === '..' || pathArg === '../') {
        targetPath = path.join(currentWorkingDirectory, '..');
      } else {
        targetPath = path.resolve(currentWorkingDirectory, pathArg);
      }

      try {
        process.chdir(targetPath);
        currentWorkingDirectory = process.cwd();
        return {
          stdout: `Directory changed to ${currentWorkingDirectory}`,
          stderr: '',
          newCwd: currentWorkingDirectory
        };
      } catch (error) {
        return {
          stdout: '',
          stderr: `cd: no such file or directory: ${pathArg}`,
          newCwd: currentWorkingDirectory
        };
      }
    }

    // Ajouter un bloc spécial pour la commande "start"
    if (isWindows && cmd.toLowerCase().startsWith('start ')) {
      const toOpen = cmd.slice(5).trim();
      const specialSetup = [
        'powershell.exe',
        '-NoProfile',
        '-ExecutionPolicy',
        'Bypass',
        '-Command',
        `[Console]::OutputEncoding=[System.Text.Encoding]::UTF8; Start-Process "${toOpen}" -Wait`
      ];

      return new Promise((resolve) => {
        const child = spawn(specialSetup[0], specialSetup.slice(1), {
          shell: false,
          windowsHide: true,
          cwd: currentWorkingDirectory,
          env: {
            ...process.env,
            LANG: `${getSystemLocale()}.UTF-8`,
            LC_ALL: `${getSystemLocale()}.UTF-8`,
          },
        });

        let stdout = Buffer.from([]);
        let stderr = Buffer.from([]);

        child.stdout.on('data', (data) => {
          stdout = Buffer.concat([stdout, data]);
        });

        child.stderr.on('data', (data) => {
          stderr = Buffer.concat([stderr, data]);
        });

        child.on('error', (err) => {
          stderr = Buffer.concat([stderr, Buffer.from(err.message, 'utf8')]);
        });

        child.on('close', (code) => {
          if (code !== 0 && stderr.length === 0) {
            stderr = Buffer.from(`Process exited with code ${code}\n`, 'utf8');
          }
          resolve({
            stdout: iconv.decode(stdout, 'utf8'),
            stderr: iconv.decode(stderr, 'utf8'),
            newCwd: currentWorkingDirectory
          });
        });
      });
    }

    // Pour Windows, traiter différemment selon la commande
    if (isWindows) {
      const baseCommand = cmd.split(' ')[0].toLowerCase();
      if (specialEncodingCommands[baseCommand] || cmd.includes('tree')) {
        return executeWindowsCommand(cmd);
      }
    }

    // Pour les autres commandes, utiliser l'approche standard
    const { stdout, stderr } = await execAsync(cmd, {
      encoding: 'buffer',
      cwd: currentWorkingDirectory,
      env: {
        ...process.env,
        FORCE_COLOR: '1',
        TERM: 'xterm-256color',
        LANG: `${getSystemLocale()}.UTF-8`,
        LC_ALL: `${getSystemLocale()}.UTF-8`,
      }
    });

    return {
      stdout: iconv.decode(stdout, 'utf8'),
      stderr: iconv.decode(stderr, 'utf8'),
      newCwd: currentWorkingDirectory
    };

  } catch (error) {
    if (error instanceof Error) {
      return {
        stdout: '',
        stderr: error.message,
        newCwd: currentWorkingDirectory
      };
    }
    
    return {
      stdout: '',
      stderr: 'Une erreur inconnue est survenue',
      newCwd: currentWorkingDirectory
    };
  }
}

interface CommandResult {
  stdout: string;
  stderr: string;
  newCwd: string;
}

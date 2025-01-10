import { exec, spawn } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import * as os from 'os';
import iconv from 'iconv-lite';
import { isCustomCommand, executeCustomCommand } from '../services/customCommands';
// import shell from 'shelljs';

const execAsync = promisify(exec);
let currentWorkingDirectory = process.cwd();

// Configuration de base
const isWindows = process.platform === 'win32';

export async function executeCommand(command: string): Promise<CommandResult> {
  try {
    const cmd = command.trim();

    // Commandes personnalisées
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

    // Commande tree sur Windows
    if (isWindows && cmd.startsWith('tree')) {
      return new Promise((resolve) => {
        const child = spawn(cmd, [], {
          shell: true,
          cwd: currentWorkingDirectory
        });

        let stdout = Buffer.from([]);

        child.stdout.on('data', (data) => {
          stdout = Buffer.concat([stdout, data]);
        });

        child.on('close', () => {
          resolve({
            stdout: iconv.decode(stdout, 'cp437'),
            // stdout: stdout,
            stderr: '',
            newCwd: currentWorkingDirectory
          });
        });
      });
    }

    const cmdName = cmd.split(' ')[0];

    // Pour les commandes npm
    if (cmdName === 'npm') {
      try {
        const { stdout, stderr } = await execAsync(cmd, {
          encoding: 'utf8',
          cwd: currentWorkingDirectory,
          env: {
            ...process.env,
            FORCE_COLOR: '1',  // Forcer les couleurs
            npm_config_color: 'always',  // Forcer les couleurs pour npm
            TERM: 'xterm-256color'
          }
        });

        // Combiner stdout et stderr pour npm ls
        if (cmd === 'npm ls') {
          return {
            stdout: `${stdout}\n${stderr}`,  // Combiner les deux sorties
            stderr: '',  // On laisse stderr vide car on l'a déjà inclus dans stdout
            newCwd: currentWorkingDirectory
          };
        }

        return {
          stdout: stdout.toString('utf8'),
          stderr: stderr.toString('utf8'),
          newCwd: currentWorkingDirectory
        };
      } catch (error) {
        // Pour npm ls, on veut quand même afficher la sortie même en cas d'erreur
        if (cmd === 'npm ls' && error instanceof Error) {
          const { stdout, stderr } = error as any;
          return {
            stdout: `${stdout || ''}\n${stderr || ''}`,
            stderr: '',
            newCwd: currentWorkingDirectory
          };
        }
        throw error;
      }
    }

    // Pour les commandes echo
    if (cmdName === 'echo') {
      const { stdout, stderr } = await execAsync(cmd, {
        encoding: 'buffer',
        cwd: currentWorkingDirectory,
        env: {
          ...process.env,
          FORCE_COLOR: '1',
          TERM: 'xterm-256color',
          LANG: 'fr_FR.UTF-8',
          LC_ALL: 'fr_FR.UTF-8'
        }
      });

      // Utiliser cp850 pour les commandes echo
      const cleanStdout = iconv.decode(stdout, 'cp850');
      const cleanStderr = iconv.decode(stderr, 'cp850');

      return {
        stdout: cleanStdout,
        stderr: cleanStderr,
        newCwd: currentWorkingDirectory
      };
    }

    // Autres commandes
    const { stdout, stderr } = await execAsync(cmd, {
      encoding: 'buffer',  // Changement ici: utiliser buffer au lieu de utf8
      cwd: currentWorkingDirectory,
      env: {
        ...process.env,
        FORCE_COLOR: '1',
        TERM: 'xterm-256color'
      }
    });

    // Convertir la sortie avec le bon encodage
    const cleanStdout = iconv.decode(stdout, 'cp850');
    const cleanStderr = iconv.decode(stderr, 'cp850');

    return {
      stdout: cleanStdout,
      stderr: cleanStderr,
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

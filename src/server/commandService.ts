import { exec, spawn } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import * as os from 'os';
import iconv from 'iconv-lite';
import { isCustomCommand, executeCustomCommand } from '../services/customCommands';
import shell from 'shelljs';

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
            stderr: '',
            newCwd: currentWorkingDirectory
          });
        });
      });
    }

    // Autres commandes
    const { stdout, stderr } = await execAsync(cmd, {
      encoding: 'buffer',
      cwd: currentWorkingDirectory
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

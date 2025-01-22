declare global {
  interface Window {
    executeCommand: (cmd: string | string[], displayInTerminal?: number) => Promise<void>;
  }
}

let terminalCommandExecutor: ((cmd: string | string[], displayInTerminal?: number) => Promise<void>) | null = null;

export function setTerminalExecutor(executor: ((cmd: string | string[], displayInTerminal?: number) => Promise<void>) | null) {
  terminalCommandExecutor = executor;
  if (executor && typeof window !== 'undefined') {
    window.executeCommand = executor;
  }
}

export function executeCommand(command: string | string[], displayInTerminal: number = 1): Promise<void> {
  if (!terminalCommandExecutor) {
    return Promise.reject(new Error('Terminal executor not initialized'));
  }
  return terminalCommandExecutor(command, displayInTerminal);
}

// Assurer que executeCommand est disponible globalement
if (typeof window !== 'undefined') {
    window.executeCommand = executeCommand;
}

let globalTerminalRef: { executeCommand: (cmd: string | string[], displayInTerminal?: number) => void } | null = null;

export function setGlobalTerminalRef(
  ref: { executeCommand: (cmd: string | string[], displayInTerminal?: number) => void } | null
) {
  globalTerminalRef = ref;
}

export function globalExecuteCommand(
  command: string | string[],
  displayInTerminal: number = 1
) {
  if (globalTerminalRef) {
    globalTerminalRef.executeCommand(command, displayInTerminal);
  }
}
const CUSTOM_COMMANDS = {
  help: () => `Available commands:
  help    - Show this help message
  about   - About this terminal
  cls | clear   - Clear terminal screen
  
  executing command:
  executeCommand('help')}
  executeCommand(['help', 'npm ls', 'about'])}
  
  Documentation: https://github.com/onigetoc/fake-terminal-experience`,

  about: () => 
`Terminal Emulator v1.0
Built with React + Vite
Github Repository: https://github.com/onigetoc/fake-terminal-experience`,
};

export function isCustomCommand(command: string): boolean {
  const cmd = command.trim().split(' ')[0];
  return cmd in CUSTOM_COMMANDS;
}

export function executeCustomCommand(command: string): string {
  const cmd = command.trim().split(' ')[0];
  return cmd in CUSTOM_COMMANDS ? CUSTOM_COMMANDS[cmd as keyof typeof CUSTOM_COMMANDS]() : '';
}

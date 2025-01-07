const CUSTOM_COMMANDS = {
  help: () => `
Available commands:
  help    - Show this help message
  about   - About this terminal
  clear   - Clear terminal screen`,

  about: () => `
Terminal Emulator v1.0
Built with React + Vite`,
};

export function isCustomCommand(command: string): boolean {
  const cmd = command.trim().split(' ')[0];
  return cmd in CUSTOM_COMMANDS;
}

export function executeCustomCommand(command: string): string {
  const cmd = command.trim().split(' ')[0];
  return cmd in CUSTOM_COMMANDS ? CUSTOM_COMMANDS[cmd as keyof typeof CUSTOM_COMMANDS]() : '';
}

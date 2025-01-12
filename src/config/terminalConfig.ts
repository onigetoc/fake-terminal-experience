// Terminal configuration type
export type TerminalConfig = {
  // UI Options
  showTerminal: boolean;
  startFullscreen: boolean;
  defaultHeight: number;
  defaultWidth: number;
  minHeight: number;
  minWidth: number;
  
  // Behavior
  showExecutedCommands: boolean;
  keepCommandHistory: boolean;
  maxHistoryLength: number;
  
  // Appearance
  theme: 'dark' | 'light' | 'system';
  fontSize: number;
  fontFamily: string;
  
  // Terminal
  promptString: string;
  showPath: boolean;
  
  // Performance
  maxOutputLength: number;
  scrollbackLimit: number;
};

// Default configuration
export const defaultConfig: TerminalConfig = {
  showTerminal: true,
  startFullscreen: false,
  defaultHeight: 320,
  minHeight: 200,
  minWidth: 400,
  showExecutedCommands: true,
  keepCommandHistory: true,
  maxHistoryLength: 100,
  theme: 'dark',
  fontSize: 14,
  fontFamily: 'monospace',
  promptString: '$ ',
  showPath: true,
  maxOutputLength: 1000,
  scrollbackLimit: 1000,
};

// Global configuration instance
let currentConfig: TerminalConfig = { ...defaultConfig };

// Configuration utility
export const terminalConfig = {
  // Get current config
  get: () => currentConfig,
  
  // Update config
  set: (newConfig: Partial<TerminalConfig>) => {
    currentConfig = {
      ...currentConfig,
      ...newConfig
    };
    return currentConfig;
  },
  
  // Reset to defaults
  reset: () => {
    currentConfig = { ...defaultConfig };
    return currentConfig;
  },
  
  // Nouvelle méthode pour contrôler la visibilité
  toggleVisibility: (show?: boolean) => {
    currentConfig = {
      ...currentConfig,
      showTerminal: show !== undefined ? show : !currentConfig.showTerminal
    };
    return currentConfig;
  }
};

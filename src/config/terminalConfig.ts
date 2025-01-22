// Terminal configuration type
export type TerminalConfig = {
  initialState: 'open' | 'closed' | 'hidden';
  startFullscreen: boolean;
  defaultHeight: number;
  minHeight: number;
  minWidth: number;
  showExecutedCommands: boolean;
  keepCommandHistory: boolean;
  maxHistoryLength: number;
  theme: 'dark' | 'light' | 'system';
  fontSize: number;
  fontFamily: string;
  showPath: boolean;
  maxOutputLength: number;
  scrollbackLimit: number;
  startMinimized: boolean;
  showFloatingButton: boolean;
  showTerminal: boolean;
  readOnlyMode: boolean;
};

export const defaultConfig: TerminalConfig = {
  initialState: 'open',
  readOnlyMode: false,
  startFullscreen: false,
  showFloatingButton: true,
  showTerminal: true,
  startMinimized: false,
  defaultHeight: 320,
  minHeight: 200,
  minWidth: 300,
  showExecutedCommands: true,
  keepCommandHistory: true,
  maxHistoryLength: 100,
  theme: 'dark',
  fontSize: 14,
  fontFamily: 'monospace',
  showPath: true,
  maxOutputLength: 1000,
  scrollbackLimit: 1000,
};

// Configuration utility
export const terminalConfig = {
  private: {
    current: { ...defaultConfig }
  },
  
  get: () => terminalConfig.private.current,
  
  set: (newConfig: Partial<TerminalConfig>) => {
    terminalConfig.private.current = {
      ...terminalConfig.private.current,
      ...newConfig
    };
    return terminalConfig.private.current;
  },
  
  reset: () => {
    terminalConfig.private.current = { ...defaultConfig };
    return terminalConfig.private.current;
  },

  toggleVisibility: (show?: boolean) => {
    terminalConfig.private.current.showTerminal = 
      show ?? !terminalConfig.private.current.showTerminal;
    return terminalConfig.private.current;
  }
};

// Terminal configuration type
export type TerminalConfig = {
  initialState: 'open' | 'closed' | 'hidden';  // Remplace showTerminal et startClosed
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
  promptString: string;
  showPath: boolean;
  maxOutputLength: number;
  scrollbackLimit: number;
  startMinimized: boolean;  // Ajout de la nouvelle option
  showFloatingButton: boolean;  // Nouvelle option
  showTerminal: boolean;         // Nouvelle option pour contrôler la visibilité
  readOnlyMode: boolean;  // Nouvelle option
};

export const defaultConfig: TerminalConfig = {
    initialState: 'open',  // open by default. OPTIONS: 'open' | 'closed' | 'hidden'
    readOnlyMode: false,    // Par défaut, terminal interactif complet
    startFullscreen: false,
    showFloatingButton: true,  // Par défaut, on montre le bouton flottant
    showTerminal: true,         // Valeur par défaut pour contrôler la visibilité
    startMinimized: false,    // Valeur par défaut globale
    defaultHeight: 320,
    minHeight: 200,
    minWidth: 300,  // Valeur par défaut pour la largeur minimale
    showExecutedCommands: true,
    keepCommandHistory: true,
    maxHistoryLength: 100,
    theme: 'dark',
    fontSize: 14,
    fontFamily: 'monospace',
    // promptString: '$ ', // ⌘ // % // $ // >
    showPath: true,
    maxOutputLength: 1000,
    scrollbackLimit: 1000,
    promptString: '$ ',
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

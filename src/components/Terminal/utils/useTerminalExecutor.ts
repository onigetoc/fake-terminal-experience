import { createContext, useContext } from 'react';

// Définir le type pour l'exécuteur de commande
type ExecuteCommand = (cmd: string | string[], displayInTerminal?: number) => Promise<void>;

// Créer le contexte avec des valeurs par défaut null
const TerminalExecutorContext = createContext<{
  executeCommand: ExecuteCommand | null;
}>({
  executeCommand: null,
});

// Hook personnalisé pour utiliser le contexte
export function useTerminalExecutor() {
  const context = useContext(TerminalExecutorContext);
  if (!context) {
    throw new Error('useTerminalExecutor doit être utilisé dans un TerminalProvider');
  }
  return context.executeCommand;
}

// Exporter le contexte pour le provider
export { TerminalExecutorContext };

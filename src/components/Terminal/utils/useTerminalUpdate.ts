import { useState, useCallback } from 'react';

export function useTerminalUpdate() {
  const [terminalKey, setTerminalKey] = useState(0);

  const forceUpdate = useCallback(() => {
    setTerminalKey(prev => prev + 1);
  }, []);

  return { terminalKey, forceUpdate };
}

import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Button } from "@/components/ui/button";
import { X, Minus, Maximize2, Terminal as TerminalIcon, Trash2, Plus, Loader2, HelpCircle, Eraser, Info, FolderOpen, Minimize2 } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import '../../styles/terminal.css';
import { executeRemoteCommand } from '../../services/terminalApi';
import { translateCommand, shouldTranslateCommand } from '../../utils/osCommands';
import { terminalConfig, TerminalConfig } from '@/config/terminalConfig'; // Importer le type TerminalConfig
import { TerminalUI } from './TerminalUI';
import { setTerminalExecutor } from '@/utils/terminalUtils'; // Ajouter cette ligne

// Assurez-vous qu'il n'y a aucune utilisation de TerminalContext

interface TerminalOutput {
  command: string;
  output: string;
  isLoading?: boolean;
}

interface TerminalState {
  isClearing: boolean;
  isMinimizing: boolean;
}

const formatTextWithLinks = (text: string) => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return text.split(urlRegex).map((part, i) => {
    if (part.match(urlRegex)) {
      return (
        <a 
          key={i}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="terminal-link"
          onClick={(e) => {
            e.preventDefault();
            window.open(part, '_blank');
          }}
        >
          {part}
        </a>
      );
    }
    return part;
  });
};

const formatCommand = (command: string) => {
  const words = command.split(' ');
  const firstWord = words[0];
  const rest = command.slice(firstWord.length);
  
  // Modifier le regex pour inclure les paramètres avec un ou deux tirets
  const paramRegex = /(\s-[a-zA-Z]+|\s--[a-zA-Z-]+)|("[^"]*")|('[^']*')/g;
  
  const formattedRest = rest.replace(paramRegex, match => {
    if (match.startsWith(' -')) {
      return `<span class="text-gray-400">${match}</span>`; // Paramètres en orange ou gray
    }
    return `<span class="text-[#3b8eea]">${match}</span>`; // Chaînes entre guillemets en bleu
  });

  return (
    <>
      <span className="text-yellow-300">{firstWord}</span>
      <span 
        className="terminal-command"
        dangerouslySetInnerHTML={{ __html: formattedRest }}
      />
    </>
  );
};

const parseAnsiColor = (text: string) => {
  // Regex qui capture à la fois les codes simples et composés
  const ansiRegex = /\u001b\[(\d+(?:;\d+)*)?m/g;
  
  const colorMap: Record<string, string> = {
    // Codes simples
    '31': 'text-red-500',
    '32': 'text-green-500',
    '33': 'text-yellow-500',
    '34': 'text-blue-500',
    '35': 'text-purple-500', // ERROR ???
    // '35': 'text-red-400',
    '36': 'text-cyan-500',
    '37': 'text-gray-100',
    '90': 'text-gray-500',
    // Reset
    '0': '',
    // Le code pour 'extraneous' (probablement en gris)
    '39': 'text-gray-300'
  };

  const parts = [];
  let lastIndex = 0;
  let currentClass = '';
  let match;

  while ((match = ansiRegex.exec(text)) !== null) {
    // Ajouter le texte avant le code ANSI
    if (match.index > lastIndex) {
      parts.push(
        <span key={lastIndex} className={currentClass}>
          {text.slice(lastIndex, match.index)}
        </span>
      );
    }

    // Mettre à jour la classe de couleur
    if (match[1]) {
      currentClass = colorMap[match[1]] || currentClass;
    }

    lastIndex = match.index + match[0].length;
  }

  // Ajouter le reste du texte
  if (lastIndex < text.length) {
    parts.push(
      <span key={lastIndex} className={currentClass}>
        {text.slice(lastIndex)}
      </span>
    );
  }

  return parts;
};

// Modifier l'interface pour inclure displayInTerminal
interface TerminalProps {
  config?: Partial<TerminalConfig>;
}

export const Terminal = forwardRef<any, TerminalProps>(({ config: propsConfig }, ref): JSX.Element => {
  const mergedConfig = {
    ...terminalConfig.get(),
    ...propsConfig
  };

  // Simple détection de langue une seule fois
  const userLocale = useRef(navigator.language || 'en-US');

  // Log unique au démarrage pour debug
  useEffect(() => {
    console.log('User Locale:', userLocale.current);
  }, []);

  // États initiaux basés sur initialState
  const [isVisible, setIsVisible] = useState(mergedConfig.initialState !== 'hidden');
  const [isOpen, setIsOpen] = useState(mergedConfig.initialState === 'open');

  // Utiliser directement mergedConfig pour les états initiaux
  const [isFullscreen, setIsFullscreen] = useState(mergedConfig.startFullscreen);
  const [height, setHeight] = useState(mergedConfig.defaultHeight);
  const [isMinimized, setIsMinimized] = useState(mergedConfig.startMinimized);

  // Ajouter un effet pour synchroniser les changements de configuration
  useEffect(() => {
    setHeight(mergedConfig.defaultHeight);
    setIsMinimized(mergedConfig.startMinimized);
  }, [mergedConfig.defaultHeight, mergedConfig.startMinimized]);

  // Autres états
  const [command, setCommand] = useState('');
  const [history, setHistory] = useState<TerminalOutput[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const terminalRef = useRef<HTMLDivElement>(null);
  const dragStartY = useRef<number>(0);
  const dragStartHeight = useRef<number>(0);
  const { toast } = useToast();
  const [currentDirectory, setCurrentDirectory] = useState<string>('');
  const [osInfo] = useState(() => {
    // Détection simple du système d'exploitation côté client
    const userAgent = window.navigator.userAgent;
    if (userAgent.indexOf('Win') !== -1) return 'Windows';
    if (userAgent.indexOf('Mac') !== -1) return 'MacOS';
    if (userAgent.indexOf('Linux') !== -1) return 'Linux';
    return 'Unknown OS';
  });

  const scrollToBottom = () => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [history]);

  // Initialiser le répertoire courant
  useEffect(() => {
    async function initDirectory() {
      try {
        const savedDir = localStorage.getItem('terminalDirectory');
        if (savedDir) {
          setCurrentDirectory(savedDir);
        } else {
          const defaultPath = osInfo === 'Windows' ? process.env.USERPROFILE || 'C:\\Users' : os.homedir();
          setCurrentDirectory(defaultPath);
          localStorage.setItem('terminalDirectory', defaultPath);
        }
      } catch (error) {
        console.error('Directory initialization error:', error);
      }
    }
    initDirectory();
  }, [osInfo]);

  useEffect(() => {
    if (currentDirectory) {
      localStorage.setItem('terminalDirectory', currentDirectory);
    }
  }, [currentDirectory]);

  // Handle mouse events for resizing
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    dragStartY.current = e.clientY;
    dragStartHeight.current = height;
    document.body.style.cursor = 'ns-resize';
    document.body.style.userSelect = 'none';
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging && !isFullscreen) {
        const deltaY = dragStartY.current - e.clientY;
        const newHeight = Math.max(100, Math.min(window.innerHeight - 40, dragStartHeight.current + deltaY));
        setHeight(newHeight);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isFullscreen]);

  const simulateCommand = async (cmd: string): Promise<string> => {
    try {
      const translatedCmd = shouldTranslateCommand(cmd) ? translateCommand(cmd) : cmd;
      const { stdout, stderr, newCwd } = await executeRemoteCommand(translatedCmd, userLocale.current);
      
      if (newCwd && newCwd !== currentDirectory) {
        setCurrentDirectory(newCwd);
      }

      return stderr || stdout || 'Command executed successfully';
    } catch (error) {
      console.error('Command execution error:', error);
      return `Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`;
    }
  };

  // On crée une ref vers TerminalSearch
  const searchRef = useRef<{ removeAllHighlights: () => void } | null>(null);

  // Ajouter les refs pour l'observer et le contenu
  const observerRef = useRef<MutationObserver | null>(null);
  const contentRef = useRef<HTMLElement | null>(null);

  // Initialiser l'observer
  useEffect(() => {
    contentRef.current = document.querySelector('.terminal-scrollbar');
    
    if (contentRef.current && !observerRef.current) {
      observerRef.current = new MutationObserver(() => {
        // La logique de l'observer sera gérée par TerminalSearch
      });
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  // Ajouter un AbortController pour gérer les commandes en cours
  const currentCommandController = useRef<AbortController | null>(null);

  // Modifier la structure de la queue pour inclure resolve/reject
  const commandQueue = useRef<Array<{
    cmd: string | string[],
    displayInTerminal: number,
    resolve: () => void,
    reject: (err: Error) => void
  }>>([]);

  // Ajouter la file de commandes et l'état d'exécution
  const [isCommandRunning, setIsCommandRunning] = useState(false);

  function runNextCommandInQueue() {
    if (commandQueue.current.length === 0) {
      setIsCommandRunning(false);
      return;
    }
    const { cmd, displayInTerminal, resolve, reject } = commandQueue.current.shift()!;
    runCommand(cmd, displayInTerminal, resolve, reject);
  }

  // Extraire la logique d'exécution dans une fonction
  async function runCommand(cmd: string | string[], displayInTerminal: number, resolve: () => void, reject: (err: Error) => void) {
    setIsCommandRunning(true);

    const commands = Array.isArray(cmd) ? cmd : [cmd];

    for (const command of commands) {
      if (!command.trim()) continue;
      // Handle clear commands
      if (command === 'clear' || command === 'cls') {
        try {
          // 1. Nettoyer les surlignages de recherche
          if (searchRef.current) {
            searchRef.current.removeAllHighlights();
          }

          // 2. Forcer un re-render en minimisant
          setIsMinimized(true);

          // 3. Attendre que le minimize soit appliqué
          await new Promise(resolve => setTimeout(resolve, 50));

          // 4. Nettoyer l'historique de manière sûre
          const clearHistory = async () => {
            setHistory([]);
            setCommand('');
            // 5. Attendre le prochain tick pour s'assurer que le state est mis à jour
            await new Promise(resolve => setTimeout(resolve, 0));
            // 6. Restaurer l'affichage
            setIsMinimized(false);
          };

          await clearHistory();
        } catch (error) {
          console.error('Error during clear:', error);
          // En cas d'erreur, s'assurer que le terminal n'est pas bloqué en minimize
          setIsMinimized(false);
        }
        continue;
      }

      // N'ajouter à l'historique que si displayInTerminal est 1
      if (displayInTerminal === 1) {
        setHistory(prev => [...prev, { command, output: '', isLoading: true }]);
      }

      try {
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Command execution timeout')), 30000);
        });

        const outputPromise = simulateCommand(command);
        const output = await Promise.race([outputPromise, timeoutPromise]);

        if (displayInTerminal === 1) {
          setHistory(prev => {
            const newHistory = [...prev];
            const lastEntry = newHistory[newHistory.length - 1];
            if (lastEntry && lastEntry.command === command) {
              lastEntry.output = String(output);
              lastEntry.isLoading = false;
            }
            return newHistory;
          });
        }
      } catch (error) {
        if (error.name === 'AbortError') {
          console.log('Command was killed');
          return;
        }
        console.error('Error executing command:', error);
        
        if (displayInTerminal === 1) {
          setHistory(prev => {
            const newHistory = [...prev];
            const lastEntry = newHistory[newHistory.length - 1];
            if (lastEntry && lastEntry.command === command) {
              lastEntry.output = `Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`;
              lastEntry.isLoading = false;
            }
            return newHistory;
          });

          toast({
            variant: "destructive",
            title: "Command Error",
            description: error instanceof Error ? error.message : 'Unknown error occurred',
          });
        }
        reject(error instanceof Error ? error : new Error(String(error)));
      }
    }

    // Quand c'est fini, lancer la prochaine commande
    resolve();
    runNextCommandInQueue();
  }

  // Modifier la fonction executeCommand pour gérer la file
  const executeCommand = (cmd: string | string[], displayInTerminal: number = 1): Promise<void> => {
    return new Promise((resolve, reject) => {
      commandQueue.current.push({ cmd, displayInTerminal, resolve, reject });
      if (!isCommandRunning) {
        runNextCommandInQueue();
      }
    });
  };

  // Exposer executeCommand via la ref
  useImperativeHandle(ref, () => ({
    executeCommand
  }));

  // Initialiser l'exécuteur global au montage du composant
  useEffect(() => {
    if (typeof setTerminalExecutor === 'function') {
      setTerminalExecutor(executeCommand);
      return () => setTerminalExecutor(null);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Séparer les commandes par point-virgule
    const commands = command.split(';').map(cmd => cmd.trim()).filter(Boolean);
    executeCommand(commands);
    setCommand('');
  };

  const formatOutput = (output: string) => {
    // Premier regex pour les URLs
    // const urlRegex = /(https?:\/\/[^\s]+)/g;
    const urlRegex = /https?:\/\/[^\s"')\]]+/g;
    
    // Regex amélioré pour les chemins Windows et Unix
    // const pathRegex = /(?:[a-zA-Z]:)?\\(?:[^\\/:*?"<>|\r\n@]+\\)*[^\\/:*?"<>|\r\n@]*|(?:\/(?!@)[^\/\r\n@]+)+/g;
    const pathRegex = /[A-Za-z]:\\(?:[^\\/:*?"<>|\r\n]+\\)+[^\\/:*?"<>|\r\n'")]+/g;
    // const pathRegex = /[A-Za-z]:(?:\\|\/)+(?:[^\\/:*?"<>|\r\n]+(?:\\|\/)+)+[^\\/:*?"<>|\r\n'")\]]+/g;
    
    // Diviser d'abord par les URLs
    const parts = [];
    let lastIndex = 0;
    let match;

    // Trouver toutes les URLs d'abord
    while ((match = urlRegex.exec(output)) !== null) {
      // Ajouter le texte avant l'URL
      if (match.index > lastIndex) {
        parts.push({
          type: 'text',
          content: output.slice(lastIndex, match.index)
        });
      }
      // Ajouter l'URL
      parts.push({
        type: 'url',
        content: match[0]
      });
      lastIndex = match.index + match[0].length;
    }

    // Ajouter le reste du texte
    if (lastIndex < output.length) {
      parts.push({
        type: 'text',
        content: output.slice(lastIndex)
      });
    }

    // Traiter chaque partie pour les chemins système
    return (
      <pre className="whitespace-pre-wrap break-words font-mono">
        {parts.map((part, i) => {
          if (part.type === 'url') {
            return (
              <a
                key={`url-${i}`}
                href={part.content}
                className="terminal-link"
                onClick={(e) => {
                  e.preventDefault();
                  window.open(part.content, '_blank', 'noopener,noreferrer');
                }}
              >
                {part.content}
              </a>
            );
          }

          // Traiter le texte pour les chemins
          const pathParts = [];
          let textLastIndex = 0;
          let pathMatch;

          while ((pathMatch = pathRegex.exec(part.content)) !== null) {
            // Ajouter le texte avant le chemin
            if (pathMatch.index > textLastIndex) {
              pathParts.push({
                type: 'text',
                content: part.content.slice(textLastIndex, pathMatch.index)
              });
            }
            // Ajouter le chemin
            pathParts.push({
              type: 'path',
              content: pathMatch[0]
            });
            textLastIndex = pathMatch.index + pathMatch[0].length;
          }

          // Ajouter le reste du texte
          if (textLastIndex < part.content.length) {
            pathParts.push({
              type: 'text',
              content: part.content.slice(textLastIndex)
            });
          }

          return pathParts.map((pathPart, j) => {
            if (pathPart.type === 'path') {
              return (
                <a
                  key={`path-${i}-${j}`}
                  className="terminal-link text-[#3b8eea] hover:underline cursor-pointer"
                  onClick={() => {
                    // Exécuter la commande "explorer <chemin>" sans l'afficher dans le terminal
                    executeCommand(`explorer "${pathPart.content}"`, 0);
                  }}
                >
                  {pathPart.content}
                </a>
              );
            }
            return <span key={`text-${i}-${j}`}>{parseAnsiColor(pathPart.content)}</span>;
          });
        })}
      </pre>
    );
  };

  // Mise à jour de la fonction handleKillTerminal
  const handleKillTerminal = () => {
    try {
      // 1. Annuler la commande en cours
      if (currentCommandController.current) {
        currentCommandController.current.abort();
        currentCommandController.current = null;
      }

      // 2. Ne pas manipuler directement le DOM, utiliser setState à la place
      setHistory([{
        command: '',
        output: '\x1b[31mProcess terminated. All running commands have been killed.\x1b[0m',
        isLoading: false
      }]);
      
      // 3. Réinitialiser les autres états
      setCommand('');
      
      // 4. Réinitialiser la recherche si elle existe
      if (searchRef.current?.removeAllHighlights) {
        searchRef.current.removeAllHighlights();
      }
      
    } catch (error) {
      console.error('Error killing terminal:', error);
    }
  };

  // Effet pour suivre les changements de configuration
  useEffect(() => {
    const handleConfigChange = () => {
      const currentConfig = {
        ...terminalConfig.get(),
        ...propsConfig // Toujours donner la priorité aux props
      };
      setIsVisible(currentConfig.showTerminal);
    };

    handleConfigChange(); // Appliquer immédiatement
    const interval = setInterval(handleConfigChange, 100); // Réduire l'intervalle pour une réponse plus rapide

    return () => clearInterval(interval);
  }, [propsConfig]); // Ajouter propsConfig comme dépendance

  // Déplacer ces effets avant les conditions de retour
  useEffect(() => {
    setTerminalExecutor(executeCommand);
    return () => setTerminalExecutor(null);
  }, []);

  // Modifier pour préserver l'état
  const [terminalState] = useState(() => ({
    history: [],
    searchState: null
  }));
  const [contentKey, setContentKey] = useState(0);

  // Ajouter un effet pour la persistance du state
  useEffect(() => {
    if (!isOpen) {
      // Sauvegarder l'état actuel
      terminalState.history = history;
    } else {
      // Restaurer l'état au remontage
      if (terminalState.history.length > 0) {
        setHistory(terminalState.history);
      }
    }
  }, [isOpen]);

  // Modifier pour réinitialiser correctement l'observer
  useEffect(() => {
    if (isOpen) {
      // Attendre le prochain tick pour que le DOM soit mis à jour
      setTimeout(() => {
        contentRef.current = document.querySelector('.terminal-scrollbar');
        if (contentRef.current) {
          observerRef.current?.disconnect();
          observerRef.current = new MutationObserver(() => {
            // La logique du search
          });
          observerRef.current.observe(contentRef.current, {
            childList: true,
            subtree: true,
            characterData: true
          });
        }
      }, 0);
    }

    return () => {
      observerRef.current?.disconnect();
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isMinimized && searchRef.current) {
      // Réinitialiser la recherche lorsque le terminal est maximisé
      searchRef.current.removeAllHighlights();
    }
  }, [isMinimized]);

  // Ajouter cet effet pour réinitialiser les refs après minimisation/maximisation
  useEffect(() => {
    if (!isMinimized) {
      // Attendre que le DOM soit mis à jour après la maximisation
      setTimeout(() => {
        // Mettre à jour la ref du contenu
        contentRef.current = document.querySelector('.terminal-scrollbar');
        
        if (contentRef.current) {
          // Déconnecter l'ancien observer
          observerRef.current?.disconnect();
          
          // Créer un nouvel observer
          observerRef.current = new MutationObserver(() => {
            // La logique de recherche sera gérée par TerminalSearch
          });
          
          // Reconnecter l'observer au contenu
          observerRef.current.observe(contentRef.current, {
            childList: true,
            subtree: true,
            characterData: true
          });
        }
      }, 0);
    }
  }, [isMinimized]);

  // Modifier cette partie pour ne pas retourner trop tôt
  const renderContent = () => {
    if (!isVisible) return null;

    if (!isOpen && mergedConfig.initialState !== 'hidden') {
      return (
        <Button
          className="fixed bottom-4 right-4 bg-[#1e1e1e] text-white floating-button"
          onClick={() => setIsOpen(true)}
        >
          <TerminalIcon className="w-4 h-4 mr-2" />
          Open Terminal
        </Button>
      );
    }

    if (!isOpen) return null;

    return (
      <TerminalUI
        contentKey={contentKey}
        setContentKey={setContentKey}
        isOpen={isOpen}
        isFullscreen={isFullscreen}
        isMinimized={isMinimized}
        height={height}
        isDragging={isDragging}
        currentDirectory={currentDirectory}
        osInfo={osInfo}
        history={history}
        command={command}
        terminalRef={terminalRef}
        handleMouseDown={handleMouseDown}
        handleKillTerminal={handleKillTerminal}
        setIsOpen={setIsOpen}
        setIsMinimized={setIsMinimized}
        setIsFullscreen={setIsFullscreen}
        handleSubmit={handleSubmit}
        setCommand={setCommand}
        executeCommand={executeCommand}
        mergedConfig={mergedConfig}
        formatCommand={formatCommand}
        formatOutput={formatOutput}
        observerRef={observerRef}
        contentRef={contentRef}
        setHistory={setHistory}
      />
    );
  };

  // Retourner le contenu rendu
  return renderContent();
});

Terminal.displayName = 'Terminal';
export default Terminal;

import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { X, Minus, Maximize2, Terminal as TerminalIcon, Trash2, Plus, Loader2, HelpCircle, Eraser, Info, FolderOpen } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import '../../styles/terminal.css';
import { executeRemoteCommand } from '../../services/terminalApi';
import { isCustomCommand, executeCustomCommand } from '../../services/customCommands';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { getFullPath } from "../../utils/pathUtils";
import { translateCommand, shouldTranslateCommand } from '../../utils/osCommands';

interface TerminalOutput {
  command: string;
  output: string;
  isLoading?: boolean;  // Ajout d'un flag de chargement par commande
}

// REGEXT PATH:
// (?<opening>\b(?<montage>[a-zA-Z]:[\/\\])|[\/\\][\/\\](?<!http:\/\/)(?<!https:\/\/)(?>[?.][\/\\](?:[^\/\\<>:"|?\n\r ]+[\/\\])?(?&montage)?|(?!(?&montage)))|%\w+%[\/\\]?)(?:[^\/\\<>:"|?\n\r ,'][^\/\\<>:"|?\n\r]*(?<![ ,'])[\/\\])*(?:(?=[^\/\\<>:"'|?\n\r;, ])(?:(?:[^\/\\<>:"|?\n\r;, .](?: (?=[\w\-]))?(?:\*(?!= ))?(?!(?&montage)))+)?(?:\.\w+)*)|(?:'(?&opening)(?=.*'\W|.*'$)(?:[^\/\\<>:'"|?\n\r]+(?:'(?=\w))?[\/\\]?)*')|"(?&opening)(?=.*")(?:[^\/\\<>:"|?\n\r]+[\/\\]?)*"

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
  
  // Modifier le regex pour ne détecter les paramètres que s'ils sont précédés d'un espace
  const paramRegex = /(\s-[a-zA-Z]+)|("[^"]*")|('[^']*')/g;
  
  const formattedRest = rest.replace(paramRegex, match => {
    if (match.startsWith(' -')) { // Noter l'espace avant le tiret
      return `<span class="text-yellow-500">${match}</span>`; // Paramètres en jaune
    }
    return `<span class="text-[#3b8eea]">${match}</span>`; // Chaînes entre guillemets
  });

  return (
    <>
      <span className="terminal-command-keyword">{firstWord}</span>
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

const Terminal = React.forwardRef((props, ref) => {
  const [isOpen, setIsOpen] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [command, setCommand] = useState('');
  const [history, setHistory] = useState<TerminalOutput[]>([]);
  const [height, setHeight] = useState(220);
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
    const initializeDirectory = async () => {
      try {
        const { stdout, newCwd } = await executeRemoteCommand('pwd');
        if (newCwd) {
          setCurrentDirectory(newCwd);
        } else if (stdout) {
          setCurrentDirectory(stdout);
        }
      } catch (error) {
        console.error('Failed to initialize directory:', error);
        setCurrentDirectory('Directory not available');
      }
    };

    initializeDirectory();
  }, []);

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
      // Traduire la commande si nécessaire
      const translatedCmd = shouldTranslateCommand(cmd) ? translateCommand(cmd) : cmd;
      
      const { stdout, stderr, newCwd } = await executeRemoteCommand(translatedCmd);
      
      // Mise à jour du répertoire courant si changé
      if (newCwd && newCwd !== currentDirectory) {
        setCurrentDirectory(newCwd);
      }

      return stderr || stdout || 'Command executed successfully';
    } catch (error) {
      console.error('Command execution error:', error);
      return `Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`;
    }
  };

  const executeCommand = async (cmd: string | string[]) => {
    const commands = Array.isArray(cmd) ? cmd : [cmd];

    for (const command of commands) {
      if (!command.trim()) continue;

      if (command === 'clear' || command === 'cls' ) {
        setHistory([]);
        setCommand('');
        continue;
      }

      // Ajouter la commande à l'historique avec isLoading=true
      setHistory(prev => [...prev, { command, output: '', isLoading: true }]);

      try {
        // Ajouter un timeout de 30 secondes
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Command execution timeout')), 60000);
        });

        const outputPromise = simulateCommand(command);
        const output = await Promise.race([outputPromise, timeoutPromise]);

        setHistory(prev => {
          const newHistory = [...prev];
          const lastEntry = newHistory[newHistory.length - 1];
          if (lastEntry && lastEntry.command === command) {
            lastEntry.output = String(output);
            lastEntry.isLoading = false;
          }
          return newHistory;
        });
      } catch (error) {
        console.error('Error executing command:', error);
        
        // S'assurer que l'état isLoading est mis à false même en cas d'erreur
        setHistory(prev => {
          const newHistory = [...prev];
          const lastEntry = newHistory[newHistory.length - 1];
          if (lastEntry && lastEntry.command === command) {
            lastEntry.output = `Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`;
            lastEntry.isLoading = false;
          }
          return newHistory;
        });

        // Optionnellement afficher un toast d'erreur
        toast({
          variant: "destructive",
          title: "Command Error",
          description: error instanceof Error ? error.message : 'Unknown error occurred',
        });
      }
    }
  };

  // Exposer executeCommand via la ref
  React.useImperativeHandle(ref, () => ({
    executeCommand
  }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Séparer les commandes par point-virgule
    const commands = command.split(';').map(cmd => cmd.trim()).filter(Boolean);
    executeCommand(commands);
    setCommand('');
  };

  const formatOutput = (output: string) => {
    // Premier regex pour les URLs
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    
    // Regex amélioré pour les chemins Windows et Unix
    const pathRegex = /(?:[a-zA-Z]:)?\\(?:[^\\/:*?"<>|\r\n]+\\)*[^\\/:*?"<>|\r\n]*|(?:\/[^\/\r\n]+)+/g;
    
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
                    executeCommand(`explorer "${pathPart.content}"`);
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
    // Effacer l'historique et la commande en cours
    setHistory([{
      command: '',
      output: '\x1b[31mProcess terminated.\x1b[0m',  // En rouge avec ANSI
      isLoading: false
    }]);
    setCommand('');
  };

  if (!isOpen) {
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

  const terminalClasses = `fixed bg-[#1e1e1e] text-[#d4d4d4] border-t border-[#333] shadow-lg transition-all duration-200 ${
    isFullscreen 
      ? 'top-0 left-0 right-0 bottom-0 z-50' 
      : 'bottom-0 left-0 right-0'
  }`;

  // Modifier le style commun des tooltips dans la partie header et footer
  const tooltipStyle = "bg-[#252526] text-[#d4d4d4] border border-[#333] shadow-md";

  return (
    <div className={terminalClasses}>
      {/* Drag Handle */}
      <div
        className="absolute top-0 left-0 right-0 h-1 cursor-ns-resize"
        onMouseDown={handleMouseDown}
      />

      {/* Terminal Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#252526] border-b border-[#333]">
        <div className="flex items-center">
          <TerminalIcon className="w-4 h-4 mr-2" />
          <span className="text-sm font-medium">Terminal</span>
        </div>
        <div className="flex space-x-2">
          <TooltipProvider delayDuration={50}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={handleKillTerminal}  // Modification ici
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top" className={tooltipStyle}>
                <p>Kill Terminal</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={async () => {
                    try {
                      const dirHandle = await (window as any).showDirectoryPicker();
                      const fullPath = getFullPath(dirHandle.name);
                      executeCommand(`cd "${fullPath}"`);
                    } catch (err) {
                      console.error('Erreur lors de la sélection du dossier:', err);
                    }
                  }}
                >
                  <FolderOpen className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top" className={tooltipStyle}>
                <p>Select folder</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => setIsMinimized(!isMinimized)}
                >
                  {isMinimized ? <Plus className="h-4 w-4" /> : <Minus className="h-4 w-4" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top" className={tooltipStyle}>
                <p>{isMinimized ? 'Maximize' : 'Minimize'}</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => setIsFullscreen(!isFullscreen)}
                >
                  <Maximize2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top" className={tooltipStyle}>
                <p>Toggle fullscreen</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top" className={tooltipStyle}>
                <p>Close terminal</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Terminal Content - Only show if not minimized */}
      {!isMinimized && (
        <>
          <div className="p-2 bg-[#252526] border-b border-[#333] text-xs text-gray-400 flex justify-between items-center">
            <div>Current directory: {currentDirectory || 'Loading...'}</div>
            <div>User OS: {osInfo}</div>
          </div>
          <div 
            ref={terminalRef}
            className={`overflow-y-auto p-4 font-mono text-sm terminal-scrollbar ${
              isFullscreen 
                ? 'h-[calc(100vh-40px)]' 
                : `h-[${height}px]`
            }`}
            style={{ height: isFullscreen ? 'calc(100vh - 40px)' : height }}
          >
            {history.map((entry, index) => (
              <div key={index} className="mb-2">
                <div className="flex items-center">
                  <span className="terminal-prompt mr-2">&gt;</span>
                  <div className="terminal-command">
                    {formatCommand(entry.command)}
                  </div>
                </div>
                <div className="ml-4 terminal-output">
                  {entry.isLoading ? (
                    <div className="flex items-center gap-2 text-gray-400">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Executing command...</span>
                    </div>
                  ) : (
                    formatOutput(entry.output) 
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Command Input */}
          <form onSubmit={handleSubmit} className="p-2 border-t border-[#333] flex">
            <span className="terminal-prompt mr-2 mt-1">&gt;</span>
            <input
              type="text"
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              className="flex-1 bg-transparent border-none outline-none terminal-command font-mono"
              placeholder="Type a command..."
            />
            <div className="flex space-x-2"> 
              <TooltipProvider delayDuration={50}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => executeCommand('clear')}
                    >
                      <Eraser className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent 
                    side="top" 
                    align="center"
                    className={`${tooltipStyle} z-50`}
                  >
                    <p>Clear terminal</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 bg-[#323233]"
                      onClick={() => executeCommand(['help', 'npm ls', 'about'])}                   
                    >
                      <HelpCircle className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className={tooltipStyle}>
                    <p>Help</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 bg-[#323233]"
                      onClick={() => executeCommand('about')}
                    >
                      <Info className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className={tooltipStyle}>
                    <p>About</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </form>
        </>
      )}
    </div>
  );
});

export default Terminal;

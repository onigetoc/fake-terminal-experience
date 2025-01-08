import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { X, Minus, Maximize2, Terminal as TerminalIcon, Trash2, Plus, Loader2, HelpCircle, Eraser, Info } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import '../../styles/terminal.css';
import { executeRemoteCommand } from '../../services/terminalApi';
import { isCustomCommand, executeCustomCommand } from '../../services/customCommands';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface TerminalOutput {
  command: string;
  output: string;
  isLoading?: boolean;  // Ajout d'un flag de chargement par commande
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
  const restOfCommand = words.slice(1).join(' ');
  
  return (
    <>
      <span className="terminal-command-keyword">{firstWord}</span>
      {restOfCommand && <span className="terminal-command"> {restOfCommand}</span>}
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

const Terminal = () => {
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
      const { stdout, stderr, newCwd } = await executeRemoteCommand(cmd);
      
      // Mise à jour du répertoire courant si changé
      if (newCwd && newCwd !== currentDirectory) {
        setCurrentDirectory(newCwd);
        console.log('Directory updated to:', newCwd); // Pour debug
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

      if (command === 'clear') {
        setHistory([]);
        setCommand('');
        continue;
      }

      // Ajouter la commande à l'historique avec isLoading=true
      setHistory(prev => [...prev, { command, output: '', isLoading: true }]);

      // Attendre que l'état de l'historique soit mis à jour
      await new Promise(resolve => setTimeout(resolve, 100)); // Petit délai ajouté

      try {
        const output = await simulateCommand(command);

        // Mettre à jour l'historique avec l'output et isLoading=false
        setHistory(prev => {
          const newHistory = [...prev];
          const currentIndex = newHistory.length - 1;
          newHistory[currentIndex] = { command, output, isLoading: false };
          return newHistory;
        });

        // Attendre que la mise à jour de l'état soit terminée
        await new Promise(resolve => setTimeout(resolve, 100)); // Petit délai ajouté
      } catch (error) {
        console.error('Error:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';

        setHistory(prev => {
          const newHistory = [...prev];
          const currentIndex = newHistory.length - 1;
          newHistory[currentIndex] = { command, output: `Error: ${errorMessage}`, isLoading: false };
          return newHistory;
        });

        // Arrêter l'exécution des commandes suivantes en cas d'erreur
        break;
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Séparer les commandes par point-virgule
    const commands = command.split(';').map(cmd => cmd.trim()).filter(Boolean);
    executeCommand(commands);
    setCommand('');
  };

  const formatOutput = (output: string) => {
    // Regex pour détecter les URLs
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = output.split(urlRegex);

    return (
      <pre className="whitespace-pre-wrap break-words font-mono">
        {parts.map((part, i) => {
          if (part.match(urlRegex)) {
            return (
              <a
                key={i}
                href={part}
                className="terminal-link"
                onClick={(e) => {
                  e.preventDefault();
                  window.open(part, '_blank', 'noopener,noreferrer');
                }}
              >
                {part}
              </a>
            );
          }
          return <span key={i}>{parseAnsiColor(part)}</span>;
        })}
      </pre>
    );
  };

  if (!isOpen) {
    return (
      <Button
        className="fixed bottom-4 right-4 bg-[#1e1e1e] text-white"
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
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => setHistory([])}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => setIsMinimized(!isMinimized)}
          >
            {isMinimized ? <Plus className="h-4 w-4" /> : <Minus className="h-4 w-4" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => setIsFullscreen(!isFullscreen)}
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => setIsOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Terminal Content - Only show if not minimized */}
      {!isMinimized && (
        <>
          <div className="p-2 bg-[#252526] border-b border-[#333] text-xs text-gray-400">
            Current directory: {currentDirectory || 'Loading...'}
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
              <TooltipProvider>
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
                  <TooltipContent>
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
                      // onClick={() => executeCommand('help')}
                      onClick={() => executeCommand(['help', 'npm ls', 'about'])}                   
                    >
                      <HelpCircle className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
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
                  <TooltipContent>
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
};

export default Terminal;

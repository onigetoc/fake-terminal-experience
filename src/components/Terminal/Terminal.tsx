import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { X, Minus, Maximize2, Terminal as TerminalIcon, Trash2, Plus } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";

interface TerminalOutput {
  command: string;
  output: string;
}

const Terminal = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [command, setCommand] = useState('');
  const [history, setHistory] = useState<TerminalOutput[]>([]);
  const [height, setHeight] = useState(300); // Default height
  const [isDragging, setIsDragging] = useState(false);
  const terminalRef = useRef<HTMLDivElement>(null);
  const dragStartY = useRef<number>(0);
  const dragStartHeight = useRef<number>(0);
  const { toast } = useToast();

  const scrollToBottom = () => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [history]);

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

  const simulateCommand = (cmd: string): string => {
    // Simulate common npm and system commands
    if (cmd === 'npm -v') {
      return '10.2.4';
    } else if (cmd === 'node -v') {
      return 'v20.11.0';
    } else if (cmd === 'npm run dev') {
      return `
VITE v5.4.6  ready in 241 ms

➜  Local:   http://localhost:5173/
➜  Network: http://192.168.1.100:5173/
➜  press h + enter to show help`;
    } else if (cmd === 'help') {
      return `Available commands:
- help: Show this help message
- clear: Clear terminal
- npm -v: Show npm version
- node -v: Show node version
- npm run dev: Start development server
`;
    }
    return `Command not found: ${cmd}`;
  };

  const executeCommand = (cmd: string) => {
    if (!cmd.trim()) return;

    if (cmd === 'clear') {
      setHistory([]);
      return;
    }

    const output = simulateCommand(cmd);
    setHistory(prev => [...prev, { command: cmd, output }]);
    setCommand('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeCommand(command);
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
          <div 
            ref={terminalRef}
            className={`overflow-y-auto p-4 font-mono text-sm ${
              isFullscreen 
                ? 'h-[calc(100vh-40px)]' 
                : `h-[${height}px]`
            }`}
            style={{ height: isFullscreen ? 'calc(100vh - 40px)' : height }}
          >
            {history.map((entry, index) => (
              <div key={index} className="mb-2">
                <div className="flex">
                  <span className="text-[#608b4e] mr-2">&gt;</span>
                  <span>{entry.command}</span>
                </div>
                <div className="ml-4 whitespace-pre-wrap">{entry.output}</div>
              </div>
            ))}
          </div>

          {/* Command Input */}
          <form onSubmit={handleSubmit} className="p-2 border-t border-[#333] flex">
            <span className="text-[#608b4e] mr-2 mt-2">&gt;</span>
            <input
              type="text"
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              className="flex-1 bg-transparent border-none outline-none text-[#d4d4d4] font-mono"
              placeholder="Type a command..."
            />
            <div className="flex space-x-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => executeCommand('help')}
              >
                Help
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => executeCommand('clear')}
              >
                Clear
              </Button>
            </div>
          </form>
        </>
      )}
    </div>
  );
};

export default Terminal;

import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import shell from 'shelljs';
import { X, Minus, Maximize2, Terminal as TerminalIcon, Trash2 } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";

interface TerminalOutput {
  command: string;
  output: string;
}

const Terminal = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [command, setCommand] = useState('');
  const [history, setHistory] = useState<TerminalOutput[]>([]);
  const terminalRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [history]);

  const executeCommand = async (cmd: string) => {
    if (!cmd.trim()) return;

    let output = '';
    
    if (cmd === 'help') {
      output = `Available commands:
- help: Show this help message
- clear: Clear terminal
- npm <command>: Run npm commands
- node <file>: Run node files
`;
    } else if (cmd === 'clear') {
      setHistory([]);
      return;
    } else {
      try {
        const result = shell.exec(cmd, { silent: true });
        output = result.stdout || result.stderr;
      } catch (error) {
        output = `Error: ${error}`;
        toast({
          variant: "destructive",
          title: "Command failed",
          description: String(error),
        });
      }
    }

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

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#1e1e1e] text-[#d4d4d4] border-t border-[#333] shadow-lg">
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
            onClick={() => setIsOpen(false)}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
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

      {/* Terminal Content */}
      <div 
        ref={terminalRef}
        className="h-[300px] overflow-y-auto p-4 font-mono text-sm"
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
    </div>
  );
};

export default Terminal;
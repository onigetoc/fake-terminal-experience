import Terminal from "@/components/Terminal/Terminal";
import { Button } from "@/components/ui/button";
import { useRef } from "react";
import { Play, Terminal as TerminalIcon, Globe } from "lucide-react";

const Index = () => {
  const terminalRef = useRef<{
    executeCommand: (cmd: string | string[], displayInTerminal?: number) => void;
  }>(null);

  const handleRunCommand = (command: string | string[], displayInTerminal: number = 1) => {
    if (terminalRef.current) {
      terminalRef.current.executeCommand(command, displayInTerminal);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4">
        <h1 className="text-4xl font-bold mb-4">Terminal Demo</h1>
        <p className="text-lg text-muted-foreground mb-4">
          Try running some commands like "npm -v" or type "help" to see available commands.
        </p>

        <p className="text-lg text-muted-foreground mb-2">
          Launch terminal commands from anywhere (fronend) in your app using:
        </p>

        <p>start C:\Users\LENOVO\Videos\Advanced-Promp-Generator-v3</p>
        
        <pre className="bg-[#1e1e1e] text-[#d4d4d4] p-4 rounded-md mb-4 font-mono text-sm">
          <span className="text-[#888888]">// Frontend example</span>{'\n'}
          <span className="text-[#888888]">// Single command</span>{'\n'}
          <span className="text-[#DCDCAA]">handleRunCommand</span>
          <span className="text-[#D4D4D4]">(</span>
          <span className="text-[#CE9178]">"npm -v"</span>
          <span className="text-[#D4D4D4]">);</span>{'\n\n'}
          <span className="text-[#888888]">// Multiple commands</span>{'\n'}
          <span className="text-[#DCDCAA]">handleRunCommand</span>
          <span className="text-[#D4D4D4]">(</span>
          <span className="text-[#D4D4D4]">[</span>
          <span className="text-[#CE9178]">"help"</span>
          <span className="text-[#D4D4D4]">, </span>
          <span className="text-[#CE9178]">"about"</span>
          <span className="text-[#D4D4D4]">, </span>
          <span className="text-[#CE9178]">"node -v"</span>
          <span className="text-[#D4D4D4]">]</span>
          <span className="text-[#D4D4D4]">);</span>{'\n\n'}
          <span className="text-[#888888]">// Backend example</span>{'\n'}
          <span className="text-[#DCDCAA]">executeCommand</span>
          <span className="text-[#D4D4D4]">(</span>
          <span className="text-[#CE9178]">"npm -v"</span>
          <span className="text-[#D4D4D4]">);</span>
        </pre>

        <p className="text-lg text-muted-foreground mb-4">
          Or trigger one or multiple commands from everywhere.
        </p>

        <div className="flex gap-2 mb-8">
          <Button
            variant="outline"
            onClick={() => handleRunCommand("npm -v")} // Par défaut displayInTerminal = 1
            className="flex items-center gap-2"
          >
            <Play className="h-4 w-4" />
            Run npm -v
          </Button>
          <Button
            variant="outline"
            onClick={() => handleRunCommand(['help', 'npm ls', 'about'], 0)} // Exécution silencieuse
            className="flex items-center gap-2"
          >
            <TerminalIcon className="h-4 w-4" />
            Help, npm ls & About
          </Button>
          <Button
            variant="outline"
            onClick={() => handleRunCommand(['explorer "https://www.google.com/search?q=fake+terminal"'])}
            className="flex items-center gap-2"
          >
            <Globe className="h-4 w-4" />
            Open Browser & Google search
          </Button>
          <Button
            variant="outline"
            onClick={() => handleRunCommand(['explorer "https://github.com/onigetoc/fake-terminal-experience"'])}
            className="flex items-center gap-2"
          >
            <Globe className="h-4 w-4" />
            Open Github Project in browser
          </Button>
          <Button
            variant="outline"
            onClick={() => handleRunCommand(['tree /f'])}
            className="flex items-center gap-2"
          >
            <TerminalIcon className="h-4 w-4" />
            Get folder tree
          </Button>
          <Button
            variant="outline"
            onClick={() => handleRunCommand(['wmic product get name'])}
            className="flex items-center gap-2"
          >
            <TerminalIcon className="h-4 w-4" />
            Programs installed on your PC
          </Button>
        </div>
      </div>
      <Terminal ref={terminalRef} />
    </div>
  );
};

export default Index;
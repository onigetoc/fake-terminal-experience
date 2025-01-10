import Terminal from "@/components/Terminal/Terminal";
import { Button } from "@/components/ui/button";
import { useRef } from "react";
import { Play, Terminal as TerminalIcon } from "lucide-react";

const Index = () => {
  const terminalRef = useRef<any>(null);

  const handleRunCommand = (command: string | string[]) => {
    if (terminalRef.current) {
      terminalRef.current.executeCommand(command);
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
          Launch terminal commands from anywhere in your app using:
        </p>
        
        <pre className="bg-[#1e1e1e] text-[#d4d4d4] p-4 rounded-md mb-4 font-mono text-sm">
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
          <span className="text-[#D4D4D4]">);</span>
        </pre>

        <p className="text-lg text-muted-foreground mb-4">
          Or trigger one or multiple commands from everywhere.
        </p>

        <div className="flex gap-2 mb-8">
          <Button
            variant="outline"
            onClick={() => handleRunCommand("npm -v")}
            className="flex items-center gap-2"
          >
            <Play className="h-4 w-4" />
            Run npm -v
          </Button>
          <Button
            variant="outline"
            onClick={() => handleRunCommand(["help", "about", "node -v"])}
            className="flex items-center gap-2"
          >
            <TerminalIcon className="h-4 w-4" />
            Help, About & Node -v
          </Button>
        </div>
      </div>
      <Terminal ref={terminalRef} />
    </div>
  );
};

export default Index;
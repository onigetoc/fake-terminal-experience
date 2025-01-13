import React from 'react';
import { Button } from "@/components/ui/button";
import {
  Trash2, FolderOpen, Plus, Minus, Maximize2, Minimize2, X, Terminal as TerminalIcon,
  Loader2, Eraser, HelpCircle, Info
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface TerminalUIProps {
  isOpen: boolean;
  isFullscreen: boolean;
  isMinimized: boolean;
  height: number;
  isDragging: boolean;
  currentDirectory: string;
  osInfo: string;
  history: any[];
  command: string;
  terminalRef: React.RefObject<HTMLDivElement>;
  handleMouseDown: (e: React.MouseEvent<HTMLDivElement>) => void;
  handleKillTerminal: () => void;
  setIsOpen: (val: boolean) => void;
  setIsMinimized: (val: boolean) => void;
  setIsFullscreen: (val: boolean) => void;
  handleSubmit: (e: React.FormEvent) => void;
  setCommand: (val: string) => void;
  executeCommand: (cmd: string | string[], displayInTerminal?: number) => void;
  mergedConfig: any;
  formatCommand: (command: string) => React.ReactNode;
  formatOutput: (output: string) => React.ReactNode;
  onFolderSelect?: () => Promise<void>;  // Ajouter cette prop
}

// On reçoit en props tout ce qui est nécessaire pour l’UI (états, handlers, etc.)
export function TerminalUI(props: TerminalUIProps) {
  const tooltipStyle = "bg-[#252526] text-[#d4d4d4] border border-[#333] shadow-md";

  if (!props.isOpen) {
    return (
      <Button
        className="fixed bottom-4 right-4 bg-[#1e1e1e] text-white floating-button"
        onClick={() => props.setIsOpen(true)}
      >
        <TerminalIcon className="w-4 h-4 mr-2" />
        Open Terminal
      </Button>
    );
  }

  const terminalClasses = `fixed bg-[#1e1e1e] text-[#d4d4d4] border-t border-[#333] shadow-lg transition-all duration-200 ${
    props.isFullscreen 
      ? 'top-0 left-0 right-0 bottom-0 z-50' 
      : 'bottom-0 left-0 right-0'
  }`;

  return (
    <div className={terminalClasses}>
      <div 
        className="terminal-window"
        style={{
          height: props.isFullscreen ? '100vh' : props.isMinimized ? '40px' : props.height,
          fontSize: `${props.mergedConfig.fontSize}px`,
          fontFamily: props.mergedConfig.fontFamily,
        }}
      >
        {/* Drag Handle */}
        <div
          className="absolute top-0 left-0 right-0 h-1 cursor-ns-resize"
          onMouseDown={props.handleMouseDown}
        />

        {/* Terminal Header */}
        <div className="flex items-center justify-between px-4 py-2 bg-[#252526] border-b border-[#333]">
          <div className="flex items-center">
            <TerminalIcon className="w-4 h-4 mr-2" />
            <span className="text-sm font-medium">Terminal</span>
          </div>
          {/* N'afficher les contrôles que si pas en mode lecture seule */}
          {!props.mergedConfig.readOnlyMode && (
            <div className="flex space-x-2">
              <TooltipProvider delayDuration={50}>
                {/* Kill Terminal Button */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="bg-transparent border-none hover:bg-white/10 text-[#d4d4d4] hover:text-white h-6 w-6"
                      onClick={props.handleKillTerminal}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className={tooltipStyle}>
                    <p>Kill Terminal</p>
                  </TooltipContent>
                </Tooltip>

                {/* Folder Select Button */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="pt-0.5 bg-transparent border-none hover:bg-white/10 text-[#d4d4d4] hover:text-white h-6 w-6"
                      onClick={async () => {
                        try {
                          const dirHandle = await window.showDirectoryPicker();
                          // Utiliser directement le nom du dossier sans guillemets
                          props.executeCommand(`cd ${dirHandle.name}`, 1);
                        } catch (err) {
                          console.error('Erreur lors de la sélection du dossier:', err);
                        }
                      }}
                    >
                      <FolderOpen className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className={tooltipStyle}>
                    <p>Select Working Directory</p>
                  </TooltipContent>
                </Tooltip>

                {/* Other buttons... */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="bg-transparent border-none hover:bg-white/10 text-[#d4d4d4] hover:text-white h-6 w-6"
                      onClick={() => props.setIsMinimized(!props.isMinimized)}
                    >
                      {props.isMinimized ? <Plus className="h-4 w-4" /> : <Minus className="h-4 w-4" />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className={tooltipStyle}>
                    <p>{props.isMinimized ? 'Maximize' : 'Minimize'}</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="bg-transparent border-none hover:bg-white/10 text-[#d4d4d4] hover:text-white h-6 w-6"
                      onClick={() => props.setIsFullscreen(!props.isFullscreen)}
                    >
                      {props.isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className={tooltipStyle}>
                    <p>{props.isFullscreen ? 'Exit fullscreen' : 'Toggle fullscreen'}</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="bg-transparent border-none hover:bg-white/10 text-[#d4d4d4] hover:text-white h-6 w-6"
                      onClick={() => props.setIsOpen(false)}
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
          )}
        </div>

        {/* Info Bar - Optionnelle en mode lecture seule */}
        {!props.mergedConfig.readOnlyMode && (
          <div className="p-1.5 pl-2 pr-2 bg-[#252526] border-b border-[#333] text-xs text-gray-400 flex justify-between items-center">
            <div>Current directory: {props.currentDirectory || 'Loading...'}</div>
            <div>User OS: {props.osInfo}</div>
          </div>
        )}

        {/* Terminal Content - Only show if not minimized */}
        {!props.isMinimized && (
          <>
            {/* Terminal Output */}
            <div 
              ref={props.terminalRef}
              className="overflow-y-auto p-4 font-mono text-sm terminal-scrollbar"
              style={{ 
                height: props.mergedConfig.readOnlyMode 
                  ? `${props.height - 40}px`  // Hauteur ajustée sans la barre d'input
                  : `${props.height - 96}px`,  // Hauteur normale
                fontSize: `${props.mergedConfig.fontSize}px`,  // Appliquer également au contenu
              }}
            >
              {props.history.map((entry, index) => (
                <div key={index} className="mb-2">
                  <div className="flex items-center">
                    <span className="terminal-prompt mr-2">&gt;</span>
                    <div className="terminal-command">
                      {props.formatCommand(entry.command)}
                    </div>
                  </div>
                  <div className="ml-4 terminal-output">
                    {entry.isLoading ? (
                      <div className="flex items-center gap-2 text-gray-400">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Executing command...</span>
                      </div>
                    ) : (
                      props.formatOutput(entry.output)
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Command Input - Caché en mode lecture seule */}
            {!props.mergedConfig.readOnlyMode && (
              <form onSubmit={props.handleSubmit} className="p-2 border-t border-[#333] flex items-center">
                <span className="terminal-prompt mr-2">&gt;</span>
                <input
                  type="text"
                  value={props.command}
                  onChange={(e) => props.setCommand(e.target.value)}
                  className="flex-1 bg-transparent border-none outline-none text-[#d4d4d4] font-mono"
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
                          className="h-8 w-8 hover:bg-white/10 hover:text-white"
                          onClick={() => props.executeCommand('clear')}
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
                          className="h-8 w-8 bg-[#323233] hover:bg-white/10 hover:text-white"
                          onClick={() => props.executeCommand('help')}
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
                          className="h-8 w-8 bg-[#323233] hover:bg-white/10 hover:text-white"
                          onClick={() => props.executeCommand('about')}
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
            )}
          </>
        )}
      </div>
    </div>
  );
}
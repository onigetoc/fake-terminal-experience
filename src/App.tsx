import { useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { terminalConfig } from './config/terminalConfig';
import Index from "./pages/Index";

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    // Configuration initiale minimale
    terminalConfig.set({
      showTerminal: true,  // Ajout de l'option showTerminal
      defaultHeight: 400,
      fontSize: 14,
      promptString: '$ '
    });
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;

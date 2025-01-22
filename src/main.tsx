import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Supprimer les importations du terminal
// import { TerminalProvider } from './utils/terminalUtils'

// Assurez-vous qu'il n'y a aucune importation ou utilisation de TerminalContext

createRoot(document.getElementById("root")!).render(<App />);

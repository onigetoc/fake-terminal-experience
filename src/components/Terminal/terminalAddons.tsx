import React, { useState, useEffect, forwardRef, useImperativeHandle, useRef, useCallback } from 'react';
import { X, Search, ChevronUp, ChevronDown } from 'lucide-react';

interface SearchProps {
    isTerminalFocused: boolean;
    observerRef: React.RefObject<MutationObserver | null>;
    contentRef: React.RefObject<HTMLElement | null>;
    setIsMinimized: (value: boolean) => void;
}

// Fonctions utilitaires pour la recherche
function escapeRegExp(text: string) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

// Simplifier la fonction removeHighlightMarks
function removeHighlightMarks(html: string) {
    // On ne fait plus de manipulation complexe, on nettoie juste les balises mark
    return html.replace(/<\/?mark[^>]*>/g, '');
}

function highlightText(node: Node, searchText: string, currentIndex: number, matchIndexRef: { current: number }): void {
    if (!searchText) return;

    // Préserver les liens existants
    if (node.nodeType === Node.ELEMENT_NODE && (node as Element).tagName === 'A') {
        // Sauvegarder le contenu et les attributs du lien
        const link = node as HTMLAnchorElement;
        const href = link.href;
        const isTerminalLink = link.classList.contains('terminal-link');
        
        // Traiter le texte à l'intérieur du lien
        const textContent = link.textContent || '';
        const regex = new RegExp(escapeRegExp(searchText), 'gi');
        const newHtml = textContent.replace(regex, (match) => {
            matchIndexRef.current++;
            const isCurrentMatch = matchIndexRef.current - 1 === currentIndex;
            return `<mark class="terminal-search-highlight ${isCurrentMatch ? 'terminal-search-current' : ''}">${match}</mark>`;
        });

        // Recréer le lien avec le texte surligné
        link.innerHTML = newHtml;
        
        // Réappliquer le comportement d'ouverture dans un nouvel onglet
        link.onclick = (e) => {
            e.preventDefault();
            window.open(href, '_blank', 'noopener,noreferrer');
        };
        
        return;
    }

    // Vérifie si le nœud est dans la zone de sortie (terminal-output) et pas dans une commande
    const isInCommand = node.parentElement?.closest('.terminal-command');
    const isInOutput = node.parentElement?.closest('.terminal-output');

    if (node.nodeType === Node.TEXT_NODE && isInOutput && !isInCommand) {
        const text = node.textContent || '';
        const regex = new RegExp(escapeRegExp(searchText), 'gi');
        let match;
        let lastIndex = 0;
        const fragments = [];

        while ((match = regex.exec(text)) !== null) {
            if (match.index > lastIndex) {
                fragments.push(document.createTextNode(text.slice(lastIndex, match.index)));
            }

            const mark = document.createElement('mark');
            mark.textContent = match[0];
            mark.classList.add('terminal-search-highlight');
            
            if (matchIndexRef.current === currentIndex) {
                mark.classList.add('terminal-search-current');
            }
            
            fragments.push(mark);
            lastIndex = regex.lastIndex;
            matchIndexRef.current++;
        }

        if (lastIndex < text.length) {
            fragments.push(document.createTextNode(text.slice(lastIndex)));
        }

        if (fragments.length > 0) {
            const parent = node.parentNode;
            if (parent && parent.contains(node)) {
                fragments.forEach(fragment => parent.insertBefore(fragment, node));
                parent.removeChild(node);
            }
        }
    } else {
        // Parcourir récursivement les nœuds enfants
        for (const child of Array.from(node.childNodes)) {
            highlightText(child, searchText, currentIndex, matchIndexRef);
        }
    }
}

const TerminalSearchComponent = (
    { isTerminalFocused, observerRef, contentRef, setIsMinimized }: SearchProps,
    ref: React.Ref<unknown>
) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
    const [totalMatches, setTotalMatches] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);

    // Supprimer les anciennes refs car elles sont maintenant passées en props
    // const contentRef = useRef<HTMLElement | null>(null);
    // const observerRef = useRef<MutationObserver | null>(null);

    // Mise à jour de l'effet pour utiliser les refs passées en props
    useEffect(() => {
        // Ne rien faire si les refs ne sont pas initialisées
        if (!contentRef?.current || !observerRef?.current || !searchText) return;

        // Configurer l'observer uniquement si on fait une recherche
        observerRef.current.observe(contentRef.current, {
            childList: true,
            subtree: true,
            characterData: true
        });

        return () => {
            observerRef.current?.disconnect();
        };
    }, [searchText, currentMatchIndex, contentRef, observerRef]);

    const scrollToMatch = (mark: HTMLElement) => {
        mark.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
        });
    };

    const performSearch = (text: string, index: number) => {
        if (!contentRef.current || !text) return;

        // Vérifier si le terminal a du contenu avant de faire quoi que ce soit
        if (contentRef.current.children.length === 0) {
            setTotalMatches(0);
            return;
        }

        try {
            // Nettoyer d'abord les surlignages existants
            const cleanHTML = removeHighlightMarks(contentRef.current.innerHTML);
            contentRef.current.innerHTML = cleanHTML;

            // Effectuer la nouvelle recherche
            const matchIndexRef = { current: 0 };
            highlightText(contentRef.current, text, index, matchIndexRef);
            
            const totalFound = matchIndexRef.current;
            setTotalMatches(totalFound);

            // Faire défiler jusqu'au match actuel
            if (totalFound > 0) {
                const marks = contentRef.current.getElementsByClassName('terminal-search-current');
                if (marks.length > 0) {
                    scrollToMatch(marks[0] as HTMLElement);
                }
            }
        } catch (error) {
            // Si une erreur se produit pendant la recherche, réinitialiser l'état
            console.error('Search error:', error);
            setTotalMatches(0);
        }
    };

    const navigateToMatch = (direction: 'next' | 'previous') => {
        if (totalMatches === 0) return;

        // Simplification : juste incrémenter pour next, décrémenter pour previous
        let newIndex = currentMatchIndex;
        if (direction === 'next') {
            newIndex = currentMatchIndex + 1;
            if (newIndex >= totalMatches) newIndex = 0;
        } else {
            newIndex = currentMatchIndex - 1;
            if (newIndex < 0) newIndex = totalMatches - 1;
        }

        // console.log('Navigation:', direction, 'de', currentMatchIndex, 'vers', newIndex); // Debug
        setCurrentMatchIndex(newIndex);
        performSearch(searchText, newIndex);
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // On vérifie uniquement isTerminalFocused, peu importe où est le focus à l'intérieur du terminal
            if (e.ctrlKey && e.key === 'f' && isTerminalFocused) {
                e.preventDefault();
                setIsOpen(true);
                setTimeout(() => inputRef.current?.focus(), 0);
                return;
            }

            // Pour la navigation, on vérifie si on est dans l'input de recherche
            if (isOpen && document.activeElement === inputRef.current) {
                switch(e.key) {
                    case 'Enter':
                        e.preventDefault(); // Empêcher la soumission du formulaire
                        navigateToMatch('next');
                        break;
                    case 'ArrowUp':
                        e.preventDefault();
                        navigateToMatch('previous');
                        break;
                    case 'ArrowDown':
                        e.preventDefault();
                        navigateToMatch('next');
                        break;
                    case 'Escape':
                        e.preventDefault();
                        handleClose();
                        break;
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, isTerminalFocused, navigateToMatch]); // Ajouter navigateToMatch ici

    // Ajouter un effet pour gérer le focus quand isOpen change
    useEffect(() => {
        if (isOpen) {
            // Sélectionner tout le texte quand la recherche s'ouvre
            setTimeout(() => {
                if (inputRef.current) {
                    inputRef.current.select();
                }
            }, 0);
        }
    }, [isOpen]);

    // Ajouter un gestionnaire onFocus pour toujours sélectionner le texte
    const handleFocus = () => {
        inputRef.current?.select();
    };

    const handleClose = () => {
        setIsOpen(false);
        setSearchText('');
        setCurrentMatchIndex(0);
        setTotalMatches(0);
        // Nettoyer uniquement les surlignages de recherche
        const terminal = document.querySelector('.terminal-scrollbar');
        if (terminal) {
            terminal.innerHTML = terminal.innerHTML.replace(/<\/?mark[^>]*>/g, '');
        }
    };

    // Fonction sécurisée pour nettoyer le terminal
    const cleanTerminal = useCallback(() => {
        if (!contentRef?.current) return;
        
        try {
            // 1. Déconnecter temporairement l'observer
            observerRef.current?.disconnect();
            
            // 2. Sauvegarder l'input
            const inputArea = contentRef.current.querySelector('.terminal-input-area');
            
            // 3. Nettoyer le contenu tout en préservant la structure
            const terminalContent = contentRef.current.querySelector('.terminal-scrollbar');
            if (terminalContent) {
                while (terminalContent.firstChild) {
                    terminalContent.removeChild(terminalContent.firstChild);
                }
            }
            
            // 4. Réinitialiser les états de recherche
            setSearchText('');
            setCurrentMatchIndex(0);
            setTotalMatches(0);
            
            // 5. Remettre l'input si nécessaire
            if (inputArea && terminalContent) {
                terminalContent.appendChild(inputArea);
            }
            
            // 6. Reconnecter l'observer
            observerRef.current?.observe(contentRef.current, {
                childList: true,
                subtree: true,
                characterData: true
            });
        } catch (error) {
            console.error('Error cleaning terminal:', error);
        }
    }, [contentRef, observerRef, setSearchText, setCurrentMatchIndex, setTotalMatches]);

    const removeAllHighlights = useCallback(() => {
        if (!contentRef.current) return;
        
        try {
          // 1. Créer une nouvelle fonction sécurisée pour enlever les marques
          const safelyRemoveHighlights = () => {
            const marks = contentRef.current?.querySelectorAll('mark');
            marks?.forEach(mark => {
              const parent = mark.parentNode;
              if (parent && parent.contains(mark)) {
                const text = document.createTextNode(mark.textContent || '');
                parent.replaceChild(text, mark);
              }
            });
          };
      
          // 2. Exécuter la fonction de manière sécurisée
          safelyRemoveHighlights();
          
          // 3. Réinitialiser les états
          setSearchText('');
          setCurrentMatchIndex(0);
          setTotalMatches(0);
          
        } catch (error) {
          console.error('Error removing highlights:', error);
        }
      }, [contentRef]);

    useImperativeHandle(ref, () => ({
        removeAllHighlights,
        cleanTerminal // Exposer la nouvelle fonction
    }));

    useEffect(() => {
        if (searchText) {
            setCurrentMatchIndex(0);  // Réinitialiser l'index lors d'une nouvelle recherche
            performSearch(searchText, 0);
        } else {
            // Si le texte de recherche est vide, nettoyer les surlignages
            if (contentRef.current) {
                const cleanHTML = removeHighlightMarks(contentRef.current.innerHTML);
                contentRef.current.innerHTML = cleanHTML;
            }
            setTotalMatches(0);
        }
    }, [searchText]);

    // Ajouter un effet pour réinitialiser la recherche lors de la maximisation
    useEffect(() => {
        // On vérifie si le terminal a du contenu
        if (contentRef?.current) {
            // Réinitialiser la recherche avec le texte actuel
            if (searchText) {
                performSearch(searchText, currentMatchIndex);
            }
        }
    }, [contentRef?.current]); // Dépendance sur le changement de la ref

    return (
        <div className={`absolute right-4 top-[76px] z-50 bg-[#1e1e1e] shadow-lg transition-opacity duration-200 ${
            isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}>
            <div className="search-container bg-[#252526] flex items-center gap-2 p-1.5">
                <Search className="w-4 h-4 text-gray-400" />
                <input
                    ref={inputRef} // Ajouter la ref ici
                    type="text"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    onFocus={handleFocus} // Ajouter le gestionnaire onFocus
                    placeholder="Find in terminal"
                    className="flex-1 border-none outline-none bg-[#1e1e1e] text-gray-200 text-sm"
                    autoFocus={isOpen}
                />
                {/* Modifier cette partie pour toujours afficher le compteur */}
                <span className="text-xs text-gray-400">
                    {searchText && totalMatches > 0
                        ? `${currentMatchIndex + 1}/${totalMatches}`
                        : '0/0'}
                </span>
                <div className="flex gap-1">
                    <button
                        onClick={() => navigateToMatch('previous')}
                        className="p-1 hover:bg-[#2a2d2e] rounded disabled:opacity-50"
                        disabled={totalMatches === 0}
                    >
                        <ChevronUp className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => navigateToMatch('next')}
                        className="p-1 hover:bg-[#2a2d2e] rounded disabled:opacity-50"
                        disabled={totalMatches === 0}
                    >
                        <ChevronDown className="w-4 h-4" />
                    </button>
                </div>
                <button onClick={handleClose} className="hover:bg-[#2a2d2e] p-1 rounded">
                    <X className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}

const TerminalSearch = forwardRef(TerminalSearchComponent);
export default TerminalSearch;
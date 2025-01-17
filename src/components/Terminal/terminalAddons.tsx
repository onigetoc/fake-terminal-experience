import React, { useState, useEffect, forwardRef, useImperativeHandle, useRef } from 'react';
import { X, Search, ChevronUp, ChevronDown } from 'lucide-react';

interface SearchProps {
    isTerminalFocused: boolean;
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

function TerminalSearchComponent(
    { isTerminalFocused }: SearchProps,
    ref: React.Ref<unknown>
) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
    const [totalMatches, setTotalMatches] = useState(0);
    const contentRef = useRef<HTMLElement | null>(null);
    const observerRef = useRef<MutationObserver | null>(null);
    const inputRef = useRef<HTMLInputElement>(null); // Ajouter cette ref pour l'input

    // Fonction pour mettre à jour la référence au contenu du terminal
    useEffect(() => {
        // Cibler spécifiquement le contenu du terminal
        contentRef.current = document.querySelector('.terminal-scrollbar');
        
        if (contentRef.current && !observerRef.current) {
            // Créer un observateur pour détecter les changements dans le terminal
            observerRef.current = new MutationObserver(() => {
                if (searchText) {
                    performSearch(searchText, currentMatchIndex);
                }
            });
            
            // Observer les changements dans le contenu du terminal
            observerRef.current.observe(contentRef.current, {
                childList: true,
                subtree: true,
                characterData: true
            });
        }

        return () => {
            if (observerRef.current) {
                observerRef.current.disconnect();
            }
        };
    }, [searchText, currentMatchIndex]);

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

        console.log('Navigation:', direction, 'de', currentMatchIndex, 'vers', newIndex); // Debug
        setCurrentMatchIndex(newIndex);
        performSearch(searchText, newIndex);
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.ctrlKey && e.key === 'f' && isTerminalFocused) {
                e.preventDefault();
                setIsOpen(true);
                setTimeout(() => inputRef.current?.focus(), 0);
                return;
            }

            if (isOpen && document.activeElement === inputRef.current) {
                switch(e.key) {
                    case 'Enter':
                        // Enter va toujours vers le prochain match
                        e.preventDefault();
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
    }, [isOpen, isTerminalFocused, navigateToMatch]);

    // Ajouter un effet pour gérer le focus quand isOpen change
    useEffect(() => {
        if (isOpen) {
            inputRef.current?.focus();
        }
    }, [isOpen]);

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

    useImperativeHandle(ref, () => ({
        removeAllHighlights() {
            // Ne plus rien faire ici car le terminal sera déjà vidé par setHistory([])
            setSearchText('');
            setIsOpen(false);
            setCurrentMatchIndex(0);
            setTotalMatches(0);
        }
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
                    // Supprimer le gestionnaire onKeyDown ici puisqu'il est géré dans l'effet au-dessus
                    placeholder="Find in terminal"
                    className="flex-1 border-none outline-none bg-[#1e1e1e] text-gray-200 text-sm"
                    autoFocus={isOpen}
                />
                {totalMatches > 0 && (
                    <span className="text-xs text-gray-400">
                        {currentMatchIndex + 1} of {totalMatches}
                    </span>
                )}
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
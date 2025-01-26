import React, { useState, useEffect, forwardRef, useImperativeHandle, useRef, useCallback } from 'react';
import { X, Search, ChevronUp, ChevronDown } from 'lucide-react';

interface SearchProps {
    isTerminalFocused: boolean;
    observerRef: React.RefObject<MutationObserver | null>;
    contentRef: React.RefObject<HTMLElement | null>;
    setIsMinimized: (value: boolean) => void;
}

// Utilitaires sécurisés
function escapeRegExp(text: string) {
    return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const getTextContent = (element: HTMLElement | null): string => {
    if (!element) return '';
    return element.innerText || '';
};

// Composant principal
const TerminalSearchComponent = forwardRef<any, SearchProps>(({ 
    isTerminalFocused,
    observerRef,
    contentRef,
    setIsMinimized
}, ref) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [currentIndex, setCurrentIndex] = useState(-1);
    const [matches, setMatches] = useState<Array<{index: number, text: string}>>([]);
    const inputRef = useRef<HTMLInputElement>(null);

    // Gestionnaire des raccourcis clavier
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Ouvrir la recherche avec Ctrl+F quand le terminal est focus
            if ((e.ctrlKey || e.metaKey) && e.key === 'f' && isTerminalFocused) {
                e.preventDefault();
                setIsOpen(true);
                setTimeout(() => inputRef.current?.focus(), 0);
                return;
            }

            // Navigation avec les flèches quand la recherche est ouverte
            if (isOpen && matches.length > 0) {
                if (e.key === 'Enter' || e.key === 'ArrowDown') {
                    e.preventDefault();
                    navigateToMatch('next');
                } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    navigateToMatch('previous');
                } else if (e.key === 'Escape') {
                    e.preventDefault();
                    handleClose();
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, isTerminalFocused, matches.length]);

    // Gestionnaire de fermeture
    const handleClose = useCallback(() => {
        setIsOpen(false);
        setSearchText('');
        setMatches([]);
        setCurrentIndex(-1);
        cleanup();
    }, []);

    // Trouver les correspondances de manière sécurisée
    const findMatches = useCallback((searchStr: string) => {
        if (!searchStr.trim() || !contentRef?.current) return [];
        
        const content = getTextContent(contentRef.current);
        const regex = new RegExp(escapeRegExp(searchStr), 'gi');
        const foundMatches = [];
        let match;
        
        while ((match = regex.exec(content)) !== null) {
            foundMatches.push({
                index: match.index,
                text: match[0]
            });
        }
        
        return foundMatches;
    }, [contentRef]);

    // Navigation entre les résultats
    const navigateToMatch = useCallback((direction: 'next' | 'previous') => {
        if (matches.length === 0) return;
        
        const newIndex = direction === 'next'
            ? (currentIndex + 1) % matches.length
            : (currentIndex - 1 + matches.length) % matches.length;
        
        setCurrentIndex(newIndex);

        // Scroll vers le résultat actuel
        if (contentRef.current) {
            const marks = contentRef.current.getElementsByClassName('terminal-search-current');
            if (marks[0]) {
                marks[0].scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                });
            }
        }
    }, [matches.length, currentIndex, contentRef]);

    // Mise à jour des surlignages
    const updateHighlights = useCallback(() => {
        if (!contentRef?.current || !searchText.trim()) {
            setMatches([]);
            setCurrentIndex(-1);
            return;
        }

        const foundMatches = findMatches(searchText);
        setMatches(foundMatches);

        if (foundMatches.length > 0 && currentIndex === -1) {
            setCurrentIndex(0);
        }

        cleanup();

        // Marquer uniquement les éléments de sortie, pas les commandes
        const outputs = contentRef.current.querySelectorAll('.terminal-output');
        outputs.forEach(output => {
            const walker = document.createTreeWalker(
                output,
                NodeFilter.SHOW_TEXT,
                {
                    acceptNode: (node) => {
                        return !node.parentElement?.closest('.terminal-command')
                            ? NodeFilter.FILTER_ACCEPT
                            : NodeFilter.FILTER_REJECT;
                    }
                }
            );

            const textNodes = [];
            let node;
            while (node = walker.nextNode()) textNodes.push(node);

            textNodes.forEach(node => {
                const text = node.textContent || '';
                const regex = new RegExp(`(${escapeRegExp(searchText)})`, 'gi');
                let lastIndex = 0;
                let match;
                const fragments = [];

                while ((match = regex.exec(text)) !== null) {
                    if (match.index > lastIndex) {
                        fragments.push(document.createTextNode(text.slice(lastIndex, match.index)));
                    }

                    const mark = document.createElement('mark');
                    mark.textContent = match[0];
                    mark.className = matches.findIndex((_, i) => i === currentIndex) !== -1
                        ? 'terminal-search-current'
                        : 'terminal-search-highlight';
                    fragments.push(mark);
                    lastIndex = match.index + match[0].length;
                }

                if (lastIndex < text.length) {
                    fragments.push(document.createTextNode(text.slice(lastIndex)));
                }

                if (fragments.length > 0) {
                    const parent = node.parentNode;
                    fragments.forEach(fragment => parent?.insertBefore(fragment, node));
                    parent?.removeChild(node);
                }
            });
        });
    }, [searchText, currentIndex, contentRef, findMatches]);

    // Cleanup sécurisé
    const cleanup = useCallback(() => {
        if (!contentRef?.current) return;
        
        const marks = contentRef.current.getElementsByTagName('mark');
        Array.from(marks).forEach(mark => {
            const text = document.createTextNode(mark.textContent || '');
            if (mark.parentNode) {
                mark.parentNode.replaceChild(text, mark);
            }
        });
    }, [contentRef]);

    // Gestion des effets
    useEffect(() => {
        if (searchText) {
            cleanup();
            updateHighlights();
        } else {
            cleanup();
        }
    }, [searchText, currentIndex, updateHighlights, cleanup]);

    // Expose les méthodes via ref
    useImperativeHandle(ref, () => ({
        removeAllHighlights: cleanup,
        resetSearch: () => {
            setSearchText('');
            setMatches([]);
            setCurrentIndex(-1);
            cleanup();
        }
    }));

    // Render UI
    return (
        <div className={`absolute right-4 top-[76px] z-50 bg-[#1e1e1e] shadow-lg transition-opacity duration-200 ${
            isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}>
            <div className="search-container bg-[#252526] flex items-center gap-2 p-1.5">
                <Search className="w-4 h-4 text-gray-400" />
                <input
                    ref={inputRef}
                    type="text"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    placeholder="Find in terminal"
                    className="flex-1 border-none outline-none bg-[#1e1e1e] text-gray-200 text-sm"
                    autoFocus={isOpen}
                />
                <span className="text-xs text-gray-400">
                    {matches.length > 0 ? `${currentIndex + 1}/${matches.length}` : '0/0'}
                </span>
                <div className="flex gap-1">
                    <button
                        onClick={() => navigateToMatch('previous')}
                        className="p-1 hover:bg-[#2a2d2e] rounded disabled:opacity-50"
                        disabled={matches.length === 0}
                    >
                        <ChevronUp className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => navigateToMatch('next')}
                        className="p-1 hover:bg-[#2a2d2e] rounded disabled:opacity-50"
                        disabled={matches.length === 0}
                    >
                        <ChevronDown className="w-4 h-4" />
                    </button>
                </div>
                <button 
                    onClick={() => {
                        setIsOpen(false);
                        cleanup();
                        setSearchText('');
                        setMatches([]);
                        setCurrentIndex(-1);
                    }} 
                    className="hover:bg-[#2a2d2e] p-1 rounded"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
});

export default TerminalSearchComponent;
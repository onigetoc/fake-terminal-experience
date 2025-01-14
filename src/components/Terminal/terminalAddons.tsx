import React, { useState, useEffect, useCallback } from 'react';
import { X, Search, ArrowUp, ArrowDown } from 'lucide-react';

interface SearchMatch {
    text: string;
    index: number;
}

interface SearchProps {
    isTerminalFocused: boolean;
}

const TerminalSearch = ({ isTerminalFocused }: SearchProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [matches, setMatches] = useState<SearchMatch[]>([]);
    const [currentMatchIndex, setCurrentMatchIndex] = useState(-1);

    const findMatches = useCallback(() => {
        if (!searchTerm) {
            setMatches([]);
            setCurrentMatchIndex(-1);
            return;
        }

        const terminalContent = document.querySelector('.terminal-scrollbar');
        if (!terminalContent) return;

        const text = terminalContent.textContent || '';
        const escapedSearchTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

        try {
            const regex = new RegExp(escapedSearchTerm, 'gi');
            const newMatches: SearchMatch[] = [];
            let match;
            
            regex.lastIndex = 0;
            
            while ((match = regex.exec(text)) !== null) {
                newMatches.push({
                    text: match[0],
                    index: match.index
                });
            }

            // Keep the current match if possible
            if (newMatches.length > 0) {
                if (currentMatchIndex === -1) {
                    // If no current match, start at the first one
                    setCurrentMatchIndex(0);
                } else {
                    // Try to keep highlighting the same region of text
                    const currentMatch = matches[currentMatchIndex];
                    if (currentMatch) {
                        const nearestMatchIndex = newMatches.findIndex(
                            match => Math.abs(match.index - currentMatch.index) < currentMatch.text.length
                        );
                        if (nearestMatchIndex !== -1) {
                            setCurrentMatchIndex(nearestMatchIndex);
                        } else {
                            // If we can't find a nearby match, stay at current index if valid
                            setCurrentMatchIndex(prev => 
                                prev < newMatches.length ? prev : 0
                            );
                        }
                    }
                }
            } else {
                setCurrentMatchIndex(-1);
            }

            setMatches(newMatches);
            highlightMatches(newMatches, escapedSearchTerm);
        } catch (error) {
            console.error('Regex error:', error);
        }
    }, [searchTerm, matches, currentMatchIndex]);

    const highlightMatches = useCallback((matchesToHighlight: SearchMatch[], escapedSearchTerm: string) => {
        // Clear existing highlights first
        const existingHighlights = document.querySelectorAll('.terminal-search-highlight');
        existingHighlights.forEach(el => {
            const parent = el.parentNode;
            if (parent) {
                parent.replaceChild(document.createTextNode(el.textContent || ''), el);
            }
        });

        if (!searchTerm || matchesToHighlight.length === 0) return;

        const terminalContent = document.querySelector('.terminal-scrollbar');
        if (!terminalContent) return;

        const walker = document.createTreeWalker(
            terminalContent,
            NodeFilter.SHOW_TEXT,
            null
        );

        let node;
        let currentTextIndex = 0;

        while ((node = walker.nextNode())) {
            const text = node.textContent || '';
            const matches = [...text.matchAll(new RegExp(escapedSearchTerm, 'gi'))];
            
            if (matches.length > 0) {
                const span = document.createElement('span');
                let lastIndex = 0;
                let html = '';

                matches.forEach((match, index) => {
                    const matchIndex = currentTextIndex + index;
                    const isCurrentMatch = matchIndex === currentMatchIndex;
                    
                    html += text.slice(lastIndex, match.index);
                    html += `<span class="terminal-search-highlight ${
                        isCurrentMatch ? 'terminal-search-current' : ''
                    }">${match[0]}</span>`;
                    
                    lastIndex = match.index! + match[0].length;
                });

                html += text.slice(lastIndex);
                span.innerHTML = html;
                
                if (node.parentNode) {
                    node.parentNode.replaceChild(span, node);
                }
            }
            currentTextIndex += matches.length;
        }
    }, [searchTerm, currentMatchIndex]);

    const navigateMatches = useCallback((direction: 'next' | 'prev') => {
        if (matches.length === 0) return;

        setCurrentMatchIndex(prev => {
            const next = direction === 'next'
                ? (prev + 1) % matches.length
                : (prev - 1 + matches.length) % matches.length;
            return next;
        });
    }, [matches.length]);

    const handleKeyDown = useCallback((event: KeyboardEvent) => {
        if (!isTerminalFocused && !isOpen) return;

        if (event.ctrlKey && event.key === 'f') {
            event.preventDefault();
            event.stopPropagation();
            setIsOpen(prev => !prev);
            return;
        }

        if (isOpen) {
            if (event.key === 'Escape') {
                event.preventDefault();
                handleClose();
            } else if (event.key === 'Enter' || event.key === 'F3') {
                event.preventDefault();
                navigateMatches(event.shiftKey ? 'prev' : 'next');
            }
        }
    }, [isOpen, isTerminalFocused, navigateMatches]);

    const handleClose = () => {
        setIsOpen(false);
        setSearchTerm('');
        setMatches([]);
        setCurrentMatchIndex(-1);
        
        // Nettoyer les surlignages
        const highlights = document.querySelectorAll('.terminal-search-highlight');
        highlights.forEach(el => {
            const parent = el.parentNode;
            if (parent) {
                parent.replaceChild(document.createTextNode(el.textContent || ''), el);
            }
        });
    };

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [handleKeyDown]);

    useEffect(() => {
        if (isOpen) {
            const input = document.querySelector('.search-container input');
            if (input instanceof HTMLInputElement) {
                input.focus();
            }
        }
    }, [isOpen]);

    useEffect(() => {
        console.log('Search term changed:', searchTerm); // Debug log
        const timeoutId = setTimeout(() => {
            findMatches();
        }, 100); // Add small delay to prevent too frequent updates

        return () => clearTimeout(timeoutId);
    }, [searchTerm, findMatches]);

    useEffect(() => {
        if (currentMatchIndex >= 0 && matches[currentMatchIndex]) {
            const terminalContent = document.querySelector('.terminal-scrollbar');
            const highlights = document.querySelectorAll('.terminal-search-highlight');
            
            if (terminalContent && highlights[currentMatchIndex]) {
                const highlight = highlights[currentMatchIndex];
                highlight.scrollIntoView({ behavior: 'smooth', block: 'center' });
                
                // Ajouter une classe spéciale pour le résultat actuel
                highlights.forEach(el => el.classList.remove('terminal-search-current'));
                highlight.classList.add('terminal-search-current');
            }
        }
    }, [currentMatchIndex, matches]);

    return (
        <>
            {isOpen && (
                <div 
                    className="absolute right-4 top-[76px] z-50 bg-[#1e1e1e] shadow-lg"
                    style={{ maxWidth: '300px' }}
                >
                    <div className="search-container bg-[#252526] flex items-center gap-2 p-1.5">
                        <Search className="w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Find in terminal"
                            className="flex-1 border-none outline-none bg-[#1e1e1e] text-gray-200 text-sm"
                            autoFocus
                        />
                        {matches.length > 0 && (
                            <div className="flex items-center gap-2 text-gray-400 text-xs">
                                <span>{currentMatchIndex + 1}/{matches.length}</span>
                                <div className="flex gap-1">
                                    <button
                                        onClick={() => setCurrentMatchIndex(prev => 
                                            (prev - 1 + matches.length) % matches.length
                                        )}
                                        className="p-1 hover:bg-[#2a2d2e] rounded"
                                    >
                                        <ArrowUp className="w-3 h-3" />
                                    </button>
                                    <button
                                        onClick={() => setCurrentMatchIndex(prev => 
                                            (prev + 1) % matches.length
                                        )}
                                        className="p-1 hover:bg-[#2a2d2e] rounded"
                                    >
                                        <ArrowDown className="w-3 h-3" />
                                    </button>
                                </div>
                            </div>
                        )}
                        <button 
                            onClick={handleClose}
                            className="hover:bg-[#2a2d2e] p-1 rounded"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

export default TerminalSearch;
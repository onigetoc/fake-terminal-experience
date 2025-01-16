import React, { useState, useEffect, useCallback, useRef, forwardRef, useImperativeHandle } from 'react';
import { X, Search, ArrowUp, ArrowDown } from 'lucide-react';

interface SearchProps {
    isTerminalFocused: boolean;
}

// On utilise forwardRef pour exposer removeAllHighlights
function TerminalSearchComponent(
    { isTerminalFocused }: SearchProps,
    ref: React.Ref<unknown>
) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [matches, setMatches] = useState<number>(0);
    const [currentIndex, setCurrentIndex] = useState(-1);
    const contentRef = useRef<HTMLElement | null>(null);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isTerminalFocused) {
                // Laisser le raccourci natif du navigateur fonctionner
                return; 
            }
            if (e.ctrlKey && e.key === 'f') {
                e.preventDefault();
                // Ouvrir la recherche uniquement si elle est fermée
                if (!isOpen) {
                    setIsOpen(true);
                }
            } else if (e.key === 'Escape' && isOpen) {
                e.preventDefault();
                handleClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, isTerminalFocused]);

    // Supprime toutes les balises <mark> pour retrouver le contenu brut
    const removeHighlightMarks = useCallback((html: string) => {
        return html.replace(
            /<mark class="[^"]*">([^<]+)<\/mark>/gi,
            '$1'
        );
    }, []);

    // Nouvelle fonction : vérifie si le noeud est enfant d'un élément avec la classe spécifique
    function hasParentClass(node: Node, className: string): boolean {
        let current: HTMLElement | null = node.parentElement as HTMLElement;
        while (current) {
            if (current.classList && current.classList.contains(className)) {
                return true;
            }
            current = current.parentElement as HTMLElement;
        }
        return false;
    }

    // Recherche tous les noeuds texte
    const getTextNodes = useCallback((el: Node): Text[] => {
        const nodes: Text[] = [];
        const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
        let node;
        while (node = walker.nextNode()) {
            // Ignorer les noeuds texte dans .terminal-command
            if (!hasParentClass(node, 'terminal-command')) {
                nodes.push(node as Text);
            }
        }
        return nodes;
    }, []);

    // Fonction de surlignage
    const highlightText = useCallback(() => {
        if (!contentRef.current) return;

        // Quand la zone de recherche est vide, on enlève tous les <mark> puis on quitte
        if (!searchText.trim()) {
            const cleanHTML = removeHighlightMarks(contentRef.current.innerHTML);
            contentRef.current.innerHTML = cleanHTML;
            setMatches(0);
            setCurrentIndex(-1);
            return;
        }

        const plaintext = removeHighlightMarks(contentRef.current.innerHTML);
        contentRef.current.innerHTML = plaintext;

        // Parcourir chaque noeud texte et insérer <mark> autour de searchText
        const textNodes = getTextNodes(contentRef.current);
        let totalMatches = 0;
        textNodes.forEach(node => {
            const nodeText = node.textContent || '';
            const regex = new RegExp(`(${searchText})`, 'gi');
            let lastIndex = 0, newHTML = '';
            let match;

            while ((match = regex.exec(nodeText)) !== null) {
                totalMatches++;
                const isCurrent = (totalMatches - 1) === currentIndex;
                newHTML += nodeText.substring(lastIndex, match.index)
                    + `<mark class="terminal-search-highlight${isCurrent ? ' terminal-search-current' : ''}">`
                    + match[0]
                    + '</mark>';
                lastIndex = match.index + match[0].length;
            }
            newHTML += nodeText.substring(lastIndex);

            if (newHTML !== nodeText) {
                const tmp = document.createElement('span');
                tmp.innerHTML = newHTML;
                node.replaceWith(...Array.from(tmp.childNodes));
            }
        });
        setMatches(totalMatches);

        // Centrer la vue sur la correspondance actuelle
        if (currentIndex >= 0) {
            contentRef.current.querySelector('.terminal-search-current')?.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
        }
    }, [searchText, currentIndex, removeHighlightMarks, getTextNodes]);

    // Observe ouverture & texte
    useEffect(() => {
        if (!isOpen) return;
        contentRef.current = document.querySelector('.terminal-scrollbar');
        highlightText();
    }, [isOpen, searchText, currentIndex, highlightText]);

    const handleNext = () => {
        if (matches > 0) {
            setCurrentIndex(prev => (prev + 1) % matches);
        }
    };

    const handlePrev = () => {
        if (matches > 0) {
            setCurrentIndex(prev => (prev - 1 + matches) % matches);
        }
    };

    useEffect(() => {
        highlightText();
    }, [currentIndex, highlightText]);

    const handleClose = () => {
        setIsOpen(false);
        setSearchText('');
        setMatches(0);
        setCurrentIndex(-1);
        if (contentRef.current) {
            // Nettoyer pour retirer les <mark>
            const cleanHTML = removeHighlightMarks(contentRef.current.innerHTML);
            contentRef.current.innerHTML = cleanHTML;
        }
    };

    useImperativeHandle(ref, () => ({
        removeAllHighlights() {
            // Revenir au contenu “propre” et fermer la recherche
            if (contentRef.current) {
                const cleanHTML = removeHighlightMarks(contentRef.current.innerHTML);
                contentRef.current.innerHTML = cleanHTML;
            }
            setSearchText('');
            setMatches(0);
            setCurrentIndex(-1);
            setIsOpen(false);
        }
    }));

    return (
        <>
            {isOpen && (
                <div className="absolute right-4 top-[76px] z-50 bg-[#1e1e1e] shadow-lg">
                    <div className="search-container bg-[#252526] flex items-center gap-2 p-1.5">
                        <Search className="w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            value={searchText}
                            onChange={(e) => {
                                setSearchText(e.target.value);
                                setCurrentIndex(0); // Forcer la première occurrence
                            }}
                            placeholder="Find in terminal"
                            className="flex-1 border-none outline-none bg-[#1e1e1e] text-gray-200 text-sm"
                            autoFocus
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleNext();
                                }
                            }}
                        />
                        {matches > 0 && (
                            <div className="flex items-center gap-2 text-gray-400 text-xs">
                                <span>{(currentIndex >= 0 ? currentIndex + 1 : 0)}/{matches}</span>
                                <div className="flex gap-1">
                                    <button onClick={handlePrev} className="p-1 hover:bg-[#2a2d2e] rounded">
                                        <ArrowUp className="w-3 h-3" />
                                    </button>
                                    <button onClick={handleNext} className="p-1 hover:bg-[#2a2d2e] rounded">
                                        <ArrowDown className="w-3 h-3" />
                                    </button>
                                </div>
                            </div>
                        )}
                        <button onClick={handleClose} className="hover:bg-[#2a2d2e] p-1 rounded">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}

const TerminalSearch = forwardRef(TerminalSearchComponent);
export default TerminalSearch;
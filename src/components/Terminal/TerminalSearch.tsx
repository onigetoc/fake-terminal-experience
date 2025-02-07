import { forwardRef, useEffect, useRef, useState, useImperativeHandle } from 'react';
import { Button } from "@/components/ui/button";
import { Search, ArrowUp, ArrowDown, X } from 'lucide-react';

export interface TerminalSearchRef {
  focus: () => void;
  removeAllHighlights: () => void;
}

interface TerminalSearchProps {
  isVisible: boolean;
  onClose: () => void;
  terminalRef: React.RefObject<HTMLDivElement>;
  searchState?: {
    currentMatch: number;
    totalMatches: number;
    onNext: () => void;
    onPrevious: () => void;
    searchText: string;
    setSearchText: (text: string) => void;
    setCurrentMatch: (match: number) => void;
    setTotalMatches: (total: number) => void;
  };
  setContentKey?: React.Dispatch<React.SetStateAction<number>>;
}

interface SearchMatch {
  node: Node;
  index: number;
  length: number;
}

const TerminalSearch = forwardRef<TerminalSearchRef, TerminalSearchProps>(({ isVisible, onClose, terminalRef, searchState, setContentKey }, ref) => {
  const [localSearchText, setLocalSearchText] = useState('');
  const [localCurrentMatch, setLocalCurrentMatch] = useState(0);
  const [localTotalMatches, setLocalTotalMatches] = useState(0);

  const searchText = searchState?.searchText ?? localSearchText;
  const currentMatch = searchState?.currentMatch ?? localCurrentMatch;
  const totalMatches = searchState?.totalMatches ?? localTotalMatches;
  const setSearchText = searchState?.setSearchText ?? setLocalSearchText;
  const setCurrentMatch = searchState?.setCurrentMatch ?? setLocalCurrentMatch;
  const setTotalMatches = searchState?.setTotalMatches ?? setLocalTotalMatches;
  const searchInputRef = useRef<HTMLInputElement>(null);
  const matchesRef = useRef<SearchMatch[]>([]);

  useImperativeHandle(ref, () => ({
    focus: () => {
      if (searchInputRef.current) {
        searchInputRef.current.focus();
        searchInputRef.current.select();
      }
    },
    removeAllHighlights: clearHighlights
  }));

  const clearHighlights = () => {
    const content = terminalRef.current;
    if (!content) return;

    const marks = content.getElementsByTagName('mark');
    while (marks.length > 0) {
      const mark = marks[0];
      const parent = mark.parentNode;
      if (parent) {
        parent.replaceChild(document.createTextNode(mark.textContent || ''), mark);
        parent.normalize();
      }
    }
  };

  const escapeRegExp = (string: string) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  };

  const scrollToCurrentMatch = (index: number = currentMatch) => {
    const marks = terminalRef.current?.getElementsByTagName('mark');
    if (!marks || marks.length === 0) return;
    
    const current = marks[index];
    if (current instanceof HTMLElement) {
      current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const highlightMatches = () => {
    clearHighlights();
    
    const content = terminalRef.current;
    if (!content || !searchText.trim()) {
      setTotalMatches(0);
      setCurrentMatch(0);
      return;
    }

    // Get all text nodes that are not in .terminal-command elements
    const textNodes: Node[] = [];
    const walker = document.createTreeWalker(
      content,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: (node) => {
          let current = node.parentElement;
          while (current) {
            if (current.classList?.contains('terminal-command')) {
              return NodeFilter.FILTER_REJECT;
            }
            current = current.parentElement;
          }
          return NodeFilter.FILTER_ACCEPT;
        }
      }
    );

    let node;
    while ((node = walker.nextNode())) {
      textNodes.push(node);
    }

    // Process each text node to find and highlight matches
    let totalFound = 0;
    const allMatches: SearchMatch[] = [];

    textNodes.forEach((textNode) => {
      const text = textNode.textContent || '';
      const regex = new RegExp(escapeRegExp(searchText), 'gi');
      let match;
      let lastIndex = 0;
      let newTextContent = '';

      while ((match = regex.exec(text)) !== null) {
        // Add the text before the match
        newTextContent += text.slice(lastIndex, match.index);
        
        // Create mark element for the match
        const markElement = document.createElement('mark');
        markElement.textContent = match[0];
        markElement.className = totalFound === currentMatch ? 'current' : '';
        
        // Convert mark element to string
        const tempDiv = document.createElement('div');
        tempDiv.appendChild(markElement);
        newTextContent += tempDiv.innerHTML;

        lastIndex = match.index + match[0].length;
        allMatches.push({
          node: textNode,
          index: match.index,
          length: match[0].length
        });
        totalFound++;
      }

      // Add any remaining text after the last match
      if (lastIndex < text.length) {
        newTextContent += text.slice(lastIndex);
      }

      // Only replace content if we found matches in this node
      if (newTextContent !== text) {
        const tempSpan = document.createElement('span');
        tempSpan.innerHTML = newTextContent;
        textNode.parentNode?.replaceChild(tempSpan, textNode);
      }
    });

    matchesRef.current = allMatches;
    setTotalMatches(totalFound);
    
    if (setContentKey) {
      setContentKey(prev => prev + 1);
    }

    if (totalFound > 0) {
      // Ensure currentMatch is within bounds
      if (currentMatch >= totalFound) {
        setCurrentMatch(0);
      }
      scrollToCurrentMatch();
    } else {
      setCurrentMatch(0);
    }
  };

  // Focus when search input becomes visible
  useEffect(() => {
    if (isVisible && searchInputRef.current) {
      searchInputRef.current.focus();
      searchInputRef.current.select();
    }
  }, [isVisible]);

  // Handle keyboard shortcuts for navigating results
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (document.activeElement !== searchInputRef.current) return;

    e.nativeEvent.stopImmediatePropagation();
    e.stopPropagation();
    
    if (totalMatches > 0) {
      switch (e.key) {
        case 'Enter':
          e.preventDefault();
          handleNext();
          break;
        case 'ArrowUp':
          e.preventDefault();
          handlePrevious();
          break;
        case 'ArrowDown':
          e.preventDefault();
          handleNext();
          break;
      }
    }

    if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  // Update search results
  useEffect(() => {
    if (!searchText) {
      clearHighlights();
      setTotalMatches(0);
      setCurrentMatch(0);
      matchesRef.current = [];
    } else {
      highlightMatches();
    }
  }, [searchText]);

  // Scroll to current match
  useEffect(() => {
    if (totalMatches > 0) {
      scrollToCurrentMatch();
    }
  }, [currentMatch, totalMatches]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearHighlights();
    };
  }, []);

  const handleClose = () => {
    clearHighlights();
    setSearchText('');
    setCurrentMatch(0);
    setTotalMatches(0);
    onClose();
  };

  // Update effects to handle visibility
  useEffect(() => {
    if (!isVisible) {
      clearHighlights();
      setSearchText('');
      setCurrentMatch(0);
      setTotalMatches(0);
    }
  }, [isVisible]);

  const handleNext = () => {
    if (totalMatches === 0) return;
    
    const nextMatch = (currentMatch + 1) % totalMatches;
    setCurrentMatch(nextMatch);

    const marks = terminalRef.current?.getElementsByTagName('mark');
    if (marks) {
      Array.from(marks).forEach((mark, idx) => {
        mark.className = idx === nextMatch ? 'current' : '';
      });
    }
  };

  const handlePrevious = () => {
    if (totalMatches === 0) return;
    
    const prevMatch = (currentMatch - 1 + totalMatches) % totalMatches;
    setCurrentMatch(prevMatch);

    const marks = terminalRef.current?.getElementsByTagName('mark');
    if (marks) {
      Array.from(marks).forEach((mark, idx) => {
        mark.className = idx === prevMatch ? 'current' : '';
      });
    }
  };

  if (!isVisible) return null;

  return (
    <div 
      className={`search-container absolute right-2 top-2 bg-[#252526] border border-[#383838] transition-opacity flex items-center p-2 shadow-lg z-50 mr-2 mt-20 ${isVisible ? 'visible' : 'invisible'}`}
      onClick={(e) => e.stopPropagation()}
    >
      <Search className="w-4 h-4 text-gray-400 lucide mr-2" />
      <input
        ref={searchInputRef}
        type="text"
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        onKeyDown={handleSearchKeyDown}
        className="w-40 bg-transparent border-none rounded-xl text-[#d4d4d4] text-sm px-2 outline-none focus:outline-none placeholder-[#666] transition-opacity duration-200 opacity-100"
        placeholder="Find in terminal..."
      />
      <span className="text-[#8a8a8a] text-sm px-2">
        {totalMatches > 0 ? `${currentMatch + 1}/${totalMatches}` : '0/0'}
      </span>
      <div className="flex gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="hover:bg-[#2a2d2e] rounded disabled:opacity-50"
          onClick={handlePrevious}
          disabled={totalMatches === 0}
        >
          <ArrowUp className="w-4 h-4 lucide" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="hover:bg-[#2a2d2e] rounded disabled:opacity-50"
          onClick={handleNext}
          disabled={totalMatches === 0}
        >
          <ArrowDown className="w-4 h-4 lucide" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="hover:bg-[#2a2d2e] rounded disabled:opacity-50"
          onClick={handleClose}
        >
          <X className="w-4 h-4 lucide" />
        </Button>
      </div>
    </div>
  );
});

export default TerminalSearch;

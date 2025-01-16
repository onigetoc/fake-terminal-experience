import React, { useState, useEffect, useCallback, useRef } from 'react';

const SearchHighlight = () => {
  const [searchText, setSearchText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [matches, setMatches] = useState([]);
  const contentRef = useRef(null);
  const searchInputRef = useRef(null);
  const [content] = useState(`
    Lorem ipsum dolor sit amet consectetur adipisicing elit. Projet JavaScript avancé pour créer une fonction de recherche sophistiquée. Les développeurs JavaScript adorent créer des projets innovants.
    
    La recherche dans le navigateur est un outil essentiel. Chaque projet nécessite une bonne fonction de recherche. Les développeurs passent beaucoup de temps à optimiser leurs projets.
    
    JavaScript est un langage polyvalent. Les frameworks JavaScript facilitent le développement de projets complexes. La communauté JavaScript est très active.
    
    Un bon projet demande de la patience. La recherche d'excellence est importante dans chaque projet. Les tests sont essentiels dans un projet JavaScript.
    
    Lorem ipsum dolor sit amet, la recherche continue. JavaScript évolue constamment. Les développeurs adorent JavaScript pour sa flexibilité.
  `);

  const highlightText = useCallback(() => {
    if (!searchText.trim()) {
      return content;
    }

    const regex = new RegExp(`(${searchText})`, 'gi');
    const parts = content.split(regex);

    return (
      <React.Fragment>
        {parts.map((part, index) => {
          if (part.toLowerCase() === searchText.toLowerCase()) {
            const isCurrentMatch = Math.floor(index / 2) === currentIndex;
            return (
              <mark
                key={`match-${index}`}
                className={`${isCurrentMatch ? 'bg-orange-400' : 'bg-gray-200'}`}
              >
                {part}
              </mark>
            );
          }
          return <React.Fragment key={`text-${index}`}>{part}</React.Fragment>;
        })}
      </React.Fragment>
    );
  }, [searchText, currentIndex, content]);

  const updateMatches = useCallback(() => {
    if (!searchText.trim()) {
      setMatches([]);
      return;
    }

    const regex = new RegExp(searchText, 'gi');
    const newMatches = [];
    let match;

    while ((match = regex.exec(content)) !== null) {
      newMatches.push({
        index: match.index,
        text: match[0],
      });
    }

    setMatches(newMatches);
  }, [searchText, content]);

  useEffect(() => {
    setCurrentIndex(matches.length > 0 ? 0 : -1);
    updateMatches();
  }, [searchText, updateMatches]);

  const scrollToMatch = useCallback(() => {
    if (currentIndex >= 0 && contentRef.current) {
      const marks = contentRef.current.getElementsByTagName('mark');
      const currentMark = marks[currentIndex];
      if (currentMark) {
        currentMark.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }
    }
  }, [currentIndex]);

  useEffect(() => {
    scrollToMatch();
  }, [currentIndex, scrollToMatch]);

  const handlePrevious = () => {
    if (matches.length > 0) {
      setCurrentIndex((prev) => (prev - 1 + matches.length) % matches.length);
    }
  };

  const handleNext = () => {
    if (matches.length > 0) {
      setCurrentIndex((prev) => (prev + 1) % matches.length);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleNext();
    }
  };

  useEffect(() => {
    const handleKeyboardShortcut = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyboardShortcut);
    return () => document.removeEventListener('keydown', handleKeyboardShortcut);
  }, []);

  return (
    <div className="relative min-h-screen p-4">
      <div className="fixed top-5 right-5 bg-white p-3 border border-gray-300 shadow-md rounded">
        <input
          ref={searchInputRef}
          type="text"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Rechercher..."
          className="p-2 w-48 mr-2 border border-gray-300 rounded"
        />
        <button
          onClick={handlePrevious}
          className="px-3 py-1 mx-1 border border-gray-300 rounded hover:bg-gray-100"
        >
          ↑
        </button>
        <button
          onClick={handleNext}
          className="px-3 py-1 mx-1 border border-gray-300 rounded hover:bg-gray-100"
        >
          ↓
        </button>
        <span className="ml-2 text-sm text-gray-600">
          {matches.length > 0 ? `${currentIndex + 1}/${matches.length}` : '0/0'}
        </span>
      </div>

      <div 
        ref={contentRef}
        className="h-96 overflow-y-auto p-5 border border-gray-300 my-20 mx-5 leading-relaxed rounded bg-white"
      >
        <div className="whitespace-pre-wrap font-sans">
          {highlightText()}
        </div>
      </div>
    </div>
  );
};

export default SearchHighlight;
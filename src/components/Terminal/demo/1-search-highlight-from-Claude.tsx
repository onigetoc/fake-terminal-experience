import React, { useState, useEffect, useCallback, useRef } from 'react';

const SearchHighlight = () => {
  const [searchText, setSearchText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [matches, setMatches] = useState([]);
  const [highlightedContent, setHighlightedContent] = useState({ __html: '' });
  const contentRef = useRef(null);
  const searchInputRef = useRef(null);
  
  // Stocker le contenu initial dans un state
  const [baseContent, setBaseContent] = useState(`
    <h1 class="text-2xl font-bold mb-4">Guide de développement JavaScript</h1>

    <h2 class="text-xl font-semibold mb-3">Introduction au JavaScript</h2>
    <p class="mb-4">
      Lorem ipsum dolor sit amet <span class="text-blue-600">consectetur adipisicing elit</span>. 
      Projet JavaScript avancé pour créer une fonction de <strong>recherche sophistiquée</strong>. 
      Les développeurs JavaScript adorent créer des <em>projets innovants</em>.
    </p>
    
    <div class="bg-gray-100 p-4 rounded mb-4">
      <h3 class="text-lg font-medium mb-2">Outils essentiels</h3>
      La recherche dans le navigateur est un outil essentiel. 
      <ul class="list-disc pl-4">
        <li>Chaque projet nécessite une bonne fonction de recherche.</li>
        <li>Les développeurs passent beaucoup de temps à optimiser leurs projets.</li>
      </ul>
    </div>
    
    <h2 class="text-xl font-semibold mb-3">Caractéristiques du JavaScript</h2>
    <p class="mb-4">
      JavaScript est un langage polyvalent. Les <a href="#" class="text-blue-500">frameworks JavaScript</a> 
      facilitent le développement de projets complexes. La communauté JavaScript est très active.
    </p>
    
    <blockquote class="border-l-4 border-gray-300 pl-4 mb-4">
      Un bon projet demande de la patience. La recherche d'excellence est importante dans 
      chaque projet. Les tests sont essentiels dans un <code>projet JavaScript</code>.
    </blockquote>
    
    <div class="mt-4">
      <h4 class="text-lg font-medium mb-2">Conclusion</h4>
      <p>
        Lorem ipsum dolor sit amet, <span class="text-green-600">la recherche continue</span>. 
        JavaScript évolue constamment. Les développeurs adorent JavaScript pour sa flexibilité.
      </p>
    </div>
  `);

  const escapeRegExp = (string) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  };

  const getTextContent = (html) => {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
  };

  const findMatches = useCallback((searchStr, content) => {
    if (!searchStr.trim() || !content) return [];
    const text = getTextContent(content);
    const regex = new RegExp(escapeRegExp(searchStr), 'gi');
    return Array.from(text.matchAll(regex), m => ({
      index: m.index,
      text: m[0]
    }));
  }, []);

  const updateHighlightedContent = useCallback(() => {
    // Si pas de contenu base, on ne fait rien
    if (!baseContent) {
      setHighlightedContent({ __html: '' });
      setMatches([]);
      setCurrentIndex(-1);
      return;
    }

    if (!searchText.trim()) {
      setHighlightedContent({ __html: baseContent });
      setMatches([]);
      setCurrentIndex(-1);
      return;
    }

    let html = baseContent;
    const foundMatches = findMatches(searchText, html);
    setMatches(foundMatches);

    if (foundMatches.length > 0) {
      if (currentIndex === -1) {
        setCurrentIndex(0);
      }
      
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = html;
      const textNodes = [];
      
      const walkNode = (node) => {
        if (node.nodeType === 3) {
          textNodes.push(node);
        } else {
          node.childNodes.forEach(walkNode);
        }
      };
      
      walkNode(tempDiv);

      let offset = 0;
      textNodes.forEach(textNode => {
        const text = textNode.textContent;
        const regex = new RegExp(`(${escapeRegExp(searchText)})`, 'gi');
        let lastIndex = 0;
        let match;
        let newText = '';

        while ((match = regex.exec(text)) !== null) {
          const matchIndex = foundMatches.findIndex(m => 
            m.index >= offset + lastIndex && 
            m.index < offset + match.index + match[0].length
          );
          
          newText += text.slice(lastIndex, match.index);
          newText += `<mark class="${
            matchIndex === currentIndex ? 'bg-orange-400' : 'bg-gray-200'
          }">${match[0]}</mark>`;
          
          lastIndex = match.index + match[0].length;
        }

        newText += text.slice(lastIndex);
        if (newText !== text) {
          const newNode = document.createElement('span');
          newNode.innerHTML = newText;
          textNode.parentNode.replaceChild(newNode, textNode);
        }
        
        offset += text.length;
      });

      html = tempDiv.innerHTML;
    }

    setHighlightedContent({ __html: html });
  }, [searchText, currentIndex, baseContent, findMatches]);

  useEffect(() => {
    updateHighlightedContent();
  }, [searchText, currentIndex, updateHighlightedContent]);

  useEffect(() => {
    if (currentIndex >= 0 && contentRef.current) {
      const marks = contentRef.current.getElementsByTagName('mark');
      const currentMark = marks[currentIndex];
      if (currentMark) {
        requestAnimationFrame(() => {
          currentMark.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
          });
        });
      }
    }
  }, [currentIndex, highlightedContent]);

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

  // Fonction pour vider le contenu
  const handleClear = () => {
    if (contentRef.current) {
      contentRef.current.innerHTML = '';
    }
    setBaseContent(''); // Vider le contenu de base
    setHighlightedContent({ __html: '' });
    setSearchText('');
    setMatches([]);
    setCurrentIndex(-1);
  };

  // Fonction pour réinitialiser le contenu initial
  const handleAddText = () => {
    // Réinitialiser avec le contenu initial
    setBaseContent(`
    <h1 class="text-2xl font-bold mb-4">Guide de développement JavaScript</h1>

    <h2 class="text-xl font-semibold mb-3">Introduction au JavaScript</h2>
    <p class="mb-4">
      Lorem ipsum dolor sit amet <span class="text-blue-600">consectetur adipisicing elit</span>. 
      Projet JavaScript avancé pour créer une fonction de <strong>recherche sophistiquée</strong>. 
      Les développeurs JavaScript adorent créer des <em>projets innovants</em>.
    </p>
    
    <div class="bg-gray-100 p-4 rounded mb-4">
      <h3 class="text-lg font-medium mb-2">Outils essentiels</h3>
      La recherche dans le navigateur est un outil essentiel. 
      <ul class="list-disc pl-4">
        <li>Chaque projet nécessite une bonne fonction de recherche.</li>
        <li>Les développeurs passent beaucoup de temps à optimiser leurs projets.</li>
      </ul>
    </div>
    
    <h2 class="text-xl font-semibold mb-3">Caractéristiques du JavaScript</h2>
    <p class="mb-4">
      JavaScript est un langage polyvalent. Les <a href="#" class="text-blue-500">frameworks JavaScript</a> 
      facilitent le développement de projets complexes. La communauté JavaScript est très active.
    </p>
    
    <blockquote class="border-l-4 border-gray-300 pl-4 mb-4">
      Un bon projet demande de la patience. La recherche d'excellence est importante dans 
      chaque projet. Les tests sont essentiels dans un <code>projet JavaScript</code>.
    </blockquote>
    
    <div class="mt-4">
      <h4 class="text-lg font-medium mb-2">Conclusion</h4>
      <p>
        Lorem ipsum dolor sit amet, <span class="text-green-600">la recherche continue</span>. 
        JavaScript évolue constamment. Les développeurs adorent JavaScript pour sa flexibilité.
      </p>
    </div>
  `);
    // Réinitialiser l'état de recherche
    setSearchText('');
    setMatches([]);
    setCurrentIndex(-1);
    // Mettre à jour le contenu surligné
    setHighlightedContent({ __html: baseContent });
  };

  useEffect(() => {
    const handleKeyboardShortcut = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyboardShortcut);
    return () => window.removeEventListener('keydown', handleKeyboardShortcut);
  }, []);

  return (
    <div className="relative min-h-screen p-4">
      <div className="fixed top-5 right-5 bg-white p-3 border border-gray-300 shadow-md rounded z-10">
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
          disabled={matches.length === 0}
          className="px-3 py-1 mx-1 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50"
        >
          ↑
        </button>
        <button
          onClick={handleNext}
          disabled={matches.length === 0}
          className="px-3 py-1 mx-1 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50"
        >
          ↓
        </button>
        <span className="ml-2 text-sm text-gray-600">
          {matches.length > 0 ? `${currentIndex + 1}/${matches.length}` : '0/0'}
        </span>
      </div>

      <div 
        id="content-container"
        ref={contentRef}
        className="content-container h-96 overflow-y-auto p-5 border border-gray-300 my-20 mx-5 leading-relaxed rounded bg-white"
        dangerouslySetInnerHTML={highlightedContent}
      />
      
      <button
        onClick={handleClear}
        className="fixed bottom-5 right-20 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors duration-200 shadow-md"
      >
        Clear
      </button>
      
      <button
        onClick={handleAddText}
        className="fixed bottom-5 right-5 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors duration-200 shadow-md"
      >
        Add Texte
      </button>
    </div>
  );
};

export default SearchHighlight;
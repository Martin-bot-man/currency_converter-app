import React, { useState, useMemo, useRef, useEffect } from 'react';
import { HiOutlineStar, HiStar, HiChevronDown, HiSearch, HiX } from "react-icons/hi";

const CurrencyDropdown = ({
  currencies = [],
  currency,
  setCurrency,
  favorites = [],
  handleFavorite,
  title = "",
  disabled = false,
  placeholder = "Select currency...",
  showSearch = true,
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [focusedIndex, setFocusedIndex] = useState(-1);
  
  const dropdownRef = useRef(null);
  const searchRef = useRef(null);
  const listRef = useRef(null);

  const isFavorite = (curr) => favorites.includes(curr);

  // Filter and sort currencies based on search term
  const filteredCurrencies = useMemo(() => {
    const searchLower = searchTerm.toLowerCase();
    
    const filtered = currencies.filter(curr => 
      curr.toLowerCase().includes(searchLower)
    );
    
    // Separate favorites and non-favorites
    const favs = filtered.filter(curr => favorites.includes(curr));
    const nonFavs = filtered.filter(curr => !favorites.includes(curr));
    
    // Sort each group alphabetically
    const sortedFavs = favs.sort();
    const sortedNonFavs = nonFavs.sort();
    
    return {
      favorites: sortedFavs,
      others: sortedNonFavs,
      all: [...sortedFavs, ...sortedNonFavs]
    };
  }, [currencies, favorites, searchTerm]);

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault();
        setIsOpen(true);
        setFocusedIndex(0);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex(prev => 
          prev < filteredCurrencies.all.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex(prev => 
          prev > 0 ? prev - 1 : filteredCurrencies.all.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (focusedIndex >= 0 && filteredCurrencies.all[focusedIndex]) {
          handleSelect(filteredCurrencies.all[focusedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        setSearchTerm("");
        setFocusedIndex(-1);
        break;
      case 'Tab':
        setIsOpen(false);
        setSearchTerm("");
        setFocusedIndex(-1);
        break;
    }
  };

  // Handle option selection
  const handleSelect = (selectedCurrency) => {
    setCurrency(selectedCurrency);
    setIsOpen(false);
    setSearchTerm("");
    setFocusedIndex(-1);
  };

  // Handle favorite toggle
  const handleFavoriteClick = (e, curr) => {
    e.stopPropagation();
    handleFavorite(curr);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm("");
        setFocusedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && showSearch && searchRef.current) {
      setTimeout(() => searchRef.current?.focus(), 100);
    }
  }, [isOpen, showSearch]);

  // Scroll focused item into view
  useEffect(() => {
    if (focusedIndex >= 0 && listRef.current) {
      const focusedElement = listRef.current.children[focusedIndex];
      if (focusedElement) {
        focusedElement.scrollIntoView({
          block: 'nearest',
          behavior: 'smooth'
        });
      }
    }
  }, [focusedIndex]);

  // Get currency display info (you can extend this with country names, flags, etc.)
  const getCurrencyInfo = (curr) => {
    const currencyNames = {
      'USD': '🇺🇸 US Dollar',
      'EUR': '🇪🇺 Euro',
      'GBP': '🇬🇧 British Pound',
      'JPY': '🇯🇵 Japanese Yen',
      'CAD': '🇨🇦 Canadian Dollar',
      'AUD': '🇦🇺 Australian Dollar',
      'CHF': '🇨🇭 Swiss Franc',
      'CNY': '🇨🇳 Chinese Yuan',
      'INR': '🇮🇳 Indian Rupee',
      'KRW': '🇰🇷 South Korean Won',
      // Add more as needed
    };
    
    return {
      code: curr,
      name: currencyNames[curr] || `${curr}`,
      flag: currencyNames[curr]?.split(' ')[0] || '💱'
    };
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Label */}
      {title && (
        <label 
          htmlFor={`currency-select-${title}`}
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          {title}
        </label>
      )}

      {/* Main Button */}
      <button
        id={`currency-select-${title}`}
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        className={`
          relative w-full p-3 text-left bg-white border rounded-lg shadow-sm
          focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
          disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60
          ${isOpen ? 'border-indigo-500 ring-2 ring-indigo-500' : 'border-gray-300'}
          hover:border-gray-400 transition-colors duration-200
        `}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-labelledby={title ? `currency-select-${title}` : undefined}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {currency ? (
              <>
                <span className="text-lg">{getCurrencyInfo(currency).flag}</span>
                <span className="font-medium">{currency}</span>
                <span className="text-sm text-gray-500 hidden sm:inline">
                  {getCurrencyInfo(currency).name.split(' ').slice(1).join(' ')}
                </span>
              </>
            ) : (
              <span className="text-gray-400">{placeholder}</span>
            )}
          </div>
          
          <div className="flex items-center space-x-1">
            {/* Favorite Button */}
            {currency && (
              <button
                type="button"
                onClick={(e) => handleFavoriteClick(e, currency)}
                className="p-1 text-yellow-500 hover:text-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-1 rounded transition-colors duration-200"
                aria-label={isFavorite(currency) ? "Remove from favorites" : "Add to favorites"}
                tabIndex={-1}
              >
                {isFavorite(currency) ? (
                  <HiStar className="w-4 h-4" />
                ) : (
                  <HiOutlineStar className="w-4 h-4" />
                )}
              </button>
            )}
            
            {/* Dropdown Arrow */}
            <HiChevronDown 
              className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
                isOpen ? 'transform rotate-180' : ''
              }`} 
            />
          </div>
        </div>
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-hidden">
          {/* Search Input */}
          {showSearch && (
            <div className="p-3 border-b border-gray-200">
              <div className="relative">
                <HiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  ref={searchRef}
                  type="text"
                  placeholder="Search currencies..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setFocusedIndex(-1);
                  }}
                  className="w-full pl-10 pr-8 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  aria-label="Search currencies"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchTerm("");
                      setFocusedIndex(-1);
                      searchRef.current?.focus();
                    }}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    aria-label="Clear search"
                  >
                    <HiX className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Options List */}
          <div 
            ref={listRef}
            className="overflow-y-auto max-h-48"
            role="listbox"
            aria-label="Currency options"
          >
            {filteredCurrencies.all.length === 0 ? (
              <div className="px-3 py-6 text-center text-gray-500">
                <div className="text-lg mb-2">🔍</div>
                <div className="text-sm">No currencies found</div>
                {searchTerm && (
                  <div className="text-xs text-gray-400 mt-1">
                    Try searching for "{searchTerm}" differently
                  </div>
                )}
              </div>
            ) : (
              <>
                {/* Favorites Section */}
                {filteredCurrencies.favorites.length > 0 && (
                  <>
                    <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50 border-b border-gray-200">
                      ⭐ Favorites
                    </div>
                    {filteredCurrencies.favorites.map((curr, index) => {
                      const info = getCurrencyInfo(curr);
                      const isSelected = curr === currency;
                      const isFocused = index === focusedIndex;
                      
                      return (
                        <button
                          key={`fav-${curr}`}
                          type="button"
                          onClick={() => handleSelect(curr)}
                          className={`
                            w-full px-3 py-3 text-left hover:bg-indigo-50 focus:bg-indigo-50 focus:outline-none
                            flex items-center justify-between group transition-colors duration-150
                            ${isSelected ? 'bg-indigo-100 text-indigo-900' : 'text-gray-900'}
                            ${isFocused ? 'bg-indigo-50' : ''}
                          `}
                          role="option"
                          aria-selected={isSelected}
                        >
                          <div className="flex items-center space-x-3">
                            <span className="text-lg">{info.flag}</span>
                            <div>
                              <div className="font-medium">{curr}</div>
                              <div className="text-xs text-gray-500 hidden sm:block">
                                {info.name.split(' ').slice(1).join(' ')}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            {isSelected && (
                              <span className="text-indigo-600">✓</span>
                            )}
                            <button
                              type="button"
                              onClick={(e) => handleFavoriteClick(e, curr)}
                              className="opacity-60 group-hover:opacity-100 text-yellow-500 hover:text-yellow-600 focus:outline-none p-1 rounded transition-all duration-200"
                              aria-label="Remove from favorites"
                              tabIndex={-1}
                            >
                              <HiStar className="w-4 h-4" />
                            </button>
                          </div>
                        </button>
                      );
                    })}
                  </>
                )}

                {/* Other Currencies Section */}
                {filteredCurrencies.others.length > 0 && (
                  <>
                    {filteredCurrencies.favorites.length > 0 && (
                      <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50 border-b border-gray-200">
                        All Currencies
                      </div>
                    )}
                    {filteredCurrencies.others.map((curr, index) => {
                      const info = getCurrencyInfo(curr);
                      const isSelected = curr === currency;
                      const actualIndex = filteredCurrencies.favorites.length + index;
                      const isFocused = actualIndex === focusedIndex;
                      
                      return (
                        <button
                          key={curr}
                          type="button"
                          onClick={() => handleSelect(curr)}
                          className={`
                            w-full px-3 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none
                            flex items-center justify-between group transition-colors duration-150
                            ${isSelected ? 'bg-indigo-100 text-indigo-900' : 'text-gray-900'}
                            ${isFocused ? 'bg-gray-50' : ''}
                          `}
                          role="option"
                          aria-selected={isSelected}
                        >
                          <div className="flex items-center space-x-3">
                            <span className="text-lg">{info.flag}</span>
                            <div>
                              <div className="font-medium">{curr}</div>
                              <div className="text-xs text-gray-500 hidden sm:block">
                                {info.name.split(' ').slice(1).join(' ')}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            {isSelected && (
                              <span className="text-indigo-600">✓</span>
                            )}
                            <button
                              type="button"
                              onClick={(e) => handleFavoriteClick(e, curr)}
                              className="opacity-0 group-hover:opacity-60 hover:opacity-100 text-yellow-500 hover:text-yellow-600 focus:outline-none p-1 rounded transition-all duration-200"
                              aria-label="Add to favorites"
                              tabIndex={-1}
                            >
                              <HiOutlineStar className="w-4 h-4" />
                            </button>
                          </div>
                        </button>
                      );
                    })}
                  </>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CurrencyDropdown;
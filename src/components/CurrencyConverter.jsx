import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { HiArrowsRightLeft, HiStar, HiOutlineStar } from "react-icons/hi2";

// Custom hook for localStorage
const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      setStoredValue(value);
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue];
};

// Custom hook for debouncing
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// CurrencyDropdown Component
const CurrencyDropdown = ({ 
  currencies, 
  currency, 
  setCurrency, 
  favorites, 
  handleFavorite, 
  title,
  disabled = false 
}) => {
  const isFavorite = favorites.includes(currency);

  // Sort currencies: favorites first, then alphabetical
  const sortedCurrencies = useMemo(() => {
    const favs = currencies.filter(curr => favorites.includes(curr));
    const nonFavs = currencies.filter(curr => !favorites.includes(curr));
    return [...favs.sort(), ...nonFavs.sort()];
  }, [currencies, favorites]);

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {title}
      </label>
      <div className="relative">
        <select
          value={currency}
          onChange={(e) => setCurrency(e.target.value)}
          disabled={disabled}
          className="w-full p-3 pr-10 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
          aria-label={`Select ${title.toLowerCase()} currency`}
        >
          <option value="">Select Currency</option>
          {favorites.length > 0 && (
            <optgroup label="⭐ Favorites">
              {sortedCurrencies
                .filter(curr => favorites.includes(curr))
                .map((curr) => (
                  <option key={`fav-${curr}`} value={curr}>
                    ⭐ {curr}
                  </option>
                ))}
            </optgroup>
          )}
          <optgroup label="All Currencies">
            {sortedCurrencies
              .filter(curr => !favorites.includes(curr))
              .map((curr) => (
                <option key={curr} value={curr}>
                  {curr}
                </option>
              ))}
          </optgroup>
        </select>
        
        <button
          type="button"
          onClick={() => handleFavorite(currency)}
          disabled={!currency || disabled}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-yellow-500 hover:text-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-1 rounded disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
        >
          {isFavorite ? (
            <HiStar className="w-5 h-5" />
          ) : (
            <HiOutlineStar className="w-5 h-5" />
          )}
        </button>
      </div>
    </div>
  );
};

// Error Alert Component
const ErrorAlert = ({ message, onClose }) => (
  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
    <div className="flex justify-between items-start">
      <div className="flex">
        <div className="text-red-400 mr-3">⚠️</div>
        <div>
          <h3 className="text-sm font-medium text-red-800">Error</h3>
          <p className="text-sm text-red-700 mt-1">{message}</p>
        </div>
      </div>
      <button
        onClick={onClose}
        className="text-red-400 hover:text-red-600 focus:outline-none"
        aria-label="Close error"
      >
        ✕
      </button>
    </div>
  </div>
);

// Success Alert Component  
const SuccessAlert = ({ amount, fromCurrency, toCurrency, convertedAmount, rate }) => (
  <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
    <div className="text-center">
      <div className="text-2xl font-bold text-green-700 mb-2">
        {convertedAmount}
      </div>
      <div className="text-sm text-green-600">
        {amount} {fromCurrency} = {convertedAmount}
      </div>
      <div className="text-xs text-green-500 mt-1">
        Exchange Rate: 1 {fromCurrency} = {rate} {toCurrency}
      </div>
    </div>
  </div>
);

// Main Component
const CurrencyConverter = () => {
  // State management
  const [currencies, setCurrencies] = useState([]);
  const [amount, setAmount] = useState(1);
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('EUR');
  const [convertedAmount, setConvertedAmount] = useState(null);
  const [exchangeRate, setExchangeRate] = useState(null);
  const [converting, setConverting] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Use custom hook for favorites
  const [favorites, setFavorites] = useLocalStorage("currency-favorites", ["EUR", "GBP", "JPY"]);
  
  // Debounce amount changes to reduce API calls
  const debouncedAmount = useDebounce(amount, 500);

  // Fetch available currencies
  const fetchCurrencies = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch("https://api.frankfurter.app/currencies");
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setCurrencies(Object.keys(data));
    } catch (error) {
      console.error('Error fetching currencies:', error);
      setError('Failed to load currencies. Please check your internet connection.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Convert currency
  const convertCurrency = useCallback(async () => {
    if (!debouncedAmount || !fromCurrency || !toCurrency || fromCurrency === toCurrency) {
      return;
    }

    setConverting(true);
    setError(null);

    try {
      // Fixed the API URL - added missing &
      const response = await fetch(
        `https://api.frankfurter.app/latest?amount=${debouncedAmount}&from=${fromCurrency}&to=${toCurrency}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.rates && data.rates[toCurrency]) {
        setConvertedAmount(data.rates[toCurrency].toFixed(2));
        setExchangeRate((data.rates[toCurrency] / debouncedAmount).toFixed(4));
      } else {
        throw new Error('Invalid response from currency API');
      }
    } catch (error) {
      console.error("Error converting currency:", error);
      setError('Failed to convert currency. Please try again.');
      setConvertedAmount(null);
      setExchangeRate(null);
    } finally {
      setConverting(false);
    }
  }, [debouncedAmount, fromCurrency, toCurrency]);

  // Handle favorites
  const handleFavorite = useCallback((currency) => {
    if (!currency) return;
    
    setFavorites(prevFavorites => {
      if (prevFavorites.includes(currency)) {
        return prevFavorites.filter(fav => fav !== currency);
      } else {
        return [...prevFavorites, currency];
      }
    });
  }, [setFavorites]);

  // Swap currencies
  const swapCurrencies = useCallback(() => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
    // Clear previous results since currencies changed
    setConvertedAmount(null);
    setExchangeRate(null);
  }, [fromCurrency, toCurrency]);

  // Effects
  useEffect(() => {
    fetchCurrencies();
  }, [fetchCurrencies]);

  // Auto-convert when amount or currencies change
  useEffect(() => {
    if (currencies.length > 0 && debouncedAmount && fromCurrency && toCurrency) {
      convertCurrency();
    }
  }, [convertCurrency, currencies.length, debouncedAmount, fromCurrency, toCurrency]);

  // Loading state
  if (loading) {
    return (
      <div className="max-w-xl mx-auto my-10 p-6 bg-white rounded-xl shadow-lg">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded mb-6"></div>
          <div className="space-y-4">
            <div className="h-12 bg-gray-300 rounded"></div>
            <div className="h-12 bg-gray-300 rounded"></div>
            <div className="h-12 bg-gray-300 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto my-10 p-6 bg-white rounded-xl shadow-lg border border-gray-200">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          💱 Currency Converter
        </h1>
        <p className="text-gray-600">
          Convert between {currencies.length} currencies instantly
        </p>
      </div>

      {/* Currency Selection */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end mb-6">
        <CurrencyDropdown
          currencies={currencies}
          currency={fromCurrency}
          setCurrency={setFromCurrency}
          favorites={favorites}
          handleFavorite={handleFavorite}
          title="From"
          disabled={converting}
        />

        <div className="flex justify-center">
          <button
            onClick={swapCurrencies}
            disabled={converting || !fromCurrency || !toCurrency}
            className="p-3 bg-indigo-100 hover:bg-indigo-200 text-indigo-600 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Swap currencies"
          >
            <HiArrowsRightLeft className="w-6 h-6" />
          </button>
        </div>

        <CurrencyDropdown
          currencies={currencies}
          currency={toCurrency}
          setCurrency={setToCurrency}
          favorites={favorites}
          handleFavorite={handleFavorite}
          title="To"
          disabled={converting}
        />
      </div>

      {/* Amount Input */}
      <div className="mb-6">
        <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
          Amount
        </label>
        <input
          id="amount"
          type="number"
          min="0"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(Math.max(0, parseFloat(e.target.value) || 0))}
          className="w-full p-3 text-lg border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="Enter amount"
          disabled={converting}
        />
      </div>

      {/* Error Display */}
      {error && (
        <ErrorAlert 
          message={error} 
          onClose={() => setError(null)} 
        />
      )}

      {/* Results */}
      {convertedAmount && !error && fromCurrency !== toCurrency && (
        <SuccessAlert
          amount={debouncedAmount}
          fromCurrency={fromCurrency}
          toCurrency={toCurrency}
          convertedAmount={`${convertedAmount} ${toCurrency}`}
          rate={exchangeRate}
        />
      )}

      {/* Same Currency Warning */}
      {fromCurrency === toCurrency && fromCurrency && (
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
          <p className="text-yellow-700">
            💡 Please select different currencies to convert
          </p>
        </div>
      )}

      {/* Loading Indicator */}
      {converting && (
        <div className="mt-4 text-center">
          <div className="inline-flex items-center px-4 py-2 bg-indigo-100 rounded-lg">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600 mr-2"></div>
            <span className="text-indigo-700">Converting...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default CurrencyConverter;
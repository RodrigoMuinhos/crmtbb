import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  suggestions?: string[];
  onSuggestionSelect?: (value: string) => void;
}

export function Input({ label, error, suggestions, onSuggestionSelect, className = '', ...props }: InputProps) {
  const [showSuggestions, setShowSuggestions] = React.useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = React.useState<string[]>([]);
  const wrapperRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    if (props.onChange) {
      props.onChange(e);
    }

    if (suggestions && value) {
      const filtered = suggestions.filter(s => 
        s.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    if (onSuggestionSelect) {
      onSuggestionSelect(suggestion);
    }
    setShowSuggestions(false);
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    if (props.onFocus) {
      props.onFocus(e);
    }
    
    if (suggestions && e.target.value) {
      const filtered = suggestions.filter(s => 
        s.toLowerCase().includes(e.target.value.toLowerCase())
      );
      setFilteredSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    }
  };
  
  return (
    <div className="w-full" ref={wrapperRef}>
      {label && (
        <label className="block mb-2 text-[var(--brand-text-primary)]">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          className={`w-full px-4 py-2 bg-[var(--brand-surface)] border border-[var(--brand-text-secondary)]/20 rounded-[var(--radius-button)] text-[var(--brand-text-primary)] placeholder:text-[var(--brand-text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/30 focus:border-[var(--brand-primary)] transition-all ${className}`}
          {...props}
          onChange={handleInputChange}
          onFocus={handleFocus}
        />
        
        {showSuggestions && filteredSuggestions.length > 0 && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-[var(--brand-text-secondary)]/20 rounded-[var(--radius-button)] shadow-lg max-h-48 overflow-y-auto">
            {filteredSuggestions.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                className="w-full px-4 py-2 text-left text-[var(--brand-text-primary)] hover:bg-[var(--brand-bg)] transition-colors"
                onClick={() => handleSuggestionClick(suggestion)}
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>
      {error && (
        <p className="mt-1 text-sm text-[var(--status-critical)]">
          {error}
        </p>
      )}
    </div>
  );
}
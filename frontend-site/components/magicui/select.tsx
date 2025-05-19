'use client';

import * as React from 'react';
import { SelectHTMLAttributes, HTMLAttributes, ReactNode, useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Select
export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLDivElement>, 'value' | 'onChange'> {
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  children: ReactNode;
}

export const Select = React.forwardRef<HTMLDivElement, SelectProps>(
  ({ value, onValueChange, placeholder, disabled, children, ...props }, ref) => {
    // On fournit la valeur et le gestionnaire de changement aux composants enfants
    const context = { value, onValueChange, disabled };
    
    return (
      <SelectProvider value={context}>
        <div ref={ref} className="relative" {...props}>
          {children}
        </div>
      </SelectProvider>
    );
  }
);

Select.displayName = 'Select';

// Contexte de Select
interface SelectContextType {
  value?: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
  isOpen?: boolean;
  setIsOpen?: (open: boolean) => void;
  selected?: string;
}

const SelectContext = React.createContext<SelectContextType>({
  onValueChange: () => {},
});

const SelectProvider = ({ children, value }: { children: ReactNode, value: SelectContextType }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState('');
  
  // Mettre à jour selected lorsque la valeur externe change
  useEffect(() => {
    if (value.value) {
      setSelected(value.value);
    }
  }, [value.value]);
  
  return (
    <SelectContext.Provider value={{ ...value, isOpen, setIsOpen, selected }}>
      {children}
    </SelectContext.Provider>
  );
};

const useSelectContext = () => {
  const context = React.useContext(SelectContext);
  if (!context) {
    throw new Error('Les composants Select doivent être utilisés à l\'intérieur d\'un composant Select');
  }
  return context;
};

// SelectTrigger
export interface SelectTriggerProps extends HTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
}

export const SelectTrigger = React.forwardRef<HTMLButtonElement, SelectTriggerProps>(
  ({ className, children, ...props }, ref) => {
    const { isOpen, setIsOpen, disabled } = useSelectContext();
    
    const handleClick = () => {
      if (!disabled && setIsOpen) {
        setIsOpen(!isOpen);
      }
    };
    
    return (
      <button
        type="button"
        ref={ref}
        className={`flex items-center justify-between w-full px-4 py-2 text-sm rounded-lg border border-white/10 bg-white/5 text-white disabled:opacity-50 ${isOpen ? 'ring-2 ring-indigo-500 border-transparent' : ''} ${className || ''}`}
        onClick={handleClick}
        disabled={disabled}
        aria-expanded={isOpen}
        {...props}
      >
        {children}
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="16" 
          height="16" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          className={`ml-2 h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        >
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>
    );
  }
);

SelectTrigger.displayName = 'SelectTrigger';

// SelectValue
export interface SelectValueProps extends HTMLAttributes<HTMLSpanElement> {
  placeholder?: string;
}

export const SelectValue = React.forwardRef<HTMLSpanElement, SelectValueProps>(
  ({ className, placeholder, ...props }, ref) => {
    const { value, selected } = useSelectContext();
    
    return (
      <span 
        ref={ref}
        className={`block truncate ${!selected ? 'text-gray-400' : 'text-white'} ${className || ''}`}
        {...props}
      >
        {selected || placeholder || 'Sélectionner...'}
      </span>
    );
  }
);

SelectValue.displayName = 'SelectValue';

// SelectContent
export interface SelectContentProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export const SelectContent = React.forwardRef<HTMLDivElement, SelectContentProps>(
  ({ className, children, ...props }, ref) => {
    const { isOpen, setIsOpen } = useSelectContext();
    const contentRef = useRef<HTMLDivElement>(null);
    
    // Fermer le menu lorsqu'on clique à l'extérieur
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (contentRef.current && !contentRef.current.contains(event.target as Node) && setIsOpen) {
          setIsOpen(false);
        }
      };
      
      if (isOpen) {
        document.addEventListener('mousedown', handleClickOutside);
      }
      
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, [isOpen, setIsOpen]);
    
    if (!isOpen) return null;
    
    return (
      <div
        ref={contentRef}
        className={`absolute z-50 w-full mt-1 overflow-auto bg-[#0F1622] border border-white/10 rounded-lg shadow-xl max-h-60 animate-in fade-in slide-in-from-top-2 ${className || ''}`}
        {...props}
      >
        <div className="py-1">
          {children}
        </div>
      </div>
    );
  }
);

SelectContent.displayName = 'SelectContent';

// SelectItem
export interface SelectItemProps extends HTMLAttributes<HTMLDivElement> {
  value: string;
  children: ReactNode;
}

export const SelectItem = React.forwardRef<HTMLDivElement, SelectItemProps>(
  ({ className, value, children, ...props }, ref) => {
    const { onValueChange, setIsOpen, selected } = useSelectContext();
    const isSelected = selected === value;
    
    const handleClick = () => {
      onValueChange(value);
      if (setIsOpen) {
        setIsOpen(false);
      }
    };
    
    return (
      <div
        ref={ref}
        className={`px-4 py-2 text-sm cursor-pointer hover:bg-white/10 ${isSelected ? 'bg-indigo-500/30 text-white' : 'text-gray-300'} ${className || ''}`}
        onClick={handleClick}
        {...props}
      >
        <span className="flex items-center">
          {isSelected && (
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"></path>
            </svg>
          )}
          {!isSelected && <span className="w-4 h-4 mr-2"></span>}
          {children}
        </span>
      </div>
    );
  }
);

SelectItem.displayName = 'SelectItem'; 
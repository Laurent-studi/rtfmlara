'use client';

import * as React from 'react';
import { InputHTMLAttributes, ReactElement } from 'react';

export interface RadioGroupProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
}

interface RadioGroupItemElement extends ReactElement {
  props: {
    value: string;
    [key: string]: any;
  };
}

export const RadioGroup = React.forwardRef<HTMLDivElement, RadioGroupProps>(
  ({ className, value, onValueChange, children, ...props }, ref) => {
    // Passer la valeur et le gestionnaire de changement à tous les enfants RadioGroupItem
    const childrenWithProps = React.Children.map(children, (child) => {
      // Vérifier que c'est un élément React valide
      if (React.isValidElement(child)) {
        const childElement = child as RadioGroupItemElement;
        if (typeof childElement.props.value === 'string') {
          return React.cloneElement(childElement, {
            checked: childElement.props.value === value,
            onChange: () => onValueChange(childElement.props.value),
          });
        }
      }
      return child;
    });

    return (
      <div ref={ref} className={className} {...props}>
        {childrenWithProps}
      </div>
    );
  }
);

RadioGroup.displayName = 'RadioGroup';

// RadioGroupItem
export interface RadioGroupItemProps extends InputHTMLAttributes<HTMLInputElement> {
  value: string;
  checked?: boolean;
  id?: string;
}

export const RadioGroupItem = React.forwardRef<HTMLInputElement, RadioGroupItemProps>(
  ({ className, id, value, checked, onChange, ...props }, ref) => {
    return (
      <input
        ref={ref}
        id={id}
        type="radio"
        value={value}
        checked={checked}
        onChange={onChange}
        className={`h-4 w-4 text-indigo-500 bg-white/5 border-white/20 focus:ring-indigo-500 focus:ring-offset-0 ${className || ''}`}
        {...props}
      />
    );
  }
);

RadioGroupItem.displayName = 'RadioGroupItem'; 
'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface Role {
  id: number;
  name: string;
  description?: string;
}

interface UserRoleBadgeProps {
  role: Role;
  size?: 'sm' | 'md' | 'lg';
}

export default function UserRoleBadge({ role, size = 'md' }: UserRoleBadgeProps) {
  // Définir les styles basés sur le rôle
  const getRoleStyles = () => {
    switch (role.name) {
      case 'player':
        return {
          bgColor: 'bg-blue-500',
          bgHoverColor: 'hover:bg-blue-600',
          textColor: 'text-white',
          icon: '🎮'
        };
      case 'creator':
        return {
          bgColor: 'bg-purple-500',
          bgHoverColor: 'hover:bg-purple-600',
          textColor: 'text-white',
          icon: '✏️'
        };
      case 'admin':
        return {
          bgColor: 'bg-amber-500',
          bgHoverColor: 'hover:bg-amber-600',
          textColor: 'text-white',
          icon: '⚙️'
        };
      case 'super_admin':
        return {
          bgColor: 'bg-red-500',
          bgHoverColor: 'hover:bg-red-600',
          textColor: 'text-white',
          icon: '👑'
        };
      default:
        return {
          bgColor: 'bg-gray-500',
          bgHoverColor: 'hover:bg-gray-600',
          textColor: 'text-white',
          icon: '👤'
        };
    }
  };

  const { bgColor, bgHoverColor, textColor, icon } = getRoleStyles();

  // Obtenir les classes de taille
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'text-xs px-2 py-1';
      case 'lg':
        return 'text-base px-4 py-2';
      default: // md
        return 'text-sm px-3 py-1.5';
    }
  };

  const sizeClasses = getSizeClasses();

  // Obtenir le label français du rôle
  const getRoleLabel = () => {
    switch (role.name) {
      case 'player':
        return 'Joueur';
      case 'creator':
        return 'Créateur';
      case 'admin':
        return 'Admin';
      case 'super_admin':
        return 'Super Admin';
      default:
        return role.name;
    }
  };

  return (
    <motion.span
      className={`inline-flex items-center gap-1.5 ${sizeClasses} rounded-full ${bgColor} ${bgHoverColor} ${textColor} transition-colors duration-200 font-medium`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      title={role.description || getRoleLabel()}
    >
      <span>{icon}</span>
      <span>{getRoleLabel()}</span>
    </motion.span>
  );
} 
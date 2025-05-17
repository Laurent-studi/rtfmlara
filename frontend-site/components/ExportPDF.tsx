'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import ExportButton from './ExportButton';
import { Quiz } from '@/models/Quiz';

interface ExportPDFProps {
  quiz: Quiz;
  participantId?: string;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showDetails?: boolean;
}

const ExportPDF: React.FC<ExportPDFProps> = ({
  quiz,
  participantId,
  variant = 'primary',
  size = 'md',
  className = '',
  showDetails = false
}) => {
  return (
    <div className={`export-pdf-container ${className}`}>
      {showDetails && (
        <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <h3 className="text-lg font-medium mb-2">Exporter "{quiz.title}"</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
            {participantId 
              ? "Exportez les résultats de ce quiz avec toutes les statistiques détaillées."
              : "Exportez ce quiz complet avec toutes ses questions et statistiques."}
          </p>
        </div>
      )}
      
      <ExportButton
        quiz={quiz}
        participantId={participantId}
        variant={variant}
        size={size}
        label={participantId ? "Exporter les résultats" : "Exporter le quiz"}
      />
    </div>
  );
};

export default ExportPDF; 
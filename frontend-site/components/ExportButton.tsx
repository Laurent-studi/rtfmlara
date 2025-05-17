'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { PDFGenerator } from '@/lib/pdf-generator';
import { Quiz } from '@/models/Quiz';
import { useToast } from '@/components/ToastContainer';

interface ExportOptions {
  includeQuestions: boolean;
  includeAnswers: boolean;
  includeParticipants: boolean;
  includeStatistics: boolean;
  paperSize: 'a4' | 'letter' | 'legal';
  orientation: 'portrait' | 'landscape';
}

interface ExportButtonProps {
  quiz: Quiz;
  participantId?: string;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  className?: string;
}

const ExportButton: React.FC<ExportButtonProps> = ({
  quiz,
  participantId,
  variant = 'primary',
  size = 'md',
  label = 'Exporter en PDF',
  className = '',
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const { showToast } = useToast();
  
  const [options, setOptions] = useState<ExportOptions>({
    includeQuestions: true,
    includeAnswers: false,
    includeParticipants: true,
    includeStatistics: true,
    paperSize: 'a4',
    orientation: 'portrait'
  });
  
  const handleExport = async () => {
    try {
      setIsExporting(true);
      
      let doc;
      if (participantId) {
        doc = await PDFGenerator.generateResultsPDF(quiz, participantId, options);
        PDFGenerator.downloadPDF(doc, `resultats_${quiz.title.replace(/\s+/g, '_').toLowerCase()}_${participantId}.pdf`);
      } else {
        doc = await PDFGenerator.generateQuizPDF(quiz, options);
        PDFGenerator.downloadPDF(doc, `quiz_${quiz.title.replace(/\s+/g, '_').toLowerCase()}.pdf`);
      }
      
      showToast('Exportation réussie!', 'success');
    } catch (error) {
      console.error('Erreur lors de l\'exportation:', error);
      showToast('Erreur lors de l\'exportation du PDF', 'error');
    } finally {
      setIsExporting(false);
      setShowOptions(false);
    }
  };
  
  const handleOptionChange = (key: keyof ExportOptions, value: any) => {
    setOptions(prev => ({ ...prev, [key]: value }));
  };
  
  // Classes du bouton selon la variante et la taille
  const getButtonClasses = () => {
    let classes = 'rounded-lg font-medium transition-all ';
    
    // Variantes
    switch (variant) {
      case 'primary':
        classes += 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:shadow-lg hover:shadow-indigo-500/25 ';
        break;
      case 'secondary':
        classes += 'bg-white/10 hover:bg-white/20 text-white ';
        break;
      case 'outline':
        classes += 'border border-indigo-500 text-indigo-500 hover:bg-indigo-50 ';
        break;
    }
    
    // Tailles
    switch (size) {
      case 'sm':
        classes += 'py-1 px-3 text-sm ';
        break;
      case 'md':
        classes += 'py-2 px-4 ';
        break;
      case 'lg':
        classes += 'py-3 px-6 text-lg ';
        break;
    }
    
    return classes + className;
  };
  
  return (
    <div className="relative">
      <motion.button
        onClick={() => setShowOptions(!showOptions)}
        disabled={isExporting}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={getButtonClasses()}
      >
        <div className="flex items-center">
          {isExporting ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Exportation en cours...
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              {label}
            </>
          )}
        </div>
      </motion.button>
      
      {showOptions && (
        <div className="absolute right-0 mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg z-50 p-4 w-72">
          <h3 className="text-gray-800 dark:text-white font-medium mb-3">Options d'exportation</h3>
          
          <div className="space-y-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={options.includeQuestions}
                onChange={e => handleOptionChange('includeQuestions', e.target.checked)}
                className="form-checkbox rounded text-indigo-500"
              />
              <span className="ml-2 text-gray-700 dark:text-gray-300 text-sm">Inclure les questions</span>
            </label>
            
            {options.includeQuestions && (
              <label className="flex items-center ml-5">
                <input
                  type="checkbox"
                  checked={options.includeAnswers}
                  onChange={e => handleOptionChange('includeAnswers', e.target.checked)}
                  className="form-checkbox rounded text-indigo-500"
                />
                <span className="ml-2 text-gray-700 dark:text-gray-300 text-sm">Inclure les réponses</span>
              </label>
            )}
            
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={options.includeParticipants}
                onChange={e => handleOptionChange('includeParticipants', e.target.checked)}
                className="form-checkbox rounded text-indigo-500"
              />
              <span className="ml-2 text-gray-700 dark:text-gray-300 text-sm">Inclure les participants</span>
            </label>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={options.includeStatistics}
                onChange={e => handleOptionChange('includeStatistics', e.target.checked)}
                className="form-checkbox rounded text-indigo-500"
              />
              <span className="ml-2 text-gray-700 dark:text-gray-300 text-sm">Inclure les statistiques</span>
            </label>
            
            <div>
              <label className="block text-gray-700 dark:text-gray-300 text-sm mb-1">Format de page</label>
              <select
                value={options.paperSize}
                onChange={e => handleOptionChange('paperSize', e.target.value)}
                className="w-full px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300"
              >
                <option value="a4">A4</option>
                <option value="letter">Letter</option>
                <option value="legal">Legal</option>
              </select>
            </div>
            
            <div>
              <label className="block text-gray-700 dark:text-gray-300 text-sm mb-1">Orientation</label>
              <select
                value={options.orientation}
                onChange={e => handleOptionChange('orientation', e.target.value)}
                className="w-full px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300"
              >
                <option value="portrait">Portrait</option>
                <option value="landscape">Paysage</option>
              </select>
            </div>
          </div>
          
          <div className="mt-5 flex justify-end gap-2">
            <button
              onClick={() => setShowOptions(false)}
              className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="px-3 py-1 text-sm bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
            >
              Exporter
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExportButton; 
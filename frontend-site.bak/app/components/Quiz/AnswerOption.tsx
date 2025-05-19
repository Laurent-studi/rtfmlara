'use client';

import { motion } from 'framer-motion';

interface AnswerOptionProps {
  text: string;
  isSelected: boolean;
  onClick: () => void;
  disabled?: boolean;
}

const AnswerOption: React.FC<AnswerOptionProps> = ({
  text,
  isSelected,
  onClick,
  disabled = false,
}) => {
  return (
    <motion.div
      whileHover={!disabled ? { scale: 1.02 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      className={`relative p-4 rounded-lg cursor-pointer transition-all duration-200 ${
        isSelected
          ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white'
          : 'bg-white/5 hover:bg-white/10 text-gray-200'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      onClick={!disabled ? onClick : undefined}
    >
      <div className="flex items-center">
        <div
          className={`w-6 h-6 rounded-full border-2 mr-4 flex items-center justify-center ${
            isSelected
              ? 'border-white bg-white'
              : 'border-gray-400'
          }`}
        >
          {isSelected && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-3 h-3 bg-indigo-500 rounded-full"
            />
          )}
        </div>
        <span className="text-lg">{text}</span>
      </div>
    </motion.div>
  );
};

export default AnswerOption; 
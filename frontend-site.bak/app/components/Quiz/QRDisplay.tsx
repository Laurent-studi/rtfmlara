'use client';

import { QRCodeSVG } from 'qrcode.react';
import { motion } from 'framer-motion';

interface QRDisplayProps {
  quizUrl: string;
  quizCode: string;
}

const QRDisplay: React.FC<QRDisplayProps> = ({ quizUrl, quizCode }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-md mx-auto p-6 bg-white/10 backdrop-blur-lg rounded-xl shadow-lg text-center"
    >
      <h2 className="text-2xl font-bold text-white mb-4">Rejoindre le Quiz</h2>
      
      <div className="bg-white p-4 rounded-lg inline-block mb-4">
        <QRCodeSVG
          value={quizUrl}
          size={200}
          level="H"
          includeMargin
          className="mx-auto"
        />
      </div>

      <div className="space-y-4">
        <div>
          <p className="text-gray-300 mb-2">Code du Quiz</p>
          <div className="bg-white/5 p-3 rounded-lg">
            <p className="text-2xl font-mono text-white tracking-wider">{quizCode}</p>
          </div>
        </div>

        <div>
          <p className="text-gray-300 mb-2">Lien direct</p>
          <div className="bg-white/5 p-3 rounded-lg break-all">
            <p className="text-sm text-white">{quizUrl}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default QRDisplay; 
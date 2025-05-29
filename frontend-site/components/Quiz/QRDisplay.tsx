'use client';

import { motion } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, Share2, Smartphone, Link2 } from 'lucide-react';
import { useState } from 'react';

interface QRDisplayProps {
  quizUrl: string;
  quizCode: string;
}

const QRDisplay: React.FC<QRDisplayProps> = ({ quizUrl, quizCode }) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Erreur lors de la copie:', err);
    }
  };

  const shareQuiz = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Rejoignez mon quiz !',
          text: `Rejoignez mon quiz avec le code: ${quizCode}`,
          url: quizUrl,
        });
      } catch (err) {
        console.error('Erreur lors du partage:', err);
      }
    } else {
      copyToClipboard(quizUrl);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-6 border border-white/20"
    >
      <div className="text-center">
        <motion.h2 
          className="text-2xl font-bold text-white mb-6 flex items-center justify-center"
          initial={{ y: -20 }}
          animate={{ y: 0 }}
        >
          <Smartphone className="w-6 h-6 mr-2" />
          Rejoindre le Quiz
        </motion.h2>
        
        {/* QR Code Container */}
        <motion.div 
          className="relative bg-white p-6 rounded-2xl inline-block mb-6 shadow-xl"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <QRCodeSVG 
            value={quizUrl} 
            size={200}
            bgColor="#ffffff"
            fgColor="#000000"
            level="M"
            includeMargin={false}
          />
          
          {/* Decorative corners */}
          <div className="absolute top-2 left-2 w-4 h-4 border-l-2 border-t-2 border-indigo-500"></div>
          <div className="absolute top-2 right-2 w-4 h-4 border-r-2 border-t-2 border-indigo-500"></div>
          <div className="absolute bottom-2 left-2 w-4 h-4 border-l-2 border-b-2 border-indigo-500"></div>
          <div className="absolute bottom-2 right-2 w-4 h-4 border-r-2 border-b-2 border-indigo-500"></div>
        </motion.div>

        <div className="space-y-4">
          {/* Quiz Code */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <p className="text-gray-300 mb-2 font-semibold">Code du Quiz</p>
            <div className="relative bg-gradient-to-r from-indigo-500/20 to-purple-500/20 p-4 rounded-xl border border-indigo-400/30">
              <p className="text-3xl font-mono text-white tracking-wider font-bold">{quizCode}</p>
              <motion.button
                onClick={() => copyToClipboard(quizCode)}
                className="absolute top-2 right-2 p-2 text-white/70 hover:text-white transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Copy className="w-4 h-4" />
              </motion.button>
            </div>
          </motion.div>

          {/* Direct Link */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <p className="text-gray-300 mb-2 font-semibold flex items-center justify-center">
              <Link2 className="w-4 h-4 mr-1" />
              Lien direct
            </p>
            <div className="relative bg-white/5 p-3 rounded-xl border border-white/10">
              <p className="text-sm text-white break-all">{quizUrl}</p>
              <motion.button
                onClick={() => copyToClipboard(quizUrl)}
                className="absolute top-2 right-2 p-1 text-white/70 hover:text-white transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Copy className="w-3 h-3" />
              </motion.button>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div 
            className="flex gap-3 mt-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <motion.button
              onClick={() => copyToClipboard(quizUrl)}
              className="flex-1 flex items-center justify-center px-4 py-3 bg-indigo-500/20 text-white rounded-xl border border-indigo-400/30 hover:bg-indigo-500/30 transition-all duration-200"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Copy className="w-4 h-4 mr-2" />
              {copied ? 'Copié !' : 'Copier'}
            </motion.button>
            
            <motion.button
              onClick={shareQuiz}
              className="flex-1 flex items-center justify-center px-4 py-3 bg-purple-500/20 text-white rounded-xl border border-purple-400/30 hover:bg-purple-500/30 transition-all duration-200"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Share2 className="w-4 h-4 mr-2" />
              Partager
            </motion.button>
          </motion.div>

          {/* Instructions */}
          <motion.div 
            className="mt-6 p-4 bg-blue-500/10 rounded-xl border border-blue-400/20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <h4 className="text-white font-semibold mb-2 text-sm">Instructions rapides :</h4>
            <div className="text-xs text-gray-300 space-y-1">
              <p>📱 Scannez le QR code avec votre appareil photo</p>
              <p>💻 Ou allez sur le site et entrez le code</p>
              <p>🔗 Ou cliquez directement sur le lien</p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Animated border effect */}
      <motion.div
        className="absolute inset-0 rounded-2xl border-2 border-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-0 hover:opacity-20 transition-opacity duration-300"
        style={{ 
          background: 'linear-gradient(45deg, transparent, transparent)',
          backgroundSize: '400% 400%'
        }}
        animate={{
          backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "linear"
        }}
      />
    </motion.div>
  );
};

export default QRDisplay;
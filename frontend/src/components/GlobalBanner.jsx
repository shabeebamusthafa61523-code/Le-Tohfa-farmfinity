import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Megaphone, Info, CheckCircle, AlertTriangle, X } from 'lucide-react';

const GlobalBanner = ({ settings }) => {
  const [isVisible, setIsVisible] = useState(true);

  // Guard clauses
  if (!settings?.globalNotification?.isActive || !settings?.globalNotification?.message || !isVisible) {
    return null;
  }

  const { type, message } = settings.globalNotification;

  // Premium color palette using semi-transparency for glass effect
  const styles = {
    info: "bg-blue-600/90 border-blue-400/20 text-white backdrop-blur-md",
    success: "bg-[#8ba88b]/90 border-[#a4bca4]/20 text-white backdrop-blur-md", // Signature Green
    warning: "bg-amber-600/90 border-amber-400/20 text-white backdrop-blur-md"
  };

  const icons = {
    info: <Info size={14} className="animate-pulse" />,
    success: <CheckCircle size={14} />,
    warning: <AlertTriangle size={14} className="animate-bounce" />
  };

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -50, opacity: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
        className={`fixed top-0 left-0 w-full z-[999] border-b shadow-lg transition-colors duration-500 ${styles[type] || styles.info}`}
      >
        <div className="max-w-7xl mx-auto px-6 py-2.5 flex items-center justify-between gap-4">
          
          {/* Spacer for centering */}
          <div className="w-4 hidden md:block" />

          {/* Content */}
          <div className="flex items-center justify-center gap-3">
            <span className="shrink-0">
              {icons[type] || <Megaphone size={14} />}
            </span>
            <p className="text-[10px] md:text-[11px] font-bold uppercase tracking-[0.2em] leading-tight text-center">
              {message}
            </p>
          </div>

          {/* Close Button */}
          <button 
            onClick={() => setIsVisible(false)}
            className="p-1 hover:bg-white/20 rounded-full transition-colors shrink-0"
            aria-label="Close Announcement"
          >
            <X size={14} />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default GlobalBanner;
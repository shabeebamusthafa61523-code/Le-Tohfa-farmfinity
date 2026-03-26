import React from 'react';
import { motion } from 'framer-motion';

const Hero = () => {
  // Stagger container for the text elements
  const containerVariants = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        delayChildren: 0.5,
      },
    },
  };

  const itemVariants = {
    initial: { opacity: 0, y: 30 },
    animate: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 1.2, ease: [0.22, 1, 0.36, 1] } 
    },
  };

  return (
    <section 
      id="home"
      className="relative w-full h-[90dvh] md:h-[100dvh] overflow-hidden bg-[#1a231a] "
    >
      {/* 1. Main Background Image with Slow Zoom Animation */}
      <motion.div 
        initial={{ scale: 1.2 }}
        animate={{ scale: 1 }}
        transition={{ duration: 10, ease: "easeOut" }}
        className="absolute inset-0 w-full h-full z-0 pointer-events-none"
        style={{
          backgroundImage: "url('/assets/hero.png')", 
          backgroundSize: 'cover', 
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      />

      {/* 2. The Overlay */}
      <div className="absolute inset-0 bg-[#2d3a2d]/70 z-10 pointer-events-none" />

      {/* 4. Content Container */}
      <motion.div 
        variants={containerVariants}
        initial="initial"
        animate="animate"
        className="relative z-20 h-full flex flex-col justify-center items-center text-center text-white px-6"
      >
        
        {/* Animated Badge */}
        <motion.div 
          variants={itemVariants}
          className="flex items-center gap-4 mb-6 mt-15"
        >
          <motion.div 
            initial={{ width: 0 }} 
            animate={{ width: 32 }} 
            transition={{ duration: 1, delay: 1 }}
            className="h-[1px] bg-[#8ba88b]"
          />
          <span className=" text-[#8ba88b] uppercase tracking-[0.5em] text-[10px] md:text-xs font-bold">
              Stay • Day • Event
          </span>
          <motion.div 
            initial={{ width: 0 }} 
            animate={{ width: 32 }} 
            transition={{ duration: 1, delay: 1 }}
            className="h-[1px] bg-[#8ba88b]"
          />
        </motion.div>
        
        {/* Title with reveal animation */}
        <motion.h1 
          variants={itemVariants}
          className="font-serif text-[2.8rem] md:text-8xl leading-[1.1] md:leading-[1.1] mb-12 max-w-5xl italic text-[#f4f7f4]"
          style={{ textShadow: '2px 4px 10px rgba(0,0,0,0.3)' }}
        >
          A natural escape <br /> 
          <span className="not-italic font-normal opacity-90">designed for you.</span>
        </motion.h1>
        
        {/* Button with hover and tap effects */}
        <motion.div variants={itemVariants}>
          <motion.a
            whileHover={{ 
              scale: 1.05,
              backgroundColor: "#3d4d3d",
              boxShadow: "0px 20px 40px rgba(0,0,0,0.3)"
            }}
            whileTap={{ scale: 0.98 }}
            href="#gallery"
            className="inline-block bg-[#2d3a2d] border border-[#8ba88b]/30 text-[#f4f7f4] px-14 py-5 rounded-full font-serif italic text-lg tracking-wide shadow-2xl transition-colors"
          >
            Explore Farminity
          </motion.a>
        </motion.div>
      </motion.div>

      {/* 5. Bottom Fade to Cream */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2, delay: 1.5 }}
        className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent z-10" 
      />

      {/* Floating Scroll Indicator Animation */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2"
      >
        <span className="text-[8px] uppercase tracking-[0.3em] opacity-40">Scroll</span>
        <motion.div 
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-[1px] h-8 bg-[#8ba88b]/50"
        />
      </motion.div>
    </section>
  );
};

export default Hero;
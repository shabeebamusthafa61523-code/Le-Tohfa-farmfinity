import React from 'react';
import { motion, useScroll, useSpring, useTransform } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Hero from '../components/Hero';
import Amenities from '../components/Amenities';
import Gallery from '../components/Gallery';
import Pricing from '../components/Pricing';
import Footer from '../components/Footer';

const Home = () => {
  const navigate = useNavigate();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });
  
  // Logic to check authentication
  const isLoggedIn = !!localStorage.getItem('token');

  const fadeInUp = {
    hidden: { opacity: 0, y: 60 },
    visible: { opacity: 1, y: 0, transition: { duration: 1, ease: [0.16, 1, 0.3, 1] } }
  };

  return (
    <main className="bg-[#fcfdfc] selection:bg-[#2d3a2d] selection:text-[#f4f7f4] overflow-x-hidden text-[#2d3a2d]">
      <motion.div className="fixed top-0 left-0 right-0 h-[3px] bg-[#8ba88b] origin-left z-[100]" style={{ scaleX }} />
      
      <Hero />

      {/* 1. BIO-POOL EXPERIENCE */}
      <section className="relative py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="grid md:grid-cols-12 gap-8 items-center">
            <motion.div variants={fadeInUp} className="md:col-span-5">
              <span className="text-[#8ba88b] text-[10px] tracking-[0.5em] font-bold uppercase block mb-4">Innovation</span>
              <h2 className="text-4xl md:text-5xl font-serif italic mb-6">Natural Purity.</h2>
              <p className="text-gray-500 font-light leading-relaxed text-lg">
                Experience the first of its kind in the region. We use a <span className="text-[#2d3a2d] font-semibold">Bio Swimming Pool</span> that breathes naturally.
              </p>
            </motion.div>
            <motion.div variants={fadeInUp} className="md:col-span-7 relative">
               <div className="relative overflow-hidden rounded-[1.5rem] bg-white p-8 md:p-12 shadow-xl border border-gray-50">
                <div className="flex flex-wrap gap-12 justify-around items-center">
                  <div className="text-center"><p className="text-3xl font-serif italic text-[#8ba88b]">0%</p><p className="text-[10px] uppercase tracking-widest opacity-60">Chlorine</p></div>
                  <div className="text-center"><p className="text-3xl font-serif italic text-[#8ba88b]">100%</p><p className="text-[10px] uppercase tracking-widest opacity-60">Organic</p></div>
                  <div className="text-center"><p className="text-3xl font-serif italic text-[#8ba88b]">Bio</p><p className="text-[10px] uppercase tracking-widest opacity-60">Filtration</p></div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* 2. GALLERY SECTION */}
      <section className="py-20">
        <Gallery />
      </section>

      {/* 3. AMENITIES */}
      <section id="amenities" className="px-4 mb-24">
        <motion.div initial={{ y: 100, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} className="bg-white rounded-[4rem] py-15 shadow-sm border border-gray-50">
          <Amenities />
        </motion.div>
      </section>

      {/* 4. EXCLUSIVE PRICING & CALENDAR SECTION */}
    {/* 4. PRICING - Responsive Padding Fix */}
<section id="pricing" className="relative px-2 md:px-4 mb-12 md:mb-24">
  <div className={`transition-all duration-1000 ${!isLoggedIn ? 'blur-md pointer-events-none select-none' : ''}`}>
    {/* py-12 for mobile, py-32 for desktop */}
    <div className="bg-[#2d3a2d] rounded-[3rem] md:rounded-[4rem] py-12 md:py-32 text-white relative overflow-hidden">
      <div className="absolute top-0 right-0 w-full h-full bg-[url('/assets/i.JPG')] opacity-[0.03] pointer-events-none" />
      <Pricing />
    </div>
  </div>

  {/* Auth Overlay - Centering Fix */}
  {!isLoggedIn && (
    <div className="absolute inset-0 z-20 flex items-center justify-center p-4">
      {/* Ensure this card has a max-width and doesn't stretch too tall */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        className="bg-white/95 backdrop-blur-xl p-8 md:p-20 rounded-[2.5rem] md:rounded-[3rem] shadow-2xl text-center w-full max-w-lg border border-white"
      >
        <h2 className="text-3xl md:text-5xl font-serif italic text-[#2d3a2d] mb-4">Unlock the Experience</h2>
        <p className="text-gray-500 mb-8 text-sm md:text-base leading-relaxed">
          Join our community to view real-time availability and personalized pricing.
        </p>
        <div className="flex flex-col gap-3">
          <button onClick={() => navigate('/login')} className="bg-[#2d3a2d] text-white py-4 rounded-full font-serif italic text-lg">Login</button>
          <button onClick={() => navigate('/register')} className="text-[#2d3a2d] py-2 text-sm underline opacity-70">Create Account</button>
        </div>
      </motion.div>
    </div>
  )}
</section>

      {/* 5. CALL TO ACTION */}
      <motion.section className="py-40 text-center" initial="hidden" whileInView="visible">
        <div className="max-w-3xl mx-auto px-6">
          <h4 className="text-4xl md:text-6xl font-serif mb-10 italic text-[#2d3a2d]">Your escape is ready.</h4>
          <motion.a 
            href="https://wa.me/919562042711" 
            whileHover={{ scale: 1.05 }} 
            className="inline-block bg-[#2d3a2d] text-white px-16 py-6 rounded-full font-serif tracking-widest uppercase text-xs"
          >
            Inquire via WhatsApp
          </motion.a>
        </div>
      </motion.section>

      <Footer />

      {/* Floating FAB - Logic updated to link to login if logged out */}
      <motion.button
        onClick={() => isLoggedIn ? document.getElementById('pricing').scrollIntoView({behavior:'smooth'}) : navigate('/login')}
        className="fixed bottom-8 right-8 z-[90] bg-[#8ba88b] text-white w-20 h-20 rounded-full shadow-2xl flex items-center justify-center text-[10px] uppercase font-bold text-center border-4 border-white"
      >
        {isLoggedIn ? "Book\nNow" : "Login"}
      </motion.button>
    </main>
  );
};

export default Home; 
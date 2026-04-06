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
  {/* 6. LOCATION SECTION */}
<section id="location" className="py-24 px-6 bg-[#f8faf8]">
  <div className="max-w-7xl mx-auto">
    <motion.div 
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="grid md:grid-cols-2 gap-12 items-center"
    >
      {/* Map Side */}
      <div className="h-[400px] w-full rounded-[2.5rem] overflow-hidden shadow-2xl border-8 border-white">
        <iframe
          title="Resort Location"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3915.283539761148!2d76.08720907416401!3d11.092232989076383!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ba6350005d04da5%3A0xd362b55ebbbb95db!2sLe%20Tohfa%20Farmfinity!5e0!3m2!1sen!2sin!4v1775456509062!5m2!1sen!2sin" 
          width="100%"
          height="100%"
          style={{ border: 0, filter: 'grayscale(10%) contrast(90%)' }}
          allowFullScreen=""
          loading="lazy"
        ></iframe>
      </div>

      {/* Info Side */}
      <div className="space-y-8">
        <div>
          <span className="text-[#8ba88b] text-[10px] tracking-[0.5em] font-bold uppercase block mb-4">Find Us</span>
          <h2 className="text-4xl md:text-5xl font-serif italic text-[#2d3a2d] mb-6">Our Sanctuary.</h2>
          <p className="text-gray-500 font-light text-lg leading-relaxed">
            Nestled in the heart of nature, easily accessible yet worlds away from the hustle.
          </p>
        </div>

        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center flex-shrink-0 text-[#8ba88b]">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
          </div>
          <div>
            <p className="text-[#2d3a2d] font-semibold uppercase tracking-widest text-xs mb-1">Address</p>
            <p className="text-gray-500 font-light">Le'Tohfa Farmfinity, Near Kolayi,<br />Malappuram, Kerala, India - 676509</p>
          </div>
        </div>

        <motion.a 
          href="https://maps.app.goo.gl/XM1xXDDBaurt47NA6" // Replace with your actual Google Maps link
          target="_blank"
          whileHover={{ x: 10 }}
          className="inline-flex items-center gap-4 text-[#2d3a2d] font-serif italic text-xl group"
        >
          Get Directions 
          <span className="group-hover:translate-x-2 transition-transform duration-300">→</span>
        </motion.a>
      </div>
    </motion.div>
  </div>
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
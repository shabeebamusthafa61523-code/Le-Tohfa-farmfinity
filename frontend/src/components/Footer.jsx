import React from 'react';
import { FaInstagram, FaPhoneAlt, FaWhatsapp } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-[#2d3a2d] text-white pt-16 pb-8 px-6">
      <div className="max-w-7xl mx-auto flex flex-col items-center">
        
        {/* Brand Section */}
        <div className="text-center mb-10">
          {/* Replace the h3 section in Footer.jsx */}
<div className="text-center mb-10">
  <img 
    src="/assets/logo.png" 
    alt="Le'Tohfa Footer Logo" 
    className="h-20 md:h-15 mx-auto mb-4 brightness-110" 
  />
  
</div>
          <div className="h-[1px] w-20 bg-[#8ba88b] mx-auto mb-6"></div>
          <p className="text-gray-400 font-light italic max-w-sm">
            "A sanctuary for the soul, a gift for your senses."
          </p>
        </div>

       
        {/* Contact Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 w-full max-w-2xl text-center md:text-left mb-12">
          <div className="space-y-4">
            <h4 className="text-xs uppercase tracking-widest text-[#8ba88b] font-bold">Reservations</h4>
            <div className="flex items-center justify-center md:justify-start space-x-3 text-lg">
              <FaPhoneAlt className="text-[#8ba88b] text-sm" />
              <p className="font-light tracking-wide">95620 42711 | 80895 02467</p>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs uppercase tracking-widest text-[#8ba88b] font-bold">Social Connect</h4>
            <a 
              href="https://www.instagram.com/letohfa_farmfinity/" 
              target="_blank" 
              rel="noreferrer"
              className="flex items-center justify-center md:justify-start space-x-3 text-lg hover:text-[#8ba88b] transition"
            >
              <FaInstagram className="text-xl" />
              <span className="font-light tracking-wide">@letohfa_farminity</span>
            </a>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="w-full pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center text-[10px] uppercase tracking-[0.2em] text-gray-500">
          <p>© 2026 Le'Tohfa Farminity. All rights reserved.</p>
          <p className="mt-4 md:mt-0">Design & Dev by Your Brand</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
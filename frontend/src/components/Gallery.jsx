import React from 'react';
import { motion } from 'framer-motion';

const images = [
  { 
    url: '/assets/a.JPG', 
    title: 'The Bio-Pool', 
    subtitle: 'Chemical-Free Purity',
    className: 'md:col-span-2 md:row-span-2' 
  },
  { 
    url: '/assets/i.JPG', 
    title: 'Le\'Tohfa Manor', 
    subtitle: 'Main Entrance',
    className: 'md:col-span-2 md:row-span-1' 
  },
  { 
    url: '/assets/f.JPG', 
    title: 'Modern Living', 
    subtitle: 'Wooden Accents',
    className: 'md:col-span-1 md:row-span-1' 
  },
  { 
    url: '/assets/c.JPG', 
    title: 'Premium Suite', 
    subtitle: 'Elegance & Comfort',
    className: 'md:col-span-1 md:row-span-1' 
  },
//   { 
//     url: '/assets/h.JPG', 
//     title: 'The Grill Hut', 
//     subtitle: 'Rustic Gatherings',
//     className: 'md:col-span-1 md:row-span-1' 
//   },
  { 
    url: '/assets/h.JPG', 
    title: 'The Grill Hut', 
    subtitle: 'Rustic Gatherings',
    className: 'md:col-span-1 md:row-span-1' 
  },
  { 
    url: '/assets/d.JPG', 
    title: 'Gourmet Kitchen', 
    subtitle: 'Sleek Design',
    className: 'md:col-span-2 md:row-span-1' 
  },
  { 
    url: '/assets/g.JPG', 
    title: 'Green Pathways', 
    subtitle: 'Lush Surroundings',
    className: 'md:col-span-1 md:row-span-1' 
  },
];

const Gallery = () => {
  return (
    <section id="gallery" className="py-24 px-6 bg-[#fcfdfc]">
      <div className="max-w-7xl mx-auto">
        
        <div className="mb-16">
          <span className="text-[#8ba88b] uppercase tracking-[0.4em] text-[10px] font-bold block mb-2">
            Visual Journal
          </span>
          <h2 className="text-4xl md:text-5xl font-serif italic text-[#2d3a2d]">
            Captured Harmony.
          </h2>
        </div>

        {/* Dynamic Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 auto-rows-[300px]">
          {images.map((img, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              className={`relative overflow-hidden rounded-[2rem] group cursor-pointer shadow-sm hover:shadow-2xl transition-all duration-700 ${img.className}`}
            >
              <img 
                src={img.url} 
                className="w-full h-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-110" 
                alt={img.title}
                loading="lazy"
              />

              {/* Sophisticated Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#2d3a2d]/90 via-transparent to-transparent opacity-40 group-hover:opacity-80 transition-opacity duration-500" />

              {/* Text Content */}
              <div className="absolute bottom-8 left-8 right-8 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                <p className="text-[#8ba88b] text-[10px] uppercase tracking-widest mb-1 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                  {img.subtitle}
                </p>
                <h3 className="text-white font-serif text-2xl italic tracking-wide">
                  {img.title}
                </h3>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Gallery;
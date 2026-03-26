import React from 'react';
import { FaBed, FaSwimmer, FaUtensils, FaWifi, FaMusic, FaHandsHelping } from 'react-icons/fa';

const amenities = [
  { title: "Stay", icon: <FaBed />, items: ["2 Premium Bedrooms", "Equipped Kitchen", "Bamboo Hut"] },
  { title: "Leisure", icon: <FaSwimmer />, items: ["Large Infinity Pool", "Kids' Play Park", "Turf Area"] },
  { title: "Facilities", icon: <FaWifi />, items: ["High-Speed WiFi", "Grill Hut (BBQ)", "Prayer Hall"] },
];

const Amenities = () => {
  return (
    <section className="py-10 bg-[#f4f7f4]">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-4xl font-serif text-[#4a5d4a] text-center mb-12 italic">Le'Tohfa Experiences</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {amenities.map((group, idx) => (
            <div key={idx} className="bg-white/80 backdrop-blur-md p-8 rounded-2xl border border-[#e0e7e0] shadow-sm hover:shadow-xl transition-all duration-300 group">
              <div className="text-3xl text-[#6b8e6b] mb-4 group-hover:scale-110 transition-transform">
                {group.icon}
              </div>
              <h3 className="text-2xl font-semibold text-[#2d3a2d] mb-4">{group.title}</h3>
              <ul className="space-y-3 text-gray-600">
                {group.items.map((item, i) => (
                  <li key={i} className="flex items-center space-x-2">
                    <span className="w-1.5 h-1.5 bg-[#8ba88b] rounded-full"></span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Amenities;
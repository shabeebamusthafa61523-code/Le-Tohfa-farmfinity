import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, LayoutDashboard, Calendar, Users, Settings, ArrowLeft } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const AdminSidebar = ({ isOpen, onClose }) => {
  const location = useLocation();

  // Helper to highlight active links
  const isActive = (path) => location.pathname === path;

  const menuItems = [
    { name: "Statistics", path: "/admin", icon: <LayoutDashboard size={20} /> },
    { name: "Bookings", path: "/admin/bookings", icon: <Calendar size={20} /> },
        { name: 'Farm Calendar', path: '/admin/availability', icon: <Calendar size={20} /> },

    { name: "Users", path: "/admin/users", icon: <Users size={20} /> },
    { name: "Settings", path: "/admin/settings", icon: <Settings size={20} /> },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-[9998]"
          />

          {/* Sidebar */}
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 left-0 h-screen w-[280px] bg-[#1a231a] text-white shadow-2xl z-[9999] flex flex-col"
          >
            {/* Header */}
            <div className="p-6 flex justify-between items-center border-b border-white/5">
              <div>
                <h2 className="text-xl font-serif italic text-white">Admin</h2>
                <p className="text-[10px] uppercase tracking-[0.2em] text-[#8ba88b] font-bold">Management</p>
              </div>

              <button
                onClick={onClose}
                className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Navigation Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-8">
              
              {/* EXIT LINK: Back to Public Site */}
              <section>
                <Link
                  to="/"
                  onClick={onClose}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-[#8ba88b] hover:bg-[#8ba88b] hover:text-white transition-all duration-300 group"
                >
                  <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                  <span className="text-xs font-bold uppercase tracking-widest">Back to Website</span>
                </Link>
              </section>

              {/* ADMIN MENU */}
              <nav className="flex flex-col gap-2">
                <p className="text-[10px] uppercase tracking-[0.3em] text-white/30 font-bold px-4 mb-2">
                  Main Menu
                </p>

                {menuItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={onClose}
                    className={`flex items-center gap-4 p-4 rounded-xl border transition-all duration-300 ${
                      isActive(item.path)
                        ? "bg-[#8ba88b] border-[#8ba88b] text-white shadow-lg shadow-[#8ba88b]/20"
                        : "bg-white/5 border-white/5 text-white/70 hover:bg-white/10 hover:border-white/10 hover:text-white"
                    }`}
                  >
                    <span className={isActive(item.path) ? "text-white" : "text-[#8ba88b]"}>
                      {item.icon}
                    </span>
                    <span className="text-sm font-medium">{item.name}</span>
                  </Link>
                ))}
              </nav>
            </div>

            {/* Footer / User Info */}
            <div className="p-6 border-t border-white/5 bg-black/20">
              <p className="text-[10px] text-white/30 uppercase tracking-widest text-center">
                &copy; 2026 Le'Tohfa Dashboard
              </p>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};

export default AdminSidebar;
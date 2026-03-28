import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../redux/authSlice';
import { Menu, X, ChevronDown, LogOut, User, LayoutDashboard, Briefcase, Home, ShieldCheck } from 'lucide-react';

const Navbar = ({ toggleAdminSidebar }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const isAdminPath = location.pathname.startsWith('/admin');

// ... inside your Navbar component

const scrollToSection = (e, href) => {
  e.preventDefault();
  const targetId = href.replace('#', '');
  
  if (location.pathname !== '/') {
    // 1. If not on home, navigate to home first
    navigate('/');
    
    // 2. Wait for home to mount, then scroll
    setTimeout(() => {
      const elem = document.getElementById(targetId);
      if (elem) {
        elem.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100); 
  } else {
    // 3. If already home, just scroll
    const elem = document.getElementById(targetId);
    if (elem) {
      const offset = 80;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = elem.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  }
  setIsMobileMenuOpen(false);
};


  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    console.log("Current User Role:", user?.role);
    setIsMobileMenuOpen(false);
  }, [location]);

  const isSolid = isScrolled || isAdminPath;

  const navLinks = [
    { name: 'Home', href: '#home' },
    { name: 'Experience', href: '#amenities' },
    { name: 'Packages', href: '#pricing' },
    { name: 'Gallery', href: '#gallery' },
  ];

  const handleLogout = () => {
    dispatch(logout());
    setIsProfileOpen(false);
    setIsMobileMenuOpen(false);
    navigate('/login');
  };

  const menuVariants = {
    closed: { opacity: 0, scale: 0.95, y: -20, transition: { duration: 0.2 } },
    open: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', damping: 20, stiffness: 300 } }
  };

  return (
    <>
      <nav 
        className={`fixed w-full z-[100] transition-all duration-500 ease-in-out ${
          isSolid 
            ? 'bg-[#2d3a2d]/90 backdrop-blur-xl py-3 shadow-2xl border-b border-white/5' 
            : 'bg-transparent py-6 md:py-8'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex justify-between items-center">
          
          {/* LEFT: Admin Toggle & Logo */}
          <div className="flex items-center gap-4 md:gap-8">
            {isAuthenticated && user?.role === 'admin' && (
              <motion.button 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={toggleAdminSidebar}
                className="flex flex-col gap-1 p-2 group"
              >
                <span className="h-0.5 w-7 bg-white transition-all group-hover:w-4"></span>
                <span className="h-0.5 w-4 bg-[#8ba88b] transition-all group-hover:w-7"></span>
                <span className="h-0.5 w-6 bg-white transition-all group-hover:w-3"></span>
              </motion.button>
            )}

            <Link to="/" className="shrink-0">
              <motion.img 
                layout
                src="/assets/logo.png" 
                alt="Logo" 
                className={`transition-all duration-500 object-contain ${isSolid ? 'h-8 md:h-10' : 'h-12 md:h-14'}`} 
              />
            </Link>
          </div>

          {/* CENTER: Desktop Nav Links (Hidden on Admin & Mobile) */}
          <div className="hidden lg:flex items-center gap-8 xl:gap-12">
            {!isAdminPath && navLinks.map((link, i) => (
              <motion.a
                key={link.name}
                href={link.href}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="text-[10px] uppercase tracking-[0.3em] font-bold text-white/90 hover:text-[#8ba88b] transition-all relative group"
onClick={(e) => scrollToSection(e, link.href)} // Use the new function
  >
                    {link.name}
                <span className="absolute -bottom-1 left-0 w-0 h-[1.5px] bg-[#8ba88b] transition-all duration-300 group-hover:w-full"></span>
              </motion.a>
            ))}
          </div>

          {/* RIGHT: User Profile & Mobile Toggle */}
          <div className="flex items-center gap-2 md:gap-4">
            {isAuthenticated ? (
              <div className="relative hidden md:block">
                <motion.button 
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-3 pl-1.5 pr-4 py-1.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-all shadow-inner"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#8ba88b] to-[#2d3a2d] flex items-center justify-center text-[10px] font-bold text-white shadow-lg">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-xs font-semibold text-white font-serif italic tracking-wide">
                    hi, {user?.name?.split(' ')[0]}
                  </span>
                  <ChevronDown size={14} className={`text-[#8ba88b] transition-transform duration-300 ${isProfileOpen ? 'rotate-180' : ''}`} />
                </motion.button>

                <AnimatePresence>
                  {isProfileOpen && (
                    <motion.div 
                      variants={menuVariants}
                      initial="closed"
                      animate="open"
                      exit="closed"
                      className="absolute right-0 mt-4 w-60 bg-[#1a231a]/98 backdrop-blur-2xl border border-white/10 rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-2 z-[110]"
                    >
                      <div className="px-4 py-3 border-b border-white/5 mb-2 opacity-50">
                        <p className="text-[9px] uppercase tracking-[0.2em] text-white font-bold">Personal Account</p>
                      </div>
                      
                      <MenuLink to="/profile" icon={<User size={15}/>} label="My Profile" />
                      <MenuLink to="/my-bookings" icon={<Briefcase size={15}/>} label="My Bookings" />
                      
                      {user?.role === 'admin' && (
                        <MenuLink 
                          to="/admin" 
                          icon={<ShieldCheck size={15}/>} 
                          label="Admin Dashboard" 
                          highlight 
                          onClick={() => setIsProfileOpen(false)}
                        />
                      )}

                      <div className="mt-2 pt-2 border-t border-white/5">
                        <button 
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-all text-xs font-bold"
                        >
                          <LogOut size={15} /> Logout
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link 
                to="/login" 
                className="hidden md:block px-7 py-2.5 rounded-full bg-[#8ba88b] text-white text-[10px] uppercase tracking-widest font-extrabold hover:bg-[#7a967a] transition-all shadow-xl shadow-[#8ba88b]/20"
              >
                Sign In
              </Link>
            )}

            {/* MOBILE TOGGLE BUTTON */}
            <motion.button 
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-white bg-white/5 rounded-lg border border-white/10"
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </motion.button>
          </div>
        </div>
      </nav>

      {/* MOBILE FULL-SCREEN DRAWER */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed inset-0 z-[120] bg-[#1a231a] flex flex-col p-6 lg:hidden"
          >
            {/* Header in Drawer */}
            <div className="flex justify-between items-center mb-12">
              <img src="/assets/logo.png" alt="Logo" className="h-10" />
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-3 bg-white/5 rounded-full">
                <X size={24} className="text-white" />
              </button>
            </div>

            {/* Links */}
            <div className="flex flex-col gap-6">
              {!isAdminPath ? (
                navLinks.map((link) => (
                  <a 
                    key={link.name} 
                    href={link.href} 
                    className="text-4xl font-serif italic text-white/90 hover:text-[#8ba88b] transition-all"
onClick={(e) => scrollToSection(e, link.href)} // Use the new function
                    >
                    {link.name}
                  </a>
                ))
              ) : (
                <Link to="/" className="text-4xl font-serif italic text-[#8ba88b]">Back to Site</Link>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="mt-auto space-y-4">
              {isAuthenticated ? (
                <>
                  <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 rounded-full bg-[#8ba88b] flex items-center justify-center text-xl font-bold text-white">
                        {user?.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-white font-serif italic text-lg">{user?.name}</p>
                        <p className="text-white/40 text-xs uppercase tracking-widest">{user?.role}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                    {/* FIXED: Added My Profile and My Bookings to mobile drawer */}
                    <Link to="/profile" className="flex items-center gap-3 p-4 bg-white/5 text-white/90 rounded-2xl text-sm font-bold">
                      <User size={18}/> My Profile
                    </Link>
                    <Link to="/my-bookings" className="flex items-center gap-3 p-4 bg-white/5 text-white/90 rounded-2xl text-sm font-bold">
                      <Briefcase size={18}/> My Bookings
                    </Link>
                    
                    {user?.role === 'admin' && (
                      <Link to="/admin" className="flex items-center gap-3 p-4 bg-[#8ba88b]/10 text-[#8ba88b] rounded-2xl text-sm font-bold">
                        <LayoutDashboard size={18}/> Admin Panel
                      </Link>
                    )}
                    <button onClick={handleLogout} className="flex items-center gap-3 p-4 bg-red-500/10 text-red-400 rounded-2xl text-sm font-bold">
                      <LogOut size={18}/> Logout
                    </button>
                  </div>
                  </div>
                </>
              ) : (
                <Link 
                  to="/login" 
                  className="block w-full text-center py-5 bg-[#8ba88b] text-white rounded-2xl font-bold uppercase tracking-[0.2em]"
                >
                  Sign In
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

const MenuLink = ({ to, icon, label, highlight, onClick }) => (
  <Link 
    to={to} 
    onClick={onClick}
    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-xs group font-medium ${
      highlight ? 'text-[#8ba88b] hover:bg-[#8ba88b]/10 bg-[#8ba88b]/5' : 'text-white/70 hover:bg-white/5 hover:text-white'
    }`}
  >
    <span className="transition-transform group-hover:rotate-12 group-hover:scale-110">{icon}</span>
    {label}
  </Link>
);

export default Navbar;
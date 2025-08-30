import React, { useState, useEffect, useRef } from 'react';
import { Search, Calendar, Clock, ChevronDown, Menu, X, Bus, Shield, Phone, CheckCircle, Smartphone, User, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [userInfo, setUserInfo] = useState({ username: '', email: '' });
  const [searchQuery, setSearchQuery] = useState(''); // NEW: State for search query

  const desktopDropdownRef = useRef(null);
  const mobileDropdownRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch user info from backend
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await fetch('http://localhost:8081/user/profile', {
          method: 'GET',
          credentials: 'include',
        });

        console.log('Profile fetch status:', response.status);

        if (response.ok) {
          const userData = await response.json();
          setUserInfo({
            username: userData.username || 'User',
            email: userData.email || 'user@example.com',
          });
          console.log('User info loaded:', userData);
        } else {
          console.log('Failed to fetch user info, status:', response.status);
          setUserInfo({ username: 'Guest User', email: 'guest@example.com' });
        }
      } catch (error) {
        console.error('Network error fetching user info:', error);
        setUserInfo({ username: 'Default User', email: 'default@example.com' });
      }
    };
    fetchUserInfo();
  }, []);

  // Close dropdown when clicking outside (works for both desktop & mobile)
  useEffect(() => {
    const handleClickOutside = (event) => {
      const target = event.target;
      const clickedInsideDesktop =
        desktopDropdownRef.current && desktopDropdownRef.current.contains(target);
      const clickedInsideMobile =
        mobileDropdownRef.current && mobileDropdownRef.current.contains(target);

      if (!clickedInsideDesktop && !clickedInsideMobile) {
        setIsProfileDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      console.log('Logout button clicked - starting logout process');
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });

      console.log('Logout response status:', response.status);
      window.location.href = '/login';
    } catch (error) {
      console.error('Network error during logout:', error);
      window.location.href = '/login';
    } finally {
      setIsProfileDropdownOpen(false);
    }
  };

  // Static Data for Routes (replace with API call later)
  const allRoutes = [
    { id: 1, name: 'Colombo - Galle', highway: 'Southern Expressway (E01)', duration: '~2 hours', routeNo: 'Route 100' },
    { id: 2, name: 'Colombo - Matara', highway: 'Southern Expressway (E01)', duration: '~2.5 hours', routeNo: 'Route 101' },
    { id: 3, name: 'Colombo - Katunayake', highway: 'Colombo-Katunayake Expressway (E03)', duration: '~45 minutes', routeNo: 'Route 102' },
    { id: 4, name: 'Colombo - Kandy', highway: 'Central Expressway (E04)', duration: '~3 hours', routeNo: 'Route 103' },
    { id: 5, name: 'Colombo - Jaffna', highway: 'Northern Expressway', duration: '~6 hours', routeNo: 'Route 104' },
  ];

  // Live filtering of routes based on search query
  const filteredRoutes = allRoutes.filter(route =>
    route.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    route.highway.toLowerCase().includes(searchQuery.toLowerCase()) ||
    route.routeNo.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-white/10 backdrop-blur-lg shadow-lg' : 'bg-white/5 backdrop-blur-sm'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                <Bus className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">eWay Bus</span>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <Link to="/home" className="text-gray-300 hover:text-blue-600 transition-colors font-medium">Home</Link>
              <Link to="/busroutes" className="text-blue-600 font-semibold">Routes</Link>
              <Link to="/buytickets" className="text-gray-300 hover:text-blue-600 transition-colors font-medium">Buy Tickets</Link>
              <Link to="/help" className="text-gray-300 hover:text-blue-600 transition-colors font-medium">Help</Link>
              
              {/* Profile Dropdown (Desktop) */}
              <div className="relative" ref={desktopDropdownRef}>
                <button onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"><User className="w-5 h-5" />
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isProfileDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
              
                {/* Dropdown Menu */}
                {isProfileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
                    <div className="py-1">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <div className="text-sm font-medium text-gray-900">{userInfo.username}</div>
                        <div className="text-sm text-gray-500">{userInfo.email}</div>
                      </div>  
                      <button onClick={handleLogout} className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"> <LogOut className="w-4 h-4 mr-3" />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center space-x-4">
              {/* Mobile Profile Dropdown */}
              <div className="relative" ref={mobileDropdownRef}>
                <button onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="flex items-center bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors"><User className="w-5 h-5" />
                </button>
              
                {/* Mobile Dropdown Menu */}
                {isProfileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
                    <div className="py-1">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <div className="text-sm font-medium text-gray-900">{userInfo.username}</div>
                        <div className="text-sm text-gray-500">{userInfo.email}</div>
                      </div>              
                      <button onClick={handleLogout} className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"> <LogOut className="w-4 h-4 mr-3" />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-700 hover:text-blue-600 transition-colors"> 
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
            
            {/* Mobile Menu */}
            {isMenuOpen && (
              <div className="md:hidden absolute top-16 left-0 right-0 bg-white shadow-lg border-t border-gray-200">
                <div className="flex flex-col space-y-0">
                  <Link to="/home" className="px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors border-b border-gray-100" onClick={() => setIsMenuOpen(false)}>
                    Home
                  </Link>
                  <Link to="/busroutes" className="px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors border-b border-gray-100" onClick={() => setIsMenuOpen(false)}>
                    Routes
                  </Link>
                  <Link to="/buytickets" className="px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors border-b border-gray-100" onClick={() => setIsMenuOpen(false)}>
                    Buy Tickets
                  </Link>
                  <Link to="/help" className="px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors" onClick={() => setIsMenuOpen(false)}>
                    Help
                  </Link>
                </div>
              </div>
            )}          
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative w-full h-[400px] bg-cover bg-center" 
           style={{ backgroundImage: `url('/images/hero-image.jpg')` }}>
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <h1 className="text-4xl md:text-5xl font-medium text-gray-200 text-center">
            Routes
          </h1>
        </div>
      </div>

      {/* Routes Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Discover Your Route
            </h2>
            <p className="text-lg text-gray-600">
              Easily find and explore available highway bus routes with pre-purchased ticket options.
            </p>
          </div>

          {/* Route Search & Filter */}
          <div className="bg-gray-100 p-6 rounded-lg shadow-inner mb-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="col-span-1 md:col-span-2">
                <label htmlFor="search-route" className="sr-only">Search Route</label>
                <div className="relative">
                  <input
                    type="text"
                    id="search-route"
                    placeholder="Search by route, city, or destination"
                    className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
              </div>
              <div>
                <button className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition-colors shadow-lg">
                  Search Routes
                </button>
              </div>
            </div>
          </div>

          {/* Featured Routes (Live Filtered) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredRoutes.length > 0 ? (
              filteredRoutes.map(route => (
                <div key={route.id} className="bg-gray-50 rounded-lg p-6 shadow-md hover:shadow-xl transition-shadow duration-300">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{route.name}</h3>
                  <p className="text-gray-600 mb-4">{route.highway}</p>
                  <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
                    <span><Clock className="inline-block w-4 h-4 mr-1 text-blue-500" /> {route.duration}</span>
                    <span><Bus className="inline-block w-4 h-4 mr-1 text-blue-500" /> {route.routeNo}</span>
                  </div>
                  <Link to="/buytickets" className="block w-full text-center bg-blue-600 text-white font-medium py-3 rounded-lg hover:bg-blue-700 transition-colors">
                    View & Buy Passes
                  </Link>
                </div>
              ))
            ) : (
              <p className="col-span-full text-center text-gray-500 text-lg">
                No routes found matching your search.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Seamless Travel, QR-Enabled
            </h2>
            <p className="text-lg text-gray-600">
              Our system allows you to pay once and travel multiple times by simply scanning a QR code.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                <Smartphone className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Buy Your Pass</h3>
              <p className="text-gray-600">Select a weekly, monthly, or a single-trip pass for your route.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Receive QR Code</h3>
              <p className="text-gray-600">Your digital pass with a unique QR code is instantly sent to your app.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                <Bus className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Scan & Go</h3>
              <p className="text-gray-600">Simply scan your QR code at the bus entry point and enjoy your ride.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Bus className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold">eWay Bus</span>
              </div>
              <p className="text-gray-400 mb-6 max-w-md">
                Sri Lanka's premier digital pre-purchased bus ticket system. Pay once, travel effortlessly with eWay Bus.
              </p>
              <div className="flex space-x-4">
                <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors cursor-pointer">
                  <span className="text-sm font-bold">f</span>
                </div>
                <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors cursor-pointer">
                  <span className="text-sm font-bold">t</span>
                </div>
                <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors cursor-pointer">
                  <span className="text-sm font-bold">in</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-3 text-gray-400">
                <li><Link to="/home" className="hover:text-white transition-colors">Home</Link></li>
                <li><Link to="/busroutes" className="hover:text-white transition-colors">Routes</Link></li>
                <li><Link to="/buytickets" className="hover:text-white transition-colors">Buy Tickets</Link></li>
                <li><Link to="/help" className="hover:text-white transition-colors">Help</Link></li>              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Support</h3>
              <ul className="space-y-3 text-gray-400">
                <li><Link to="/help" className="hover:text-white transition-colors">Help Center</Link></li>
                <li><Link to="/help" className="hover:text-white transition-colors">Contact Us</Link></li>
                <li><Link to="/help" className="hover:text-white transition-colors">Terms & Conditions</Link></li>
                <li><Link to="/help" className="hover:text-white transition-colors">Privacy Policy</Link></li>              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-center items-center">
            <p className="text-gray-400 text-sm">
              © 2025 eWay Bus. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
      
      {/* Custom Styles */}
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(50px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .animate-fade-in-up { animation: fadeInUp 0.8s ease-out; }
        .animate-slide-in-right { animation: slideInRight 0.8s ease-out; }
        .animate-float { animation: float 3s ease-in-out infinite; }
        html { scroll-behavior: smooth; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #f1f1f1; }
        ::-webkit-scrollbar-thumb { background: #3b82f6; border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: #2563eb; }
        button { position: relative; overflow: hidden; }
        button:before {
          content: '';
          position: absolute; top: 0; left: -100%;
          width: 100%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          transition: left 0.5s;
        }
        button:hover:before { left: 100%; }
        .glass {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        .gradient-text {
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
      `}</style>
    </div>
  );
}
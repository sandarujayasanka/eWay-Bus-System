import React, { useState, useEffect, useRef } from 'react';
import { Search, Calendar, MapPin, Users, Clock, Star, ChevronDown, Menu, X, Bus, Shield, CreditCard, Phone, Play, CheckCircle, ArrowRight, Smartphone, QrCode, User, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [fromLocation, setFromLocation] = useState('');
  const [toLocation, setToLocation] = useState('');
  const [date, setDate] = useState('');
  const [passengers, setPassengers] = useState(1);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [userInfo, setUserInfo] = useState({ username: '', email: '' });

  // NEW: separate refs for desktop & mobile dropdowns
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

      // close only if clicked outside BOTH
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
      // Redirect to login page regardless of backend response
      window.location.href = '/login';
    } catch (error) {
      console.error('Network error during logout:', error);
      window.location.href = '/login';
    } finally {
      setIsProfileDropdownOpen(false);
    }
  };

  const steps = [
    { icon: Search, title: 'Search Routes', description: 'Find your perfect bus route from hundreds of available options across Sri Lanka' },
    { icon: Calendar, title: 'Book & Pay', description: 'Select your preferred time and complete secure payment in just a few clicks' },
    { icon: Smartphone, title: 'Digital Ticket', description: 'Get instant QR code tickets on your phone - no printing required' }
  ];

  const features = [
    { icon: CheckCircle, title: 'Real-time tracking', description: 'Track your bus location live and get arrival updates' },
    { icon: CheckCircle, title: 'Instant refunds', description: 'Cancel anytime and get instant refunds to your account' },
    { icon: CheckCircle, title: 'Digital tickets only', description: 'Eco-friendly paperless tickets with QR code scanning' }
  ];

  const guidelines = [
    { icon: Bus, title: 'Easy Booking', description: 'Book your bus tickets in just 3 simple steps with our user-friendly platform' },
    { icon: Shield, title: 'Secure Payment', description: 'Your payment information is protected with bank-level security encryption' },
    { icon: Clock, title: 'Trip Availability', description: 'Real-time availability updates ensure you never miss your preferred departure' },
    { icon: Phone, title: 'Mobile Support', description: 'Access all features on mobile with our responsive design and mobile app' }
  ];

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

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8">
              <Link to="/home" className="text-blue-600 font-semibold">Home</Link>
              <Link to="/busroutes" className="text-gray-300 hover:text-blue-600 transition-colors font-medium">Routes</Link>
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
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <div className="w-full h-screen bg-cover bg-center bg-no-repeat" style={{
            backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url("https://kootook.com/wp-content/uploads/2021/06/bus-ticket.jpg?auto=format&fit=crop&w=1200&q=80")`,
            transform: 'scaleX(-1)',}}>
            {/* Floating Bus Illustration */}
            <div className="absolute top-1/2 left-1/4 transform -translate-y-1/2 opacity-20">
              <div className="w-32 h-20 bg-blue-600 rounded-lg relative">
                <div className="absolute -top-2 left-4 right-4 h-8 bg-blue-700 rounded-t-lg"></div>
                <div className="absolute bottom-2 left-2 w-4 h-4 bg-gray-800 rounded-full"></div>
                <div className="absolute bottom-2 right-2 w-4 h-4 bg-gray-800 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="text-center lg:text-left">
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
                Buy your bus
                <br />
                tickets online.
              </h1>
              <p className="text-xl text-blue-100 mb-8 max-w-lg">
                Travel across Sri Lanka with comfort and convenience. Book your tickets instantly and get digital passes for hassle-free journeys.
              </p>
              <Link to="/buytickets">
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-200 transform hover:scale-105 shadow-xl">
                  Book tickets now
                </button>
              </Link>

            </div>

            {/* Right Content - Mobile Mockups */}
            <div className="flex justify-center lg:justify-end">
              <div className="relative">
                {/* Main Phone */}
                <div className="relative z-20 bg-white rounded-3xl p-2 shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-300">
                  <div className="bg-blue-50 rounded-2xl p-6 w-72 h-96 relative overflow-hidden">
                    {/* Phone Header */}
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
                          <Bus className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-bold text-gray-900">eWay Bus</span>
                      </div>
                      <div className="text-sm text-gray-600">9:41 AM</div>
                    </div>

                    {/* Booking Form */}
                    <div className="space-y-4">
                      <div className="bg-white rounded-lg p-4 shadow-sm">
                        <div className="text-sm text-gray-600 mb-2">From</div>
                        <div className="font-semibold text-gray-900">Kottawa</div>
                      </div>
                      <div className="bg-white rounded-lg p-4 shadow-sm">
                        <div className="text-sm text-gray-600 mb-2">To</div>
                        <div className="font-semibold text-gray-900">Galle</div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-white rounded-lg p-4 shadow-sm">
                          <div className="text-sm text-gray-600 mb-2">Start-Date</div>
                          <div className="font-semibold text-gray-900">2025.09.01</div>
                        </div>
                        <div className="bg-white rounded-lg p-4 shadow-sm">
                          <div className="text-sm text-gray-600 mb-2">End-Date</div>
                          <div className="font-semibold text-gray-900">2025.09.07</div>
                        </div>
                      </div>
                      <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold">
                        Search Buses
                      </button>
                    </div>

                    {/* QR Code */}
                    <div className="absolute bottom-4 right-4 bg-white p-2 rounded-lg shadow-lg">
                      <QrCode className="w-12 h-12 text-gray-800" />
                    </div>
                  </div>
                </div>

                {/* Secondary Phone */}
                <div className="absolute -left-16 top-12 z-10 bg-white rounded-3xl p-2 shadow-xl transform -rotate-6 hover:rotate-0 transition-transform duration-300">
                  <div className="bg-green-50 rounded-2xl p-4 w-48 h-64 flex flex-col items-center justify-center">
                    <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mb-4">
                      <CheckCircle className="w-8 h-8 text-white" />
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-gray-900 mb-2">Booking Confirmed!</div>
                      <div className="text-sm text-gray-600 mb-4">Your digital ticket is ready</div>
                      <div className="bg-white p-3 rounded-lg">
                        <QrCode className="w-8 h-8 text-gray-800 mx-auto" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-8 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Links</h3>
            <div className="flex flex-wrap justify-center gap-4">
              <button className="px-6 py-3 bg-white rounded-full shadow-sm hover:shadow-md transition-shadow border border-gray-200 text-gray-700 hover:text-blue-600">
                👤 My Account
              </button>
              <button className="px-6 py-3 bg-white rounded-full shadow-sm hover:shadow-md transition-shadow border border-gray-200 text-gray-700 hover:text-blue-600">
                ❓ Help & Support
              </button>
              <button className="px-6 py-3 bg-white rounded-full shadow-sm hover:shadow-md transition-shadow border border-gray-200 text-gray-700 hover:text-blue-600">
                💳 Payment History
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Introducing the all new e-ticket platform
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Experience the future of bus travel in Sri Lanka with our digital-first platform. Book, pay, and travel with just your smartphone.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-20">
            {steps.map((step, index) => (
              <div key={index} className="text-center group">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-600 transition-colors duration-300">
                  <step.icon className="w-8 h-8 text-blue-600 group-hover:text-white transition-colors duration-300" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features with Phone Mockup */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left - Features */}
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">
                Add your trip details.
              </h2>
              <p className="text-lg text-gray-600 mb-12">
                Simply enter your departure and destination cities, select your travel date, and choose the number of passengers to find the perfect bus for your journey.
              </p>

              <div className="space-y-6">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <feature.icon className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">{feature.title}</h4>
                      <p className="text-gray-600">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right - Phone Mockup */}
            <div className="flex justify-center">
              <div className="relative">
                <div className="bg-white rounded-3xl p-3 shadow-2xl">
                  <div className="bg-gray-900 rounded-2xl p-6 w-80 h-96 relative overflow-hidden">
                    {/* Status Bar */}
                    <div className="flex justify-between items-center text-white text-sm mb-6">
                      <span>9:41</span>
                      <div className="flex space-x-1">
                        <div className="w-4 h-2 bg-white rounded-sm"></div>
                        <div className="w-4 h-2 bg-white rounded-sm opacity-60"></div>
                        <div className="w-4 h-2 bg-white rounded-sm opacity-30"></div>
                      </div>
                    </div>

                    {/* App Interface */}
                    <div className="bg-white rounded-lg p-4 h-80">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-gray-900">Search Routes</h3>
                        <div className="w-6 h-6 bg-blue-600 rounded"></div>
                      </div>

                      <div className="space-y-4">
                        <div className="border-2 border-blue-200 rounded-lg p-3 bg-blue-50">
                          <div className="text-sm text-gray-600 mb-1">From</div>
                          <div className="font-semibold">Kadawatha</div>
                        </div>

                        <div className="border border-gray-200 rounded-lg p-3">
                          <div className="text-sm text-gray-600 mb-1">To</div>
                          <div className="font-semibold text-gray-400">Where to?</div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="border border-gray-200 rounded-lg p-3">
                            <div className="text-sm text-gray-600 mb-1">Weekly</div>
                            <div className="font-semibold text-gray-400">Select</div>
                          </div>
                          <div className="border border-gray-200 rounded-lg p-3">
                            <div className="text-sm text-gray-600 mb-1">Monthly</div>
                            <div className="font-semibold text-gray-400">Select</div>
                          </div>
                        </div>

                        <button className="w-full bg-gray-300 text-gray-500 py-3 rounded-lg font-semibold mt-6">
                          Search Routes
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Digital Ticket Section */}
      <section className="py-20 bg-gradient-to-br from-green-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left - Content */}
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">
                Use your e-ticket
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Your digital ticket with QR code is ready instantly after payment. No need for printing - just show your phone to board the bus.
              </p>

              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  {/* CheckCircle Icon - Replaced with SVG */}
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-8.63"></path>
                    <path d="M22 4L12 14.01l-3-3"></path>
                  </svg>
                  <span className="text-gray-700">Instant QR code generation</span>
                </div>
                <div className="flex items-center space-x-3">
                  {/* CheckCircle Icon - Replaced with SVG */}
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-8.63"></path>
                    <path d="M22 4L12 14.01l-3-3"></path>
                  </svg>
                  <span className="text-gray-700">Offline ticket access</span>
                </div>
                <div className="flex items-center space-x-3">
                  {/* CheckCircle Icon - Replaced with SVG */}
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-8.63"></path>
                    <path d="M22 4L12 14.01l-3-3"></path>
                  </svg>
                  <span className="text-gray-700">Easy boarding process</span>
                </div>
              </div>
            </div>

            {/* Right - Phone Mockup */}
            <div className="flex justify-center">
              <div className="relative">
                <div className="bg-white rounded-3xl p-3 shadow-2xl">
                  <div className="bg-gradient-to-br from-green-400 to-green-600 rounded-2xl p-6 w-80 h-96 relative overflow-hidden">
                    <div className="text-white">
                      <div className="flex justify-between items-center mb-6">
                        <span className="text-sm">9:41</span>
                        <div className="flex space-x-1">
                          <div className="w-4 h-2 bg-white rounded-sm"></div>
                          <div className="w-4 h-2 bg-white rounded-sm opacity-60"></div>
                          <div className="w-4 h-2 bg-white rounded-sm opacity-30"></div>
                        </div>
                      </div>

                      <div className="text-center mb-6">
                        <h3 className="text-xl font-bold mb-2">Your E-Ticket</h3>
                        <p className="text-green-100">Ready to board</p>
                      </div>

                      <div className="bg-white rounded-lg p-6 text-gray-900 text-center">
                        <div className="mb-4">
                          <div className="text-sm text-gray-600 mb-1">Name</div>
                          <div className="font-bold">Kamindu</div>
                        </div>

                        <div className="mb-4">
                          <div className="text-sm text-gray-600 mb-1">Route</div>
                          <div className="font-bold">Colombo → Kandy</div>
                        </div>

                        <div className="bg-gray-100 rounded-lg p-4">
                          {/* QrCode Icon - Replaced with SVG */}
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-20 h-20 text-gray-800 mx-auto mb-2" viewBox="0 0 24 24" fill="currentColor">
                            <rect width="7" height="7" x="3" y="3" rx="1" />
                            <rect width="7" height="7" x="14" y="3" rx="1" />
                            <rect width="7" height="7" x="3" y="14" rx="1" />
                            <path d="M14 14h1v1h-1v-1Z" />
                            <path d="M17 14h1v1h-1v-1Z" />
                            <path d="M15 15h1v1h-1v-1Z" />
                            <path d="M18 15h1v1h-1v-1Z" />
                            <path d="M16 16h1v1h-1v-1Z" />
                            <path d="M17 17h1v1h-1v-1Z" />
                            <path d="M15 18h1v1h-1v-1Z" />
                            <path d="M18 18h1v1h-1v-1Z" />
                            <path d="M16 19h1v1h-1v-1Z" />
                          </svg>
                          <p className="text-xs text-gray-600">Show this QR code to board</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
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

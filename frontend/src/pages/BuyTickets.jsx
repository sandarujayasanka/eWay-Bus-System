import React, { useState, useEffect, useRef } from 'react';
import { Bus, User, ChevronDown, Menu, X, Calendar, LogOut, Upload, CreditCard, Download, CheckCircle, ArrowRight, QrCode, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { QRCodeCanvas } from 'qrcode.react';
import jsPDF from 'jspdf';

export default function BuyTickets() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [userInfo, setUserInfo] = useState({ username: '', email: '' });

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
  
  // Form states
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: '',
    userType: '',
    adultId: null,  // Will store base64 string
    studentDoc: null,  // Will store base64 string
    startLocation: 'Colombo',
    endLocation: 'Galle',
    duration: 'week',
    startDate: '',
    endDate: '',
    paymentMethod: ''
  });
  
  const [price, setPrice] = useState(0);
  const [ticketData, setTicketData] = useState('');
  
  const desktopDropdownRef = useRef(null);
  const mobileDropdownRef = useRef(null);
  const qrCodeRef = useRef(null);

  // Route prices (weekly base prices)
  const routePrices = {
    "Colombo-Galle": 2000,
    "Colombo-Kandy": 1800,
    "Colombo-Kalutara": 1000,
    "Galle-Kandy": 2200,
    "Galle-Kalutara": 1500,
    "Kandy-Kalutara": 1700
  };

  // Duration multipliers
  const durationMultipliers = {
    'week': 1,
    'month': 4
  };

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      const target = event.target;
      const clickedInsideDesktop = desktopDropdownRef.current && desktopDropdownRef.current.contains(target);
      const clickedInsideMobile = mobileDropdownRef.current && mobileDropdownRef.current.contains(target);

      if (!clickedInsideDesktop && !clickedInsideMobile) {
        setIsProfileDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    updatePrice();
    updateDates();
  }, [formData.startLocation, formData.endLocation, formData.userType, formData.duration, formData.startDate]);

  const updatePrice = () => {
    const key1 = `${formData.startLocation}-${formData.endLocation}`;
    const key2 = `${formData.endLocation}-${formData.startLocation}`;
    
    let basePrice = routePrices[key1] || routePrices[key2] || 1500;
    
    basePrice = basePrice * durationMultipliers[formData.duration];
    
    if (formData.userType === 'student') {
      basePrice = basePrice * 0.5;
    }
    
    setPrice(basePrice);
  };

  const updateDates = () => {
    if (!formData.startDate) return;
    
    const startDate = new Date(formData.startDate);
    let endDate;
    
    if (formData.duration === 'week') {
      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);
    } else if (formData.duration === 'month') {
      endDate = new Date(startDate);
      endDate.setMonth(startDate.getMonth() + 1);
      endDate.setDate(endDate.getDate() - 1);
    }
    
    setFormData((prev) => ({ 
      ...prev, 
      endDate: endDate.toISOString().split('T')[0] 
    }));
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    
    if (field === 'startDate' || field === 'duration') {
      updateDates();
    }
  };

  const handleFileUpload = (field, file) => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData((prev) => ({ ...prev, [field]: e.target.result })); 
      };
      reader.readAsDataURL(file);
    } else {
      setFormData((prev) => ({ ...prev, [field]: null }));
    }
  };

  const handleNextStep = (step) => {
    if (step === 2) {
      if (!formData.fullName.trim()) {
        alert("Please enter your full name!");
        return;
      }
      if (!formData.userType) {
        alert("Please select a user type!");
        return;
      }
      if (formData.userType === "adult" && !formData.adultId) {
        alert("Please upload your ID photo!");
        return;
      }
      if (formData.userType === "student" && !formData.studentDoc) {
        alert("Please upload your student document!");
        return;
      }
    }

    if (step === 3) {
      if (formData.startLocation === formData.endLocation) {
        alert("Start and end locations cannot be the same!");
        return;
      }
      if (!formData.startDate) {
        alert("Please select a start date!");
        return;
      }
    }

    if (step === 4) {
      if (!formData.paymentMethod) {
        alert("Please select a payment method!");
        return;
      }
      alert(`Payment successful via ${formData.paymentMethod}! Proceeding to generate pass.`);
    }

    setCurrentStep(step);
    
    if (step === 4) {
      generateQR();
    }
  };

  const handleBackStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // ... other code above
const generateQR = async () => {
    // ... other code to generate ticketId and issueDate
    const ticketId = 'SP' + Date.now().toString().substr(-8);
    const issueDate = new Date().toLocaleDateString('en-CA'); 

    // Correct payload with all the required fields
    const ticketDataForBackend = {
        ticketId: ticketId,
        name: formData.fullName,
        type: formData.userType,
        startLocation: formData.startLocation,
        endLocation: formData.endLocation,
        duration: formData.duration,
        startDate: formData.startDate,
        endDate: formData.endDate,
        price: price, // Ensure this price variable holds a number
        payment: formData.paymentMethod,
        issued: issueDate,
        validUntil: formData.endDate,
        status: 'ACTIVE',
        createdBy: 1 // You need to provide a user ID here. For now, use a static value.
    };
    
    // Set the QR data as before, but ensure the backend receives a clean payload
    const qrData = JSON.stringify(ticketDataForBackend);
    setTicketData(qrData);

    // Send data to Ballerina backend
    try {
        // Change the port to 8081 to match your backend listener
        const response = await fetch('http://localhost:8081/api/saveTicket', { 
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(ticketDataForBackend) // Use the new, complete payload
        });
        
        const result = await response.json();

        if (response.ok && result.status === 'success') {
            console.log('Ticket saved:', result);
            alert('Ticket has been recorded successfully!');
        } else {
            // Handle specific errors from the backend response
            console.error('Error saving ticket:', result.message);
            alert('Error saving ticket to database: ' + result.message);
        }

    } catch (error) {
        console.error('Network or unexpected error:', error);
        alert('Error connecting to the backend. Please check if the server is running.');
    }
};

  const downloadQR = () => {
    if (ticketData && qrCodeRef.current) {
        // Create a temporary canvas for the non-QR elements
        const canvas = document.createElement('canvas');
        canvas.width = 800;
        canvas.height = 1200;
        const ctx = canvas.getContext('2d');

        // Set white background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, 800, 1200);

        // Parse ticket data
        const details = JSON.parse(ticketData);
        const route = `${details.startLocation} → ${details.endLocation}`;

        // Draw name and route at the top
        ctx.fillStyle = '#1f2937';
        ctx.textAlign = 'center';
        ctx.font = 'bold 48px Arial';
        ctx.fillText(details.name, 400, 120);
        ctx.font = 'bold 36px Arial';
        ctx.fillText(route, 400, 180);

        // Draw valid dates below where QR will be
        ctx.font = '24px Arial';
        ctx.fillText(`Valid: ${details.startDate} to ${details.endDate}`, 400, 680);

        // Create the PDF
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: [70, 110],
        });

        // Add the content from the temporary canvas to the PDF
        const contentImgData = canvas.toDataURL('image/png', 1.0);
        pdf.addImage(contentImgData, 'PNG', 5, 5, 60, 90, '', 'FAST');

        // Get the QR code canvas directly from the reference
        const qrCanvas = qrCodeRef.current.querySelector('canvas');
        if (qrCanvas) {
            const qrImgData = qrCanvas.toDataURL('image/png', 1.0);
            
            // Add the QR code image to the PDF
            pdf.addImage(qrImgData, 'PNG', 15, 30, 40, 40, null, 'NONE'); 
            
            // Save PDF
            pdf.save(`SeasonPass_${details.ticketId}.pdf`);

        } else {
            alert('Error: QR code not generated properly.');
        }
    }
  };

  const handleLogout = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
      window.location.href = '/login';
    } catch (error) {
      console.error('Network error during logout:', error);
      window.location.href = '/login';
    } finally {
      setIsProfileDropdownOpen(false);
    }
  };

  const [showScanner, setShowScanner] = useState(false);
  const [scannedData, setScannedData] = useState(null);

  const simulateQRScan = () => {
    if (ticketData) {
      try {
        const parsed = JSON.parse(ticketData);
        const currentDate = new Date();
        const endDate = new Date(parsed.endDate);
        parsed.status = currentDate > endDate ? 'EXPIRED' : 'ACTIVE';
        setScannedData(parsed);
        setShowScanner(true);
        if (parsed.status === 'EXPIRED') {
          alert('This season pass is not valid (expired)!');
        } else {
          alert('Season pass is valid!');
        }
      } catch (error) {
        alert('Invalid QR code data');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
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
              <Link to="/busroutes" className="text-gray-300 hover:text-blue-600 transition-colors font-medium">Routes</Link>
              <Link to="/buytickets" className="text-blue-600 font-semibold">Buy Tickets</Link>
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
            Buy Tickets
          </h1>
        </div>
      </div>

      {/* QR Scanner Modal (Demo) */}
      {showScanner && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">QR Code Scanned</h3>
              <button
                onClick={() => setShowScanner(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            {scannedData && (
              <div className="space-y-3 text-sm">
                <div className={`border rounded-lg p-3 ${scannedData.status === 'ACTIVE' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                  <div className="flex items-center mb-2">
                    <CheckCircle className={`w-5 h-5 ${scannedData.status === 'ACTIVE' ? 'text-green-600' : 'text-red-600'} mr-2`} />
                    <span className={`font-semibold ${scannedData.status === 'ACTIVE' ? 'text-green-800' : 'text-red-800'}`}>
                      {scannedData.status === 'ACTIVE' ? 'Valid Season Pass' : 'Expired Season Pass'}
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="font-medium text-gray-700">ID:</span>
                    <div className="text-gray-900">{scannedData.id}</div>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Status:</span>
                    <div className={`font-semibold ${scannedData.status === 'ACTIVE' ? 'text-green-600' : 'text-red-600'}`}>{scannedData.status}</div>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Name:</span>
                    <div className="text-gray-900">{scannedData.name}</div>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Type:</span>
                    <div className="text-gray-900">{scannedData.type.charAt(0).toUpperCase() + scannedData.type.slice(1)}</div>
                  </div>
                  <div className="col-span-2">
                    <span className="font-medium text-gray-700">Route:</span>
                    <div className="text-gray-900">{scannedData.route}</div>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Duration:</span>
                    <div className="text-gray-900">{scannedData.duration === 'week' ? 'Weekly Pass' : 'Monthly Pass'}</div>
                  </div>
                  <div className="col-span-2">
                    <span className="font-medium text-gray-700">Valid Period:</span>
                    <div className="text-gray-900">{scannedData.startDate} to {scannedData.endDate}</div>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Price:</span>
                    <div className="text-gray-900">Rs. {scannedData.price}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="pt-20 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Season Pass <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Booking</span>
            </h1>
            <p className="text-xl text-gray-600">Book your season pass in 4 simple steps</p>
          </div>
          {/* Progress Steps */}
          <div className="flex justify-center mb-12">
            <div className="flex items-center space-x-4">
              {[1, 2, 3, 4].map((step) => (
                <React.Fragment key={step}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                    currentStep >= step ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {step}
                  </div>
                  {step < 4 && (
                    <div className={`w-12 h-1 transition-all ${
                      currentStep > step ? 'bg-blue-600' : 'bg-gray-200'
                    }`} />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
            {/* Step 1: Your Details */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <h3 className="text-2xl font-semibold text-gray-900 mb-6">Step 1: Your Details</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                    <input type="text" value={formData.fullName} onChange={(e) => handleInputChange('fullName', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" placeholder="Enter your full name"/>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">User Type *</label>
                    <select value={formData.userType} onChange={(e) => handleInputChange('userType', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all">
                      <option value="" disabled>Select Type</option>
                      <option value="adult">Adult</option>
                      <option value="student">Student</option>
                    </select>
                  </div>

                  {formData.userType === 'adult' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Upload ID Photo *</label>
                      <div className="flex items-center space-x-4">
                        <input type="file" accept="image/*" onChange={(e) => handleFileUpload('adultId', e.target.files[0])} className="hidden" id="adultId"/>
                        <label htmlFor="adultId" className="flex items-center space-x-2 bg-gray-50 hover:bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg px-4 py-3 cursor-pointer transition-all">
                          <Upload className="w-5 h-5 text-gray-500" />
                          <span className="text-gray-700">Choose ID Photo</span>
                        </label>
                        {formData.adultId && (<span className="text-green-600 font-medium">✓ Uploaded</span>)}
                      </div>
                    </div>
                  )}

                  {formData.userType === 'student' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Upload Student Document *</label>
                      <div className="flex items-center space-x-4">
                        <input type="file" accept="image/*,application/pdf" onChange={(e) => handleFileUpload('studentDoc', e.target.files[0])} className="hidden" id="studentDoc"/>
                        <label htmlFor="studentDoc" className="flex items-center space-x-2 bg-gray-50 hover:bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg px-4 py-3 cursor-pointer transition-all">
                          <Upload className="w-5 h-5 text-gray-500" />
                          <span className="text-gray-700">Choose Student Document</span>
                        </label>
                        {formData.studentDoc && (<span className="text-green-600 font-medium">✓ Uploaded</span>)}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-between">
                  <button onClick={handleBackStep} disabled={currentStep === 1} className={`w-full sm:w-auto bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-3 px-6 rounded-lg transition-all flex items-center justify-center space-x-2 ${currentStep === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    <ArrowLeft className="w-5 h-5" />
                    <span>Back</span>
                  </button>
                  <button onClick={() => handleNextStep(2)} className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all flex items-center justify-center space-x-2">
                    <span>Next</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Select Route & Duration */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <h3 className="text-2xl font-semibold text-gray-900 mb-6">Step 2: Select Route & Duration</h3>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Start Location</label>
                    <select value={formData.startLocation} onChange={(e) => handleInputChange('startLocation', e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all">
                      <option value="Colombo">Colombo</option>
                      <option value="Galle">Galle</option>
                      <option value="Kandy">Kandy</option>
                      <option value="Kalutara">Kalutara</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">End Location</label>
                    <select value={formData.endLocation} onChange={(e) => handleInputChange('endLocation', e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all">
                      <option value="Colombo">Colombo</option>
                      <option value="Galle">Galle</option>
                      <option value="Kandy">Kandy</option>
                      <option value="Kalutara">Kalutara</option>
                    </select>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Start Date *</label>
                    <input type="date" value={formData.startDate} onChange={(e) => handleInputChange('startDate', e.target.value)} min={new Date().toISOString().split('T')[0]} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"/>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                    <input type="date" value={formData.endDate} readOnly className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Pass Duration</label>
                  <div className="grid grid-cols-2 gap-4">
                    <label className={`cursor-pointer border-2 rounded-lg p-4 transition-all ${formData.duration === 'week' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}>
                      <input type="radio" name="duration" value="week" checked={formData.duration === 'week'} onChange={(e) => handleInputChange('duration', e.target.value)} className="sr-only"/>
                      <div className="text-center">
                        <div className="font-semibold text-gray-900">Weekly Pass</div>
                        <div className="text-sm text-gray-600">7 days validity</div>
                        <div className="text-lg font-bold text-blue-600 mt-1">Base Price</div>
                      </div>
                    </label>
                    
                    <label className={`cursor-pointer border-2 rounded-lg p-4 transition-all ${formData.duration === 'month' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}>
                      <input type="radio" name="duration" value="month" checked={formData.duration === 'month'} onChange={(e) => handleInputChange('duration', e.target.value)} className="sr-only"/>
                      <div className="text-center">
                        <div className="font-semibold text-gray-900">Monthly Pass</div>
                        <div className="text-sm text-gray-600">30+ days validity</div>
                        <div className="text-lg font-bold text-green-600 mt-1">4x Weekly</div>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-between">
                  <button onClick={handleBackStep} disabled={currentStep === 1} className={`w-full sm:w-auto bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-3 px-6 rounded-lg transition-all flex items-center justify-center space-x-2 ${currentStep === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    <ArrowLeft className="w-5 h-5" />
                    <span>Back</span>
                  </button>
                  <button onClick={() => handleNextStep(3)} className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all flex items-center justify-center space-x-2">
                    <span>Next</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Payment */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <h3 className="text-2xl font-semibold text-gray-900 mb-6">Step 3: Payment</h3>
                
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-lg font-medium text-gray-700">Total Amount:</span>
                    <span className="text-3xl font-bold text-blue-600">Rs. {price}</span>
                  </div>
                  
                  <div className="text-sm text-gray-600">
                    <div>Route: {formData.startLocation} → {formData.endLocation}</div>
                    <div>Duration: {formData.duration === 'week' ? 'Weekly Pass' : 'Monthly Pass'}</div>
                    <div>Valid: {formData.startDate} to {formData.endDate}</div>
                    <div>Passenger: {formData.fullName} ({formData.userType})</div>
                    {formData.userType === 'student' && (
                      <div className="text-green-600 font-medium">✓ Student discount applied</div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method *</label>
                  <select value={formData.paymentMethod} onChange={(e) => handleInputChange('paymentMethod', e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all">
                    <option value="" disabled>Select Payment Method</option>
                    <option value="ezcash">eZCash</option>
                    <option value="card">Card</option>
                  </select>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-between">
                  <button onClick={handleBackStep} disabled={currentStep === 1} className={`w-full sm:w-auto bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-3 px-6 rounded-lg transition-all flex items-center justify-center space-x-2 ${currentStep === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    <ArrowLeft className="w-5 h-5" />
                    <span>Back</span>
                  </button>
                  <button onClick={() => handleNextStep(4)} className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-all flex items-center justify-center space-x-2">
                    <CreditCard className="w-5 h-5" />
                    <span>Pay & Generate Pass</span>
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Download Pass */}
            {currentStep === 4 && (
              <div className="space-y-6 text-center">
                <div className="mb-6">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-2xl font-semibold text-gray-900 mb-2">Payment Successful!</h3>
                  <p className="text-gray-600">Your season pass is ready for download</p>
                </div>

                <div className="bg-gray-50 rounded-lg p-8">
                  <div className="flex flex-col md:flex-row items-center justify-center space-y-6 md:space-y-0 md:space-x-8">
                    <div className="flex flex-col items-center">
                      {ticketData && (
                        <div className="bg-white p-4 rounded-lg border-2 border-gray-200" ref={qrCodeRef}>
                          <QRCodeCanvas value={ticketData} size={150} level="H"/>
                        </div>
                      )}                      
                    </div>

                    <div className="text-left space-y-2">
                      <div className="text-lg font-bold text-gray-900">{formData.fullName}</div>
                      <div className="text-gray-600">{formData.startLocation} → {formData.endLocation}</div>
                      <div className="text-sm text-gray-500">
                        <div>Type: {formData.userType.charAt(0).toUpperCase() + formData.userType.slice(1)}</div>
                        <div>Duration: {formData.duration === 'week' ? 'Weekly' : 'Monthly'}</div>
                        <div>Valid: {formData.startDate} to {formData.endDate}</div>
                        <div>Amount: Rs. {price}</div>
                        <div>Payment: {formData.paymentMethod.charAt(0).toUpperCase() + formData.paymentMethod.slice(1)}</div>
                        {scannedData && (
                          <>
                            <div>Ticket ID: {scannedData.id}</div>
                            <div>Status: {scannedData.status}</div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-between">
                  <button onClick={handleBackStep} disabled={currentStep === 1} className={`w-full sm:w-auto bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-3 px-6 rounded-lg transition-all flex items-center justify-center space-x-2 ${currentStep === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    <ArrowLeft className="w-5 h-5" />
                    <span>Back</span>
                  </button>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <button onClick={downloadQR} className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all flex items-center justify-center space-x-2">
                      <Download className="w-5 h-5" />
                      <span>Download Pass (PDF)</span>
                    </button>
                    
                    <button onClick={() => {
                        setCurrentStep(1);
                        setFormData({
                          fullName: '',
                          userType: '',
                          adultId: null,
                          studentDoc: null,
                          startLocation: 'Colombo',
                          endLocation: 'Galle',
                          duration: 'week',
                          startDate: '',
                          endDate: '',
                          paymentMethod: ''
                        });
                        setTicketData('');
                        setScannedData(null);
                      }}
                      className="w-full sm:w-auto bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-all"
                    >
                      Book Another Pass
                    </button>
                  </div>
                </div>

                <div className="text-sm text-gray-500 mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="font-semibold text-yellow-800 mb-2">Important Instructions:</div>
                  <ul className="text-left space-y-1">
                    <li>• Save this QR code PDF and show it to the conductor when boarding</li>
                    <li>• Pass is non-transferable and must be used by the named passenger only</li>
                    <li>• Lost passes cannot be replaced - keep this document safe</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

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
        
        .animate-fade-in-up { animation: fadeInUp 0.8s ease-out; }
        
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
      `}</style>
    </div>
  );
}
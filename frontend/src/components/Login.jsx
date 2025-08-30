import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { IoEyeOutline, IoEyeOffOutline } from "react-icons/io5";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:8081/user/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (data.status === "success") {
        // --- ADDED THIS SECTION TO SAVE THE TOKEN ---
        if (data.token) {
          localStorage.setItem("authToken", data.token);
          console.log("Login successful. Token saved.");
        }
        // ---------------------------------------------
        
        setForm({ email: "", password: "" });
        if (data.role === "admin") {
          navigate("/admin");
        } else {
          navigate("/home");
        }
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("Something went wrong. Please try again.");
    }
  };

  return (
    // ... rest of your JSX code remains the same
    <div 
      className="relative flex min-h-screen items-center justify-center bg-cover bg-center" 
      style={{ backgroundImage: 'url("/images/b4.jpg")' }}
    >
      {/* Background Overlay */}
      <div className="absolute inset-0 bg-black opacity-50"></div>

      {/* Login Card Container */}
      <div className="relative bg-white rounded-3xl shadow-2xl overflow-hidden md:flex md:w-3/4 lg:w-3/5 max-w-4xl z-10">
        {/* Login Form Section (Left Side) */}
        <div className="w-full md:w-1/2 p-10 flex flex-col justify-center">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold text-gray-800 mb-2">Log In</h2>
            <p className="text-gray-500 text-sm">Welcome back! Please enter your details</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-gray-700 text-sm font-medium mb-2">Email</label>
              <input
                name="email"
                id="email"
                placeholder="Enter your email"
                type="email"
                value={form.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-gray-700 text-sm font-medium mb-2">Password</label>
              <div className="relative">
                <input
                  name="password"
                  id="password"
                  placeholder="********"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700 focus:outline-none"
                >
                  {showPassword ? <IoEyeOffOutline size={20} /> : <IoEyeOutline size={20} />}
                </button>
              </div>
              <div className="text-right mt-2">
                <Link to="/forgot-password" className="text-purple-600 text-sm hover:underline">
                  Forgot password ?
                </Link>
              </div>
            </div>
            
            <button
              type="submit"
              className="w-full py-3 bg-purple-600 text-white rounded-lg font-semibold text-lg hover:bg-purple-700 transition duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
            >
              Log In
            </button>
          </form>

          <div className="mt-auto text-center text-gray-600 text-sm pt-8">
            <p>
              Don't have an account?{" "}
              <Link to="/register" className="text-purple-600 font-semibold hover:underline">
                Sign up
              </Link>
            </p>
          </div>
        </div>

        {/* The second image is not needed anymore */}
        <div className="hidden md:block md:w-1/2 relative">
          <img
            src="/images/card2.jpg"
            alt="Login background"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </div>
  );
}
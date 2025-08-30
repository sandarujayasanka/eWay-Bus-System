import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { IoEyeOutline, IoEyeOffOutline } from "react-icons/io5";

export default function Register() {
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Port 8081
      const res = await fetch("http://localhost:8081/user/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });

      const data = await res.json();

      if (data.status === "success") {
        alert(data.message);
        // Registration success නම් login page එකට redirect කරන්න
        navigate("/login");
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("Registration error:", error);
      alert("Something went wrong. Please try again.");
    }
  };

  return (
    <div 
      className="relative flex min-h-screen items-center justify-center bg-cover bg-center" 
      style={{ backgroundImage: 'url("/images/b4.jpg")' }}
    >
      {/* Background Overlay */}
      <div className="absolute inset-0 bg-black opacity-50"></div>

      {/* Login Card Container */}
      <div className="relative bg-white rounded-3xl shadow-2xl overflow-hidden md:flex md:w-3/4 lg:w-3/5 max-w-4xl z-10">
        {/* Register Form Section (Left Side) */}
        <div className="w-full md:w-1/2 p-10 flex flex-col justify-center">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold text-gray-800 mb-2">Register</h2>
            <p className="text-gray-500 text-sm">Create your account to get started!</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-gray-700 text-sm font-medium mb-2">Username</label>
              <input 
                name="username" 
                id="username"
                placeholder="Enter your username" 
                value={form.username} 
                onChange={handleChange} 
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
            </div>
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
            </div>
            
            <button 
              type="submit"
              className="w-full py-3 bg-purple-600 text-white rounded-lg font-semibold text-lg hover:bg-purple-700 transition duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
            >
              Register
            </button>
          </form>

          <div className="mt-auto text-center text-gray-600 text-sm pt-8">
            <p>
              Already have an account?{" "}
              <Link to="/login" className="text-purple-600 font-semibold hover:underline">
                Login here
              </Link>
            </p>
          </div>
        </div>

        {/* Image Section (Right Side) */}
        <div className="hidden md:block md:w-1/2 relative">
          <img
            src="/images/card2.jpg"
            alt="Register background"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </div>
  );
}
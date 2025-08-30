import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Register from "./components/Register";
import Login from "./components/Login";
import Home from "./pages/Home";
import Admin from "./pages/Admin";
import BuyTickets from "./pages/BuyTickets";
import BusRoutes from "./pages/BusRoutes";

function App() {
  return (
    <Router>
      <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/home" element={<Home />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="/buytickets" element={<BuyTickets />} />
      <Route path="/busroutes" element={<BusRoutes />} />
      <Route path="/" element={<Login />} /> {/* Start page is Login */}
    </Routes>
    </Router>
  );
}

export default App;

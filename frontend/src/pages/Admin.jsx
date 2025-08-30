import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Settings, 
  BarChart3, 
  LogOut, 
  Search,
  Menu,
  UserCheck,
  ShoppingCart,
  TrendingUp,
  Activity,
  RefreshCw,
  Ticket
} from 'lucide-react';

export default function Admin() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalOrders: 0,
    revenue: 0
  });

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch('http://localhost:8081/stats');
      if (response.ok) {
        const data = await response.json();
        setStats({
          totalUsers: data.totalUsers || 0,
          activeUsers: data.activeUsers || 0,
          totalOrders: data.totalOrders || 0,
          revenue: data.revenue || 0
        });
      }
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
    }
  };

  const handleLogout = async () => {
    try {
      const confirmed = window.confirm('Are you sure you want to logout?');
      if (!confirmed) return;

      await fetch('http://localhost:8081/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });

      window.location.href = '/login';
    } catch (error) {
      console.error('Logout error:', error);
      window.location.href = '/login';
    }
  };

  const StatCard = ({ title, value, icon: Icon, bgColor, iconColor }) => (
    <div className={`${bgColor} rounded-xl shadow-lg p-6`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-gray-700 uppercase">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value.toLocaleString()}</p>
        </div>
        <div className={`p-4 rounded-2xl ${iconColor}`}>
          <Icon className="h-8 w-8 text-white" />
        </div>
      </div>
    </div>
  );

  const DashboardContent = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard title="Total Users" value={stats.totalUsers} icon={Users}
        bgColor="bg-blue-50" iconColor="bg-blue-600" />
      <StatCard title="Active Users" value={stats.activeUsers} icon={UserCheck}
        bgColor="bg-green-50" iconColor="bg-green-600" />
      <StatCard title="Total Tickets" value={stats.totalOrders} icon={ShoppingCart}
        bgColor="bg-purple-50" iconColor="bg-purple-600" />
      <StatCard title="Revenue (LKR)" value={stats.revenue} icon={TrendingUp}
        bgColor="bg-orange-50" iconColor="bg-orange-600" />
    </div>
  );

  const UsersContent = () => (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold mb-2">User Management</h3>
      <p className="text-gray-500">User management module already integrated.</p>
    </div>
  );

  // ✅ Tickets Management
  const OrdersContent = () => {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchTickets = async () => {
      try {
        setLoading(true);
        const res = await fetch("http://localhost:8081/admin/tickets");
        const data = await res.json();
        if (data.status === "success") {
          setTickets(data.data);
        }
      } catch (err) {
        console.error("Error fetching tickets:", err);
      } finally {
        setLoading(false);
      }
    };

    useEffect(() => {
      fetchTickets();
    }, []);

    const filteredTickets = tickets.filter(t =>
      t.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Tickets Management</h3>
          <button onClick={fetchTickets} className="flex items-center px-3 py-2 text-blue-600 hover:bg-blue-50 rounded">
            <RefreshCw className="h-4 w-4 mr-2" /> Refresh
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8 text-gray-600 flex items-center justify-center">
            <Activity className="h-5 w-5 animate-spin mr-2" />
            Loading tickets...
          </div>
        ) : filteredTickets.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-200 text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 border">Ticket ID</th>
                  <th className="px-4 py-2 border">Name</th>
                  <th className="px-4 py-2 border">Type</th>
                  <th className="px-4 py-2 border">Route</th>
                  <th className="px-4 py-2 border">Price</th>
                  <th className="px-4 py-2 border">Status</th>
                  <th className="px-4 py-2 border">User</th>
                  <th className="px-4 py-2 border">Email</th>
                </tr>
              </thead>
              <tbody>
                {filteredTickets.map((t, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-4 py-2 border">{t.ticketId}</td>
                    <td className="px-4 py-2 border">{t.name}</td>
                    <td className="px-4 py-2 border">{t.type}</td>
                    <td className="px-4 py-2 border">{t.route}</td>
                    <td className="px-4 py-2 border">{t.price}</td>
                    <td className="px-4 py-2 border">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        t.status === "active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                      }`}>
                        {t.status}
                      </span>
                    </td>
                    <td className="px-4 py-2 border">{t.username}</td>
                    <td className="px-4 py-2 border">{t.email}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-6 text-gray-500">
            <Ticket className="mx-auto h-12 w-12 text-gray-400" />
            <p>No tickets found.</p>
          </div>
        )}
      </div>
    );
  };

  const SettingsContent = () => (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900">System Settings</h3>
      <p className="text-gray-600 mt-2">Configure your system preferences.</p>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <DashboardContent />;
      case 'users': return <UsersContent />;
      case 'orders': return <OrdersContent />;
      case 'settings': return <SettingsContent />;
      default: return <DashboardContent />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`w-64 bg-gradient-to-b from-blue-600 to-blue-800 transform 
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform md:translate-x-0 shadow-xl`}>
        <div className="flex items-center justify-center h-16 bg-blue-800">
          <h1 className="text-white text-xl font-bold">Admin Panel</h1>
        </div>
        <nav className="mt-8 px-4 space-y-2">
          <button onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center px-4 py-3 rounded-lg ${activeTab === 'dashboard' ? 'bg-blue-500 text-white' : 'text-blue-100 hover:bg-blue-600'}`}>
            <BarChart3 className="mr-3 h-5 w-5" /> Dashboard
          </button>
          <button onClick={() => setActiveTab('users')}
            className={`w-full flex items-center px-4 py-3 rounded-lg ${activeTab === 'users' ? 'bg-blue-500 text-white' : 'text-blue-100 hover:bg-blue-600'}`}>
            <Users className="mr-3 h-5 w-5" /> Users
          </button>
          <button onClick={() => setActiveTab('orders')}
            className={`w-full flex items-center px-4 py-3 rounded-lg ${activeTab === 'orders' ? 'bg-blue-500 text-white' : 'text-blue-100 hover:bg-blue-600'}`}>
            <ShoppingCart className="mr-3 h-5 w-5" /> Tickets
          </button>
          <button onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center px-4 py-3 rounded-lg ${activeTab === 'settings' ? 'bg-blue-500 text-white' : 'text-blue-100 hover:bg-blue-600'}`}>
            <Settings className="mr-3 h-5 w-5" /> Settings
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow-sm border-b h-16 flex items-center justify-between px-6">
          <div className="flex items-center space-x-4">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="md:hidden text-gray-600">
              <Menu className="h-6 w-6" />
            </button>
            <div className="flex items-center bg-gray-50 rounded-lg px-4 py-2 w-72">
              <Search className="h-5 w-5 text-gray-400 mr-3" />
              <input type="text" placeholder="Search..."
                value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                className="bg-transparent outline-none flex-1 text-sm" />
            </div>
          </div>
          <button onClick={handleLogout} className="flex items-center px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-600 hover:text-white">
            <LogOut className="h-5 w-5 mr-2" /> Logout
          </button>
        </header>

        <main className="flex-1 p-6 overflow-y-auto">
          <h1 className="text-2xl font-bold mb-2 capitalize">{activeTab}</h1>
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

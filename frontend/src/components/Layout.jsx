import { useContext } from 'react';
import { Navigate, Outlet, Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LayoutDashboard, Database, LogOut, Zap } from 'lucide-react';

const Sidebar = () => {
    const { logout, user } = useContext(AuthContext);
    const location = useLocation();

    return (
        <div className="w-64 bg-[#0A0A0A] border-r border-[#1F1F1F] h-screen p-5 flex flex-col">
            <div className="flex items-center space-x-3 mb-10 px-2 mt-2">
                <div className="w-8 h-8 rounded bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
                    <Zap size={16} className="text-white" fill="white" />
                </div>
                <h1 className="text-lg font-bold text-white tracking-wide">AI Gateway</h1>
            </div>
            
            <div className="flex-1 space-y-1">
                <Link to="/dashboard" className={`flex items-center space-x-3 text-sm font-medium px-3 py-2.5 rounded-lg transition-colors ${location.pathname === '/dashboard' ? 'bg-[#1A1A1A] text-white border border-[#333]' : 'text-gray-400 hover:text-white hover:bg-[#111]'}`}>
                  <LayoutDashboard size={18} /> <span>Dashboard</span>
                </Link>
                {user?.email === 'admin@admin.com' && (
                  <Link to="/admin" className={`flex items-center space-x-3 text-sm font-medium px-3 py-2.5 rounded-lg transition-colors ${location.pathname === '/admin' ? 'bg-[#1A1A1A] text-white border border-[#333]' : 'text-gray-400 hover:text-white hover:bg-[#111]'}`}>
                    <Database size={18} /> <span>Admin Panel</span>
                  </Link>
                )}
            </div>

            <div className="border-t border-[#1F1F1F] pt-4 mt-auto">
                <div className="flex items-center justify-between px-2">
                    <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-200 truncate w-36">{user?.name}</span>
                        <span className="text-xs text-blue-400 font-medium">${user?.credits?.toFixed(2)}</span>
                    </div>
                    <button onClick={logout} className="text-gray-500 hover:text-white transition-colors p-2 rounded-lg hover:bg-[#111]" title="Sign out">
                        <LogOut size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
}

export const Layout = () => {
    const { user } = useContext(AuthContext);

    if (!user) return <Navigate to="/login" replace />;

    return (
        <div className="flex h-screen bg-[#050505] text-white overflow-hidden">
            <Sidebar />
            <main className="flex-1 overflow-y-auto p-8 lg:p-12">
                <Outlet />
            </main>
        </div>
    );
};

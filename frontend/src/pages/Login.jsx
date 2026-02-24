import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Navigate, useNavigate } from 'react-router-dom';
import { KeyRound, Mail, Lock, User, ArrowRight, Zap } from 'lucide-react';

export default function Login() {
  const { login, register, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (user) return <Navigate to="/dashboard" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      if (isLogin) {
        await login(formData.email, formData.password);
      } else {
        await register(formData.name, formData.email, formData.password);
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Authentication failed');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Dynamic Background Effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/20 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="w-full max-w-[420px] relative z-10">
        
        {/* Logo or Brand */}
        <div className="flex flex-col items-center justify-center mb-8">
            <div className="w-12 h-12 bg-gradient-to-tr from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center mb-4 shadow-[0_0_40px_rgba(59,130,246,0.4)]">
                <Zap size={24} className="text-white" fill="white" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white mb-2">
                OpenRouter <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Clone</span>
            </h1>
            <p className="text-gray-400 text-sm">
                The unified AI API Gateway
            </p>
        </div>

        {/* Card */}
        <div className="bg-[#0A0A0A] border border-[#1F1F1F] rounded-2xl shadow-2xl p-8 backdrop-blur-xl relative">
         <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
         
         <h2 className="text-xl font-semibold text-white mb-6">
            {isLogin ? 'Sign in to your account' : 'Create your account'}
         </h2>
         
         {error && (
             <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg mb-6 text-sm flex items-start space-x-2 animate-in fade-in slide-in-from-top-2">
                <div className="mt-0.5"><KeyRound size={16} /></div>
                <span>{error}</span>
             </div>
         )}

         <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
                <div className="space-y-1.5">
                  <label className="text-gray-400 text-xs font-medium uppercase tracking-wider">Full Name</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User size={16} className="text-gray-500" />
                    </div>
                    <input 
                      required 
                      placeholder="John Doe" 
                      className="w-full bg-[#111] border border-[#222] rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all" 
                      onChange={e => setFormData({...formData, name: e.target.value})} 
                    />
                  </div>
                </div>
            )}
            
            <div className="space-y-1.5">
              <label className="text-gray-400 text-xs font-medium uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail size={16} className="text-gray-500" />
                </div>
                <input 
                  type="email" 
                  required 
                  placeholder="you@example.com" 
                  className="w-full bg-[#111] border border-[#222] rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all" 
                  onChange={e => setFormData({...formData, email: e.target.value})} 
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-gray-400 text-xs font-medium uppercase tracking-wider">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock size={16} className="text-gray-500" />
                </div>
                <input 
                  type="password" 
                  required 
                  placeholder="••••••••"
                  className="w-full bg-[#111] border border-[#222] rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all" 
                  onChange={e => setFormData({...formData, password: e.target.value})} 
                />
              </div>
            </div>

            <button 
                type="submit" 
                disabled={isLoading}
                className="w-full group bg-white hover:bg-gray-100 text-black font-semibold py-2.5 px-4 rounded-lg transition-all flex items-center justify-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed mt-6"
            >
                <span>{isLoading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}</span>
                {!isLoading && <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />}
            </button>
         </form>
        </div>

        <p className="mt-8 text-center text-sm text-gray-400">
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <button 
                onClick={() => { setIsLogin(!isLogin); setError(''); }} 
                className="ml-2 text-white hover:text-blue-400 font-medium transition-colors"
            >
                {isLogin ? 'Register now' : 'Sign in instead'}
            </button>
        </p>
      </div>
    </div>
  );
}

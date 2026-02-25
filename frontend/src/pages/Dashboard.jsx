import { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../lib/api';
import { CreditCard, KeyRound, Copy, Trash2, ShieldCheck, Activity, Terminal } from 'lucide-react';

export default function Dashboard() {
    const { user, setUser } = useContext(AuthContext);
    const [amount, setAmount] = useState(10);
    const [loading, setLoading] = useState(false);
    const [keys, setKeys] = useState([]);
    const [newKey, setNewKey] = useState(null);

    const fetchKeys = async () => {
        try {
            const res = await api.get('/keys');
            setKeys(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    // Auto-refresh user profile to get latest credits after a redirect
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('payment') === 'success') {
             api.get('/auth/me').then(res => setUser(res.data)).catch(console.error);
             // remove query param
             window.history.replaceState({}, document.title, window.location.pathname);
        }
        fetchKeys();
    }, [setUser]);

    const handleCheckout = async () => {
        setLoading(true);
        try {
            const res = await api.post('/billing/create-checkout-session', { amount });
            window.location.href = res.data.url;
        } catch (err) {
            console.error('Checkout error:', err);
            alert('Failed to initiate checkout');
            setLoading(false);
        }
    };

    const generateKey = async () => {
        try {
            const res = await api.post('/keys');
            setNewKey(res.data.api_key);
            fetchKeys();
        } catch (err) {
            alert('Failed to generate key');
        }
    };

    const deleteKey = async (id) => {
        if (!confirm('Are you sure you want to revoke this key?')) return;
        try {
            await api.delete(`/keys/${id}`);
            fetchKeys();
        } catch (err) {
            alert('Failed to delete key');
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        // Optional: Could add a toast notification here
    };

    return (
        <div className="max-w-6xl mx-auto pb-12">
            <header className="mb-10">
                <h1 className="text-3xl font-bold text-white tracking-tight">Dashboard</h1>
                <p className="text-gray-400 mt-2">Manage your API keys, billing, and monitor usage.</p>
            </header>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                {/* Credits Widget */}
                <div className="bg-[#0A0A0A] border border-[#1F1F1F] rounded-2xl p-6 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-medium text-gray-200">Balance</h2>
                        <div className="p-2 bg-blue-500/10 rounded-lg">
                            <Activity size={18} className="text-blue-400" />
                        </div>
                    </div>
                    <div className="text-5xl font-bold text-white mb-2 tracking-tight">
                        ${user?.credits?.toFixed(2) || '0.00'}
                    </div>
                    <p className="text-sm text-gray-500 mb-8">Available API Credits</p>
                    
                    <div className="border-t border-[#1F1F1F] pt-6">
                        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Add Funds</h3>
                        <div className="grid grid-cols-4 gap-2 mb-4">
                            {[10, 20, 50, 100].map(val => (
                                <button 
                                    key={val}
                                    onClick={() => setAmount(val)}
                                    className={`py-2 rounded-lg border text-sm font-medium transition-all ${
                                        amount === val 
                                        ? 'bg-blue-600 border-blue-500 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]' 
                                        : 'bg-[#111] border-[#333] text-gray-400 hover:border-gray-500 hover:text-white'
                                    }`}
                                >
                                    ${val}
                                </button>
                            ))}
                        </div>
                        <button 
                            onClick={handleCheckout}
                            disabled={loading}
                            className="w-full bg-white text-black font-semibold py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
                        >
                            <CreditCard size={18} />
                            <span>{loading ? 'Processing...' : `Add $${amount} via Stripe`}</span>
                        </button>
                    </div>
                </div>

                {/* API Keys Widget */}
                <div className="lg:col-span-2 bg-[#0A0A0A] border border-[#1F1F1F] rounded-2xl p-6 flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-lg font-medium text-gray-200">API Keys</h2>
                            <p className="text-sm text-gray-500 mt-1">Keys used to authenticate requests to the Gateway.</p>
                        </div>
                        <button 
                            onClick={generateKey}
                            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2 shadow-lg shadow-blue-500/20"
                        >
                            <KeyRound size={16} />
                            <span>Create Key</span>
                        </button>
                    </div>

                    {newKey && (
                        <div className="mb-6 bg-green-500/10 border border-green-500/30 rounded-xl p-5 relative">
                            <div className="flex items-start space-x-3">
                                <ShieldCheck className="text-green-400 mt-0.5" size={20} />
                                <div className="flex-1">
                                    <h3 className="text-green-400 font-medium mb-1">Save your secret key</h3>
                                    <p className="text-green-400/80 text-sm mb-3">Please copy this key now. For your security, it won't be shown again.</p>
                                    <div className="flex items-center group relative">
                                        <input 
                                            readOnly 
                                            value={newKey} 
                                            className="w-full bg-[#050505] border border-green-500/30 rounded-l-lg py-2.5 px-3 text-green-300 font-mono text-sm focus:outline-none"
                                        />
                                        <button 
                                            onClick={() => copyToClipboard(newKey)}
                                            className="bg-green-600 hover:bg-green-500 text-white px-4 py-2.5 rounded-r-lg border border-green-600 hover:border-green-500 transition-colors flex items-center justify-center"
                                            title="Copy to clipboard"
                                        >
                                            <Copy size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex-1 border border-[#1F1F1F] rounded-xl overflow-hidden bg-[#050505]">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-[#111] border-b border-[#1F1F1F]">
                                    <th className="px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Name</th>
                                    <th className="px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Key Hint</th>
                                    <th className="px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Created</th>
                                    <th className="px-5 py-3 text-right"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#1F1F1F]">
                                {keys.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="px-5 py-12 text-center text-gray-500">
                                            <KeyRound size={24} className="mx-auto mb-3 opacity-20" />
                                            No active API keys found.
                                        </td>
                                    </tr>
                                ) : keys.map(k => (
                                    <tr key={k.id} className="group hover:bg-[#111] transition-colors">
                                        <td className="px-5 py-4 text-sm font-medium text-gray-200">{k.name}</td>
                                        <td className="px-5 py-4 text-sm text-gray-500 font-mono">sk_live_...</td>
                                        <td className="px-5 py-4 text-sm text-gray-500">{new Date(k.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric'})}</td>
                                        <td className="px-5 py-4 text-right">
                                            <button 
                                                onClick={() => deleteKey(k.id)} 
                                                className="text-gray-500 hover:text-red-400 transition-colors p-2 rounded-lg hover:bg-red-500/10 opacity-0 group-hover:opacity-100 focus:opacity-100"
                                                title="Revoke Key"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Integration Instructions */}
            <div className="bg-[#0A0A0A] border border-[#1F1F1F] rounded-2xl p-6">
                 <div className="flex items-center space-x-3 mb-4">
                     <Terminal className="text-gray-400" size={20} />
                     <h2 className="text-lg font-medium text-gray-200">Integration Gateway</h2>
                 </div>
                 <p className="text-sm text-gray-500 mb-6">Use your API key to interact with OpenAI-compatible endpoints. The gateway will automatically route requests to the specified model platform (OpenAI, Gemini, or Claude). Replace `https://api.openai.com/v1` with your Gateway URL.</p>
                 
                 <div className="bg-[#050505] p-5 rounded-xl border border-[#1F1F1F] overflow-x-auto">
<pre className="text-sm text-gray-300 font-mono">
<span className="text-purple-400">curl</span> <span className="text-yellow-300">https://api.yourgateway.com/v1/chat/completions</span> \
  <span className="text-blue-400">-H</span> <span className="text-green-300">"Content-Type: application/json"</span> \
  <span className="text-blue-400">-H</span> <span className="text-green-300">"Authorization: Bearer $OPENROUTER_API_KEY"</span> \
  <span className="text-blue-400">-d</span> <span className="text-green-300">'{'{'}
  "model": "gpt-4o",
  "messages": [
    {'{'}
      "role": "user",
      "content": "What is the meaning of life?"
    {'}'}
  ]
{'}'}'</span>
</pre>
                 </div>
            </div>
        </div>
    );
}

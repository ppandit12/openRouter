import { useState, useEffect } from 'react';
import api from '../lib/api';
import { Users, DollarSign, Activity } from 'lucide-react';

export default function Admin() {
    const [stats, setStats] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get('/admin/stats');
                setStats(res.data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchStats();
    }, []);

    return (
        <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold mb-8">Admin Overview</h1>
            
            {!stats ? (
                <div className="text-gray-500">Loading metrics...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 flex items-center space-x-4">
                        <div className="p-4 bg-blue-900/30 text-blue-400 rounded-full">
                            <Users size={24} />
                        </div>
                        <div>
                            <p className="text-gray-400 text-sm">Total Users</p>
                            <h3 className="text-2xl font-bold">{stats.total_users}</h3>
                        </div>
                    </div>

                    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 flex items-center space-x-4">
                        <div className="p-4 bg-green-900/30 text-green-400 rounded-full">
                            <DollarSign size={24} />
                        </div>
                        <div>
                            <p className="text-gray-400 text-sm">Total Revenue</p>
                            <h3 className="text-2xl font-bold">${stats.total_revenue.toFixed(2)}</h3>
                        </div>
                    </div>

                    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 flex items-center space-x-4">
                        <div className="p-4 bg-purple-900/30 text-purple-400 rounded-full">
                            <Activity size={24} />
                        </div>
                        <div>
                            <p className="text-gray-400 text-sm">Tokens Processed</p>
                            <h3 className="text-2xl font-bold">{stats.total_tokens_used.toLocaleString()}</h3>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

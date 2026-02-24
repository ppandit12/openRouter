const User = require('../models/User');
const UsageLog = require('../models/UsageLog');
const Payment = require('../models/Payment');

exports.getStats = async (req, res) => {
  // Validate admin... omitted for brevity or implement checking req.user.role if added
  try {
    const totalUsers = await User.countDocuments();
    
    const usageAggr = await UsageLog.aggregate([
      { $match: { status: 'success' } },
      { $group: {
          _id: null,
          total_tokens: { $sum: '$total_tokens' },
          total_cost: { $sum: '$total_cost' }
      }}
    ]);
    
    const paymentsAggr = await Payment.aggregate([
        { $match: { status: 'completed' } },
        { $group: {
            _id: null,
            total_revenue: { $sum: '$amount' }
        }}
    ]);
    
    res.json({
        total_users: totalUsers,
        total_tokens_used: usageAggr[0]?.total_tokens || 0,
        total_cost_incurred: usageAggr[0]?.total_cost || 0,
        total_revenue: paymentsAggr[0]?.total_revenue || 0
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

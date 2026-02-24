const crypto = require('crypto');
const bcrypt = require('bcrypt');
const ApiKey = require('../models/ApiKey');

exports.generateKey = async (req, res) => {
  try {
    // Generate a unique API key
    const rawKey = 'sk_live_' + crypto.randomBytes(24).toString('hex');
    
    // Hash it before saving
    const salt = await bcrypt.genSalt(10);
    const hashedKey = await bcrypt.hash(rawKey, salt);
    
    const newApiKey = new ApiKey({
      user_id: req.user.id,
      api_key_hash: hashedKey
    });
    
    await newApiKey.save();
    
    // Return the raw key ONLY ONCE. It cannot be retrieved again.
    res.json({ api_key: rawKey, created_at: newApiKey.created_at });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.getKeys = async (req, res) => {
  try {
    const keys = await ApiKey.find({ user_id: req.user.id }).sort({ created_at: -1 });
    // Don't return hashes to the user, just the IDs/created_at to show they exist
    const safeKeys = keys.map(k => ({
      id: k._id,
      created_at: k.created_at,
      name: 'Secret Key' // Add a name field if you expand the schema later
    }));
    
    res.json(safeKeys);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.deleteKey = async (req, res) => {
  try {
    const api_key = await ApiKey.findById(req.params.id);
    
    if (!api_key) return res.status(404).json({ msg: 'API key not found' });
    
    // Make sure user owns this key
    if (api_key.user_id.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    await api_key.deleteOne();
    res.json({ msg: 'API key removed' });
  } catch (err) {
    if (err.kind === 'ObjectId') {
        return res.status(404).json({ msg: 'API key not found' });
    }
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

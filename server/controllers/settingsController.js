const Settings = require('../models/Settings');

const getSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) settings = await Settings.create({}); 
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: "Sync failed" });
  }
};

const updateSettings = async (req, res) => {
  try {
    const settings = await Settings.findOneAndUpdate({}, req.body, { 
returnDocument: 'after',
      upsert: true 
    });
    res.json({ success: true, settings });
  } catch (error) {
    res.status(500).json({ message: "Update failed" });
  }
};

module.exports = { getSettings, updateSettings };
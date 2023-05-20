const mongoose = require('mongoose');

// Schema for statistics data
const statisticsSchema = new mongoose.Schema({
  registeredMembers: { type: Number, default: 0 },
  activeMembers: { type: Number, default: 0 },
  registeredBarbershops: { type: Number, default: 0 },
  activeBarbershops: { type: Number, default: 0 },
  assignedDigitalStamps: { type: Number, default: 0 },
  participatedBeardContest: { type: Number, default: 0 },
});

const Statistics = mongoose.model('Statistics', statisticsSchema);

module.exports = Statistics;

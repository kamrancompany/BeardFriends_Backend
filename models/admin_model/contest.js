const mongoose = require('mongoose');

const contestSchema = new mongoose.Schema({
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  }
});

const Contest = mongoose.model('Contest', contestSchema);

module.exports = Contest;

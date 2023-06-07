const mongoose = require('mongoose');

const participationSchema = new mongoose.Schema({
  barberId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Barbers',
    required: true
  },
  picture: {
    type: String,
    required: true
  },
  votes: {
    type: Number,
    default: 0
  },
  isBlocked: {
    type: Boolean,
    default: false
  },
  voters: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Members'
  }]
});

const Participation = mongoose.model('Participation', participationSchema);

module.exports = Participation;

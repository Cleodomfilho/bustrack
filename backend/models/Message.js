const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  receiverRole: { type: String, enum: ['responsavel', 'motorista', 'all'], default: 'responsavel' },
  text: { type: String, required: true },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Message', MessageSchema);

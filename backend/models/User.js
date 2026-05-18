const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  telefone: { type: String },
  password: { type: String },
  role: { type: String, required: true, enum: ['responsavel', 'motorista'] },
  criadoEm: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);

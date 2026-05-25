const mongoose = require('mongoose');

const AlertSchema = new mongoose.Schema({
  vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: {
    type: String,
    required: true,
    enum: ['em_transito', 'em_rota', 'chegou_ao_local', 'pneu_furado', 'quebrado', 'nao_disponivel', 'chegou_ao_destino']
  },
  label: { type: String, required: true },
  message: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Alert', AlertSchema);

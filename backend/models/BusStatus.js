const mongoose = require('mongoose');

const BusStatusSchema = new mongoose.Schema({
  busId: {
    type: String,
    required: true,
    default: 'onibus_07'
  },
  status: {
    type: String,
    required: true,
    enum: ['em_transito', 'parado', 'pneu_furado', 'nao_ira_circular', 'atrasado', 'em_rota', 'rota_finalizada']
  },
  label: {
    type: String,
    required: true
  },
  message: {
    type: String,
    default: ''
  },
  sentTo: {
    type: Number,
    default: 0
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('BusStatus', BusStatusSchema);

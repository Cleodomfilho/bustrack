const mongoose = require('mongoose');

const ResponsavelSchema = new mongoose.Schema({
    nome: {
        type: String,
        required: true
    },
    telefone: {
        type: String,
        required: true
    },
    aluno: {
        type: String,
        required: true
    },
    criadoEm: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Responsavel', ResponsavelSchema);

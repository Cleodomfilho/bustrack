const express = require('express');
const router = express.Router();
const BusStatus = require('../models/BusStatus');
const Message = require('../models/Message');
const User = require('../models/User');

// Retorna o status atual do ônibus
router.get('/current', async (req, res) => {
  try {
    const status = await BusStatus.findOne({ busId: 'onibus_07' }).sort({ updatedAt: -1 });

    if (!status) {
      return res.json({
        busId: 'onibus_07',
        status: 'em_transito',
        label: 'Em Trânsito',
        message: 'Ônibus em trânsito normalmente.',
        sentTo: 12,
        updatedAt: new Date()
      });
    }

    res.json(status);
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
});

// Atualiza o status do ônibus
router.post('/', async (req, res) => {
  try {
    const { busId = 'onibus_07', status, label, message = '', sentTo = 12, senderId = null, senderRole = null } = req.body;

    if (!status || !label) {
      return res.status(400).json({ erro: 'Status e label são obrigatórios.' });
    }

    const novoStatus = new BusStatus({ busId, status, label, message, sentTo });
    const salvo = await novoStatus.save();

    const smsBody = `${label} - Ônibus escolar. ${message || 'Sem mensagem adicional.'}`;

    // Determina nome do remetente, se fornecido
    let senderName = 'Motorista';
    if (senderId) {
      try {
        const s = await User.findById(senderId);
        if (s) senderName = s.nome;
      } catch (err) {
        // ignore
      }
    }

    // Se motorista marcou em_rota, crie mensagem específica para responsáveis
    if (status === 'em_rota' && senderRole === 'motorista') {
      const text = `${senderName} está em rota. ${message || ''}`.trim();
      const msg = new Message({ senderId: senderId || null, receiverRole: 'responsavel', text });
      await msg.save();
    } else {
      // Comportamento padrão: broadcast para responsáveis e motoristas
      const msgForResponsaveis = new Message({ senderId: senderId || null, receiverRole: 'responsavel', text: smsBody });
      const msgForMotoristas = new Message({ senderId: senderId || null, receiverRole: 'motorista', text: smsBody });
      await Promise.all([msgForResponsaveis.save(), msgForMotoristas.save()]);
    }

    res.status(201).json({
      status: salvo,
      message: 'Status salvo e mensagens internas criadas.'
    });
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
});

// Histórico de status do ônibus
router.get('/history', async (req, res) => {
  try {
    const history = await BusStatus.find({ busId: 'onibus_07' }).sort({ updatedAt: -1 }).limit(10);
    res.json(history);
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
});

module.exports = router;

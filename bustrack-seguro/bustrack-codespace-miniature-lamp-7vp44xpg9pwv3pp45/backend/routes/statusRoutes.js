const express = require('express');
const router = express.Router();
const BusStatus = require('../models/BusStatus');
const Message = require('../models/Message');
const User = require('../models/User');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');
const { sanitizeString } = require('../middleware/security');

router.get('/current', authMiddleware, async (req, res) => {
  try {
    const status = await BusStatus.findOne({ busId: 'onibus_07' }).sort({ updatedAt: -1 });
    res.json(status || {});
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.post('/', authMiddleware, roleMiddleware('motorista'), async (req, res) => {
  try {
    const { busId = 'onibus_07', status, label, message = '', sentTo = 12 } = req.body;

    if (!status || !label) {
      return res.status(400).json({ error: 'Status e label são obrigatórios.' });
    }

    const cleanMessage = sanitizeString(message);
    const cleanLabel = sanitizeString(label);

    const novoStatus = new BusStatus({ busId, status, label: cleanLabel, message: cleanMessage, sentTo });
    const salvo = await novoStatus.save();

    const sender = await User.findById(req.user.id);
    const senderName = sender?.nome || 'Motorista';

    const text = `${senderName}: ${cleanLabel} - ${cleanMessage}`;

    await Promise.all([
      new Message({ senderId: req.user.id, receiverRole: 'responsavel', text }).save(),
      new Message({ senderId: req.user.id, receiverRole: 'motorista', text }).save()
    ]);

    res.status(201).json({ status: salvo });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.get('/history', authMiddleware, async (req, res) => {
  try {
    const history = await BusStatus.find({ busId: 'onibus_07' }).sort({ updatedAt: -1 }).limit(10);
    res.json(history);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;

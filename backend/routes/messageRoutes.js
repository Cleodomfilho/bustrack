const express = require('express');
const router = express.Router();
const Message = require('../models/Message');

// Listar mensagens por receiverId ou receiverRole
router.get('/', async (req, res) => {
  try {
    const { receiverId, receiverRole } = req.query;
    const filtro = {};
    if (receiverId) filtro.receiverId = receiverId;
    if (receiverRole) filtro.receiverRole = receiverRole;
    const msgs = await Message.find(filtro).sort({ createdAt: -1 }).limit(100);
    res.json(msgs);
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
});

// Marcar mensagem como lida
router.patch('/:id/read', async (req, res) => {
  try {
    const { id } = req.params;
    const msg = await Message.findByIdAndUpdate(id, { read: true }, { new: true });
    if (!msg) return res.status(404).json({ erro: 'mensagem não encontrada' });
    res.json(msg);
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
});

module.exports = router;

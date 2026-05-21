const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const { authMiddleware } = require('../middleware/auth');
const { validateObjectId } = require('../middleware/security');

router.get('/', authMiddleware, async (req, res) => {
  try {
    const { receiverId, receiverRole } = req.query;
    const filtro = {};
    if (receiverId) filtro.receiverId = receiverId;
    if (receiverRole) filtro.receiverRole = receiverRole;
    const msgs = await Message.find(filtro).sort({ createdAt: -1 }).limit(50);
    res.json(msgs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.patch('/:id/read', authMiddleware, validateObjectId, async (req, res) => {
  try {
    const msg = await Message.findByIdAndUpdate(req.params.id, { read: true }, { new: true });
    if (!msg) return res.status(404).json({ error: 'Mensagem não encontrada' });
    res.json(msg);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const Alert = require('../models/Alert');
const Vehicle = require('../models/Vehicle');
const User = require('../models/User');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

router.post('/', authMiddleware, roleMiddleware('motorista'), async (req, res) => {
  try {
    const { vehicleId, status, label, message } = req.body;
    if (!vehicleId || !status || !label) {
      return res.status(400).json({ error: 'vehicleId, status e label são obrigatórios' });
    }

    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) return res.status(404).json({ error: 'Veículo não encontrado' });
    if (vehicle.driver.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Você só pode enviar alertas para seu veículo' });
    }

    const alert = new Alert({
      vehicle: vehicle._id,
      sender: req.user.id,
      status,
      label,
      message: message ? message.trim() : ''
    });
    await alert.save();

    res.status(201).json(alert);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });

    let vehicleId = user.vehicle;
    if (user.role === 'motorista') {
      const vehicle = await Vehicle.findOne({ driver: user._id });
      if (!vehicle) return res.status(404).json({ error: 'Nenhum veículo cadastrado' });
      vehicleId = vehicle._id;
    }

    if (!vehicleId) {
      return res.status(404).json({ error: 'Nenhum veículo associado ao usuário' });
    }

    const alerts = await Alert.find({ vehicle: vehicleId })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate('sender', 'nome email');

    const alertsWithPersonalizedMessage = alerts.map((alert) => {
      const senderName = alert.sender?.nome || 'Motorista';
      const baseText = alert.message ? `${alert.label}. ${alert.message}` : alert.label;
      let personalizedMessage = baseText;

      if (user.role === 'aluno') {
        personalizedMessage = `Olá! ${senderName} informou: ${baseText}`;
      } else if (user.role === 'responsavel') {
        personalizedMessage = `Olá responsável! ${senderName} enviou um aviso para seu aluno: ${baseText}`;
      } else {
        personalizedMessage = `Você enviou: ${baseText}`;
      }

      return {
        ...alert.toObject(),
        personalizedMessage
      };
    });

    res.json(alertsWithPersonalizedMessage);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/latest', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });

    let vehicleId = user.vehicle;
    if (user.role === 'motorista') {
      const vehicle = await Vehicle.findOne({ driver: user._id });
      if (!vehicle) return res.status(404).json({ error: 'Nenhum veículo cadastrado' });
      vehicleId = vehicle._id;
    }

    if (!vehicleId) return res.status(404).json({ error: 'Nenhum veículo associado ao usuário' });

    const latestAlert = await Alert.findOne({ vehicle: vehicleId }).sort({ createdAt: -1 });
    res.json(latestAlert || {});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

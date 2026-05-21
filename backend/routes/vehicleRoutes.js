const express = require('express');
const router = express.Router();
const Vehicle = require('../models/Vehicle');
const User = require('../models/User');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

router.get('/', async (req, res) => {
  try {
    const vehicles = await Vehicle.find().populate('driver', 'nome email');
    res.json(vehicles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/mine', authMiddleware, roleMiddleware('motorista'), async (req, res) => {
  try {
    const vehicle = await Vehicle.findOne({ driver: req.user.id });
    if (!vehicle) return res.status(404).json({ error: 'Nenhum veículo cadastrado para este motorista' });
    res.json(vehicle);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', authMiddleware, roleMiddleware('motorista'), async (req, res) => {
  try {
    const { name, plate, route } = req.body;
    if (!name || !plate || !route) {
      return res.status(400).json({ error: 'Nome, placa e rota do veículo são obrigatórios' });
    }

    const existing = await Vehicle.findOne({ $or: [{ plate: plate.trim().toUpperCase() }, { driver: req.user.id }] });
    if (existing) {
      return res.status(409).json({ error: 'O motorista já tem um veículo cadastrado ou a placa já existe' });
    }

    const vehicle = new Vehicle({
      name: name.trim(),
      plate: plate.trim().toUpperCase(),
      route: route.trim(),
      driver: req.user.id
    });
    await vehicle.save();

    await User.findByIdAndUpdate(req.user.id, { vehicle: vehicle._id });

    res.status(201).json(vehicle);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id).populate('driver', 'nome email');
    if (!vehicle) return res.status(404).json({ error: 'Veículo não encontrado' });
    res.json(vehicle);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Vehicle = require('../models/Vehicle');
const { authMiddleware } = require('../middleware/auth');

const createToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    process.env.JWT_SECRET || 'bustrack-secret',
    { expiresIn: '7d' }
  );
};

router.post('/register', async (req, res) => {
  try {
    const { nome, email, password, role, vehiclePlate } = req.body;
    if (!nome || !email || !password || !role) {
      return res.status(400).json({ error: 'nome, email, senha e role são obrigatórios' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) return res.status(409).json({ error: 'Email já cadastrado' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const userData = {
      nome: nome.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role
    };

    if (vehiclePlate && ['aluno', 'responsavel'].includes(role)) {
      const vehicle = await Vehicle.findOne({ plate: vehiclePlate.trim().toUpperCase() });
      if (vehicle) {
        userData.vehicle = vehicle._id;
      }
    }

    const user = new User(userData);
    await user.save();

    const token = createToken(user);
    res.status(201).json({ token, user: { id: user._id, nome: user.nome, email: user.email, role: user.role, vehicle: user.vehicle } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'email e senha são obrigatórios' });

    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: 'Senha incorreta' });

    const token = createToken(user);
    res.json({ token, user: { id: user._id, nome: user.nome, email: user.email, role: user.role, vehicle: user.vehicle } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate({
      path: 'vehicle',
      populate: { path: 'driver', select: 'nome email' }
    });
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });
    res.json({ id: user._id, nome: user.nome, email: user.email, role: user.role, vehicle: user.vehicle });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.patch('/me/join', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });
    if (!['aluno', 'responsavel'].includes(user.role)) {
      return res.status(403).json({ error: 'Apenas aluno e responsável podem entrar em um veículo' });
    }

    const { vehiclePlate } = req.body;
    if (!vehiclePlate) return res.status(400).json({ error: 'Placa do veículo é obrigatória' });

    const vehicle = await Vehicle.findOne({ plate: vehiclePlate.trim().toUpperCase() });
    if (!vehicle) return res.status(404).json({ error: 'Veículo não encontrado' });

    user.vehicle = vehicle._id;
    await user.save();
    res.json({ message: 'Veículo associado com sucesso', vehicle });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

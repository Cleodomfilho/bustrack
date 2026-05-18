const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');

// Cadastro simples sem senha
router.post('/register', async (req, res) => {
  try {
    const { nome, username, role, password } = req.body;
    if (!nome || !role || !username || !password) return res.status(400).json({ erro: 'nome, username, role e password são obrigatórios' });

    const existing = await User.findOne({ username });
    if (existing) return res.status(409).json({ erro: 'username já existe' });

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    const usuario = new User({ nome, username, role, password: hashed });
    await usuario.save();
    res.status(201).json({ id: usuario._id, nome: usuario.nome, username: usuario.username, role: usuario.role });
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
});

// Login simples: usa telefone + senha (se existir)
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ erro: 'username e password são obrigatórios' });

    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ erro: 'usuário não encontrado' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ erro: 'senha incorreta' });

    res.json({ id: user._id, nome: user.nome, username: user.username, role: user.role });
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
});

// Lista todos usuários (opcional: filtrar por role)
router.get('/', async (req, res) => {
  try {
    const { role } = req.query;
    const filtro = {};
    if (role) filtro.role = role;
    const users = await User.find(filtro).sort({ criadoEm: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
});

module.exports = router;

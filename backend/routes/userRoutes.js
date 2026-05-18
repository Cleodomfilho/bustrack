const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');

// Cadastro simples sem senha
router.post('/register', async (req, res) => {
  try {
    const { nome, telefone, role, password } = req.body;
    if (!nome || !role) return res.status(400).json({ erro: 'nome e role obrigatórios' });

    // Se for motorista, exige senha
    let hashed = undefined;
    if (role === 'motorista') {
      if (!password) return res.status(400).json({ erro: 'motorista precisa de senha' });
      const salt = await bcrypt.genSalt(10);
      hashed = await bcrypt.hash(password, salt);
    }

    const usuario = new User({ nome, telefone, role, password: hashed });
    await usuario.save();
    res.status(201).json(usuario);
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
});

// Login simples: usa telefone + senha (se existir)
router.post('/login', async (req, res) => {
  try {
    const { telefone, password } = req.body;
    if (!telefone) return res.status(400).json({ erro: 'telefone é obrigatório' });

    const user = await User.findOne({ telefone });
    if (!user) return res.status(404).json({ erro: 'usuário não encontrado' });

    if (user.password) {
      // exige senha
      if (!password) return res.status(400).json({ erro: 'senha necessária' });
      const match = await bcrypt.compare(password, user.password);
      if (!match) return res.status(401).json({ erro: 'senha incorreta' });
    }

    res.json({ id: user._id, nome: user.nome, role: user.role });
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

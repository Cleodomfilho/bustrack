const express = require('express');
const router = express.Router();
const Responsavel = require('../models/Responsavel');

// Criar responsável
router.post('/', async (req, res) => {
    try {
        const novoResponsavel = new Responsavel(req.body);
        const salvo = await novoResponsavel.save();

        res.status(201).json(salvo);
    } catch (error) {
        res.status(500).json({ erro: error.message });
    }
});

// Buscar responsáveis
router.get('/', async (req, res) => {
    try {
        const responsaveis = await Responsavel.find();
        res.json(responsaveis);
    } catch (error) {
        res.status(500).json({ erro: error.message });
    }
});

module.exports = router;

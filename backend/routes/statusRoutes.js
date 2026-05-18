const express = require('express');
const router = express.Router();
const BusStatus = require('../models/BusStatus');
const Responsavel = require('../models/Responsavel');

const isZapConfigured = () => {
  return Boolean(process.env.ZAP_API_KEY);
};

const normalizePhoneNumber = (phone) => {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10 || digits.length === 11) {
    return `55${digits}`;
  }
  if (digits.length === 12 && digits.startsWith('55')) {
    return digits;
  }
  if (digits.length === 13 && digits.startsWith('055')) {
    return digits.slice(1);
  }
  return digits;
};

const sendZapToAllResponsaveis = async (body) => {
  if (!isZapConfigured()) {
    return { success: false, sentTo: 0, error: 'Zap API não configurada' };
  }

  const responsaveis = await Responsavel.find();
  const phones = responsaveis
    .map((item) => normalizePhoneNumber(item.telefone))
    .filter(Boolean);

  const apiKey = process.env.ZAP_API_KEY;
  let sentTo = 0;
  const errors = [];

  await Promise.allSettled(
    phones.map((phone) => {
      const url = `https://api.callmebot.com/whatsapp.php?phone=${phone}&text=${encodeURIComponent(body)}&apikey=${encodeURIComponent(apiKey)}`;
      return fetch(url);
    })
  ).then(async (results) => {
    for (const result of results) {
      if (result.status === 'fulfilled') {
        const response = result.value;
        if (response.ok) {
          sentTo += 1;
        } else {
          errors.push(`HTTP ${response.status}`);
        }
      } else {
        errors.push(result.reason?.message || String(result.reason));
      }
    }
  });

  return { success: sentTo > 0, sentTo, errors };
};

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
    const { busId = 'onibus_07', status, label, message = '', sentTo = 12 } = req.body;

    if (!status || !label) {
      return res.status(400).json({ erro: 'Status e label são obrigatórios.' });
    }

    const novoStatus = new BusStatus({ busId, status, label, message, sentTo });
    const salvo = await novoStatus.save();

    const smsBody = `${label} - Ônibus escolar. ${message || 'Sem mensagem adicional.'}`;
    const smsResult = await sendZapToAllResponsaveis(smsBody);

    res.status(201).json({
      status: salvo,
      sms: smsResult,
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

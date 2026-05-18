require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

app.use('/api/status', require('./routes/statusRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/messages', require('./routes/messageRoutes'));

// Health check
const mongoose = require('mongoose');
app.get('/_health', (req, res) => {
  const state = mongoose.connection.readyState; // 0 disconnected, 1 connected
  res.json({ status: 'ok', dbState: state });
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
});
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

const publicDir = path.join(__dirname, '..');
// Serve static files from project root (css, js, assets, html)
app.use(express.static(publicDir));
app.use('/css', express.static(path.join(publicDir, 'css')));
app.use('/js', express.static(path.join(publicDir, 'js')));
app.use('/assets', express.static(path.join(publicDir, 'assets')));

app.get(['/', '/index.html'], (req, res) => {
  res.sendFile(path.join(publicDir, 'index.html'));
});

app.get('/login.html', (req, res) => {
  res.sendFile(path.join(publicDir, 'login.html'));
});

app.get('/motorista.html', (req, res) => {
  res.sendFile(path.join(publicDir, 'motorista.html'));
});

app.get('/responsavel.html', (req, res) => {
  res.sendFile(path.join(publicDir, 'responsavel.html'));
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});

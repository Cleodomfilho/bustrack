require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

const authRoutes = require('./routes/userRoutes');
const vehicleRoutes = require('./routes/vehicleRoutes');
const alertRoutes = require('./routes/alertRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

if (!process.env.JWT_SECRET) {
  console.warn('Aviso: JWT_SECRET não configurado. Configure essa variável no Render para proteger os tokens.');
}

app.disable('x-powered-by');
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '1mb' }));

app.use('/api/auth', authRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/alerts', alertRoutes);

const publicDir = path.join(__dirname, '..');
app.use(express.static(publicDir));
app.use('/css', express.static(path.join(publicDir, 'css')));
app.use('/js', express.static(path.join(publicDir, 'js')));
app.use('/assets', express.static(path.join(publicDir, 'assets')));

app.get(['/','/index.html'], (req, res) => res.sendFile(path.join(publicDir, 'index.html')));
app.get('/login.html', (req, res) => res.sendFile(path.join(publicDir, 'login.html')));
app.get('/register.html', (req, res) => res.sendFile(path.join(publicDir, 'register.html')));
app.get('/motorista.html', (req, res) => res.sendFile(path.join(publicDir, 'motorista.html')));
app.get('/responsavel.html', (req, res) => res.sendFile(path.join(publicDir, 'responsavel.html')));
app.get('/aluno.html', (req, res) => res.sendFile(path.join(publicDir, 'aluno.html')));

app.get('/_health', (req, res) => {
  const dbState = ['disconnected', 'connected', 'connecting', 'disconnecting'][require('mongoose').connection.readyState] || 'unknown';
  res.status(dbState === 'connected' ? 200 : 503).json({ status: dbState === 'connected' ? 'ok' : 'starting', dbState });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

app.use((err, req, res, next) => {
  console.error('Erro interno:', err);
  res.status(500).json({ error: 'Erro interno no servidor' });
});

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT}`);
    });
  } catch (error) {
    console.error('Falha ao iniciar servidor:', error.message);
    process.exit(1);
  }
};

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

startServer();

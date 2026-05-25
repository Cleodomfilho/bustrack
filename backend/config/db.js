const mongoose = require('mongoose');

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    throw new Error('MONGO_URI não foi configurado. Defina essa variável no Render em Environment.');
  }

  mongoose.connection.on('connected', () => {
    console.log('MongoDB Atlas conectado com sucesso');
  });

  mongoose.connection.on('error', (error) => {
    console.error('Erro na conexão com MongoDB:', error.message);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('MongoDB desconectado. O Mongoose tentará reconectar automaticamente.');
  });

  await mongoose.connect(mongoUri, {
    dbName: process.env.MONGO_DB_NAME || undefined,
    serverSelectionTimeoutMS: 10000,
    maxPoolSize: 10,
    autoIndex: process.env.NODE_ENV !== 'production'
  });

  await mongoose.connection.db.admin().ping();
};

module.exports = connectDB;

const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            dbName: process.env.MONGO_DB_NAME || undefined,
            autoIndex: true,
        });

        await mongoose.connection.db.admin().ping();
        console.log('MongoDB Atlas conectado com sucesso');
    } catch (error) {
        console.error('Erro ao conectar no MongoDB:', error);
        process.exit(1);
    }
};

module.exports = connectDB;

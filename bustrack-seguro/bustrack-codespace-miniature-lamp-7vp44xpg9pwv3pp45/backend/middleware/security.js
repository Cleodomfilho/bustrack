const mongoose = require('mongoose');

const sanitizeString = (value='') => String(value).replace(/[<>$]/g, '').trim();

const validateObjectId = (req, res, next) => {
  const id = req.params.id;
  if (id && !mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'ID inválido' });
  }
  next();
};

module.exports = { sanitizeString, validateObjectId };

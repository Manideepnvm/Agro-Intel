const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const cropsRoutes = require('./routes/crops');
const predictionsRoutes = require('./routes/predictions');

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/crops', cropsRoutes);
app.use('/api/predictions', predictionsRoutes);

module.exports = app; 
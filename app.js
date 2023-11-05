const express = require('express'),
    app = express(),
    cors = require('cors'),
    db = require('./config/database'),
    Users = require('./model/users');

require("dotenv").config();

const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

Users.sync({alter: true})

app.listen(PORT, async () => {
    console.log(`Server is running on port ${PORT}`);
    try {
        await db.authenticate();
        console.log('Connection has been established successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
})

app.use('/api/v1', require('./routes/userRoutes'));
app.all('*', (req, res) => {
    res.status(400).send({
        "code": 400,
        "msg": "Bad request"
    });
  });
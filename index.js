require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();

const User = require('./models/User');

const DB_USER = process.env.DB_USER;
const DB_PASSWORD = process.env.DB_PASSWORD;

app.use(express.json());


mongoose.connect(`PASTE_YOUR_MONGO_CONNECTION_STRING_HERE`)
.then(() => {
    app.listen(3000, () => {
        console.log('\n[#] Database connected!');
        console.log('[#] Server running at http://localhost:3000');
    })
})
.catch((error) => {
    console.log(error);
})

// Open Route - Public Route
app.get('/', (req, res) => {
    res.status(200).json({ message: 'Welcome to the API' });
});

// Register User
app.post('/auth/register', async (req, res) => {
    const {email, username, password, confirmPassword} = req.body;

    if (!username) {
        return res.status(412).json({ message: "O nome é obrigatório!" });
    }

    if (!email) {
        return res.status(412).json({ message: "O email é obrigatório!" });
    }

    if (!password) {
        return res.status(412).json({ message: "A senha é obrigatória!" });
    }

    if(password != confirmPassword) {
        return res.status(422).json({ message: "As senhas não conferem!" });
    }
})
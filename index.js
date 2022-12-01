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


mongoose.connect(`PASTE_YOUR_MONGODB_STRING_CONNECTION_HERE`)
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

// Private Route
app.get('/user/:id', checkToken, async (req, res) => {
    const id = req.params.id;

    const user = await User.findById(id, '-password');

    if (!user) {
        res.status(404).json({ message: "Usuário não encontrado!" });
        return;
    }

    res.status(200).json(user);
});

function checkToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        res.status(401).json({ message: "Acesso negado!" });
        return;
    }

    try {
        const secret = process.env.SECRET;

        jwt.verify(token, secret);

        next();
    } catch (error) {
        res.status(403).json({ message: "Token inválido!" });
    }
}

// Register User
app.post('/auth/register', async (req, res) => {
    const { email, username, password, confirmPassword } = req.body;

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

    // Checar se o usuário já existe
    const userExists = await User.findOne({ email: email });

    if (userExists) {
        res.status(422).json({ message: "Email já cadastrado!" });
        return;
    }

    // Criar senha
    const passwordHash = await bcrypt.hash(password, 12);

    // Criar usuário
    const user = new User({
        username,
        email,
        password: passwordHash
    });

    try {
      await user.save();
      
      res.status(201).json({ message: "Usuário cadastrado com sucesso!" });
    } catch (error) {
        res.status(500).json({ message: error });
    }
})

// Login
app.post("/auth/login", async (req, res) => {
    const {email, password} = req.body;

    if (!email) {
        return res.status(412).json({ message: "O email é obrigatório!" });
    }

    if (!password) {
        return res.status(412).json({ message: "A senha é obrigatória!" });
    }

    // Checar se o usuário existe
    const user = await User.findOne({ email: email });

    if (!user) {
        res.status(404).json({ message: "Usuário não encontrado!" });
        return;
    }

    // Checar se a senha está correta
    const checkPassword = await bcrypt.compare(password, user.password);

    if (!checkPassword) {
        res.status(422).json({ message: "Senha inválida!" });
        return;
    }

    try {
        const secret = process.env.SECRET;
        const token = jwt.sign({
            id: user._id
        }, secret);

        res.status(200).json({ message: "Usuário autenticado com sucesso", token });
    } catch (error) {
        res.status(500).json({ message: error });
    }
})
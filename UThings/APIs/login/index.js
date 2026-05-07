const express = require('express');
const cors = require('cors');
const fs = require('fs');
const app = express();

app.use(cors());
app.use(express.json());

const PATH_USUARIOS = './usuarios.json';

const leerUsuarios = () => {
    if (!fs.existsSync(PATH_USUARIOS)) return [];
    const data = fs.readFileSync(PATH_USUARIOS, 'utf-8');
    return JSON.parse(data || '[]');
};

const guardarUsuarios = (usuarios) => {
    fs.writeFileSync(PATH_USUARIOS, JSON.stringify(usuarios, null, 2));
};

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const usuarios = leerUsuarios();
    const user = usuarios.find(u => u.username === username && u.password === password);
    if (user) res.json({ username: user.username });
    else res.status(401).json({ mensaje: 'Error' });
});

app.post('/register', (req, res) => {
    const { username, password } = req.body;
    const usuarios = leerUsuarios();
    usuarios.push({ username, password });
    guardarUsuarios(usuarios);
    res.status(201).json({ mensaje: 'Ok' });
});

app.listen(3000, () => console.log('3000'));
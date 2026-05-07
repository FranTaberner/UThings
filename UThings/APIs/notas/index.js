const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const fs = require('fs');
const app = express();

app.use(cors());
app.use(express.json());

const PATH_NOTAS = './notas.json';

const leerNotas = () => {
    if (!fs.existsSync(PATH_NOTAS)) return [];
    const data = fs.readFileSync(PATH_NOTAS, 'utf-8');
    return JSON.parse(data || '[]');
};

const guardarNotas = (notas) => {
    fs.writeFileSync(PATH_NOTAS, JSON.stringify(notas, null, 2));
};

app.post('/notas/crear', (req, res) => {
    const { username } = req.body;
    const notas = leerNotas();
    const nuevaId = crypto.randomBytes(3).toString('hex');
    const nuevaNota = { id: nuevaId, autor: username, contenido: '', fecha: new Date() };
    notas.push(nuevaNota);
    guardarNotas(notas);
    res.status(201).json(nuevaNota);
});

app.get('/notas/:username', (req, res) => {
    const notas = leerNotas();
    const misNotas = notas.filter(n => n.autor === req.params.username);
    res.json(misNotas);
});

app.put('/notas/:id', (req, res) => {
    let notas = leerNotas();
    const index = notas.findIndex(n => n.id === req.params.id);
    if (index !== -1) {
        notas[index].contenido = req.body.contenido;
        guardarNotas(notas);
        res.json({ mensaje: 'Ok' });
    } else {
        res.status(404).send();
    }
});

app.delete('/notas/:id', (req, res) => {
    let notas = leerNotas();
    notas = notas.filter(n => n.id !== req.params.id);
    guardarNotas(notas);
    res.json({ mensaje: 'Ok' });
});

app.listen(3001, () => console.log('3001'));
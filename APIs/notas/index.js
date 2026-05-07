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
    const { email } = req.body;
    const notas = leerNotas();
    const nuevaId = crypto.randomBytes(3).toString('hex');
    const nuevaNota = { 
        id: nuevaId, 
        autorEmail: email, 
        titulo: 'Nueva Nota',
        contenido: '', 
        fecha: new Date(),
        colaboradores: []
    };
    notas.push(nuevaNota);
    guardarNotas(notas);
    res.status(201).json(nuevaNota);
});

app.get('/notas/:email', (req, res) => {
    const notas = leerNotas();
    const emailBusqueda = req.params.email.toLowerCase();
    
    const misNotas = notas.filter(n => 
        n.autorEmail.toLowerCase() === emailBusqueda || 
        (n.colaboradores && n.colaboradores.some(c => c.email.toLowerCase() === emailBusqueda))
    );
    res.json(misNotas);
});

app.put('/notas/:id', (req, res) => {
    const { id } = req.params;
    const { titulo, contenido, email } = req.body;

    let notas = leerNotas();
    const index = notas.findIndex(n => n.id === id);

    if (index === -1) return res.status(404).send('Nota no encontrada');

    const nota = notas[index];
    const emailEditor = email.toLowerCase();

    const esAutor = nota.autorEmail.toLowerCase() === emailEditor;
    const colaborador = nota.colaboradores.find(c => c.email.toLowerCase() === emailEditor);
    const puedeEditar = esAutor || (colaborador && colaborador.permiso === 'edicion');

    if (!puedeEditar) {
        return res.status(403).json({ mensaje: 'No tienes permiso para editar esta nota' });
    }

    if (titulo !== undefined) nota.titulo = titulo;
    if (contenido !== undefined) nota.contenido = contenido;
    
    guardarNotas(notas);
    res.json({ mensaje: 'Guardado con éxito' });
});

app.post('/notas/compartir', (req, res) => {
    const { id, emailACompartir, permiso } = req.body;
    let notas = leerNotas();
    const index = notas.findIndex(n => n.id === id);

    if (index !== -1) {
        if (!notas[index].colaboradores) notas[index].colaboradores = [];
        
        const colabIndex = notas[index].colaboradores.findIndex(c => c.email === emailACompartir);
        
        if (colabIndex !== -1) {
            notas[index].colaboradores[colabIndex].permiso = permiso;
        } else {
            notas[index].colaboradores.push({ email: emailACompartir, permiso });
        }

        guardarNotas(notas);
        res.json({ mensaje: 'Permisos actualizados' });
    } else {
        res.status(404).send('Nota no encontrada');
    }
});

app.delete('/notas/:id', (req, res) => {
    let notas = leerNotas();
    notas = notas.filter(n => n.id !== req.params.id);
    guardarNotas(notas);
    res.json({ mensaje: 'Ok' });
});

app.listen(3001, () => console.log('Servidor Notas en 3001 con sistema de permisos'));
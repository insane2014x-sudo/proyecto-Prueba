const express = require('express');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PUERTO = process.env.PORT || 3000;

// Middlewares
app.use(express.json());
app.use(express.static('public'));  // sirve el frontend

// Base de datos
const db = new sqlite3.Database('./tareas.db');

db.run(`CREATE TABLE IF NOT EXISTS tareas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    texto TEXT NOT NULL,
    hecha INTEGER DEFAULT 0
)`);

// GET: todas las tareas
app.get('/tareas', (req, res) => {
    db.all('SELECT * FROM tareas', (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// POST: crear tarea
app.post('/tareas', (req, res) => {
    const { texto } = req.body;
    db.run(
        'INSERT INTO tareas (texto) VALUES (?)',
        [texto],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({ id: this.lastID, texto, hecha: 0 });
        }
    );
});

// PUT: actualizar tarea (marcar como hecha)
app.put('/tareas/:id', (req, res) => {
    const id = req.params.id;
    const { hecha } = req.body;
    db.run(
        'UPDATE tareas SET hecha = ? WHERE id = ?',
        [hecha ? 1 : 0, id],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ id, hecha });
        }
    );
});

// DELETE: borrar tarea
app.delete('/tareas/:id', (req, res) => {
    const id = req.params.id;
    db.run('DELETE FROM tareas WHERE id = ?', [id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ mensaje: 'Tarea eliminada', id });
    });
});

app.listen(PUERTO, () => {
    console.log(`Servidor en http://localhost:${PUERTO}`);
});
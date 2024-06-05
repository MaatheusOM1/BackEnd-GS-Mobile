const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');

const app = express();
const PORT = 3000;

const db = new sqlite3.Database('projects.db');

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS projects (
        id INTEGER PRIMARY KEY,
        titulo TEXT,
        descricao TEXT,
        objetivos TEXT,
        data_inicio TEXT,
        data_termino TEXT,
        meta_financiamento REAL
    );`);
});

app.use(express.json());
app.use(cors());

app.post('/projects', (req, res) => {
    const { titulo, descricao, objetivos, data_inicio, data_termino, meta_financiamento } = req.body;
    if (!titulo || !descricao || !objetivos || !data_inicio || !data_termino || !meta_financiamento) {
        return res.status(400).json({ error: 'Todos os campos são obrigatórios!' });
    }
    db.run(`INSERT INTO projects (titulo, descricao, objetivos, data_inicio, data_termino, meta_financiamento)
            VALUES (?, ?, ?, ?, ?, ?)`,
            [titulo, descricao, objetivos, data_inicio, data_termino, meta_financiamento],
            function(err) {
                if (err) {
                    return res.status(500).json({ error: err.message });
                }
                res.status(201).json({ id: this.lastID, titulo, descricao, objetivos, data_inicio, data_termino, meta_financiamento });
            });
});

app.get('/projects', (req, res) => {
    db.all("SELECT * FROM projects", [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(200).json(rows);
    });
});

app.get('/projects/:id', (req, res) => {
    const { id } = req.params;
    db.get("SELECT * FROM projects WHERE id = ?", [id], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (row) {
            res.status(200).json(row);
        } else {
            res.status(404).json({ error: 'Projeto não encontrado!' });
        }
    });
});

app.put('/projects/:id', (req, res) => {
    const { id } = req.params;
    const { titulo, descricao, objetivos, data_inicio, data_termino, meta_financiamento } = req.body;
    if (!titulo && !descricao && !objetivos && !data_inicio && !data_termino && !meta_financiamento) {
        return res.status(400).json({ error: 'Pelo menos um campo deve ser fornecido para atualização!' });
    }
    
    const updateFields = [];
    const updateValues = [];
    
    if (titulo) {
        updateFields.push("titulo = ?");
        updateValues.push(titulo);
    }
    if (descricao) {
        updateFields.push("descricao = ?");
        updateValues.push(descricao);
    }
    if (objetivos) {
        updateFields.push("objetivos = ?");
        updateValues.push(objetivos);
    }
    if (data_inicio) {
        updateFields.push("data_inicio = ?");
        updateValues.push(data_inicio);
    }
    if (data_termino) {
        updateFields.push("data_termino = ?");
        updateValues.push(data_termino);
    }
    if (meta_financiamento) {
        updateFields.push("meta_financiamento = ?");
        updateValues.push(meta_financiamento);
    }
    
    updateValues.push(id);
    
    const query = `UPDATE projects SET ${updateFields.join(", ")} WHERE id = ?`;
    
    db.run(query, updateValues, function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (this.changes) {
            res.status(200).json({ message: 'Projeto atualizado com sucesso!' });
        } else {
            res.status(404).json({ error: 'Projeto não encontrado!' });
        }
    });
});

app.delete('/projects/:id', (req, res) => {
    const { id } = req.params;
    db.run("DELETE FROM projects WHERE id = ?", [id], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (this.changes) {
            res.status(200).json({ message: 'Projeto removido com sucesso!' });
        } else {
            res.status(404).json({ error: 'Projeto não encontrado!' });
        }
    });
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta http://localhost:${PORT}`);
});

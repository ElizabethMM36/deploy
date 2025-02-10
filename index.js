const express = require('express');
const path = require('path');  // Import path module
const morgan = require('morgan');
const cors = require("cors");

const app = express();
app.use(cors());

// Middleware to parse JSON bodies
app.use(express.json());
app.use(morgan("tiny"));

morgan.token('req-body', (req) => { 
  if (req.method === 'POST') {
    return JSON.stringify(req.body);
  }
  return "";
});
app.use(morgan(":method  :url :status :res[content-length] - :response-time ms  :req-body"));

// Serve React frontend build folder
app.use(express.static(path.join(__dirname, 'build')));

// Dummy Data
let persons = [
  { id: "1", name: "Arto Hellas", number: "040-123456" },
  { id: "2", name: "Ada Lovelace", number: "39-44-5323523" },
  { id: "3", name: "Dan Abramov", number: "12-43-234345" },
  { id: "4", name: "Mary Poppendieck", number: "39-23-6423122" }
];

// API Routes
app.get('/api/persons', (req, res) => res.json(persons));

app.get('/info', (req, res) => {
  res.send(`<p>Phonebook has info for ${persons.length} people</p><p>${new Date()}</p>`);
});

app.get('/api/persons/:id', (req, res) => {
  const person = persons.find(p => p.id === req.params.id);
  person ? res.json(person) : res.status(404).json({ error: "Person not found" });
});

app.delete('/api/persons/:id', (req, res) => {
  const id = req.params.id;
  const initialLength = persons.length;
  persons = persons.filter(p => p.id !== id);
  persons.length < initialLength ? res.status(204).end() : res.status(404).json({ error: "Person not found" });
});

app.post('/api/persons', (req, res) => {
  const { name, number } = req.body;
  if (!name || !number) return res.status(400).json({ error: "Name or number is missing" });
  if (persons.find(p => p.name === name)) return res.status(400).json({ error: "Name must be unique" });

  const newPerson = { id: Math.floor(Math.random() * 1000000).toString(), name, number };
  persons.push(newPerson);
  res.json(newPerson);
});

// Catch-All Route to Serve React Frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// Start Server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

const express = require('express');
const app = express();
const morgan =require('morgan')
const cors = require("cors");
app.use(cors());

let persons = [
  { id: "1", name: "Arto Hellas", number: "040-123456" },
  { id: "2", name: "Ada Lovelace", number: "39-44-5323523" },
  { id: "3", name: "Dan Abramov", number: "12-43-234345" },
  { id: "4", name: "Mary Poppendieck", number: "39-23-6423122" }
];

// Middleware to parse JSON bodies
app.use(express.json());
app.use(morgan("tiny"));
morgan.token('req-body',(req)=>{ 
  if (req.method === 'POST') {
    return JSON.stringify(req.body)
  }
  return "";
});

app.use(morgan(":method  :url :status :res[content-length] - :response-time ms  :req-body"))
// Route to return all persons
app.get('/api/persons', (req, res) => {
  res.json(persons);
});

// Route to show phonebook size and request time
app.get('/info', (req, res) => {
  const requestTime = new Date();
  const phonebookSize = persons.length;

  res.send(
    `<p>Phonebook has info for ${phonebookSize} people</p>
     <p>${requestTime}</p>`
  );
});

// Route to get a single person by ID
app.get('/api/persons/:id', (req, res) => {
  const id = req.params.id;
  const person = persons.find(p => p.id === id);

  if (person) {
    res.json(person);
  } else {
    res.status(404).send({ error: "Person not found" });
  }
});
app.get('/', (req, res) => {
  res.send('Welcome to the Phonebook API');
});

// Route to delete a person by ID
app.delete('/api/persons/:id', (req, res) => {
  const id = req.params.id;
  const initialLength = persons.length;
  persons = persons.filter(p => p.id !== id);

  if (persons.length < initialLength) {
    res.status(204).end(); // No Content response
  } else {
    res.status(404).send({ error: "Person not found" });
  }
});
// Route to add a new person
app.post('/api/persons', (req, res) => {
  const body = req.body;

  if (!body.name || !body.number) {
    return res.status(400).json({ error: "Name or number is missing" });
  }

  if (persons.find(p => p.name === body.name)) {
    return res.status(400).json({ error: "Name must be unique" });
  }

  const newPerson = {
    id: Math.floor(Math.random() * 1000000).toString(), // Generate unique ID
    name: body.name,
    number: body.number
  };

  persons.push(newPerson);
  res.json(newPerson);
});


const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


const express = require('express');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
require('dotenv').config();

const app = express();
const prisma = new PrismaClient();
app.use(cors());
app.use(express.json());

// Middleware do weryfikacji JWT
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Brak tokenu' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Nieprawidłowy token' });
  }
};

// Rejestracja
app.post('/register', async (req, res) => {
  const { email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    const user = await prisma.user.create({
      data: { email, password: hashedPassword },
    });
    res.status(201).json({ message: 'Użytkownik utworzony', userId: user.id });
  } catch (error) {
    res.status(400).json({ error: 'Email już istnieje' });
  }
});

// Logowanie
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: 'Nieprawidłowe dane' });
  }
  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
  res.json({ token });
});

// CRUD dla list
app.get('/lists', authenticate, async (req, res) => {
  const lists = await prisma.list.findMany({
    where: { userId: req.userId },
    include: { tasks: true },
  });
  res.json(lists);
});

app.post('/lists', authenticate, async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Nazwa listy jest wymagana' });
  const list = await prisma.list.create({
    data: { name, userId: req.userId },
  });
  res.json(list);
});

app.put('/lists/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Nazwa listy jest wymagana' });
  try {
    const list = await prisma.list.update({
      where: { id: parseInt(id), userId: req.userId },
      data: { name },
      include: { tasks: true }, // Dołącz zadania w odpowiedzi
    });
    res.json(list);
  } catch (error) {
    res.status(400).json({ error: 'Nie udało się zaktualizować listy' });
  }
});

app.delete('/lists/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.list.delete({
      where: { id: parseInt(id), userId: req.userId },
    });
    res.json({ message: 'Lista usunięta' });
  } catch (error) {
    res.status(400).json({ error: 'Nie udało się usunąć listy' });
  }
});

// CRUD dla zadań
app.post('/tasks', authenticate, async (req, res) => {
  const { title, listId, priority } = req.body;
  console.log('Received task creation request:', { title, listId, priority, userId: req.userId });
  if (!title || !listId) {
    console.error('Missing title or listId');
    return res.status(400).json({ error: 'Tytuł i ID listy są wymagane' });
  }
  try {
    const list = await prisma.list.findUnique({
      where: { id: parseInt(listId), userId: req.userId },
    });
    if (!list) {
      console.error('List not found or not owned by user:', listId);
      return res.status(400).json({ error: 'Lista nie istnieje lub nie należy do użytkownika' });
    }
    const task = await prisma.task.create({
      data: {
        title,
        listId: parseInt(listId),
        completed: false,
        priority: priority || null,
      },
    });
    console.log('Task created successfully:', task);
    res.json(task);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'Błąd podczas tworzenia zadania' });
  }
});

app.put('/tasks/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  const { title, completed } = req.body;
  try {
    const task = await prisma.task.update({
      where: { id: parseInt(id) },
      data: { title, completed },
    });
    res.json(task);
  } catch (error) {
    res.status(400).json({ error: 'Nie udało się zaktualizować zadania' });
  }
});

app.delete('/tasks/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.task.delete({ where: { id: parseInt(id) } });
    res.json({ message: 'Zadanie usunięte' });
  } catch (error) {
    res.status(400).json({ error: 'Nie udało się usunąć zadania' });
  }
});

app.listen(process.env.PORT, () => {
  console.log(`Serwer działa na porcie ${process.env.PORT}`);
});
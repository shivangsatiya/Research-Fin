// ============================================================
//  ResearchFin Backend — server.js
//  Tech: Node.js + Express + JSON file database (lowdb)
// ============================================================

const express = require('express');
const cors    = require('cors');
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const low     = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');

// ---------- Setup ----------
const app  = express();
const PORT = 3000;
const JWT_SECRET = 'researchfin_secret_key_2025'; // In production: use env variable

app.use(cors());
app.use(express.json());

// ---------- Database (JSON file) ----------
const adapter = new FileSync('db.json');
const db = low(adapter);

// Default structure if db.json is empty
db.defaults({
  users: [],
  budgets: [],
  assessments: [],
  sessions: []
}).write();

// ============================================================
//  HELPER: Verify JWT token (middleware)
// ============================================================
function auth(req, res, next) {
  const token = req.headers['authorization'];
  if (!token) return res.status(401).json({ error: 'No token provided' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (e) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// ============================================================
//  ROUTE 1: POST /api/register
//  Creates a new user account
// ============================================================
app.post('/api/register', async (req, res) => {
  const { name, regId, dept, role, password } = req.body;

  // Validation
  if (!name || !regId || !dept || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  // Check if user already exists
  const existing = db.get('users').find({ regId }).value();
  if (existing) {
    return res.status(409).json({ error: 'This Registration ID is already registered' });
  }

  // Hash the password before saving (NEVER store plain text passwords)
  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = {
    id: Date.now().toString(),
    name,
    regId,
    dept,
    role: role || 0,        // 0=Student, 1=Faculty, 2=Admin
    password: hashedPassword,
    createdAt: new Date().toISOString()
  };

  db.get('users').push(newUser).write();

  res.status(201).json({ message: 'Account created successfully!', regId });
});

// ============================================================
//  ROUTE 2: POST /api/login
//  Authenticates user and returns a JWT token
// ============================================================
app.post('/api/login', async (req, res) => {
  const { regId, password } = req.body;

  if (!regId || !password) {
    return res.status(400).json({ error: 'Registration ID and password are required' });
  }

  const user = db.get('users').find({ regId }).value();
  if (!user) {
    return res.status(404).json({ error: 'User not found. Please register first.' });
  }

  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) {
    return res.status(401).json({ error: 'Incorrect password' });
  }

  // Create JWT token valid for 24 hours
  const token = jwt.sign(
    { id: user.id, regId: user.regId, name: user.name, role: user.role },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  res.json({
    message: 'Login successful',
    token,
    user: { name: user.name, regId: user.regId, dept: user.dept, role: user.role }
  });
});

// ============================================================
//  ROUTE 3: GET /api/profile
//  Returns logged-in user's profile (protected route)
// ============================================================
app.get('/api/profile', auth, (req, res) => {
  const user = db.get('users').find({ id: req.user.id }).value();
  if (!user) return res.status(404).json({ error: 'User not found' });

  // Send user info WITHOUT the password
  res.json({
    name: user.name,
    regId: user.regId,
    dept: user.dept,
    role: user.role,
    createdAt: user.createdAt
  });
});

// ============================================================
//  ROUTE 4: POST /api/budget
//  Saves budget items for the logged-in user
// ============================================================
app.post('/api/budget', auth, (req, res) => {
  const { items } = req.body;

  if (!items || !Array.isArray(items)) {
    return res.status(400).json({ error: 'Budget items must be an array' });
  }

  // Remove old budget for this user and replace with new one
  db.get('budgets')
    .remove({ userId: req.user.id })
    .write();

  db.get('budgets').push({
    userId: req.user.id,
    items: items,
    savedAt: new Date().toISOString()
  }).write();

  res.json({ message: 'Budget saved successfully!', itemCount: items.length });
});

// ============================================================
//  ROUTE 5: GET /api/budget
//  Gets saved budget for the logged-in user
// ============================================================
app.get('/api/budget', auth, (req, res) => {
  const budget = db.get('budgets').find({ userId: req.user.id }).value();

  if (!budget) {
    return res.json({ items: [], savedAt: null });
  }

  res.json(budget);
});

// ============================================================
//  ROUTE 6: POST /api/assessment
//  Saves quiz/assessment result for the logged-in user
// ============================================================
app.post('/api/assessment', auth, (req, res) => {
  const { score, level, answers } = req.body;

  if (score === undefined || !level) {
    return res.status(400).json({ error: 'Score and level are required' });
  }

  // Remove old assessment, save new one
  db.get('assessments').remove({ userId: req.user.id }).write();
  db.get('assessments').push({
    userId: req.user.id,
    score,
    level,
    answers,
    takenAt: new Date().toISOString()
  }).write();

  res.json({ message: 'Assessment saved!', level });
});

// ============================================================
//  ROUTE 7: GET /api/assessment
//  Gets saved assessment result for the logged-in user
// ============================================================
app.get('/api/assessment', auth, (req, res) => {
  const assessment = db.get('assessments').find({ userId: req.user.id }).value();
  if (!assessment) return res.json({ done: false });
  res.json({ done: true, ...assessment });
});

// ============================================================
//  ROUTE 8: GET /api/admin/users  (Admin only)
//  Lists all registered users — only accessible by admins
// ============================================================
app.get('/api/admin/users', auth, (req, res) => {
  if (req.user.role !== 2) {
    return res.status(403).json({ error: 'Access denied. Admins only.' });
  }

  const users = db.get('users').map(u => ({
    name: u.name,
    regId: u.regId,
    dept: u.dept,
    role: u.role,
    createdAt: u.createdAt
  })).value();

  res.json({ totalUsers: users.length, users });
});

// ============================================================
//  ROUTE 9: GET /api/stats  (Admin only)
//  Returns app-wide stats
// ============================================================
app.get('/api/stats', auth, (req, res) => {
  if (req.user.role !== 2) {
    return res.status(403).json({ error: 'Admins only' });
  }

  const totalUsers      = db.get('users').size().value();
  const totalBudgets    = db.get('budgets').size().value();
  const totalAssessments = db.get('assessments').size().value();

  res.json({ totalUsers, totalBudgets, totalAssessments });
});

// ============================================================
//  START SERVER
// ============================================================
app.listen(PORT, () => {
  console.log(`✅ ResearchFin backend running at http://localhost:${PORT}`);
  console.log(`📁 Database file: db.json`);
});

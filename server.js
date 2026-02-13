import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import sqlite3 from 'sqlite3';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = 3000;
const JWT_SECRET = 'auroramind-secret-key-2026';

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(__dirname));

const db = new sqlite3.Database(':memory:');

// Initialize Database
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE,
    password TEXT,
    name TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS insights (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    title TEXT,
    description TEXT,
    confidence REAL,
    category TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS predictions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    input_data TEXT,
    prediction TEXT,
    accuracy REAL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  )`);

  // Insert sample data
  const sampleUsers = [
    ['demo@auroramind.ai', 'Demo@123', 'Demo User'],
    ['innovator@auroramind.ai', 'Innovator@123', 'Innovation Pro']
  ];

  sampleUsers.forEach(([email, password, name]) => {
    const hashedPassword = bcryptjs.hashSync(password, 8);
    db.run('INSERT OR IGNORE INTO users (email, password, name) VALUES (?, ?, ?)',
      [email, hashedPassword, name]);
  });

  // Sample insights
  const sampleInsights = [
    [1, 'Market Surge Detected', 'AI predicted 23% growth in Q2 based on emerging patterns', 0.94, 'Prediction'],
    [1, 'Cost Optimization', 'Identified $2.3M in operational savings across 7 departments', 0.89, 'Optimization'],
    [2, 'Risk Alert', 'Detected anomalies in supply chain requiring immediate attention', 0.91, 'Alert']
  ];

  sampleInsights.forEach(([userId, title, desc, confidence, category]) => {
    db.run('INSERT INTO insights (user_id, title, description, confidence, category) VALUES (?, ?, ?, ?, ?)',
      [userId, title, desc, confidence, category]);
  });
});

// Authentication Routes
app.post('/api/register', (req, res) => {
  const { email, password, name } = req.body;
  const hashedPassword = bcryptjs.hashSync(password, 8);

  db.run(
    'INSERT INTO users (email, password, name) VALUES (?, ?, ?)',
    [email, hashedPassword, name],
    function(err) {
      if (err) {
        return res.status(400).json({ error: 'User already exists' });
      }
      res.json({ message: 'User registered successfully', userId: this.lastID });
    }
  );
});

app.post('/api/login', (req, res) => {
  const { email, password } = req.body;

  db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
    if (err || !user) {
      return res.status(400).json({ error: 'User not found' });
    }

    if (!bcryptjs.compareSync(password, user.password)) {
      return res.status(400).json({ error: 'Invalid password' });
    }

    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
  });
});

// Middleware to verify token
const verifyToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ error: 'Invalid token' });
    req.userId = decoded.userId;
    next();
  });
};

// Insights Routes
app.get('/api/insights', verifyToken, (req, res) => {
  db.all('SELECT * FROM insights WHERE user_id = ? ORDER BY created_at DESC LIMIT 10', [req.userId], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows || []);
  });
});

app.post('/api/insights', verifyToken, (req, res) => {
  const { title, description, confidence, category } = req.body;
  db.run(
    'INSERT INTO insights (user_id, title, description, confidence, category) VALUES (?, ?, ?, ?, ?)',
    [req.userId, title, description, confidence, category],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID, message: 'Insight created' });
    }
  );
});

// Predictions Routes
app.get('/api/predictions', verifyToken, (req, res) => {
  db.all('SELECT * FROM predictions WHERE user_id = ? ORDER BY created_at DESC LIMIT 10', [req.userId], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows || []);
  });
});

app.post('/api/predict', verifyToken, (req, res) => {
  const { inputData } = req.body;
  
  // Simulate AI prediction
  const prediction = Math.random() > 0.5 ? 'Positive Outcome Expected' : 'Caution Advised';
  const accuracy = 0.85 + Math.random() * 0.1;

  db.run(
    'INSERT INTO predictions (user_id, input_data, prediction, accuracy) VALUES (?, ?, ?, ?)',
    [req.userId, JSON.stringify(inputData), prediction, accuracy],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID, prediction, accuracy });
    }
  );
});

// Dashboard Stats
app.get('/api/dashboard', verifyToken, (req, res) => {
  db.get('SELECT COUNT(*) as insightCount FROM insights WHERE user_id = ?', [req.userId], (err, insightCount) => {
    db.get('SELECT COUNT(*) as predictionCount FROM predictions WHERE user_id = ?', [req.userId], (err, predictionCount) => {
      db.get('SELECT AVG(confidence) as avgConfidence FROM insights WHERE user_id = ?', [req.userId], (err, confidence) => {
        res.json({
          insights: insightCount?.insightCount || 0,
          predictions: predictionCount?.predictionCount || 0,
          avgConfidence: confidence?.avgConfidence || 0,
          aiHealthScore: (85 + Math.random() * 10).toFixed(1)
        });
      });
    });
  });
});

app.listen(PORT, () => {
  console.log(`🌌 AuroraMind Server running at http://localhost:${PORT}`);
});

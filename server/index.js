import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Persistent JSON file storage
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_FILE = path.join(__dirname, 'data.json');

// Load or initialize data from file
const loadData = () => {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Error loading data file, starting fresh:', e.message);
  }
  return {
    groups: [],
    groupCounter: 1
  };
};

const saveData = () => {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify({ groups, groupCounter }, null, 2));
  } catch (e) {
    console.error('Error saving data:', e.message);
  }
};

let { groups, groupCounter } = loadData();

// Generate group name with letter suffix (e.g. "Mathematics A", "Mathematics B")
const getGroupName = (subject, curriculum, grade) => {
  const existing = groups.filter(g =>
    g.subject === subject &&
    g.curriculum === curriculum &&
    g.grade === grade &&
    g.type === 'Group Tutoring'
  );
  const letter = String.fromCharCode(65 + existing.length); // A, B, C, ...
  return `${subject} ${letter}`;
};

// Helper to find or create a group
const findOrCreateGroup = (subject, grade, curriculum, type) => {
  // One-to-One sessions always get their own private slot (never shown as "full")
  if (type === 'One to One Tutoring') {
    const group = {
      id: groupCounter++,
      name: `${subject} (1-to-1)`,
      subject,
      grade,
      curriculum,
      type,
      capacity: 1,
      members: [],
      status: 'Private'
    };
    groups.push(group);
    saveData();
    return group;
  }

  // For Group Tutoring: find an available group with matching criteria
  let group = groups.find(g =>
    g.subject === subject &&
    g.grade === grade &&
    g.curriculum === curriculum &&
    g.type === 'Group Tutoring' &&
    g.status !== 'Full'
  );

  // If none available, create a new named group
  if (!group) {
    const name = getGroupName(subject, curriculum, grade);
    group = {
      id: groupCounter++,
      name,
      subject,
      grade,
      curriculum,
      type: 'Group Tutoring',
      capacity: 5,
      members: [],
      status: 'Available'
    };
    groups.push(group);
    saveData();
  }

  return group;
};

// Endpoints
// Public: Only show Group Tutoring sessions (not private 1-to-1)
app.get('/api/groups', (req, res) => {
  const publicGroups = groups.filter(g => g.type === 'Group Tutoring');
  res.json(publicGroups);
});

app.post('/api/book', (req, res) => {
  const { studentName, parentName, email, phone, subject, grade, curriculum, type } = req.body;

  if (!studentName || !parentName || !subject || !grade || !curriculum || !type) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const group = findOrCreateGroup(subject, grade, curriculum, type);
  group.members.push({ studentName, parentName, email: email || '', phone: phone || '', curriculum, type });

  if (type === 'Group Tutoring' && group.members.length >= group.capacity) {
    group.status = 'Full';
  }

  saveData();
  res.json({ message: 'Booking successful', group });
});

// Auth Endpoints
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  if (username === 'admin' && password === 'password123') {
    res.json({ token: 'dummy-admin-token' });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

// Protected Admin Endpoint — shows ALL bookings including 1-to-1
app.get('/api/admin/data', (req, res) => {
  const token = req.headers['authorization'];
  if (token === 'dummy-admin-token') {
    res.json(groups);
  } else {
    res.status(403).json({ error: 'Unauthorized' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

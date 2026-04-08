import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// In-memory data storage
let groups = [
  { id: 1, subject: 'Mathematics', grade: 'Grade 10', curriculum: 'CBSE', type: 'Group Tutoring', capacity: 5, members: [{ studentName: 'Alice', parentName: 'John', curriculum: 'CBSE', type: 'Group Tutoring' }, { studentName: 'Bob', parentName: 'Jane', curriculum: 'CBSE', type: 'Group Tutoring' }], status: 'Available' },
  { id: 2, subject: 'Physics', grade: 'Grade 11', curriculum: 'IB', type: 'Group Tutoring', capacity: 5, members: [{ studentName: 'Charlie', parentName: 'Drake', curriculum: 'IB', type: 'Group Tutoring' }], status: 'Available' }
];

let groupCounter = 3;

// Helper to find or create a group
const findOrCreateGroup = (subject, grade, curriculum, type) => {
  // One-to-One sessions always get their own group
  if (type === 'One to One Tutoring') {
    const group = {
      id: groupCounter++,
      subject,
      grade,
      curriculum,
      type,
      capacity: 1,
      members: [],
      status: 'Available'
    };
    groups.push(group);
    return group;
  }

  // Find a group with matching criteria that is not full
  let group = groups.find(g => 
    g.subject === subject && 
    g.grade === grade && 
    g.curriculum === curriculum && 
    g.type === 'Group Tutoring' &&
    g.members.length < g.capacity
  );

  if (!group) {
    group = {
      id: groupCounter++,
      subject,
      grade,
      curriculum,
      type: 'Group Tutoring',
      capacity: 5,
      members: [],
      status: 'Available'
    };
    groups.push(group);
  }
  return group;
};

// Endpoints
app.get('/api/groups', (req, res) => {
  res.json(groups);
});

app.post('/api/book', (req, res) => {
  const { studentName, parentName, subject, grade, curriculum, type } = req.body;

  if (!studentName || !parentName || !subject || !grade || !curriculum || !type) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const group = findOrCreateGroup(subject, grade, curriculum, type);
  
  // Store member as an object now for more detail
  group.members.push({ studentName, parentName, curriculum, type });

  if (group.members.length === group.capacity) {
    group.status = 'Full';
  }

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

// Protected Admin Endpoint
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

import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// In-memory data storage
let groups = [
  { id: 1, subject: 'Mathematics', grade: 'Grade 10', capacity: 5, members: ['Alice', 'Bob'], status: 'Available' },
  { id: 2, subject: 'Physics', grade: 'Grade 11', capacity: 5, members: ['Charlie'], status: 'Available' }
];

let groupCounter = 3;

// Helper to find or create a group
const findOrCreateGroup = (subject, grade) => {
  // Find a group with the same subject and grade that is not full
  let group = groups.find(g => g.subject === subject && g.grade === grade && g.members.length < g.capacity);

  if (!group) {
    group = {
      id: groupCounter++,
      subject,
      grade,
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
  const { name, subject, grade } = req.body;

  if (!name || !subject || !grade) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const group = findOrCreateGroup(subject, grade);
  group.members.push(name);

  if (group.members.length === group.capacity) {
    group.status = 'Full';
  }

  res.json({ message: 'Booking successful', group });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

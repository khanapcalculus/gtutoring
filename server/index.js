import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

app.use(cors());
app.use(express.json());

// ── MongoDB Connection ──────────────────────────────────────────────────────
mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// ── Schema & Model ──────────────────────────────────────────────────────────
const memberSchema = new mongoose.Schema({
  studentName: String,
  parentName:  String,
  email:       String,
  phone:       String,
  curriculum:  String,
  type:        String,
}, { _id: false });

const groupSchema = new mongoose.Schema({
  subject:    { type: String, required: true },
  name:       { type: String, required: true },
  grade:      { type: String, required: true },
  curriculum: { type: String, required: true },
  type:       { type: String, required: true },
  capacity:   { type: Number, required: true },
  members:    { type: [memberSchema], default: [] },
  status:     { type: String, default: 'Available' },
});

const Group = mongoose.model('Group', groupSchema);

// ── Helper: Get letter suffix for group name ────────────────────────────────
const getGroupName = async (subject, curriculum, grade) => {
  const count = await Group.countDocuments({ subject, curriculum, grade, type: 'Group Tutoring' });
  const letter = String.fromCharCode(65 + count); // A, B, C …
  return `${subject} ${letter}`;
};

// ── Helper: Find or create a group ─────────────────────────────────────────
const findOrCreateGroup = async (subject, grade, curriculum, type) => {
  if (type === 'One to One Tutoring') {
    const name = `${subject} (1-to-1)`;
    const group = new Group({ subject, name, grade, curriculum, type, capacity: 1, status: 'Private' });
    await group.save();
    return group;
  }

  // Find an available group with matching criteria
  let group = await Group.findOne({
    subject, grade, curriculum, type: 'Group Tutoring', status: { $ne: 'Full' }
  });

  if (!group) {
    const name = await getGroupName(subject, curriculum, grade);
    group = new Group({ subject, name, grade, curriculum, type: 'Group Tutoring', capacity: 5 });
    await group.save();
  }

  return group;
};

// ── Public Routes ───────────────────────────────────────────────────────────
// Only show Group Tutoring sessions publicly (not private 1-to-1)
app.get('/api/groups', async (req, res) => {
  try {
    const groups = await Group.find({ type: 'Group Tutoring' }).sort({ createdAt: 1 });
    res.json(groups);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch groups' });
  }
});

app.post('/api/book', async (req, res) => {
  const { studentName, parentName, email, phone, subject, grade, curriculum, type } = req.body;

  if (!studentName || !parentName || !subject || !grade || !curriculum || !type) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const group = await findOrCreateGroup(subject, grade, curriculum, type);
    group.members.push({ studentName, parentName, email: email || '', phone: phone || '', curriculum, type });

    if (type === 'Group Tutoring' && group.members.length >= group.capacity) {
      group.status = 'Full';
    }

    await group.save();
    res.json({ message: 'Booking successful', group });
  } catch (err) {
    res.status(500).json({ error: 'Booking failed: ' + err.message });
  }
});

// ── Auth ────────────────────────────────────────────────────────────────────
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  if (username === 'admin' && password === 'password123') {
    res.json({ token: 'dummy-admin-token' });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

// ── Admin: All bookings including 1-to-1 ───────────────────────────────────
app.get('/api/admin/data', async (req, res) => {
  const token = req.headers['authorization'];
  if (token !== 'dummy-admin-token') {
    return res.status(403).json({ error: 'Unauthorized' });
  }
  try {
    const groups = await Group.find().sort({ createdAt: 1 });
    res.json(groups);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch admin data' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

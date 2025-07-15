const router = require('express').Router();
const auth = require('../middleware/auth');
const Session = require('../models/Session');

router.post('/', auth, async (req, res) => {
  const { path, duration, distance, averageSpeed } = req.body;
  const session = new Session({
    userId: req.userId,
    path,
    duration,
    distance,
    averageSpeed
  });
  await session.save();
  res.json({ message: "Session saved" });
});

router.get('/', auth, async (req, res) => {
  const page = parseInt(req.query.page || 1);
  const limit = 5;
  const sessions = await Session.find({ userId: req.userId })
    .sort({ date: -1 })
    .skip((page - 1) * limit)
    .limit(limit);
  res.json(sessions);
});

module.exports = router;

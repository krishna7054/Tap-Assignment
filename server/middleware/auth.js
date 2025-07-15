// middleware/auth.js
const jwt = require("jsonwebtoken")
const User = require("../models/User")

module.exports = async function (req, res, next) {
  const token = req.header("Authorization")?.split(" ")[1] // "Bearer <token>"

  if (!token) {
    return res.status(401).json({ error: "No token provided" })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded // contains { id, ... }
    next()
  } catch (err) {
    res.status(401).json({ error: "Token is not valid" })
  }
}

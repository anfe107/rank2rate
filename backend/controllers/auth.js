import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'

export async function register(req, res) {
  const { email, password } = req.body
  if (!email || !password) {
    return res.status(400).json({ message: 'E-Mail und Passwort erforderlich' })
  }

  const exists = await User.findOne({ email })
  if (exists) {
    return res.status(409).json({ message: 'E-Mail bereits registriert' })
  }

  const passwordHash = await bcrypt.hash(password, 12)
  await User.create({ email, passwordHash })
  res.status(201).json({ message: 'Registriert' })
}

export async function login(req, res) {
  const { email, password } = req.body
  if (!email || !password) {
    return res.status(400).json({ message: 'E-Mail und Passwort erforderlich' })
  }

  const user = await User.findOne({ email })
  if (!user) {
    return res.status(401).json({ message: 'Ungültige Anmeldedaten' })
  }

  const valid = await bcrypt.compare(password, user.passwordHash)
  if (!valid) {
    return res.status(401).json({ message: 'Ungültige Anmeldedaten' })
  }

  const token = jwt.sign(
    { userId: user._id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  )
  res.json({ token })
}

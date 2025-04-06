const express = require("express")
const usersRouter = express.Router()
const { requireAuth } = require("@clerk/express")
const User = require("../models/users")
const mongoose = require("mongoose")

usersRouter.get("/", requireAuth(), async (req, res) => {
  const userId = req.auth.userId
  try {
    const user = await User.findOne({ userId })
    if (!user) {
      return res.status(200).json([])
    }
    res.status(200).json(user.chats || [])
  } catch (err) {
    console.error("Error fetching user chats:", err)
    res.status(500).json({ error: "Error fetching user chats" })
  }
})

usersRouter.post("/", requireAuth(), async (req, res) => {
  const userId = req.auth.userId
  const { text } = req.body
  try {
    let user = await User.findOne({ userId })
    if (!user) {
      user = new User({ userId, chats: [] })
    }

    const newChat = {
      _id: new mongoose.Types.ObjectId().toString(),
      title: text,
      createAt: new Date(),
    }

    user.chats.push(newChat)
    await user.save()

    res.status(201).json(newChat)
  } catch (err) {
    console.error("Error creating user chat:", err)
    res.status(500).json({ error: "Error creating user chat" })
  }
})

module.exports = usersRouter


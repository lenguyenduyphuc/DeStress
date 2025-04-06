const express = require("express")
const chatRouter = express.Router()
const { requireAuth } = require("@clerk/express")
const Chat = require("../models/chat")
const User = require("../models/users")
const mongoose = require("mongoose")
const { generateModelResponse } = require("./model")

chatRouter.get("/", requireAuth(), async (req, res) => {
  const userId = req.auth.userId
  try {
    const chats = await Chat.find({ userId })
    res.status(200).json(chats)
  } catch (err) {
    console.error("Error fetching chats:", err)
    res.status(500).json({ error: "Error fetching chats" })
  }
})

chatRouter.post("/", requireAuth(), async (req, res) => {
  const userId = req.auth.userId
  const { text } = req.body

  if (!text) {
    return res.status(400).json({ error: "Message text is required" })
  }

  try {
    const newChat = new Chat({
      userId: userId,
      history: [
        {
          role: "user",
          parts: [{ text }],
        },
      ],
    })

    const savedChat = await newChat.save()
    const modelResponse = await generateModelResponse(text)

    savedChat.history.push({
      role: "model",
      parts: [{ text: modelResponse }],
    })

    await savedChat.save()
    const user = await User.findOne({ userId: userId })

    if (!user) {
      const newUserChat = new User({
        userId: userId,
        chats: [
          {
            _id: savedChat._id.toString(),
            title: text.substring(0, 40) || "New Chat",
          },
        ],
      })
      await newUserChat.save()
    } else {
      user.chats.push({
        _id: savedChat._id.toString(),
        title: text.substring(0, 40) || "New Chat",
      })
      await user.save()
    }

    res.status(201).json(savedChat._id)
  } catch (err) {
    console.error("Error creating chat:", err)
    res.status(500).json({ error: "Internal Server Error" })
  }
})

chatRouter.get("/:id", requireAuth(), async (req, res) => {
  const userId = req.auth.userId

  try {
    const chat = await Chat.findOne({ _id: req.params.id, userId })
    if (!chat) {
      return res.status(404).json({ error: "Chat not found" })
    }
    res.status(200).json(chat)
  } catch (err) {
    console.error("Error fetching chat:", err)
    res.status(500).json({ error: "Error fetching chat" })
  }
})

chatRouter.post("/:id/messages", requireAuth(), async (req, res) => {
  const userId = req.auth.userId
  const chatId = req.params.id
  const { text } = req.body

  if (!text) {
    return res.status(400).json({ error: "Message text is required" })
  }

  try {
    const chat = await Chat.findOne({ _id: chatId, userId })
    if (!chat) {
      return res.status(404).json({ error: "Chat not found" })
    }
    chat.history.push({
      role: "user",
      parts: [{ text }],
    })

    await chat.save()
    const modelResponse = await generateModelResponse(text, chat.history)

    chat.history.push({
      role: "model",
      parts: [{ text: modelResponse }],
    })

    await chat.save()

    res.status(200).json({ success: true, message: "Message added successfully" })
  } catch (err) {
    console.error("Error adding message:", err)
    res.status(500).json({ error: "Error adding message" })
  }
})

chatRouter.delete("/:id", requireAuth(), async (req, res) => {
  const userId = req.auth.userId
  const chatId = req.params.id

  try {
    const chat = await Chat.findOne({ _id: chatId, userId })
    if (!chat) {
      return res.status(404).json({ error: "Chat not found" })
    }

    await Chat.findOneAndDelete({ _id: chatId, userId })

    await User.updateOne({ userId: userId }, { $pull: { chats: { _id: chatId } } })

    res.status(200).json({ message: "Chat deleted successfully" })
  } catch (err) {
    console.error("Error deleting chat:", err)
    res.status(500).json({ error: "Internal Server Error" })
  }
})

module.exports = chatRouter


import axios from "axios"

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000"

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
})

export const chatApi = {
  getAllChats: async () => {
    try {
      const response = await api.get("/api/chats")
      return response.data
    } catch (error) {
      console.error("Error fetching chats:", error)
      throw error
    }
  },

  createChat: async (text) => {
    try {
      const response = await api.post("/api/chats", { text })
      return response.data
    } catch (error) {
      console.error("Error creating chat:", error)
      throw error
    }
  },

  getChat: async (id) => {
    if (!id) return null
    try {
      const response = await api.get(`/api/chats/${id}`)
      return response.data
    } catch (error) {
      console.error(`Error fetching chat ${id}:`, error)
      throw error
    }
  },

  sendMessage: async (chatId, text) => {
    if (!chatId) return null
    try {
      const response = await api.post(`/api/chats/${chatId}/messages`, { text })
      return response.data
    } catch (error) {
      console.error(`Error sending message:`, error)
      throw error
    }
  },

  deleteChat: async (chatId) => {
    if (!chatId) {
      console.error("Cannot delete chat: Invalid chat ID")
      return
    }

    try {
      await api.delete(`/api/chats/${chatId}`)
    } catch (error) {
      console.error("Error deleting chat:", error)
      throw error
    }
  },
}

export default api


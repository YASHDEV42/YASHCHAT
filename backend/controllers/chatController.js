const Chat = require("../models/Chat");
const Message = require("../models/Message");
const User = require("../models/User");
const getChat = async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id).populate(
      "users",
      "username"
    );
    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }
    res.status(200).json(chat);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getChatsByUser = async (req, res) => {
  try {
    const chats = await Chat.find({ users: req.params.userId }).populate(
      "users",
      "username"
    );
    if (!chats || chats.length === 0) {
      return res.status(200).json([]);
    }
    res.status(200).json(chats);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const createChat = async (req, res) => {
  const { userIds } = req.body;

  if (!userIds || userIds.length < 2) {
    return res
      .status(400)
      .json({ message: "At least two users are required to create a chat" });
  }

  try {
    const newChat = new Chat({
      users: userIds,
      messages: [],
    });

    const savedChat = await newChat.save();
    res.status(201).json(savedChat);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
const addMessageToChat = async (req, res) => {
  const { chatId, message } = req.body;

  if (!chatId || !message) {
    return res
      .status(400)
      .json({ message: "Chat ID and message content are required" });
  }

  try {
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    chat.messages.push(message);
    const updatedChat = await chat.save();
    res.status(200).json(updatedChat);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const deleteChat = async (req, res) => {
  try {
    const chat = await Chat.findByIdAndDelete(req.params.id);
    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }
    await Message.deleteMany({ chatId: req.params.id });
    await User.updateMany(
      { _id: { $in: chat.users } },
      { $pull: { chats: req.params.id } }
    );

    res.status(200).json({ message: "Chat deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const updateChat = async (req, res) => {
  const { chatId, updates } = req.body;

  if (!chatId || !updates) {
    return res
      .status(400)
      .json({ message: "Chat ID and updates are required" });
  }

  try {
    const updatedChat = await Chat.findByIdAndUpdate(chatId, updates, {
      new: true,
    });
    if (!updatedChat) {
      return res.status(404).json({ message: "Chat not found" });
    }
    res.status(200).json(updatedChat);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  getChat,
  getChatsByUser,
  createChat,
  addMessageToChat,
  deleteChat,
  updateChat,
};

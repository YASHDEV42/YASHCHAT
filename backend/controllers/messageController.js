const Message = require("../models/Message.js");
const Chat = require("../models/Chat.js");

exports.sendMessage = async (req, res) => {
  const { senderId, receiverId, content } = req.body;

  try {
    // Validate input
    if (!senderId || !receiverId || !content) {
      return res.status(400).json({ error: "All fields are required" });
    }
    // Check if sender and receiver are different
    if (senderId === receiverId) {
      return res
        .status(400)
        .json({ error: "Sender and receiver cannot be the same" });
    }
    // Check if sender and receiver exist in the database
    const sender = await User.findById(senderId);
    const receiver = await User.findById(receiverId);
    if (!sender || !receiver) {
      return res.status(404).json({ error: "Sender or receiver not found" });
    }

    // create a new message
    const newMessage = new Message({
      sender: senderId,
      receiver: receiverId,
      content,
    });

    // Save the message to the database
    const savedMessage = await newMessage.save();

    // Find the chat between the sender and receiver
    let chat = await Chat.findOne({
      users: { $all: [senderId, receiverId] },
    });

    // If no chat exists, create a new one
    if (!chat) {
      chat = new Chat({
        users: [senderId, receiverId],
        messages: [],
      });
      await chat.save();
    }

    // Add the message to the chat
    chat.messages.push(savedMessage._id);
    await chat.save();

    res.status(200).json(savedMessage);
  } catch (error) {
    res.status(500).json({ error: "Failed to send message" });
  }
};

exports.getMessages = async (req, res) => {
  const { chatId } = req.params;

  try {
    // Validate input
    if (!chatId) {
      return res.status(400).json({ error: "Chat ID is required" });
    }

    // Find the chat by ID
    const chat = await Chat.findById(chatId).populate("messages");

    // Check if chat exists
    if (!chat) {
      return res.status(404).json({ error: "Chat not found" });
    }

    res.status(200).json(chat.messages);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve messages" });
  }
};

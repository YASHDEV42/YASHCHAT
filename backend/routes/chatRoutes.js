const express = require("express");
const router = express.Router();
const {
  getChat,
  getChatsByUser,
  createChat,
  addMessageToChat,
  deleteChat,
  updateChat,
} = require("../controllers/chatController");

router.get("/user/:userId", getChatsByUser);
router.get("/:id", getChat);
router.post("/", createChat);
router.post("/add-message", addMessageToChat);
router.delete("/:id", deleteChat);
router.patch("/update", updateChat);

module.exports = router;

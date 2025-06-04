const express = require("express");

const {
  sendMessage,
  getMessages,
} = require("../controllers/messageController.js");
const { protect } = require("../middleware/authMiddleware.js");

const router = express.Router();

router.route("/:chatId").get(protect, getMessages);
router.route("/").post(protect, sendMessage);

module.exports = router;

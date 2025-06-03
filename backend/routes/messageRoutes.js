import express from "express";
import { sendMessage, getMessages } from "../controllers/messageController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.route("/:chatId").get(protect, getMessages);
router.route("/").post(protect, sendMessage);

export default router;

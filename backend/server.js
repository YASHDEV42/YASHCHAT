const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const socketSetup = require("./socket");

dotenv.config();
/*
Purpose:
It loads variables from a .env file into process.env.
*/

const app = express();
const server = http.createServer(app);

app.use(cors());
/* 
Purpose:
Allows your frontend (e.g., on localhost:3000) to communicate with your backend (e.g., on localhost:5000), which are on different origins.
Without CORS, the browser will block the requests due to same-origin policy.
*/
app.use(express.json());
/*
Purpose:
Purpose:
Tells Express to automatically parse incoming requests with Content-Type: application/json and make it available in req.body.
*/

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/messages", require("./routes/messageRoutes"));
app.use("/api/chats", require("./routes/chatRoutes"));
app.use("/api/users", require("./routes/userRoutes"));

socketSetup(server);

const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");

    server.listen(process.env.PORT, () => {
      console.log(`Server running on port ${process.env.PORT}`);
    });
  } catch (err) {
    console.error("Failed to connect to MongoDB:", err);
    process.exit(1);
  }
};

startServer();

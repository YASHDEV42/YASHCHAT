# 🔸 YASHCHAT

YASHCHAT is a **full-stack real-time chat application** featuring secure user authentication, a modern UI, and real-time messaging using Socket.io. The project is split into two subfolders: a frontend built with **Next.js**, and a backend built with **Express.js**.

## 🌐 Live Demo

* **Frontend:** [https://yashchat-two.vercel.app](https://yashchat-two.vercel.app)
* **Backend (API):** [https://chat-backend-3e4y.onrender.com](https://chat-backend-3e4y.onrender.com)

---

## 📁 Project Structure

```
Chat-App/
│
├── backend/                  → Express.js backend
│   ├── controllers/          → Route logic (auth, user, chat, message)
│   ├── middleware/           → Auth middleware
│   ├── models/               → Mongoose models
│   ├── routes/               → API route files
│   ├── socket/               → Socket.io logic
│   ├── .env                  → Environment variables
│   └── server.js             → App entry point
│
└── frontend/                 → Next.js frontend
    ├── app/                  → App router pages
    ├── components/           → UI components (e.g., MessageCard, ThemeToggle)
    ├── lib/                  → API utilities & helpers
    ├── public/               → Static assets
    ├── .env.local            → Environment variables
    └── tailwind.config.js    → TailwindCSS config
```

---

## 🚀 Tech Stack

### Frontend

* **Framework:** [Next.js](https://nextjs.org/)
* **Styling:** [Tailwind CSS](https://tailwindcss.com/)
* **UI Components:** [shadcn/ui](https://ui.shadcn.com/)
* **Real-time:** [Socket.io Client](https://socket.io/docs/v4/client-api/)

### Backend

* **Server:** [Express.js](https://expressjs.com/)
* **Database:** [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
* **ORM:** [Mongoose](https://mongoosejs.com/)
* **Auth:** JWT (JSON Web Token)
* **Real-time:** [Socket.io](https://socket.io/)
* **Password Hashing:** bcryptjs

---

## 🔐 Authentication & Security

* JWT-based authentication.
* Passwords are securely hashed using **bcryptjs**.
* Protected routes using middleware (`/api/messages`, `/api/chats`).

---

## 📦 API Endpoints

### Auth Routes

| Method | Endpoint             | Description            |
| ------ | -------------------- | ---------------------- |
| POST   | `/api/auth/register` | Register new user      |
| POST   | `/api/auth/login`    | Login user & get token |

### User Routes

| Method | Endpoint         | Description    |
| ------ | ---------------- | -------------- |
| GET    | `/api/users`     | Get all users  |
| GET    | `/api/users/:id` | Get user by ID |
| PATCH  | `/api/users/:id` | Update user    |
| DELETE | `/api/users/:id` | Delete user    |

### Chat Routes

| Method | Endpoint                 | Description         |
| ------ | ------------------------ | ------------------- |
| GET    | `/api/chats/user/:id`    | Get all user chats  |
| GET    | `/api/chats/:id`         | Get single chat     |
| POST   | `/api/chats`             | Create new chat     |
| POST   | `/api/chats/add-message` | Add message to chat |
| PATCH  | `/api/chats/update`      | Update chat info    |
| DELETE | `/api/chats/:id`         | Delete chat         |

### Message Routes (🔐 Protected)

| Method | Endpoint                | Description             |
| ------ | ----------------------- | ----------------------- |
| GET    | `/api/messages/:chatId` | Get messages by chat ID |
| POST   | `/api/messages`         | Send new message        |

---

## 💡 Features

* ✅ User registration & login
* ✅ Real-time one-on-one messaging
* ✅ Theme toggling (light/dark mode)
* ✅ Secure backend with JWT
* 🔜 Group chats (coming soon!)
* 🔐 Protected chat/message endpoints

---

## ⚙️ Environment Variables

### Backend `.env`

```env
PORT=5000
MONGO_URI=your_mongo_uri
JWT_SECRET=your_jwt_secret
```

### Frontend `.env.local`

```env
NEXT_PUBLIC_API_BASE=https://chat-backend-3e4y.onrender.com
```

---

## 🛠️ Scripts

Run these from the respective directories:

### Backend

```bash
npm install
npm run dev
```

### Frontend

```bash
npm install
npm run dev
```

---

## ☁️ Deployment

* **Frontend:** [Vercel](https://vercel.com/)
* **Backend:** [Render](https://render.com/)

  * Socket.io is hosted on Render since Vercel doesn't support WebSockets.

---

## 🧑‍💻 Author

Made by [YASHDEV42](https://github.com/YASHDEV42)

# 📌 Totoz Wellness – Backend

This is the backend service for **Totoz Wellness**, a platform that helps caregivers support children’s mental health.
It provides a secure REST API for authentication, guides, directory listings, and Q&A features.

---

## ⚙️ Tech Stack

* **Node.js** – runtime
* **Express.js** – web framework
* **PostgreSQL** – relational database
* **Prisma / Sequelize** (ORM – to be confirmed by team)
* **JWT** – authentication & authorization
* **bcrypt** – password hashing

---

## 📂 Project Structure

```
backend/
  ├── src/
  │   ├── config/        # DB & environment config
  │   ├── middleware/    # auth, validation
  │   ├── models/        # database models (Prisma/Sequelize)
  │   ├── routes/        # route definitions
  │   ├── controllers/   # business logic
  │   ├── services/      # helper functions
  │   ├── utils/         # small helpers (tokens, hashing)
  │   └── app.js         # Express app entry
  ├── package.json
  ├── .env.example
  └── README.md
```

---

## 🚀 Getting Started

### 1. Clone the Repo

```bash
git clone https://github.com/<org-name>/totoz-wellness.git
cd totoz-wellness/backend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Environment

Create a `.env` file in `/backend` based on `.env.example`:

```
PORT=5000
DATABASE_URL=postgresql://username:password@localhost:5432/totoz_db
JWT_SECRET=supersecretkey
```

### 4. Run Database Migrations

*(Prisma example – if Sequelize, adjust accordingly)*

```bash
npx prisma migrate dev --name init
```

### 5. Start the Server

```bash
npm run dev
```

Server runs on: **[http://localhost:5000](http://localhost:5000)**

---

## 🔑 API Overview

### Auth

* `POST /auth/register` → Register user
* `POST /auth/login` → Login & get JWT

### Guides (TalkEasy)

* `GET /guides` → List guides
* `POST /guides` → Add guide *(admin only)*

### Directory (ConnectCare)

* `GET /directory` → List entries
* `POST /directory` → Add entry *(admin only)*

### Q&A (ParentCircle)

* `POST /questions` → Submit question
* `POST /answers` → Add answer *(admin only)*

---

## 🧪 Testing

Run unit tests:

```bash
npm test
```

---

## 📌 Contributing

1. Create a feature branch:

   ```bash
   git checkout -b feature/my-feature
   ```
2. Commit your changes.
3. Push the branch.
4. Open a Pull Request.

---

## 📜 License

This project is licensed under the **MIT License**. See [LICENSE](../LICENSE) for details.


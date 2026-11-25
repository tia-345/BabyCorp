
# BabyCorp 🩵

### Parenting is better together.

BabyCorp is a community-based parenting support platform designed to connect parents and caregivers with healthcare professionals. It aims to provide a supportive space where parents can share experiences, seek guidance, and manage important aspects of their baby's development.

## ✨ Features

- **User Authentication:** Secure registration and login for parents and healthcare professionals.
- **Professional Verification:** Admin approval system for healthcare professionals.
- **Parenting Community:** A platform for parents to connect and share experiences.
- **Baby Care Tracking:** Vaccination records, growth tracking, and developmental milestones.
- **Expert Guidance:** Access to healthcare professionals for parenting-related questions.

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| React.js | Frontend |
| Node.js | Backend runtime |
| Express.js | Backend framework |
| MongoDB | Database |
| Mongoose | Database modelling |
| JWT | Authentication |
| bcrypt | Password hashing |
| Multer | File uploads |

## 📁 Project Structure

```text
BabyCorp/
├── backend/
│   ├── config/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── server.js
│   └── package.json
├── public/
├── src/
├── .gitignore
└── package.json
```

## 🚀 Getting Started

### Prerequisites

- Node.js
- MongoDB
- npm

### 1. Clone the repository

```bash
git clone https://github.com/tia-345/BabyCorp.git
cd BabyCorp
```

### 2. Install frontend dependencies

```bash
npm install
```

### 3. Install backend dependencies

```bash
cd backend
npm install
```

### 4. Configure environment variables

Create a `.env` file inside the backend folder with your own local configuration:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/babycorp
JWT_SECRET=your_secret_key
CLIENT_URL=http://localhost:3000
NODE_ENV=development
ADMIN_EMAIL=your_admin_email
ADMIN_PASSWORD=your_admin_password
```

Never commit your actual `.env` file or credentials.

### 5. Start the backend

From the backend folder:

```bash
npm run dev
```

### 6. Start the frontend

Open another terminal in the project root:

```bash
npm start
```

Frontend: http://localhost:3000

Backend: http://localhost:5000

## 👩‍💻 Developer

**Tia**

BCA Final Year Project

---

*BabyCorp – Supporting parents, one milestone at a time.*

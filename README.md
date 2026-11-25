
# BabyCorp
### Parenting is better together.

Parenting comes with many questions, challenges, and little milestones. Having the right support can make the journey a little easier.

**BabyCorp** is my BCA final-year project, a parenting support platform designed to bring parents, caregivers, and healthcare professionals together in one place.

The idea is to create a space where parents can connect, share experiences, find guidance, and keep track of their baby's development.

## About the Project

BabyCorp aims to make parenting support more accessible by combining a supportive community with useful baby-care tools.

The platform is being developed with the following features in mind:

- **Parenting Community:** A space where parents can share experiences, ask questions, and connect with others.
- **Healthcare Professional Support:** A directory of verified healthcare professionals who can provide general guidance.
- **Baby Profiles:** Manage and organise information about multiple babies.
- **Vaccination Tracking:** Maintain vaccination records and keep track of upcoming dates.
- **Growth and Milestones:** Record a baby's growth and developmental milestones.
- **Parenting Resources:** Access useful parenting information and resources.

## Current Progress

BabyCorp is currently under development.

The following components have been implemented:

- Responsive React homepage.
- Parent and healthcare professional registration.
- User login and authentication using JWT.
- Password hashing using bcrypt.
- MongoDB database integration.
- Role-based user accounts.
- Healthcare professional certificate uploads.
- Admin dashboard.
- Professional certificate review and approval/rejection system.

Additional features are being developed.

## Technology Stack

| Technology | Purpose |
|---|---|
| React.js | Frontend |
| CSS | Styling |
| Node.js | Backend runtime |
| Express.js | Backend framework |
| MongoDB | Database |
| Mongoose | Database modelling |
| JWT | Authentication |
| bcrypt | Password hashing |
| Multer | File uploads |

## Project Structure

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

## Getting Started

### Prerequisites

- Node.js
- npm
- MongoDB
- Git

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

Create a `.env` file inside the `backend` folder:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/babycorp
JWT_SECRET=your_secret_key
CLIENT_URL=http://localhost:3000
NODE_ENV=development
ADMIN_EMAIL=your_admin_email
ADMIN_PASSWORD=your_admin_password
```

Use your own credentials and do not upload the `.env` file to GitHub.

### 5. Start the backend

From the backend folder:

```bash
npm run dev
```

### 6. Start the frontend

Open another terminal in the main project folder:

```bash
npm start
```

The application runs at:

- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## Future Development

The next stages of development include:

- Parent and baby profile management.
- Community posts, likes, and comments.
- Parenting groups and anonymous posting.
- Private messaging.
- Vaccination reminders.
- Baby growth and milestone tracking.
- Parenting resources and content moderation.

## About the Developer

I'm Tia, a BCA student currently working on my final-year project.

BabyCorp is an opportunity for me to explore full-stack web development while working on an idea that could be useful to parents and caregivers.

The project is a work in progress, and I look forward to developing it further.

---

**BabyCorp — Parenting is better together.**

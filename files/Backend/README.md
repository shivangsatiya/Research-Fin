# ResearchFin — Full Stack Project
## Backend Documentation & Mentor Q&A Guide

---

## 📁 Project Structure

```
researchfin-backend/
├── server.js        ← Main backend file (all API routes)
├── db.json          ← Database (auto-created when server starts)
├── package.json     ← Node.js project config & dependencies
└── node_modules/    ← Installed libraries
```

---

## 🚀 How to Run

```bash
# Step 1: Install dependencies (only once)
npm install

# Step 2: Start the server
node server.js

# You'll see:
# ✅ ResearchFin backend running at http://localhost:3000
```

---

## 🔌 API Endpoints

| Method | Route              | Auth Required | Purpose                        |
|--------|--------------------|---------------|--------------------------------|
| POST   | /api/register      | ❌ No         | Create new account             |
| POST   | /api/login         | ❌ No         | Login, get token               |
| GET    | /api/profile       | ✅ Yes        | Get logged-in user's profile   |
| POST   | /api/budget        | ✅ Yes        | Save budget items              |
| GET    | /api/budget        | ✅ Yes        | Fetch saved budget             |
| POST   | /api/assessment    | ✅ Yes        | Save quiz result               |
| GET    | /api/assessment    | ✅ Yes        | Fetch quiz result              |
| GET    | /api/admin/users   | ✅ Admin only | List all users                 |
| GET    | /api/stats         | ✅ Admin only | App-wide statistics            |

---

## 🧠 Core Concepts Explained (for your mentor)

### 1. What is a Backend?
The backend is the server-side part of the application that:
- Stores data permanently (in a database)
- Handles business logic (e.g., validating passwords)
- Sends data to the frontend when requested
- Controls who can access what

Your frontend (HTML/CSS/JS) is what users *see*. The backend is what makes it *work* with real persistent data.

### 2. What is an API?
API = Application Programming Interface.
It's a set of URLs your frontend calls to get or send data.
Example: When a user logs in, the frontend sends their password to `/api/login`. The backend checks it and sends back a token.

### 3. What is Express.js?
Express is a Node.js framework that makes it easy to create API routes. Think of it as a "router" — it decides what to do when someone visits a specific URL.

### 4. What is a REST API?
REST = Representational State Transfer.
Rules:
- GET → Read data
- POST → Create/send data
- PUT → Update data
- DELETE → Remove data

Our backend follows REST conventions.

### 5. What is JWT (JSON Web Token)?
After login, the server creates a token — like a digital ID card.
The frontend stores this token and sends it with every request.
The server verifies the token to know WHO is making the request.
Token format: `header.payload.signature` (three parts separated by dots).

### 6. What is bcrypt (Password Hashing)?
We NEVER store plain passwords. bcrypt converts "mypassword123" → a scrambled string like "$2a$10$Xk...".
This is a one-way process — you can't reverse it. On login, bcrypt *compares* (not decrypts) the password against the hash.

### 7. What is our Database?
We use **lowdb** — a simple JSON file database. It stores all data in `db.json`.
Structure:
```json
{
  "users": [...],
  "budgets": [...],
  "assessments": [...]
}
```
In production, you'd replace this with MySQL or MongoDB.

### 8. What is CORS?
Cross-Origin Resource Sharing. By default, browsers block requests from one domain to another.
Since our frontend (file://...) talks to our backend (localhost:3000), we need CORS enabled.
`app.use(cors())` handles this.

### 9. What is Middleware?
Middleware is code that runs *between* the request arriving and the response being sent.
Our `auth` function is middleware — it checks the JWT token before allowing access to protected routes.

---

## 🔐 Security Features Implemented

1. **Password Hashing** — bcrypt with salt rounds = 10
2. **JWT Authentication** — tokens expire in 24 hours
3. **Role-Based Access Control** — Admin routes reject non-admin users
4. **Input Validation** — All routes check for required fields
5. **Passwords never returned** — Profile route strips password from response

---

## 🧪 Testing the API (without frontend)

Use **Postman** or **Thunder Client** (VS Code extension):

**Register:**
```
POST http://localhost:3000/api/register
Body (JSON):
{
  "name": "Shivang Satiya",
  "regId": "23FE10ITE00261",
  "dept": "B.Tech IT",
  "role": 0,
  "password": "test1234"
}
```

**Login:**
```
POST http://localhost:3000/api/login
Body (JSON):
{
  "regId": "23FE10ITE00261",
  "password": "test1234"
}
```
→ Copy the `token` from response

**Save Budget (paste token):**
```
POST http://localhost:3000/api/budget
Header: authorization: <paste token here>
Body (JSON):
{
  "items": [
    { "cat": "Software", "desc": "Python libraries", "cost": 0, "alt": "yes" }
  ]
}
```

---

## ❓ Likely Mentor Questions & Answers

**Q: Why Node.js and not Python/Django?**
A: Node.js is JavaScript — the same language as our frontend, making it easier to maintain a consistent codebase. It's also non-blocking and event-driven, making it efficient for I/O operations like API calls.

**Q: Why not use MySQL or MongoDB?**
A: For a student demo project, lowdb (JSON file) is sufficient and has zero setup overhead. In a production system, we would migrate to PostgreSQL or MongoDB for scalability. The API structure doesn't change — only the database layer.

**Q: What is the difference between authentication and authorization?**
A: Authentication = proving WHO you are (login). Authorization = controlling WHAT you can do (admin-only routes). We implement both using JWT + role checks.

**Q: How does the token get sent from frontend to backend?**
A: After login, we store the token in `localStorage`. Every subsequent API call includes it in the HTTP `Authorization` header.

**Q: Is this secure enough for production?**
A: For a prototype, yes. For production we'd add: HTTPS, environment variables for secrets, rate limiting, input sanitization, and a proper database.

**Q: What is the full stack in this project?**
A: 
- Frontend: HTML + CSS + Vanilla JavaScript (your existing files)
- Backend: Node.js + Express.js
- Database: lowdb (JSON file)
- Auth: JWT + bcrypt
- Communication: REST API with JSON

**Q: What design pattern does your backend follow?**
A: MVC-lite — routes handle requests (Controller), lowdb handles data (Model), and JSON responses feed the frontend (View).

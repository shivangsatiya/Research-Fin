# ResearchFin — Backend

Built with Node.js + Express.js and lowdb (JSON file database).

## How to Run
```bash
npm install
node server.js
```

## API Endpoints
| Method | Route | Auth | Purpose |
|--------|-------|------|---------|
| POST | /api/register | ❌ | Create account |
| POST | /api/login | ❌ | Login, get token |
| GET | /api/profile | ✅ | Get user profile |
| POST | /api/budget | ✅ | Save budget |
| GET | /api/budget | ✅ | Load budget |
| POST | /api/assessment | ✅ | Save quiz result |
| GET | /api/assessment | ✅ | Load quiz result |
| GET | /api/admin/users | ✅ Admin | List all users |

## Tech Stack
- Node.js + Express.js
- lowdb (JSON database)
- JWT Authentication
- bcrypt Password Hashing
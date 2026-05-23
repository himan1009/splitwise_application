# Splitwise App

A splitwise-style expense tracker built as a two-part monorepo:

- `backend/` — Express API server with MongoDB, JWT auth, groups, debts, and expense tracking
- `frontend/` — React + Vite SPA with login/register, dashboard, debts, and group creation

---

## Project purpose

This app is designed to help friends or groups manage shared expenses and personal debts.
It supports:

- user registration and login
- authenticated API access using JWT tokens
- group creation and member management
- personal debt records between users
- recording expenses for groups with per-user splits
- dashboard summaries for quick balances

The repository is separated into two packages so frontend and backend can run independently.

---

## Repository structure

```text
Splitwise App/
├── backend/
│   ├── package.json
│   ├── src/
│   │   ├── app.js
│   │   ├── server.js
│   │   ├── config/db.js
│   │   ├── controllers/
│   │   │   ├── auth.controller.js
│   │   │   ├── expense.controller.js
│   │   ├── middleware/auth.js
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   ├── Group.js
│   │   │   ├── Expense.js
│   │   │   ├── Debt.js
│   │   ├── routes/
│   │   │   ├── auth.routes.js
│   │   │   ├── group.routes.js
│   │   │   ├── expense.routes.js
│   │   │   ├── debt.routes.js
│   ├── .gitignore
├── frontend/
│   ├── package.json
│   ├── src/
│   │   ├── App.jsx
│   │   ├── api/api.js
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── CreateGroup.jsx
│   │   │   ├── AddDebt.jsx
n│   │   │   ├── DebtDetails.jsx
│   ├── .gitignore
├── .gitignore
```

> Note: `frontend/src/pages/GroupDetails.jsx` currently contains commented-out code and may require completion before group-detail features work fully.

---

## Backend overview

### Technology stack

- Node.js + Express
- MongoDB via Mongoose
- JWT authentication
- bcrypt for password hashing
- CORS and JSON body parsing

### Main backend files

- `backend/src/server.js` — loads environment variables, connects to MongoDB, starts the Express server
- `backend/src/app.js` — configures middleware and mounts routes
- `backend/src/middleware/auth.js` — validates JWT tokens and attaches `req.user`
- `backend/src/controllers/auth.controller.js` — registration and login logic
- `backend/src/controllers/expense.controller.js` — create and list group expenses
- `backend/src/routes/*.js` — API routes for auth, groups, expenses, and debts

### Data models

- `User` — stores `name`, `email`, `password`
- `Group` — stores `name`, creator, and member IDs
- `Expense` — stores `groupId`, `description`, `amount`, payer, and split details
- `Debt` — stores `from`, `to`, `amount`, `description`, plus timestamps

### Backend API endpoints

#### Auth

- `POST /auth/register` — create a new user
- `POST /auth/login` — login and receive a JWT token + user info
- `DELETE /auth/delete-account` — delete current account (protected)

#### Groups

- `GET /groups/users` — returns all registered users for group creation
- `POST /groups` — create a new group with selected member IDs
- `GET /groups` — return groups that include the authenticated user
- `POST /groups/:groupId/add-member` — add another registered user to the group
- `DELETE /groups/:groupId` — delete a group; only the creator can delete

#### Expenses

- `POST /expenses` — add an expense for a group; split amounts must add up to total
- `GET /expenses/:groupId` — fetch expenses for a specific group

#### Debts

- `POST /debts` — add a personal debt record between two users
- `GET /debts` — get all debts involving the authenticated user
- `GET /debts/with/:userId` — get debt history with one user
- `DELETE /debts/:id` — delete a single debt record
- `DELETE /debts/all-with/:userId` — delete all debts between the authenticated user and that user

---

## Frontend overview

### Technology stack

- React + Vite
- React Router DOM for SPA routes
- Axios for HTTP requests
- Tailwind CSS for styling

### Main frontend files

- `frontend/src/App.jsx` — app routing and protected route handling
- `frontend/src/api/api.js` — Axios instance with JWT token interceptor
- `frontend/src/pages/Login.jsx` — login form and token storage
- `frontend/src/pages/Register.jsx` — new account registration
- `frontend/src/pages/Dashboard.jsx` — main summary of groups and personal debts
- `frontend/src/pages/CreateGroup.jsx` — create group UI and member selection
- `frontend/src/pages/AddDebt.jsx` — add a new personal debt record
- `frontend/src/pages/DebtDetails.jsx` — view transaction history with another user

### Frontend routes

- `/login`
- `/register`
- `/dashboard`
- `/create-group`
- `/add-debt`
- `/debt/:userId`
- `/group/:groupId` — page may be incomplete / under development

### Important behavior

- After login, the frontend stores `token` and `user` in `localStorage`
- `frontend/src/api/api.js` attaches the JWT token to protected API requests
- Dashboard shows both personal debt summaries and group cards
- Debt details calculate net balance per user and allow deletions

---

## Running the app locally

### 1. Backend setup

1. Open a terminal in `backend/`
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in `backend/` with:
   ```bash
   MONGO_URI=<your-mongodb-connection-string>
   JWT_SECRET=<optional-secret>
   ```
4. Start the backend server:
   ```bash
   npm run dev
   ```

The backend listens on port `5000` by default.

### 2. Frontend setup

1. Open a terminal in `frontend/`
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the frontend app:
   ```bash
   npm run dev
   ```

The frontend uses Vite and will usually start on `http://localhost:5173`.

### 3. Using the app

1. Open the frontend URL in your browser
2. Register a new account
3. Login to access the dashboard
4. Create a group, add members, and track debts
5. Add a personal debt record from the dashboard
6. View debt history with a user using `/debt/:userId`

---

## Notes and current state

- The backend has active support for auth, groups, expenses, and debts.
- The frontend login, register, dashboard, create group, add debt, and debt details pages are implemented.
- `GroupDetails.jsx` appears to be commented out and may need work before the `/group/:groupId` feature functions correctly.
- The app expects a running MongoDB instance and valid `MONGO_URI`.

---

## Recommended improvements

- complete the group details page and expense split UI
- add error handling for backend `500` responses on the frontend
- add logout functionality to remove `token` and `user` from `localStorage`
- add form validation for register/login and create group actions
- add README sections for deployment if you want to deploy the frontend and backend separately

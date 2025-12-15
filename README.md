# Project I - Chat App

This repository contains a real-time chat application with a React frontend and a Node.js backend. The app uses MongoDB for persistent data storage and Cloudinary for file/image uploads. Socket.IO handles real-time messaging.

## Table of Contents

- **Project**: Short description and features
- **Tech Stack**: Frontend, Backend, Database, File storage
- **Project Structure**: Key directories and files
- **Installed Libraries**: Frontend and backend dependency lists
- **Environment Variables**: Required `.env` keys
- **Run Locally**: Step-by-step instructions
- **API Endpoints**: Brief overview
- **Notes & Tips**n+
## Project

This project is a simple but complete chat application that supports:

- User registration and login (passwords hashed with bcrypt)
- Real-time messaging with Socket.IO
- Persistent message storage with MongoDB
- Conversations list and message history
- File/image upload support using Multer + Cloudinary
- Basic user search and online presence tracking

## Tech Stack

- Frontend: React (Vite)
- Backend: Node.js + Express
- Realtime: Socket.IO (client & server)
- Database: MongoDB (Mongoose)
- File storage: Cloudinary (via `multer-storage-cloudinary`)

## Project Structure (important files)

- `Chat-Application/` — React frontend (Vite)
	- `src/` — React source code
	- `package.json` — frontend deps & scripts
- `server/` — Node.js backend
	- `index.js` — main server file (Express + Socket.IO)
	- `models/` — Mongoose models (`User.js`, `Message.js`)
	- `package.json` — backend deps
- `README.md` — this file

## Installed Libraries

These lists are taken from the project's `package.json` files.

- Root `package.json` (workspace-level small deps):
	- `react-router-dom` ^7.9.6

- Frontend (`Chat-Application/package.json`):
	- Dependencies:
		- `react` ^19.2.0
		- `react-dom` ^19.2.0
		- `react-router-dom` ^7.9.6
		- `axios` ^1.13.2
		- `socket.io-client` ^4.8.1
		- `react-icons` ^5.5.0
		- `lucide-react` ^0.554.0
	- DevDependencies (build & lint):
		- `vite` ^7.2.4
		- `@vitejs/plugin-react` ^5.1.1
		- `eslint`, `@eslint/js`, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`, `globals`

- Backend (`server/package.json`):
	- `express` ^5.1.0
	- `mongoose` ^9.0.0
	- `socket.io` ^4.8.1
	- `cors` ^2.8.5
	- `dotenv` ^17.2.3
	- `bcrypt` ^6.0.0
	- `multer` ^2.0.2
	- `cloudinary` ^2.8.0
	- `multer-storage-cloudinary` ^4.0.0

If you add other packages later, update the `package.json` files accordingly.

## Environment Variables

Create a `.env` file inside `server/` and set (minimum):

- `CLOUDINARY_NAME` — your Cloudinary cloud name
- `CLOUDINARY_KEY` — your Cloudinary API key
- `CLOUDINARY_SECRET` — your Cloudinary API secret
- (optional) `MONGODB_URI` — if you want to use a hosted MongoDB; the server currently connects to `mongodb://127.0.0.1:27017/z-chat` by default

Example `server/.env`:

```
CLOUDINARY_NAME=your_cloud_name
CLOUDINARY_KEY=your_api_key
CLOUDINARY_SECRET=your_api_secret
MONGODB_URI=mongodb://127.0.0.1:27017/z-chat
```

Note: `index.js` config in the repository configures Cloudinary from these environment variables. If you set `MONGODB_URI`, update `index.js` to use it (or replace the hardcoded URI there).

## How to Run Locally

1) Install dependencies for the backend and frontend.

Backend (server):

```bash
cd server
npm install
```

Frontend (Chat-Application):

```bash
cd Chat-Application
npm install
```

2) Configure environment variables

Create `server/.env` as described above.

3) Start the backend server

```bash
cd server
# start with Node
node index.js

# Or if you prefer automatic restarts during development, install nodemon globally and run:
# npm i -g nodemon
# nodemon index.js
```

By default the server listens on port `3001` (see `server/index.js`).

4) Start the frontend (Vite)

```bash
cd Chat-Application
npm run dev
```

The Vite dev server usually serves at `http://localhost:5173` — the backend's Socket.IO CORS allows that origin by default.

5) Open the app in your browser

Frontend: `http://localhost:5173`
Backend: API root `http://localhost:3001`

## API Endpoints (brief)

- `POST /api/register` — Register a new user (passwords are hashed)
- `POST /api/login` — Login
- `GET /api/users?search=...` — Search users
- `POST /api/messages` — Save a message
- `GET /api/messages/:userId1/:userId2` — Get messages between two users
- `GET /api/conversations/:userId` — Get conversation list for user
- `POST /api/upload` — Upload a file (Multer + Cloudinary). Returns `fileUrl`, `fileName`, and `mimetype`.

Socket.IO events (server-side):

- `addUser` — register a connected user and mark online
- `sendMessage` — send a message to another connected user
- `getMessage` (emitted to recipient) — deliver real-time message
- `getOnlineUsers` — broadcast online users list
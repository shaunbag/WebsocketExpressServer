# Express WebSocket Server

A real-time WebSocket chat server built with Node.js, Express, and TypeScript. This server handles WebSocket connections, manages user sessions with persistent storage, and broadcasts messages to all connected clients, making it perfect for building simple web chat applications.

## Features

- 🔌 **WebSocket Support**: Real-time bidirectional communication using WebSocket protocol
- 🔐 **JWT Authentication**: Secure user authentication with JSON Web Tokens
- 👥 **User Management**: Track connected users and manage active sessions
- 💾 **Database Persistence**: SQLite database for user storage and authentication
- 🔒 **Password Security**: Bcrypt password hashing for secure credential storage
- 📨 **Message Broadcasting**: Broadcast messages to all connected clients in real-time
- 🌐 **CORS Enabled**: Configured for cross-origin requests
- 📝 **TypeScript**: Fully typed codebase for better development experience

## Tech Stack

- **Node.js** - Runtime environment
- **Express** - Web application framework
- **WebSocket (ws)** - WebSocket server implementation
- **TypeScript** - Type-safe JavaScript
- **JWT (jsonwebtoken)** - Authentication tokens
- **better-sqlite3** - SQLite database for persistent user storage
- **bcrypt** - Password hashing for secure authentication
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment variable management
- **UUID** - Unique identifier generation

## Project Structure

```
src/
├── server.ts          # Main server file with Express and WebSocket setup
├── authMiddleware.ts  # JWT authentication middleware and token generation
├── sqlite.ts          # Database operations and user management
├── Types.ts           # TypeScript type definitions (User, Message)
└── express.d.ts       # Express type extensions for Request.user
```

## Setup

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd ExpressWebsocketServer
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```env
JWT_SECRET=your-secret-key-here
```

4. Build the TypeScript code:
```bash
npm run build
```

5. Start the server:
```bash
npm start
```

For development with auto-rebuild:
```bash
npm run dev
```

The server will start on `http://localhost:4000`

**Note**: The SQLite database (`db.sqlite`) will be automatically created on first run if it doesn't exist.

## API Endpoints

### `GET /`
Health check endpoint that returns "Server Is Up!"

### `POST /register`
Register a new user account.

**Request Body:**
```json
{
  "name": "username",
  "password": "password"
}
```

**Success Response (200):**
```json
{
  "response": "User Successfully Created"
}
```

**Error Responses:**
- `400` - Name and Password Required
- `409` - Username Already Exists
- `500` - Internal Server Error

### `POST /login`
Authenticate a user and receive a JWT token.

**Request Body:**
```json
{
  "name": "username",
  "password": "password"
}
```

**Success Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses:**
- `400` - Name and Password Required
- `401` - Invalid Username Or Password
- `500` - Internal Server Error

## WebSocket Connection

### Connecting

Connect to the WebSocket server at `ws://localhost:4000/?token=<jwt-token>`

**Important**: You must first authenticate via the `/login` endpoint to obtain a JWT token before connecting to the WebSocket server.

The server will:
- Validate the JWT token
- Add the user to the connected users list
- Automatically send the current list of connected users upon connection
- Remove the user from the connected users list when they disconnect

**Connection Errors:**
- `4001` - No token provided
- `4002` - Invalid Token

### Message Format

Messages should be sent as JSON strings with the following structure:
```json
{
  "type": "message",
  "from": {
    "id": "user-id",
    "name": "username"
  },
  "content": "message content"
}
```

### Server Messages

When a client connects, the server sends:
```json
{
  "type": "users",
  "content": "[{\"id\":\"...\",\"name\":\"...\"}, ...]",
  "from": {
    "name": "Server"
  }
}
```

### Broadcasting

All messages received by the server are broadcast to all connected clients in real-time.

## Configuration

### CORS

The server is configured to allow requests from `http://localhost:5173` (default Vite dev server). To change this, modify the `corsOptions` in `server.ts`:

```typescript
const corsOptions = {
  origin: 'http://your-frontend-url',
  optionsSuccessStatus: 200
}
```

### Port

Default port is `4000`. To change it, modify the `PORT` constant in `server.ts`.

## Example Frontend

An example frontend application using this server can be found here: [ChattyMcChatface](https://github.com/shaunbag/ChattyMcChatface)

## Development

### Building

```bash
npm run build
```

This compiles TypeScript files from `src/` to `dist/`.

### Scripts

- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Run the compiled server
- `npm run dev` - Build and start the server

## Database

The server uses SQLite (`better-sqlite3`) for persistent user storage. The database file (`db.sqlite`) is automatically created in the project root on first run.

### Database Schema

**users table:**
- `id` (INTEGER PRIMARY KEY AUTOINCREMENT) - Unique user identifier
- `name` (TEXT NOT NULL UNIQUE) - Username (must be unique)
- `password_hash` (TEXT NOT NULL) - Bcrypt hashed password
- `created_at` (DATETIME) - Account creation timestamp

### Security

- Passwords are hashed using bcrypt with a salt rounds of 12
- JWT tokens expire after 1 hour
- WebSocket connections require valid JWT tokens for authentication

## License

ISC
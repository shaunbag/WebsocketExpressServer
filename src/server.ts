import express, { Request, Response } from 'express';
import cors from 'cors';
import { Message, User } from './Types';
import WebSocket from 'ws';
import dotenv from 'dotenv';
dotenv.config();
import { generateToken } from './authMiddleware';
import { v4 as uuidv4 } from 'uuid';

const app = express();
const PORT = 4000;
const server = require('http').createServer(app);
const Websocket = require('ws');
const wss = new Websocket.Server({ server: server });

let users: User[] = []

function addUser(user: User) {
  if(users.includes(user)) return
  users.push(user)
}

function removeUser(userId: string) {
  users.splice(users.findIndex(user => user.id === userId),1)
}

// cors config setup to allow origin for inital testing
const corsOptions = {
  origin: 'http://localhost:5173',
  optionsSuccessStatus: 200
}

app.use(cors(corsOptions))
app.use(express.json())

wss.on('connection', (ws: WebSocket, req: Request) => {

  const userId = req.url.split('userId')[1]

  ws.send(JSON.stringify({
          type: 'users',
          content: JSON.stringify(users),
          from: {name: 'Server'}
        }));

  ws.on('message', (message: WebSocket.RawData ) => {
    console.log(`Received message => ${message}`);
    wss.clients.forEach((client: { readyState: any; send: (arg0: any) => void; }) => {
      if (client.readyState === Websocket.OPEN) {
        client.send(message.toString());
      }
    });
  });

  ws.once('close', () => {
    removeUser(userId)
  })
});

app.get('/', (req: Request, res: Response) => {
  res.status(200).send('Server Is Up!')
});

app.post('/login', (req: Request, res: Response) => {
  console.log(req.body)
  const {name, password} = req.body
  const id = uuidv4();
  //create the user in DB and assign id: TODO
  const user: User = {
    id: id,
    name: name
  }
  addUser(user)
  const token = generateToken(user)
  res.json({ token })
})

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
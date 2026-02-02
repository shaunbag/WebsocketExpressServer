import express, { Request, Response } from 'express';
import cors from 'cors';
import { User } from './Types';
import WebSocket, { WebSocketServer } from 'ws';
import dotenv from 'dotenv';
dotenv.config();
import { generateToken, verifyJwt } from './authMiddleware';
import { loginUser, registerUser } from './sqlite';
import { parse } from 'url';

const app = express();
const PORT = 4000;
const server = require('http').createServer(app);
const wss = new WebSocketServer({ server: server });

// this users array is so that we can tell othger users connected who else is connected, TODO: dm and private ws messaging
let users: User[] = [];

/**Functions to hanle the users online array */
function addUser(user: User) {
  if (users.some(u => u.id === user.id)) return;
  users.push(user);
}

function removeUser(userId: number) {
  users.splice(users.findIndex(user => user.id === userId), 1);
}


// cors config setup to allow origin for inital testing
const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions))
app.use(express.json())



/** Websocket Handling */
wss.on('connection', (ws: WebSocket, req: Request) => {

  const url = parse(req.url || '', true);
  const token = url.query.token as string;

  if (!token) {
    ws.close(4001, 'No token provided');
    return;
  }

  try{
    const payload = verifyJwt(token)
    const userId = payload.id
    const name = payload.name
    const user: User = {id: userId, name: name};
    addUser(user);
    ws.once('close', () => {
      removeUser(Number(userId));
    });
    
  } catch (err) {
    ws.close(4002, 'Invalid Token')
  }

  ws.send(JSON.stringify({
    type: 'users',
    content: JSON.stringify(users),
    from: { name: 'Server' }
  }));

  ws.on('message', (message: WebSocket.RawData) => {
    console.log(`Received message => ${message}`);
    wss.clients.forEach((client: WebSocket) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message.toString());
      }
    });
  });


});

/**HTTP Api Requests */


// this is just to verify the server is running 
app.get('/', (req: Request, res: Response) => {
  res.status(200).send('Server Is Up!');
});

// Initial registering of users
app.post('/register', async (req: Request, res: Response) => {
  const { name, password } = req.body;
  if(!name || !password) {
    return res.status(400).json({response: 'Name and Password Required'});
  }
  
  try {
    const success = await registerUser(name, password);
    if(success){
      return res.json({response: 'User Successfully Created'});
    } else {
      return res.status(409).json({response: 'Username Already Exists'});
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({response: 'Internal Server Error'});
  }

})

// login post 
app.post('/login', async (req: Request, res: Response) => {
  console.log(req.body)
  const { name, password } = req.body;
  if(!name || !password) {
    return res.status(400).json({response: 'Name and Password Required'});
  }

  try {
    const id = await loginUser(name, password);
    if(id) {
      const user: User = {id, name};
      const token = generateToken(user);
      return res.json({token});
    } else {
      res.status(401).json({response: 'Invalid Username Or Password'});
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({ response: 'Internal Server Error'});
  }
})

server.listen(PORT, () => {
  console.log(`Server is running`);
});
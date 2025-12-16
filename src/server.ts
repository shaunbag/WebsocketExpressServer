import express from 'express';
const app = express();
const PORT = 4000;
const server = require('http').createServer(app);
const Websocket = require('ws');
const wss = new Websocket.Server({ server: server });


wss.on('connection', (ws: { on: (arg0: string, arg1: (message: any) => void) => void; send: (arg0: string) => void; }) => {
    
    ws.on('message', (message) => {
    wss.clients.forEach((client: { readyState: any; send: (arg0: any) => void; }) => {
      if (client.readyState === Websocket.OPEN) {
        client.send(message.toString());
      }
    });
  });
});

server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
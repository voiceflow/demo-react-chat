import { WebSocketServer } from 'ws';

const wss = new WebSocketServer({
  port: 9099,
});

let counter = 0;

wss.on('connection', function connection(ws) {
  ws.on('error', console.error);

  ws.on('message', function message(data) {
    console.log('received: %s', data);
  });

  ws.send('counting:');

  setInterval(() => {
    ws.send(++counter);
  }, 1000);
});

console.log('server is running on port 9099');

const net = require('net');
const WebSocket = require('ws');

const tcpClient = new net.Socket();
tcpClient.connect(9000, '127.0.0.1', () => {
    console.log('Connected to C++ Engine on port 9000');
});

const wss = new WebSocket.Server({ port: 8081 });
console.log('Switchboard WebSocket running on ws://localhost:8081');

wss.on('connection', (ws) => {
    console.log('React Frontend Connected');

    ws.on('message', (message) => {
        const data = JSON.parse(message);
        
        const orderId = `ORD_${Math.floor(Math.random() * 100000)}`;
        const orderString = `${orderId},User_D,${data.symbol},${data.side},${data.price},${data.qty}\n`;
        
        tcpClient.write(orderString);
    });

    tcpClient.on('data', (data) => {
        const trades = data.toString().trim().split('\n');
        trades.forEach(trade => {
            if (trade) ws.send(trade);
        });
    });
});
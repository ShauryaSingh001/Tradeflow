const net = require('net');
const WebSocket = require('ws');

// 1. Connect to C++ Engine
const tcpClient = new net.Socket();
tcpClient.connect(9000, '127.0.0.1', () => {
    console.log('Connected to C++ Engine on port 9000');
});

// 2. Start WebSocket Server for React
const wss = new WebSocket.Server({ port: 8081 });
console.log('Switchboard WebSocket running on ws://localhost:8081');

wss.on('connection', (ws) => {
    console.log('React Frontend Connected');

    // 3. React -> Node -> C++
    ws.on('message', (message) => {
        const data = JSON.parse(message);
        
        // THE CRITICAL FIX: We now include ${data.symbol} in the string!
        const orderId = `ORD_${Math.floor(Math.random() * 100000)}`;
        const orderString = `${orderId},User_D,${data.symbol},${data.side},${data.price},${data.qty}\n`;
        
        tcpClient.write(orderString);
    });

    // 4. C++ -> Node -> React
    tcpClient.on('data', (data) => {
        const trades = data.toString().trim().split('\n');
        trades.forEach(trade => {
            if (trade) ws.send(trade); // Forward the JSON straight to React
        });
    });
});
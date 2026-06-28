# 📊 TradeFlow: Live Algorithmic Trading Simulator

TradeFlow is a high-performance, multi-asset trading simulator built from scratch. It features a custom **Continuous Double Auction Matching Engine** written in C++, a Node.js WebSocket switchboard, and a modern React frontend. 

The platform simulates a live stock exchange with autonomous algorithmic "Market Maker" bots providing liquidity, allowing users to execute real-time Limit and Market orders across multiple assets.

## ✨ Features
* **C++ Matching Engine:** Processes concurrent buy/sell orders using Price-Time Priority.
* **Thread-Safe Architecture:** Utilizes `std::mutex` locking to safely process concurrent orders from human users and background algorithms simultaneously.
* **Algorithmic Market Makers:** Background C++ threads (`Algo_Alpha`, `Algo_Beta`, `Algo_Gamma`) autonomously inject liquidity and volatility across all supported assets.
* **Multi-Asset Support:** Trade dynamic tech stocks (AAPL, TSLA, NVDA, GOOGL) in independent, dynamically generated order book instances.
* **Real-Time Data Pipeline:** TCP Socket -> Node.js -> WebSocket -> React connection ensures trades appear on the frontend with zero-latency.
* **Live Portfolio P&L:** React dashboard dynamically calculates unrealized profits, average buy prices, and tracks cash balances.

## 🏗️ System Architecture
The platform is split into three decoupled layers:

1. **The Brain (C++):** `Engine.cpp`
   * Manages the `Exchange` and `OrderBook` classes using standard queues.
   * Runs the Matchmaker loop and background Robot threads.
   * Listens on a raw TCP socket (Port 9000).
2. **The Switchboard (Node.js):** `server.js`
   * Connects to the C++ engine via `net.Socket`.
   * Hosts a WebSocket server (`ws`) on Port 8081 for the frontend.
   * Acts as a lightning-fast translator between C++ strings and React JSON.
3. **The Glass (React.js):** `tradeflow-ui`
   * Modern, responsive interface styled as a "Learning Trading Simulator".
   * Tracks user balances, holds WebSocket connections, and renders the live Trade Tape.

## 🚀 Getting Started (Local Setup)

### Prerequisites
* C++ Compiler (GCC/MinGW for Windows)
* Node.js (v16+)
* npm or yarn

### 1. Boot the C++ Engine
Open a terminal in the root folder and compile the engine:
```bash
# Windows (requires Winsock library)
g++ Engine.cpp -o Engine.exe -lws2_32
./Engine.exe
You should see: [C++] MULTI-ASSET Engine online. Listening on Port 9000...

2. Start the Node.js Switchboard
Open a second terminal in the root folder:

Bash
node server.js
The C++ terminal will confirm the connection, and algorithmic trades will immediately begin logging.

3. Launch the React UI
Open a third terminal and navigate into the UI folder:

Bash
cd tradeflow-ui
npm install
npm run dev
Navigate to http://localhost:5173 in your browser. Happy trading!

#define NOMINMAX
#include <iostream>
#include <map>
#include <queue>
#include <string>
#include <sstream>
#include <vector>
#include <algorithm>
#include <thread>
#include <chrono>
#include <random>
#include <mutex>
#include <winsock2.h>
#include <ws2tcpip.h>

#pragma comment(lib, "ws2_32.lib")

// --- 1. ORDER STRUCT (With Symbols) ---
struct Order {
    std::string orderId;
    std::string userId;
    std::string symbol; 
    bool isBuy;
    double price;
    int quantity;
};

class OrderBook {
private:
    std::map<double, std::queue<Order>, std::greater<double>> bids;
    std::map<double, std::queue<Order>> asks;
    std::mutex bookMutex;

public:
    std::string processOrder(Order order) {
        std::lock_guard<std::mutex> lock(bookMutex);
        std::stringstream output;

        while (order.quantity > 0) {
            if (order.isBuy) {
                if (asks.empty() || asks.begin()->first > order.price) break;
                double bestAsk = asks.begin()->first;
                auto& restingOrders = asks.begin()->second;
                Order& restingOrder = restingOrders.front();
                int tradeQty = std::min(order.quantity, restingOrder.quantity);

                output << "{\"type\":\"TRADE_EXECUTED\", \"symbol\":\"" << order.symbol 
                       << "\", \"buyer\":\"" << order.userId 
                       << "\", \"seller\":\"" << restingOrder.userId 
                       << "\", \"price\":" << bestAsk 
                       << ", \"qty\":" << tradeQty << "}\n";

                order.quantity -= tradeQty;
                restingOrder.quantity -= tradeQty;
                if (restingOrder.quantity == 0) restingOrders.pop();
                if (restingOrders.empty()) asks.erase(asks.begin());
            } else { 
                if (bids.empty() || bids.begin()->first < order.price) break;
                double bestBid = bids.begin()->first;
                auto& restingOrders = bids.begin()->second;
                Order& restingOrder = restingOrders.front();
                int tradeQty = std::min(order.quantity, restingOrder.quantity);

                output << "{\"type\":\"TRADE_EXECUTED\", \"symbol\":\"" << order.symbol 
                       << "\", \"buyer\":\"" << restingOrder.userId 
                       << "\", \"seller\":\"" << order.userId 
                       << "\", \"price\":" << bestBid 
                       << ", \"qty\":" << tradeQty << "}\n";

                order.quantity -= tradeQty;
                restingOrder.quantity -= tradeQty;
                if (restingOrder.quantity == 0) restingOrders.pop();
                if (restingOrders.empty()) bids.erase(bids.begin());
            }
        }

        if (order.quantity > 0) {
            if (order.isBuy) bids[order.price].push(order);
            else asks[order.price].push(order);
        }
        return output.str();
    }
};

// --- 2. MASTER EXCHANGE ---
class Exchange {
private:
    std::map<std::string, OrderBook*> markets;
    std::mutex exchangeMutex;
public:
    OrderBook* getMarket(std::string symbol) {
        std::lock_guard<std::mutex> lock(exchangeMutex);
        if (markets.find(symbol) == markets.end()) {
            markets[symbol] = new OrderBook();
        }
        return markets[symbol];
    }
};

std::vector<std::string> split(const std::string &s, char delim) {
    std::vector<std::string> result;
    std::stringstream ss(s);
    std::string item;
    while (getline(ss, item, delim)) result.push_back(item);
    return result;
}

// --- 3. BOTS ---
void StartMarketMakers(SOCKET clientSocket, Exchange& exchange) {
    std::thread([clientSocket, &exchange]() {
        std::mt19937 rng(std::time(nullptr));
        std::uniform_int_distribution<int> sideDist(0, 1);
        std::uniform_int_distribution<int> qtyDist(1, 15);
        std::uniform_int_distribution<int> delayDist(800, 2500);

        std::string botNames[] = {"Algo_Alpha", "Algo_Beta", "Algo_Gamma"};
        std::string symbols[] = {"AAPL", "TSLA", "NVDA", "GOOGL"};
        std::map<std::string, double> basePrices = {
            {"AAPL", 190.00}, {"TSLA", 240.00}, {"NVDA", 950.00}, {"GOOGL", 2850.00}
        };

        while (true) {
            std::this_thread::sleep_for(std::chrono::milliseconds(delayDist(rng)));

            std::string sym = symbols[rng() % 4];
            double base = basePrices[sym];
            std::uniform_real_distribution<double> priceDist(base - 5.0, base + 5.0);

            Order botOrder;
            botOrder.orderId = "BOT_" + std::to_string(rng() % 10000);
            botOrder.userId = botNames[rng() % 3];
            botOrder.symbol = sym;
            botOrder.isBuy = (sideDist(rng) == 0);
            botOrder.price = std::round(priceDist(rng) * 100.0) / 100.0;
            botOrder.quantity = qtyDist(rng);

            std::string tradeResults = exchange.getMarket(botOrder.symbol)->processOrder(botOrder);

            if (!tradeResults.empty()) {
                send(clientSocket, tradeResults.c_str(), tradeResults.length(), 0);
            }
        }
    }).detach(); 
}

int main() {
    WSADATA wsaData;
    if (WSAStartup(MAKEWORD(2, 2), &wsaData) != 0) return 1;

    Exchange exchange;
    SOCKET server_fd, new_socket;
    struct sockaddr_in address;
    int addrlen = sizeof(address);
    char buffer[1024] = {0};

    if ((server_fd = socket(AF_INET, SOCK_STREAM, 0)) == INVALID_SOCKET) return 1;
    address.sin_family = AF_INET;
    address.sin_addr.s_addr = INADDR_ANY;
    address.sin_port = htons(9000);
    if (bind(server_fd, (struct sockaddr *)&address, sizeof(address)) == SOCKET_ERROR) return 1;
    if (listen(server_fd, 3) == SOCKET_ERROR) return 1;

    std::cout << "[C++] MULTI-ASSET Engine online. Listening on Port 9000...\n";

    if ((new_socket = accept(server_fd, (struct sockaddr *)&address, &addrlen)) == INVALID_SOCKET) return 1;
    std::cout << "[C++] Node.js Switchboard Connected!\n";

    StartMarketMakers(new_socket, exchange);

    while (true) {
        memset(buffer, 0, sizeof(buffer));
        int valread = recv(new_socket, buffer, 1024, 0);
        if (valread <= 0) break;

        std::string rawData(buffer);
        rawData.erase(std::remove(rawData.begin(), rawData.end(), '\n'), rawData.end()); 
        std::vector<std::string> parts = split(rawData, ',');
        
        if (parts.size() == 6) {
            Order newOrder;
            newOrder.orderId = parts[0];
            newOrder.userId = parts[1];
            newOrder.symbol = parts[2];
            newOrder.isBuy = (parts[3] == "BUY");
            newOrder.price = std::stod(parts[4]);
            newOrder.quantity = std::stoi(parts[5]);

            std::string tradeResults = exchange.getMarket(newOrder.symbol)->processOrder(newOrder);

            if (!tradeResults.empty()) {
                send(new_socket, tradeResults.c_str(), tradeResults.length(), 0);
            }
        }
    }

    closesocket(new_socket);
    closesocket(server_fd);
    WSACleanup();
    return 0;
}
#include <iostream>
#include <map>
#include <queue>
#include <string>
#include <algorithm>


struct Order {
    std::string orderId;
    std::string userId;
    bool isBuy;
    double price;
    int quantity;
};

class OrderBook {
private:
    std::map<double, std::queue<Order>, std::greater<double>> bids;
    std::map<double, std::queue<Order>> asks;

public:
    void processOrder(Order order) {
        std::cout << "--- Processing " << (order.isBuy ? "BUY" : "SELL") 
                  << " Order " << order.orderId << " for " << order.quantity 
                  << " shares @ Rs." << order.price << " ---\n";

        while (order.quantity > 0) {
            if (order.isBuy) {
                if (asks.empty() || asks.begin()->first > order.price) {
                    break;
                }

                double bestAskPrice = asks.begin()->first;
                auto& restingOrders = asks.begin()->second; 
                Order& restingOrder = restingOrders.front();

                int tradeQty = std::min(order.quantity, restingOrder.quantity);

                std::cout << "[TRADE EXECUTED] " << order.userId << " bought " << tradeQty 
                          << " shares from " << restingOrder.userId << " @ Rs." << bestAskPrice << "\n";

                order.quantity -= tradeQty;
                restingOrder.quantity -= tradeQty;

                if (restingOrder.quantity == 0) {
                    restingOrders.pop();
                }
                if (restingOrders.empty()) {
                    asks.erase(asks.begin());
                }

            } else { 
                if (bids.empty() || bids.begin()->first < order.price) {
                    break;
                }

                double bestBidPrice = bids.begin()->first;
                auto& restingOrders = bids.begin()->second;
                Order& restingOrder = restingOrders.front();

                int tradeQty = std::min(order.quantity, restingOrder.quantity);

                std::cout << "[TRADE EXECUTED] " << order.userId << " sold " << tradeQty 
                          << " shares to " << restingOrder.userId << " @ Rs." << bestBidPrice << "\n";

                order.quantity -= tradeQty;
                restingOrder.quantity -= tradeQty;

                if (restingOrder.quantity == 0) {
                    restingOrders.pop();
                }
                if (restingOrders.empty()) {
                    bids.erase(bids.begin());
                }
            }
        }

        if (order.quantity > 0) {
            if (order.isBuy) {
                bids[order.price].push(order);
                std::cout << "[ADDED TO BOOK] " << order.quantity << " shares added to Bids @ Rs." << order.price << "\n";
            } else {
                asks[order.price].push(order);
                std::cout << "[ADDED TO BOOK] " << order.quantity << " shares added to Asks @ Rs." << order.price << "\n";
            }
        }
        std::cout << "\n";
    }
};

int main() {
    OrderBook book;

    // Seed the book with three Sell orders (Asks)
    book.processOrder({"S1", "User_A", false, 150.50, 100});
    book.processOrder({"S2", "User_B", false, 151.00, 200});
    
    // User_C places a sell order at the same price as User_A. 
    // They will go to the back of the queue for the 150.50 price level!
    book.processOrder({"S3", "User_C", false, 150.50, 50}); 

    // Incoming Buy order that crosses the spread.
    // User_D wants 120 shares @ 150.50. 
    // They should get 100 from User_A, 20 from User_C, and 0 from User_B (too expensive).
    book.processOrder({"B1", "User_D", true, 150.50, 120});

    book.processOrder({"B2", "User_E", true, 149.00, 500});

    return 0;
}
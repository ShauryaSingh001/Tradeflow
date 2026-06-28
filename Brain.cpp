#include <iostream>
#include <map>
#include <queue>
#include <string>
#include <algorithm>

// 1. The Order Entity
struct Order {
    std::string orderId;
    std::string userId;
    bool isBuy;
    double price;
    int quantity;
};

// 2. The Engine
class OrderBook {
private:
    // Bids: Sorted descending (highest price first)
    std::map<double, std::queue<Order>, std::greater<double>> bids;
    // Asks: Sorted ascending (lowest price first)
    std::map<double, std::queue<Order>> asks;

public:
    void processOrder(Order order) {
        std::cout << "--- Processing " << (order.isBuy ? "BUY" : "SELL") 
                  << " Order " << order.orderId << " for " << order.quantity 
                  << " shares @ Rs." << order.price << " ---\n";

        // 3. MATCHING LOOP: Keep looping as long as the incoming order still needs shares
        while (order.quantity > 0) {
            if (order.isBuy) {
                // Stop matching if no sellers, or if the cheapest seller is too expensive
                if (asks.empty() || asks.begin()->first > order.price) {
                    break;
                }

                // Grab the best price and a REFERENCE to the queue of orders at that price
                double bestAskPrice = asks.begin()->first;
                auto& restingOrders = asks.begin()->second; 
                Order& restingOrder = restingOrders.front();

                // Figure out how many shares can actually be swapped right now
                int tradeQty = std::min(order.quantity, restingOrder.quantity);

                std::cout << "[TRADE EXECUTED] " << order.userId << " bought " << tradeQty 
                          << " shares from " << restingOrder.userId << " @ Rs." << bestAskPrice << "\n";

                // Deduct the traded shares from both orders
                order.quantity -= tradeQty;
                restingOrder.quantity -= tradeQty;

                // Clean up: If the resting order is empty, remove it from the front of the queue
                if (restingOrder.quantity == 0) {
                    restingOrders.pop();
                }
                // Clean up: If the queue for this price level is now empty, delete the price level entirely
                if (restingOrders.empty()) {
                    asks.erase(asks.begin());
                }

            } else { // Logic for a SELL order
                // Stop matching if no buyers, or if the highest buyer is too cheap
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

        // 4. THE LEFTOVERS: Add any remaining unmatched quantity to the Order Book
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

// 5. The Test Lab
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

    // Incoming Buy order that is too cheap (Limit Buy below the lowest Ask)
    book.processOrder({"B2", "User_E", true, 149.00, 500});

    return 0;
}
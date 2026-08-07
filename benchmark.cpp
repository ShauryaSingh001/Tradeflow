#define NOMINMAX
#include <iostream>
#include <chrono>
#include <string>
#include "Engine.cpp" 

void runLatencyTest() {
    OrderBook testBook;

    for (int i = 0; i < 500; ++i) {
        Order ask;
        ask.orderId = "ASK_" + std::to_string(i);
        ask.userId = "Maker";
        ask.symbol = "AAPL";
        ask.isBuy = false;
        ask.price = 150.00 + (i * 0.01);
        ask.quantity = 100;
        testBook.processOrder(ask);
    }

    Order buyOrder;
    buyOrder.orderId = "BUY_1";
    buyOrder.userId = "Taker";
    buyOrder.symbol = "AAPL";
    buyOrder.isBuy = true;
    buyOrder.price = 155.00;
    buyOrder.quantity = 50;

    const int iterations = 100000;
    auto start = std::chrono::high_resolution_clock::now();

    for (int i = 0; i < iterations; ++i) {
        volatile auto res = testBook.processOrder(buyOrder);
    }

    auto end = std::chrono::high_resolution_clock::now();
    auto duration = std::chrono::duration_cast<std::chrono::nanoseconds>(end - start).count();

    std::cout << "--- ORDER MATCHING LATENCY ---" << std::endl;
    std::cout << "Total iterations: " << iterations << std::endl;
    std::cout << "Average Latency per order: " << (double)duration / iterations << " ns\n" << std::endl;
}

void runThroughputTest() {
    OrderBook testBook;
    Order testOrder;
    testOrder.orderId = "BULK_1";
    testOrder.userId = "Trader";
    testOrder.symbol = "AAPL";
    testOrder.isBuy = true;
    testOrder.price = 140.00;
    testOrder.quantity = 10;

    const int totalOrders = 100000;
    auto start = std::chrono::high_resolution_clock::now();

    for (int i = 0; i < totalOrders; ++i) {
        testBook.processOrder(testOrder);
    }

    auto end = std::chrono::high_resolution_clock::now();
    auto durationSec = std::chrono::duration_cast<std::chrono::duration<double>>(end - start).count();

    std::cout << "--- SYSTEM THROUGHPUT ---" << std::endl;
    std::cout << "Processed " << totalOrders << " orders in " << durationSec << " seconds." << std::endl;
    std::cout << "Throughput: " << (totalOrders / durationSec) / 1000000.0 << " million orders/sec\n" << std::endl;
}

int main() {
    std::cout << "Running Tradeflow Performance Benchmarks...\n" << std::endl;
    runLatencyTest();
    runThroughputTest();
    return 0;
}
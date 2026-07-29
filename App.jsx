import React, { useState, useEffect, useRef } from 'react';

// THE COMMAND CENTER: Where users place trades
const OrderEntryForm = ({ onPlaceOrder }) => {
    const [side, setSide] = useState('BUY');
    const [type, setType] = useState('LIMIT');
    const [price, setPrice] = useState('');
    const [qty, setQty] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        onPlaceOrder({ side, type, price: parseFloat(price), qty: parseInt(qty) });
        setQty(''); 
    };

    return (
        <div style={{ padding: '20px', background: '#f8f9fa', borderRadius: '8px' }}>
            <h3>Place Order</h3>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button type="button" onClick={() => setSide('BUY')} style={{ flex: 1, padding: '10px', background: side === 'BUY' ? '#00cc66' : '#ccc', color: 'white', border: 'none' }}>BUY</button>
                    <button type="button" onClick={() => setSide('SELL')} style={{ flex: 1, padding: '10px', background: side === 'SELL' ? '#ff4d4d' : '#ccc', color: 'white', border: 'none' }}>SELL</button>
                </div>
                <select value={type} onChange={(e) => setType(e.target.value)} style={{ padding: '10px' }}>
                    <option value="LIMIT">Limit Order</option>
                    <option value="MARKET">Market Order</option>
                </select>
                <input type="number" placeholder="Price (₹)" value={price} onChange={(e) => setPrice(e.target.value)} disabled={type === 'MARKET'} required={type === 'LIMIT'} style={{ padding: '10px' }}/>
                <input type="number" placeholder="Quantity" value={qty} onChange={(e) => setQty(e.target.value)} required style={{ padding: '10px' }}/>
                <button type="submit" style={{ background: '#007bff', color: 'white', padding: '12px', border: 'none', fontWeight: 'bold' }}>Submit {side} Order</button>
            </form>
        </div>
    );
};

// THE MASTER DASHBOARD
export default function App() {
    const [lastPrice, setLastPrice] = useState(150.00);
    const [trades, setTrades] = useState([]);
    const wsRef = useRef(null);
    
    const userBalance = 1000000.00; 

    useEffect(() => {
        wsRef.current = new WebSocket('ws://localhost:8080');

        wsRef.current.onopen = () => console.log('Connected to Node.js Switchboard');

        wsRef.current.onmessage = (event) => {
            const data = JSON.parse(event.data);
            
            if (data.type === 'TRADE_EXECUTED') {
                setLastPrice(data.price);
                setTrades(prev => [`${data.buyer} bought ${data.qty} @ ₹${data.price} from ${data.seller}`, ...prev].slice(0, 10));
            } else if (data.type === 'ERROR') {
                alert(`Order Failed: ${data.msg}`);
            }
        };

        return () => wsRef.current.close();
    }, []);

    const handlePlaceOrder = (orderData) => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify(orderData));
        } else {
            alert("Not connected to server!");
        }
    };

    return (
        <div style={{ padding: '20px', fontFamily: 'system-ui, sans-serif', maxWidth: '900px', margin: '0 auto' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #eee', paddingBottom: '10px', marginBottom: '20px' }}>
                <h2>TradeFlow Exchange</h2>
                <div>
                    <span style={{ color: '#666', marginRight: '10px' }}>Available Cash:</span>
                    <strong style={{ fontSize: '1.2rem' }}>₹{userBalance.toLocaleString()}</strong>
                </div>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
                <OrderEntryForm onPlaceOrder={handlePlaceOrder} />
                
                <div>
                    <div style={{ textAlign: 'center', padding: '20px', background: '#222', color: '#00cc66', fontSize: '2rem', borderRadius: '8px', marginBottom: '20px' }}>
                        Last Traded Price: ₹{lastPrice.toFixed(2)}
                    </div>
                    
                    <h3>Live Trade Tape</h3>
                    <ul style={{ listStyle: 'none', padding: 0, fontFamily: 'monospace' }}>
                        {trades.map((trade, idx) => (
                            <li key={idx} style={{ padding: '8px', borderBottom: '1px solid #eee' }}>{trade}</li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}
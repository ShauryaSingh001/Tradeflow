import { useState, useEffect, useRef } from 'react';

// --- THE DESIGN SYSTEM ---
const colors = {
    bg: '#F8FAFC', 
    surface: '#FFFFFF', 
    border: '#E2E8F0',
    textMain: '#0F172A', 
    textMuted: '#64748B',
    buy: '#22C55E', 
    sell: '#EF4444',
    primaryBlue: '#3B82F6',
    accentGold: '#F59E0B'
};

const shadows = {
    card: '0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05)'
};

const fonts = {
    body: '"Inter", sans-serif',
    heading: '"Poppins", sans-serif',
    mono: '"JetBrains Mono", monospace'
};

// --- COMPONENTS ---
const Sidebar = ({ activeView, setActiveView }) => (
    <div style={{ width: '250px', background: colors.surface, borderRight: `1px solid ${colors.border}`, display: 'flex', flexDirection: 'column', padding: '24px' }}>
        <h2 style={{ fontFamily: fonts.heading, color: colors.primaryBlue, marginBottom: '40px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.5rem' }}>
            📊 TradeFlow
        </h2>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {['Dashboard', 'Market', 'Portfolio', 'Orders', 'Trade History'].map((item) => (
                <div 
                    key={item} 
                    onClick={() => setActiveView(item)}
                    style={{ 
                        padding: '12px 16px', 
                        borderRadius: '12px', 
                        cursor: 'pointer', 
                        background: activeView === item ? '#EFF6FF' : 'transparent', 
                        color: activeView === item ? colors.primaryBlue : colors.textMuted, 
                        fontWeight: activeView === item ? '600' : '500',
                        transition: 'all 0.2s ease'
                    }}
                >
                    {item}
                </div>
            ))}
        </nav>
    </div>
);

const Header = ({ userBalance, activeView }) => (
    <div style={{ height: '76px', background: colors.surface, borderBottom: `1px solid ${colors.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px' }}>
        <div style={{ fontFamily: fonts.heading, fontWeight: '600', fontSize: '1.25rem', color: colors.textMain }}>{activeView}</div>
        <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
            <div style={{ color: colors.textMuted, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                Cash Available: 
                <strong style={{ color: colors.textMain, fontSize: '1.1rem', fontFamily: fonts.mono }}>
                    ₹{userBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </strong>
            </div>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#E0E7FF', color: colors.primaryBlue, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontFamily: fonts.heading }}>
                S
            </div>
        </div>
    </div>
);

const MetricCard = ({ title, value, subtext, subtextColor }) => (
    <div style={{ background: colors.surface, padding: '24px', borderRadius: '16px', border: `1px solid ${colors.border}`, boxShadow: shadows.card }}>
        <div style={{ color: colors.textMuted, fontSize: '0.9rem', marginBottom: '8px', fontWeight: '500' }}>{title}</div>
        <div style={{ fontSize: '1.75rem', fontWeight: '700', color: colors.textMain, marginBottom: '4px', fontFamily: fonts.mono }}>{value}</div>
        {subtext && <div style={{ fontSize: '0.85rem', color: subtextColor, fontWeight: '600', fontFamily: fonts.mono }}>{subtext}</div>}
    </div>
);

const PortfolioView = ({ userBalance }) => {
    const holdings = [
        { sym: 'AAPL', qty: 10, avg: 180.00, ltp: 190.34 },
        { sym: 'TSLA', qty: 5, avg: 250.00, ltp: 240.60 },
        { sym: 'NVDA', qty: 2, avg: 900.00, ltp: 950.10 },
        { sym: 'GOOGL', qty: 3, avg: 2700.00, ltp: 2851.10 }
    ];

    let totalInvested = 0;
    let totalCurrentValue = 0;
    holdings.forEach(h => { totalInvested += (h.qty * h.avg); totalCurrentValue += (h.qty * h.ltp); });

    const totalPnl = totalCurrentValue - totalInvested;
    const pnlPercentage = ((totalPnl / totalInvested) * 100).toFixed(2);
    const pnlColor = totalPnl >= 0 ? colors.buy : colors.sell;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
                <MetricCard title="Total Value" value={`₹${(totalCurrentValue + userBalance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`} />
                <MetricCard title="Invested Amount" value={`₹${totalInvested.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`} />
                <MetricCard title="Total P&L" value={`${totalPnl >= 0 ? '+' : ''}₹${totalPnl.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`} subtext={`${totalPnl >= 0 ? '▲' : '▼'} ${Math.abs(pnlPercentage)}%`} subtextColor={pnlColor} />
                <MetricCard title="Cash Available" value={`₹${userBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`} />
            </div>

            <div style={{ background: colors.surface, borderRadius: '16px', border: `1px solid ${colors.border}`, padding: '24px', boxShadow: shadows.card }}>
                <h3 style={{ margin: '0 0 24px 0', fontSize: '1.25rem', color: colors.textMain, fontFamily: fonts.heading }}>Your Holdings ({holdings.length})</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr 1fr 1fr', color: colors.textMuted, fontSize: '0.85rem', paddingBottom: '16px', borderBottom: `1px solid ${colors.border}`, fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    <span>Instrument</span><span style={{ textAlign: 'right' }}>Qty</span><span style={{ textAlign: 'right' }}>Avg Price</span><span style={{ textAlign: 'right' }}>LTP</span><span style={{ textAlign: 'right' }}>Current Value</span><span style={{ textAlign: 'right' }}>P&L</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {holdings.map(stock => {
                        const currentValue = stock.qty * stock.ltp;
                        const pnl = currentValue - (stock.qty * stock.avg);
                        const pnlPct = ((pnl / (stock.qty * stock.avg)) * 100).toFixed(2);
                        const rowColor = pnl >= 0 ? colors.buy : colors.sell;

                        return (
                            <div key={stock.sym} style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr 1fr 1fr', padding: '16px 0', borderBottom: `1px solid ${colors.border}`, alignItems: 'center' }}>
                                <strong style={{ color: colors.textMain, fontSize: '1.05rem' }}>{stock.sym}</strong>
                                <span style={{ textAlign: 'right', fontFamily: fonts.mono }}>{stock.qty}</span>
                                <span style={{ textAlign: 'right', fontFamily: fonts.mono }}>₹{stock.avg.toFixed(2)}</span>
                                <span style={{ textAlign: 'right', fontFamily: fonts.mono }}>₹{stock.ltp.toFixed(2)}</span>
                                <span style={{ textAlign: 'right', fontFamily: fonts.mono }}>₹{currentValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                <span style={{ textAlign: 'right', color: rowColor, fontWeight: '700', fontFamily: fonts.mono }}>{pnl >= 0 ? '+' : ''}₹{pnl.toFixed(2)} <br/><span style={{ fontSize: '0.75rem' }}>{pnlPct}%</span></span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

const DashboardView = ({ userBalance, setActiveView }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div>
            <h2 style={{ margin: '0 0 8px 0', color: colors.textMain, fontFamily: fonts.heading, fontSize: '1.75rem' }}>Good Morning, Shaurya 📈</h2>
            <div style={{ color: colors.textMuted, fontSize: '1.05rem' }}>Portfolio Value: <strong style={{color: colors.textMain, fontFamily: fonts.mono}}>₹1,25,000</strong> <span style={{color: colors.buy, fontFamily: fonts.mono}}>(+3.2%)</span></div>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
            <MetricCard title="Portfolio Value" value="₹1,25,430.50" subtext="▲ 2.45% today" subtextColor={colors.buy} />
            <MetricCard title="Today's P&L" value="+₹2,350.75" subtext="▲ 1.91%" subtextColor={colors.buy} />
            <MetricCard title="Cash Available" value={`₹${userBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`} />
            <MetricCard title="Total Holdings" value="8" />
        </div>
    </div>
);

const OrderEntry = ({ onPlaceOrder, currentSymbol, setCurrentSymbol }) => {
    const [side, setSide] = useState('BUY');
    const [type, setType] = useState('LIMIT');
    const [price, setPrice] = useState('');
    const [qty, setQty] = useState('10');

    useEffect(() => {
        const basePrices = { AAPL: 190, TSLA: 240, NVDA: 950, GOOGL: 2850 };
        setPrice(basePrices[currentSymbol]);
    }, [currentSymbol]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onPlaceOrder({ symbol: currentSymbol, side, type, price: parseFloat(price), qty: parseInt(qty) });
    };

    return (
        <div style={{ background: colors.surface, borderRadius: '16px', border: `1px solid ${colors.border}`, overflow: 'hidden', boxShadow: shadows.card }}>
            <div style={{ padding: '20px 24px', borderBottom: `1px solid ${colors.border}`, fontWeight: '600', fontFamily: fonts.heading }}>Place Order</div>
            
            <div style={{ display: 'flex', padding: '16px 24px', gap: '12px' }}>
                <div onClick={() => setSide('BUY')} style={{ flex: 1, padding: '12px', textAlign: 'center', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', color: side === 'BUY' ? '#fff' : colors.textMain, background: side === 'BUY' ? colors.buy : '#F1F5F9', transition: 'all 0.2s' }}>BUY</div>
                <div onClick={() => setSide('SELL')} style={{ flex: 1, padding: '12px', textAlign: 'center', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', color: side === 'SELL' ? '#fff' : colors.textMain, background: side === 'SELL' ? colors.sell : '#F1F5F9', transition: 'all 0.2s' }}>SELL</div>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: '0 24px 24px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <select value={currentSymbol} onChange={(e) => setCurrentSymbol(e.target.value)} style={{ padding: '12px', borderRadius: '8px', border: `1px solid ${colors.border}`, fontSize: '1rem', fontWeight: '600', color: colors.textMain, outline: 'none' }}>
                    <option value="AAPL">AAPL - Apple Inc.</option>
                    <option value="TSLA">TSLA - Tesla</option>
                    <option value="NVDA">NVDA - NVIDIA Corp.</option>
                    <option value="GOOGL">GOOGL - Alphabet Inc.</option>
                </select>

                <div style={{ display: 'flex', gap: '12px', background: '#F8FAFC', padding: '4px', borderRadius: '8px' }}>
                    <div onClick={() => setType('LIMIT')} style={{ flex: 1, padding: '8px', textAlign: 'center', borderRadius: '6px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '500', background: type === 'LIMIT' ? '#fff' : 'transparent', boxShadow: type === 'LIMIT' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}>Limit</div>
                    <div onClick={() => setType('MARKET')} style={{ flex: 1, padding: '8px', textAlign: 'center', borderRadius: '6px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '500', background: type === 'MARKET' ? '#fff' : 'transparent', boxShadow: type === 'MARKET' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}>Market</div>
                </div>

                <div style={{ display: 'flex', gap: '16px' }}>
                    <div style={{ flex: 1 }}>
                        <label style={{ fontSize: '0.8rem', color: colors.textMuted, fontWeight: '500' }}>Price (₹)</label>
                        <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} disabled={type === 'MARKET'} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: `1px solid ${colors.border}`, marginTop: '6px', fontFamily: fonts.mono, outline: 'none' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                        <label style={{ fontSize: '0.8rem', color: colors.textMuted, fontWeight: '500' }}>Quantity</label>
                        <input type="number" value={qty} onChange={(e) => setQty(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: `1px solid ${colors.border}`, marginTop: '6px', fontFamily: fonts.mono, outline: 'none' }} />
                    </div>
                </div>

                <button type="submit" style={{ width: '100%', padding: '16px', borderRadius: '8px', border: 'none', background: side === 'BUY' ? colors.buy : colors.sell, color: 'white', fontWeight: '600', fontSize: '1rem', cursor: 'pointer', marginTop: '8px', transition: 'opacity 0.2s' }} onMouseOver={e=>e.target.style.opacity=0.9} onMouseOut={e=>e.target.style.opacity=1}>
                    Place {side} Order
                </button>
            </form>
        </div>
    );
};

// --- MAIN APP ---
export default function App() {
    const [activeView, setActiveView] = useState('Market');
    const [currentSymbol, setCurrentSymbol] = useState('AAPL'); 
    const [trades, setTrades] = useState([]);
    const [userBalance, setUserBalance] = useState(1000000.00); 
    const wsRef = useRef(null);

    useEffect(() => {
        wsRef.current = new WebSocket('ws://localhost:8081');
        wsRef.current.onopen = () => console.log('Connected to Switchboard');

        wsRef.current.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === 'TRADE_EXECUTED') {
                const newTrade = { ...data, time: new Date().toLocaleTimeString([], { hour12: false }) };
                setTrades(prev => [newTrade, ...prev].slice(0, 15));

                if (data.buyer === 'User_D') {
                    setUserBalance(prev => prev - (data.price * data.qty));
                } else if (data.seller === 'User_D') {
                    setUserBalance(prev => prev + (data.price * data.qty));
                }
            }
        };
        return () => wsRef.current.close();
    }, []);

    const handlePlaceOrder = (orderData) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify(orderData));
        }
    };

    const filteredTrades = trades.filter(t => t.symbol === currentSymbol);

    return (
        <div style={{ display: 'flex', height: '100vh', background: colors.bg, fontFamily: fonts.body, color: colors.textMain }}>
            <Sidebar activeView={activeView} setActiveView={setActiveView} />
            
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <Header userBalance={userBalance} activeView={activeView} />
                
                <div style={{ padding: '32px', overflowY: 'auto', flex: 1 }}>
                    {activeView === 'Dashboard' ? (
                        <DashboardView userBalance={userBalance} setActiveView={setActiveView} />
                    ) : activeView === 'Market' ? (
                        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px', height: '100%' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                                
                                <div style={{ background: colors.surface, borderRadius: '16px', border: `1px solid ${colors.border}`, padding: '24px', height: '400px', display: 'flex', flexDirection: 'column', boxShadow: shadows.card }}>
                                    <div style={{ fontSize: '1.25rem', color: colors.textMuted, fontWeight: '600', fontFamily: fonts.heading }}>{currentSymbol}</div>
                                    <div style={{ fontSize: '2.5rem', fontWeight: '700', color: colors.textMain, fontFamily: fonts.mono }}>
                                        {filteredTrades.length > 0 ? `₹${filteredTrades[0].price.toFixed(2)}` : 'Waiting for ticks...'} 
                                    </div>
                                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: colors.textMuted, border: `2px dashed ${colors.border}`, marginTop: '24px', borderRadius: '12px', background: '#F8FAFC' }}>
                                        Chart for {currentSymbol} (Coming Soon)
                                    </div>
                                </div>

                                <div style={{ background: colors.surface, borderRadius: '16px', border: `1px solid ${colors.border}`, flex: 1, minHeight: '300px', boxShadow: shadows.card }}>
                                    <div style={{ padding: '20px 24px', borderBottom: `1px solid ${colors.border}`, fontWeight: '600', fontFamily: fonts.heading }}>{currentSymbol} Recent Trades</div>
                                    <div style={{ padding: '0 24px' }}>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', color: colors.textMuted, fontSize: '0.85rem', padding: '16px 0', borderBottom: `1px solid ${colors.border}`, fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                            <span>Price (₹)</span><span>Quantity</span><span style={{ textAlign: 'right' }}>Time</span>
                                        </div>
                                        {filteredTrades.map((trade, idx) => (
                                            <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', fontSize: '0.95rem', padding: '14px 0', borderBottom: `1px solid ${colors.border}` }}>
                                                <span style={{ color: trade.buyer === 'User_D' ? colors.buy : colors.sell, fontWeight: '700', fontFamily: fonts.mono }}>{trade.price.toFixed(2)}</span>
                                                <span style={{ fontFamily: fonts.mono }}>{trade.qty}</span>
                                                <span style={{ textAlign: 'right', color: colors.textMuted, fontFamily: fonts.mono }}>{trade.time}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                                <OrderEntry onPlaceOrder={handlePlaceOrder} currentSymbol={currentSymbol} setCurrentSymbol={setCurrentSymbol} />
                                <div style={{ background: 'linear-gradient(135deg, #22C55E 0%, #3B82F6 100%)', borderRadius: '16px', flex: 1, padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'white', textAlign: 'center', boxShadow: shadows.card }}>
                                    <h3 style={{fontFamily: fonts.heading, margin: '0 0 8px 0'}}>Live Order Book</h3>
                                    <p style={{opacity: 0.9, fontSize: '0.9rem', margin: 0}}>Requires C++ Depth Updates</p>
                                </div>
                            </div>
                        </div>
                    ) : activeView === 'Portfolio' ? (
                        <PortfolioView userBalance={userBalance} />
                    ) : (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: colors.textMuted, fontSize: '1.2rem' }}>
                            The {activeView} module is currently under construction. 🚧
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
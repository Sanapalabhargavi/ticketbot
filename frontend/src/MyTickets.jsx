function MyTickets({ tickets, onBack }) {
    return (
        <div style={{
            maxWidth: '600px', margin: '0 auto', height: '100vh',
            display: 'flex', flexDirection: 'column', fontFamily: 'Arial'
        }}>

            {/* Header */}
            <div style={{
                background: '#1a56db', color: 'white',
                padding: '14px 16px',
                display: 'flex', alignItems: 'center', gap: '12px'
            }}>
                <button onClick={onBack} style={{
                    background: 'transparent', border: '1.5px solid white',
                    color: 'white', borderRadius: '8px', padding: '6px 12px',
                    cursor: 'pointer', fontSize: '13px'
                }}>
                    ← Back
                </button>
                <div>
                    <h2 style={{ margin: 0, fontSize: '18px' }}>🎫 My Tickets</h2>
                    <p style={{ margin: 0, fontSize: '12px', opacity: 0.85 }}>
                        Your booked tickets
                    </p>
                </div>
            </div>

            {/* Tickets List */}
            <div style={{
                flex: 1, overflowY: 'auto', padding: '16px',
                background: '#f5f5f5', display: 'flex', flexDirection: 'column', gap: '12px'
            }}>
                {tickets.length === 0 ? (
                    <div style={{
                        textAlign: 'center', marginTop: '80px', color: '#888'
                    }}>
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎫</div>
                        <p style={{ fontSize: '16px' }}>No tickets booked yet!</p>
                        <p style={{ fontSize: '13px' }}>Go back and book a ticket.</p>
                    </div>
                ) : (
                    tickets.map((ticket, i) => (
                        <div key={i} style={{
                            background: 'white', borderRadius: '12px',
                            padding: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                            borderLeft: '4px solid #1a56db'
                        }}>
                            <div style={{
                                display: 'flex', justifyContent: 'space-between',
                                alignItems: 'center', marginBottom: '10px'
                            }}>
                                <span style={{ fontSize: '20px' }}>
                                    {ticket.type === 'bus' ? '🚌' : ticket.type === 'train' ? '🚂' : '🎬'}
                                </span>
                                <span style={{
                                    background: '#e8f5e9', color: '#2e7d32',
                                    padding: '3px 10px', borderRadius: '20px', fontSize: '12px',
                                    fontWeight: '500'
                                }}>
                                    ✓ Confirmed
                                </span>
                            </div>

                            <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>
                                {ticket.type === 'movie'
                                    ? ticket.movie
                                    : `${ticket.from} → ${ticket.to}`}
                            </div>

                            <div style={{
                                display: 'grid', gridTemplateColumns: '1fr 1fr',
                                gap: '6px', fontSize: '13px', color: '#555'
                            }}>
                                <span>📅 {ticket.date}</span>
                                <span>💺 {ticket.seats} seat(s)</span>
                                <span>💰 ₹{ticket.total}</span>
                                <span>🎫 {ticket.id}</span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}

export default MyTickets
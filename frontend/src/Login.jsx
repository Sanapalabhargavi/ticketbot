import { useState } from 'react'

function Login({ onLogin }) {
    const [isRegister, setIsRegister] = useState(false)
    const [name, setName] = useState('')
    const [phone, setPhone] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')

    const handleSubmit = () => {
        if (!phone || !password) {
            setError('Phone and password required!')
            return
        }
        const userData = {
            id: Date.now(),
            name: name || phone,
            phone: phone
        }
        onLogin(userData)
    }

    return (
        <div style={{
            minHeight: '100vh', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            background: '#f0f4ff', fontFamily: 'Arial'
        }}>
            <div style={{
                background: 'white', borderRadius: '16px',
                padding: '32px', width: '100%', maxWidth: '380px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                    <div style={{ fontSize: '40px' }}>🤖</div>
                    <h2 style={{ margin: '8px 0 4px', color: '#1a56db' }}>TicketBot</h2>
                    <p style={{ margin: 0, color: '#888', fontSize: '13px' }}>
                        AI Ticket Booking Assistant
                    </p>
                </div>

                <div style={{
                    display: 'flex', background: '#f0f4ff',
                    borderRadius: '10px', padding: '4px', marginBottom: '20px'
                }}>
                    {['Login', 'Register'].map((tab, i) => (
                        <button key={tab} onClick={() => { setIsRegister(i === 1); setError('') }}
                            style={{
                                flex: 1, padding: '8px', border: 'none', borderRadius: '8px',
                                cursor: 'pointer', fontSize: '14px', fontWeight: '500',
                                background: (i === 1) === isRegister ? '#1a56db' : 'transparent',
                                color: (i === 1) === isRegister ? 'white' : '#666',
                            }}>
                            {tab}
                        </button>
                    ))}
                </div>

                {isRegister && (
                    <input value={name} onChange={e => setName(e.target.value)}
                        placeholder="Full Name"
                        style={{
                            width: '100%', padding: '11px 14px', marginBottom: '12px',
                            border: '1px solid #ddd', borderRadius: '8px',
                            fontSize: '14px', outline: 'none', boxSizing: 'border-box'
                        }}
                    />
                )}

                <input value={phone} onChange={e => setPhone(e.target.value)}
                    placeholder="Phone Number"
                    style={{
                        width: '100%', padding: '11px 14px', marginBottom: '12px',
                        border: '1px solid #ddd', borderRadius: '8px',
                        fontSize: '14px', outline: 'none', boxSizing: 'border-box'
                    }}
                />

                <input value={password} onChange={e => setPassword(e.target.value)}
                    placeholder="Password"
                    type="password"
                    onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                    style={{
                        width: '100%', padding: '11px 14px', marginBottom: '16px',
                        border: '1px solid #ddd', borderRadius: '8px',
                        fontSize: '14px', outline: 'none', boxSizing: 'border-box'
                    }}
                />

                {error && (
                    <div style={{ color: '#e53e3e', fontSize: '13px', marginBottom: '12px', textAlign: 'center' }}>
                        ⚠️ {error}
                    </div>
                )}

                <button onClick={handleSubmit}
                    style={{
                        width: '100%', padding: '12px', background: '#1a56db',
                        color: 'white', border: 'none', borderRadius: '8px',
                        fontSize: '15px', fontWeight: '500', cursor: 'pointer'
                    }}>
                    {isRegister ? 'Create Account' : 'Login'}
                </button>

                <p style={{ textAlign: 'center', fontSize: '12px', color: '#888', marginTop: '16px' }}>
                    {isRegister ? 'Already have account?' : "Don't have account?"}
                    <span onClick={() => { setIsRegister(!isRegister); setError('') }}
                        style={{ color: '#1a56db', cursor: 'pointer', marginLeft: '4px' }}>
                        {isRegister ? 'Login' : 'Register'}
                    </span>
                </p>
            </div>
        </div>
    )
}

export default Login
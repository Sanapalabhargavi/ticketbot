import { useState } from 'react'
import axios from 'axios'
import Login from './Login'
import MyTickets from './MyTickets'

const BACKEND = 'https://backend-delta-ten-61.vercel.app'

const LANGS = {
  te: {
    greeting: 'నమస్కారం! 👋 Bus, Train, Movie tickets book cheyyadaniki help chestanu!',
    placeholder: 'ఇక్కడ type చేయండి...',
    typing: 'TicketBot typing...',
  },
  en: {
    greeting: 'Hello! 👋 I can help you book Bus, Train, and Movie tickets!',
    placeholder: 'Type here...',
    typing: 'TicketBot typing...',
  },
  hi: {
    greeting: 'नमस्ते! 👋 Bus, Train, Movie tickets book करने में मदद करूंगा!',
    placeholder: 'यहाँ type करें...',
    typing: 'TicketBot typing...',
  }
}

const SESSION_ID = 'session_' + Math.random().toString(36).substr(2, 9)

function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user')
    return saved ? JSON.parse(saved) : null
  })

  const [lang, setLang] = useState('te')
  const [messages, setMessages] = useState([
    { role: 'bot', text: LANGS['te'].greeting }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState('chat')
  const [tickets, setTickets] = useState([])

  const handleLogin = (userData) => {
    localStorage.setItem('user', JSON.stringify(userData))
    setUser(userData)
  }

  const handleLogout = () => {
    localStorage.removeItem('user')
    setUser(null)
    setTickets([])
    setPage('chat')
  }

  if (!user) return <Login onLogin={handleLogin} />

  if (page === 'tickets') return (
    <MyTickets tickets={tickets} onBack={() => setPage('chat')} />
  )

  const changeLang = (newLang) => {
    setLang(newLang)
    setMessages([{ role: 'bot', text: LANGS[newLang].greeting }])
    setInput('')
  }

  const sendMessage = async () => {
    if (!input.trim()) return
    const userMsg = { role: 'user', text: input }
    const currentInput = input
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const res = await axios.post(`${BACKEND}/chat`,
        { message: currentInput, language: lang },
        { headers: { 'x-session-id': SESSION_ID } }
      )

      const reply = res.data.reply
      setMessages(prev => [...prev, { role: 'bot', text: reply }])

      if (reply.includes('Booking Confirmed') ||
        reply.includes('నిర్ధారించబడింది') ||
        reply.includes('पुष्टि')) {
        const lines = reply.split('\n')
        const idMatch = reply.match(/TKT\d+/)
        const priceMatch = reply.match(/₹(\d+)/)
        const seatsMatch = reply.match(/Seats?: (\d+)|సీట్లు: (\d+)|सीटें: (\d+)|టికెట్లు: (\d+)|Tickets?: (\d+)/)
        const routeLine = lines.find(l => l.includes('→'))
        const dateLine = lines.find(l => l.includes('Date:') || l.includes('తేదీ:') || l.includes('तारीख:'))

        const newTicket = {
          id: idMatch ? idMatch[0] : 'TKT' + Math.floor(Math.random() * 90000 + 10000),
          type: reply.includes('🎬') ? 'movie' : reply.includes('🚂') ? 'train' : 'bus',
          from: routeLine ? routeLine.split('→')[0].replace(/[🚌🚂🎬]/g, '').trim() : '',
          to: routeLine ? routeLine.split('→')[1]?.trim() : '',
          date: dateLine ? dateLine.split(':').slice(1).join(':').trim() : '',
          seats: seatsMatch ? (seatsMatch[1] || seatsMatch[2] || seatsMatch[3] || seatsMatch[4] || seatsMatch[5]) : '1',
          total: priceMatch ? priceMatch[1] : '350',
          movie: reply.includes('🎬') ? lines.find(l => l.includes('🎬'))?.replace('🎬', '').trim() : '',
        }
        setTickets(prev => [...prev, newTicket])
      }

    } catch (err) {
      setMessages(prev => [...prev, { role: 'bot', text: 'Error! Server check cheyyi.' }])
    }
    setLoading(false)
  }

  const handleKey = (e) => {
    if (e.key === 'Enter') sendMessage()
  }

  return (
    <div style={{
      maxWidth: '600px', margin: '0 auto', height: '100vh',
      display: 'flex', flexDirection: 'column', fontFamily: 'Arial'
    }}>

      {/* Header */}
      <div style={{
        background: '#1a56db', color: 'white',
        padding: '14px 16px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between'
      }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '18px' }}>🤖 TicketBot</h2>
          <p style={{ margin: 0, fontSize: '12px', opacity: 0.85 }}>
            Hello, {user.name}! 👋
          </p>
        </div>
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
          {[['te', 'తెలుగు'], ['en', 'English'], ['hi', 'हिंदी']].map(([code, label]) => (
            <button key={code} onClick={() => changeLang(code)} style={{
              padding: '5px 10px', borderRadius: '20px', fontSize: '12px',
              border: '1.5px solid white', cursor: 'pointer',
              background: lang === code ? 'white' : 'transparent',
              color: lang === code ? '#1a56db' : 'white',
              fontWeight: lang === code ? 'bold' : 'normal'
            }}>
              {label}
            </button>
          ))}
          <button onClick={() => setPage('tickets')} style={{
            padding: '5px 10px', borderRadius: '20px', fontSize: '12px',
            border: '1.5px solid white', cursor: 'pointer',
            background: 'transparent', color: 'white'
          }}>
            🎫 {tickets.length}
          </button>
          <button onClick={handleLogout} style={{
            padding: '5px 10px', borderRadius: '20px', fontSize: '12px',
            border: '1.5px solid white', cursor: 'pointer',
            background: 'transparent', color: 'white'
          }}>
            Logout
          </button>
        </div>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1, overflowY: 'auto', padding: '16px',
        background: '#f5f5f5', display: 'flex', flexDirection: 'column', gap: '10px'
      }}>
        {messages.map((msg, i) => (
          <div key={i} style={{
            display: 'flex',
            justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start'
          }}>
            <div style={{
              background: msg.role === 'user' ? '#1a56db' : 'white',
              color: msg.role === 'user' ? 'white' : 'black',
              padding: '10px 14px', borderRadius: '12px',
              maxWidth: '75%', fontSize: '14px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              whiteSpace: 'pre-line'
            }}>
              {msg.text}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ color: '#888', fontSize: '13px' }}>
            {LANGS[lang].typing}
          </div>
        )}
      </div>

      {/* Quick Buttons */}
      <div style={{
        display: 'flex', gap: '8px', padding: '8px 16px',
        background: 'white', borderTop: '1px solid #eee', flexWrap: 'wrap'
      }}>
        {['🚌 Bus', '🚂 Train', '🎬 Movie'].map(label => (
          <button key={label} onClick={() => setInput(label)} style={{
            padding: '6px 14px', borderRadius: '20px',
            border: '1px solid #1a56db', background: 'white',
            color: '#1a56db', cursor: 'pointer', fontSize: '13px'
          }}>
            {label}
          </button>
        ))}
      </div>

      {/* Input */}
      <div style={{
        display: 'flex', gap: '8px', padding: '12px 16px',
        background: 'white', borderTop: '1px solid #eee'
      }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder={LANGS[lang].placeholder}
          style={{
            flex: 1, padding: '10px', borderRadius: '8px',
            border: '1px solid #ddd', fontSize: '14px', outline: 'none'
          }}
        />
        <button onClick={sendMessage} style={{
          background: '#1a56db', color: 'white', border: 'none',
          borderRadius: '8px', padding: '10px 18px',
          cursor: 'pointer', fontSize: '14px'
        }}>
          Send
        </button>
      </div>
    </div>
  )
}

export default App
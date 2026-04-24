import { useState } from 'react'
import Login from './Login'
import MyTickets from './MyTickets'

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

// Booking steps
const STEPS = {
  idle: null,
  get_from: 'from',
  get_to: 'to',
  get_date: 'date',
  get_seats: 'seats',
  get_movie: 'movie',
  get_movie_date: 'date',
  get_movie_seats: 'seats',
}

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
  const [session, setSession] = useState({ step: 'idle', type: null, data: {} })

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
  if (page === 'tickets') return <MyTickets tickets={tickets} onBack={() => setPage('chat')} />

  const changeLang = (newLang) => {
    setLang(newLang)
    setMessages([{ role: 'bot', text: LANGS[newLang].greeting }])
    setInput('')
    setSession({ step: 'idle', type: null, data: {} })
  }

  const getReply = (msg, currentSession) => {
    const m = msg.toLowerCase()
    let reply = ''
    let newSession = { ...currentSession, data: { ...currentSession.data } }

    if (newSession.step === 'idle') {
      if (m.includes('bus') || m.includes('బస్సు') || m.includes('बस')) {
        newSession.type = 'bus'
        newSession.step = 'get_from'
        reply = lang === 'te' ? 'బస్సు టికెట్! 🚌 ఎక్కడి నుండి వెళ్తున్నారు?' :
          lang === 'hi' ? 'बस टिकट! 🚌 कहाँ से जाएंगे?' :
            'Bus ticket! 🚌 Where are you traveling FROM?'
      } else if (m.includes('train') || m.includes('రైలు') || m.includes('ट्रेन')) {
        newSession.type = 'train'
        newSession.step = 'get_from'
        reply = lang === 'te' ? 'రైలు టికెట్! 🚂 ఏ స్టేషన్ నుండి?' :
          lang === 'hi' ? 'ट्रेन टिकट! 🚂 किस स्टेशन से?' :
            'Train ticket! 🚂 Which station FROM?'
      } else if (m.includes('movie') || m.includes('సినిమా') || m.includes('मूवी') || m.includes('film')) {
        newSession.type = 'movie'
        newSession.step = 'get_movie'
        reply = lang === 'te' ? 'సినిమా టికెట్! 🎬 ఏ సినిమా చూడాలి?' :
          lang === 'hi' ? 'मूवी टिकट! 🎬 कौन सी मूवी?' :
            'Movie ticket! 🎬 Which movie do you want to watch?'
      } else {
        reply = lang === 'te' ? 'నమస్కారం! 👋 Bus, Train లేదా Movie టికెట్ కావాలా?' :
          lang === 'hi' ? 'नमस्ते! 👋 Bus, Train या Movie टिकट चाहिए?' :
            'Hello! 👋 Do you want Bus, Train, or Movie ticket?'
      }
    } else if (newSession.step === 'get_from') {
      newSession.data.from = msg
      newSession.step = 'get_to'
      reply = lang === 'te' ? `${msg} నుండి! ఎక్కడికి వెళ్తున్నారు?` :
        lang === 'hi' ? `${msg} से! कहाँ जाना है?` :
          `From ${msg}! Where are you going TO?`
    } else if (newSession.step === 'get_to') {
      newSession.data.to = msg
      newSession.step = 'get_date'
      reply = lang === 'te' ? `${msg} కి! తేదీ ఏమిటి? (ఉదా: మే 10)` :
        lang === 'hi' ? `${msg} को! तारीख? (जैसे: 10 मई)` :
          `To ${msg}! What is the travel date? (e.g. May 10)`
    } else if (newSession.step === 'get_date') {
      newSession.data.date = msg
      newSession.step = 'get_seats'
      reply = lang === 'te' ? `${msg} తేదీన! ఎన్ని సీట్లు కావాలి?` :
        lang === 'hi' ? `${msg} को! कितनी सीटें?` :
          `On ${msg}! How many seats do you need?`
    } else if (newSession.step === 'get_seats') {
      const seats = parseInt(msg) || 1
      const price = newSession.type === 'bus' ? 350 : 680
      const total = seats * price
      const d = newSession.data
      const ticketId = 'TKT' + Math.floor(Math.random() * 90000 + 10000)

      // Save ticket
      const newTicket = {
        id: ticketId, type: newSession.type,
        from: d.from, to: d.to, date: d.date,
        seats: seats, total: total, movie: ''
      }
      setTickets(prev => [...prev, newTicket])

      newSession.step = 'idle'
      newSession.type = null
      newSession.data = {}

      reply = lang === 'te' ?
        `✅ బుకింగ్ నిర్ధారించబడింది!\n\n${newSession.type === 'bus' ? '🚌' : '🚂'} ${d.from} → ${d.to}\n📅 తేదీ: ${d.date}\n💺 సీట్లు: ${seats}\n💰 మొత్తం: ₹${total}\n\n🎫 టికెట్ ID: ${ticketId}\nశుభ యాత్ర! 🎉` :
        lang === 'hi' ?
          `✅ बुकिंग हो गई!\n\n${newSession.type === 'bus' ? '🚌' : '🚂'} ${d.from} → ${d.to}\n📅 तारीख: ${d.date}\n💺 सीटें: ${seats}\n💰 कुल: ₹${total}\n\n🎫 ID: ${ticketId}\nशुभ यात्रा! 🎉` :
          `✅ Booking Confirmed!\n\n${newSession.type === 'bus' ? '🚌' : '🚂'} ${d.from} → ${d.to}\n📅 Date: ${d.date}\n💺 Seats: ${seats}\n💰 Total: ₹${total}\n\n🎫 Ticket ID: ${ticketId}\nHave a great journey! 🎉`
    } else if (newSession.step === 'get_movie') {
      newSession.data.movie = msg
      newSession.step = 'get_movie_date'
      reply = lang === 'te' ? `${msg} సినిమా! తేదీ మరియు సమయం? (ఉదా: మే 10, సాయంత్రం 6)` :
        lang === 'hi' ? `${msg} मूवी! तारीख और समय?` :
          `${msg} movie! Date and showtime? (e.g. May 10, 6 PM)`
    } else if (newSession.step === 'get_movie_date') {
      newSession.data.date = msg
      newSession.step = 'get_movie_seats'
      reply = lang === 'te' ? 'ఎన్ని టికెట్లు కావాలి?' :
        lang === 'hi' ? 'कितने टिकट?' : 'How many tickets?'
    } else if (newSession.step === 'get_movie_seats') {
      const tickets2 = parseInt(msg) || 1
      const total = tickets2 * 250
      const d = newSession.data
      const ticketId = 'TKT' + Math.floor(Math.random() * 90000 + 10000)

      const newTicket = {
        id: ticketId, type: 'movie',
        from: '', to: '', date: d.date,
        seats: tickets2, total: total, movie: d.movie
      }
      setTickets(prev => [...prev, newTicket])

      newSession.step = 'idle'
      newSession.type = null
      newSession.data = {}

      reply = lang === 'te' ?
        `✅ బుకింగ్ నిర్ధారించబడింది!\n\n🎬 సినిమా: ${d.movie}\n📅 తేదీ: ${d.date}\n🎟️ టికెట్లు: ${tickets2}\n💰 మొత్తం: ₹${total}\n\n🎫 టికెట్ ID: ${ticketId}\nఆనందంగా చూడండి! 🍿` :
        lang === 'hi' ?
          `✅ बुकिंग हो गई!\n\n🎬 मूवी: ${d.movie}\n📅 तारीख: ${d.date}\n🎟️ टिकट: ${tickets2}\n💰 कुल: ₹${total}\n\n🎫 ID: ${ticketId}\nमज़े करें! 🍿` :
          `✅ Booking Confirmed!\n\n🎬 Movie: ${d.movie}\n📅 Date: ${d.date}\n🎟️ Tickets: ${tickets2}\n💰 Total: ₹${total}\n\n🎫 Ticket ID: ${ticketId}\nEnjoy the movie! 🍿`
    }

    return { reply, newSession }
  }

  const sendMessage = () => {
    if (!input.trim() || loading) return
    const userMsg = { role: 'user', text: input }
    const currentInput = input
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    setTimeout(() => {
      const { reply, newSession } = getReply(currentInput, session)
      setSession(newSession)
      setMessages(prev => [...prev, { role: 'bot', text: reply }])
      setLoading(false)
    }, 600)
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
          <p style={{ margin: 0, fontSize: '12px', opacity: 0.85 }}>Hello, {user.name}! 👋</p>
        </div>
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
          {[['te', 'తెలుగు'], ['en', 'English'], ['hi', 'हिंदी']].map(([code, label]) => (
            <button key={code} onClick={() => changeLang(code)} style={{
              padding: '5px 10px', borderRadius: '20px', fontSize: '12px',
              border: '1.5px solid white', cursor: 'pointer',
              background: lang === code ? 'white' : 'transparent',
              color: lang === code ? '#1a56db' : 'white',
              fontWeight: lang === code ? 'bold' : 'normal'
            }}>{label}</button>
          ))}
          <button onClick={() => setPage('tickets')} style={{
            padding: '5px 10px', borderRadius: '20px', fontSize: '12px',
            border: '1.5px solid white', cursor: 'pointer',
            background: 'transparent', color: 'white'
          }}>🎫 {tickets.length}</button>
          <button onClick={handleLogout} style={{
            padding: '5px 10px', borderRadius: '20px', fontSize: '12px',
            border: '1.5px solid white', cursor: 'pointer',
            background: 'transparent', color: 'white'
          }}>Logout</button>
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
            }}>{msg.text}</div>
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
          }}>{label}</button>
        ))}
      </div>

      {/* Input */}
      <div style={{
        display: 'flex', gap: '8px', padding: '12px 16px',
        background: 'white', borderTop: '1px solid #eee'
      }}>
        <input value={input} onChange={e => setInput(e.target.value)}
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
        }}>Send</button>
      </div>
    </div>
  )
}

export default App
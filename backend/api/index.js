const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const sessions = {};
const users = [];

app.post('/register', (req, res) => {
    const { name, phone, password } = req.body;
    const exists = users.find(u => u.phone === phone);
    if (exists) return res.status(400).json({ error: 'Phone already registered!' });
    const user = { id: Date.now(), name, phone, password };
    users.push(user);
    res.json({ user: { id: user.id, name: user.name, phone: user.phone } });
});

app.post('/login', (req, res) => {
    const { phone, password } = req.body;
    const user = users.find(u => u.phone === phone && u.password === password);
    if (!user) return res.status(400).json({ error: 'Wrong phone or password!' });
    res.json({ user: { id: user.id, name: user.name, phone: user.phone } });
});

app.post('/chat', (req, res) => {
    const { message, language = 'te' } = req.body;
    const msg = message.toLowerCase();
    const sessionId = req.headers['x-session-id'] || 'default';

    if (!sessions[sessionId]) sessions[sessionId] = { step: 'idle', type: null, data: {} };
    const session = sessions[sessionId];
    let reply = '';

    if (session.step === 'idle') {
        if (msg.includes('bus') || msg.includes('బస్సు') || msg.includes('बस')) {
            session.type = 'bus'; session.step = 'get_from';
            reply = language === 'te' ? 'బస్సు టికెట్! మీరు ఎక్కడి నుండి బయలుదేరుతున్నారు?' :
                language === 'hi' ? 'बस टिकट! कहाँ से जाएंगे?' :
                    'Bus ticket! Where are you traveling FROM?';
        } else if (msg.includes('train') || msg.includes('రైలు') || msg.includes('ट्रेन')) {
            session.type = 'train'; session.step = 'get_from';
            reply = language === 'te' ? 'రైలు టికెట్! ఏ స్టేషన్ నుండి?' :
                language === 'hi' ? 'ट्रेन टिकट! किस स्टेशन से?' :
                    'Train ticket! Which station FROM?';
        } else if (msg.includes('movie') || msg.includes('సినిమా') || msg.includes('मूवी')) {
            session.type = 'movie'; session.step = 'get_movie';
            reply = language === 'te' ? 'సినిమా టికెట్! ఏ సినిమా చూడాలి?' :
                language === 'hi' ? 'मूवी टिकट! कौन सी मूवी?' :
                    'Movie ticket! Which movie?';
        } else {
            reply = language === 'te' ? 'నమస్కారం! Bus, Train లేదా Movie టికెట్ కావాలా?' :
                language === 'hi' ? 'नमस्ते! Bus, Train या Movie टिकट चाहिए?' :
                    'Hello! Do you want Bus, Train, or Movie ticket?';
        }
    } else if (session.step === 'get_from') {
        session.data.from = message; session.step = 'get_to';
        reply = language === 'te' ? `${message} నుండి! ఎక్కడికి వెళ్తున్నారు?` :
            language === 'hi' ? `${message} से! कहाँ जाना है?` :
                `From ${message}! Where are you going TO?`;
    } else if (session.step === 'get_to') {
        session.data.to = message; session.step = 'get_date';
        reply = language === 'te' ? `${message} కి! తేదీ ఏమిటి?` :
            language === 'hi' ? `${message} को! तारीख?` :
                `To ${message}! What is the date?`;
    } else if (session.step === 'get_date') {
        session.data.date = message; session.step = 'get_seats';
        reply = language === 'te' ? `${message} తేదీన! ఎన్ని సీట్లు?` :
            language === 'hi' ? `${message} को! कितनी सीटें?` :
                `On ${message}! How many seats?`;
    } else if (session.step === 'get_seats') {
        const seats = parseInt(message) || 1;
        const price = session.type === 'bus' ? 350 : 680;
        const total = seats * price;
        const d = session.data;
        session.step = 'idle'; session.data = {};
        reply = language === 'te' ?
            `✅ బుకింగ్ నిర్ధారించబడింది!\n\n🚌 ${d.from} → ${d.to}\n📅 తేదీ: ${d.date}\n💺 సీట్లు: ${seats}\n💰 మొత్తం: ₹${total}\n\n🎫 టికెట్ ID: TKT${Math.floor(Math.random() * 90000 + 10000)}\nశుభ యాత్ర! 🎉` :
            language === 'hi' ?
                `✅ बुकिंग हो गई!\n\n🚌 ${d.from} → ${d.to}\n📅 तारीख: ${d.date}\n💺 सीटें: ${seats}\n💰 कुल: ₹${total}\n\n🎫 ID: TKT${Math.floor(Math.random() * 90000 + 10000)}\nशुभ यात्रा! 🎉` :
                `✅ Booking Confirmed!\n\n🚌 ${d.from} → ${d.to}\n📅 Date: ${d.date}\n💺 Seats: ${seats}\n💰 Total: ₹${total}\n\n🎫 Ticket ID: TKT${Math.floor(Math.random() * 90000 + 10000)}\nHave a great journey! 🎉`;
    } else if (session.step === 'get_movie') {
        session.data.movie = message; session.step = 'get_movie_date';
        reply = language === 'te' ? `${message} సినిమా! తేదీ మరియు సమయం?` :
            language === 'hi' ? `${message} मूवी! तारीख और समय?` :
                `${message} movie! Date and showtime?`;
    } else if (session.step === 'get_movie_date') {
        session.data.date = message; session.step = 'get_movie_seats';
        reply = language === 'te' ? 'ఎన్ని టికెట్లు?' :
            language === 'hi' ? 'कितने टिकट?' : 'How many tickets?';
    } else if (session.step === 'get_movie_seats') {
        const tickets = parseInt(message) || 1;
        const total = tickets * 250;
        const d = session.data;
        session.step = 'idle'; session.data = {};
        reply = language === 'te' ?
            `✅ బుకింగ్ నిర్ధారించబడింది!\n\n🎬 సినిమా: ${d.movie}\n📅 తేదీ: ${d.date}\n🎟️ టికెట్లు: ${tickets}\n💰 మొత్తం: ₹${total}\n\n🎫 టికెట్ ID: TKT${Math.floor(Math.random() * 90000 + 10000)}\nఆనందంగా చూడండి! 🍿` :
            language === 'hi' ?
                `✅ बुकिंग हो गई!\n\n🎬 मूवी: ${d.movie}\n📅 तारीख: ${d.date}\n🎟️ टिकट: ${tickets}\n💰 कुल: ₹${total}\n\n🎫 ID: TKT${Math.floor(Math.random() * 90000 + 10000)}\nमज़े करें! 🍿` :
                `✅ Booking Confirmed!\n\n🎬 Movie: ${d.movie}\n📅 Date: ${d.date}\n🎟️ Tickets: ${tickets}\n💰 Total: ₹${total}\n\n🎫 Ticket ID: TKT${Math.floor(Math.random() * 90000 + 10000)}\nEnjoy! 🍿`;
    }

    res.json({ reply });
});

module.exports = app;
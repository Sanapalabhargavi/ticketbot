const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Booking state store (simple, no database)
const sessions = {};

app.post('/chat', (req, res) => {
    const { message, language = 'te' } = req.body;
    const msg = message.toLowerCase();
    const sessionId = req.headers['x-session-id'] || 'default';

    if (!sessions[sessionId]) sessions[sessionId] = { step: 'idle', type: null, data: {} };
    const session = sessions[sessionId];

    let reply = '';

    // Detect ticket type
    if (session.step === 'idle') {
        if (msg.includes('bus') || msg.includes('బస్సు') || msg.includes('बस')) {
            session.type = 'bus';
            session.step = 'get_from';
            reply = language === 'te' ? 'బస్సు టికెట్! మీరు ఎక్కడి నుండి బయలుదేరుతున్నారు?' :
                language === 'hi' ? 'बस टिकट! आप कहाँ से यात्रा करेंगे?' :
                    'Bus ticket! Where are you traveling FROM?';
        } else if (msg.includes('train') || msg.includes('రైలు') || msg.includes('ट्रेन')) {
            session.type = 'train';
            session.step = 'get_from';
            reply = language === 'te' ? 'రైలు టికెట్! మీరు ఏ స్టేషన్ నుండి బయలుదేరుతున్నారు?' :
                language === 'hi' ? 'ट्रेन टिकट! किस स्टेशन से जाएंगे?' :
                    'Train ticket! Which station are you departing FROM?';
        } else if (msg.includes('movie') || msg.includes('సినిమా') || msg.includes('मूवी')) {
            session.type = 'movie';
            session.step = 'get_movie';
            reply = language === 'te' ? 'సినిమా టికెట్! ఏ సినిమా చూడాలనుకుంటున్నారు?' :
                language === 'hi' ? 'मूवी टिकट! कौन सी मूवी देखनी है?' :
                    'Movie ticket! Which movie do you want to watch?';
        } else {
            reply = language === 'te' ? 'నమస్కారం! 👋 Bus, Train లేదా Movie టికెట్ కావాలా? దయచేసి చెప్పండి!' :
                language === 'hi' ? 'नमस्ते! 👋 Bus, Train या Movie टिकट चाहिए? बताइए!' :
                    'Hello! 👋 Do you want a Bus, Train, or Movie ticket? Please let me know!';
        }
    }

    // Bus / Train flow
    else if (session.step === 'get_from') {
        session.data.from = message;
        session.step = 'get_to';
        reply = language === 'te' ? `${message} నుండి బయలుదేరుతున్నారు! మీరు ఎక్కడికి వెళ్తున్నారు?` :
            language === 'hi' ? `${message} से जाएंगे! कहाँ जाना है?` :
                `Traveling from ${message}! Where are you going TO?`;
    }

    else if (session.step === 'get_to') {
        session.data.to = message;
        session.step = 'get_date';
        reply = language === 'te' ? `${message} కి వెళ్తున్నారు! ప్రయాణ తేదీ ఏమిటి? (ఉదా: మే 10)` :
            language === 'hi' ? `${message} जाएंगे! यात्रा की तारीख? (जैसे: 10 मई)` :
                `Going to ${message}! What is the travel date? (e.g. May 10)`;
    }

    else if (session.step === 'get_date') {
        session.data.date = message;
        session.step = 'get_seats';
        reply = language === 'te' ? `${message} తేదీన! ఎన్ని సీట్లు కావాలి?` :
            language === 'hi' ? `${message} को! कितनी सीटें चाहिए?` :
                `On ${message}! How many seats do you need?`;
    }

    else if (session.step === 'get_seats') {
        session.data.seats = message;
        const price = session.type === 'bus' ? 350 : 680;
        const total = parseInt(message) * price || price;
        const d = session.data;
        session.step = 'idle';
        session.data = {};

        reply = language === 'te' ?
            `✅ బుకింగ్ నిర్ధారించబడింది!\n\n🚌 ${d.from} → ${d.to}\n📅 తేదీ: ${d.date}\n💺 సీట్లు: ${message}\n💰 మొత్తం: ₹${total}\n\n🎫 టికెట్ ID: TKT${Math.floor(Math.random() * 90000 + 10000)}\nశుభ యాత్ర! 🎉` :
            language === 'hi' ?
                `✅ बुकिंग की पुष्टि हो गई!\n\n🚌 ${d.from} → ${d.to}\n📅 तारीख: ${d.date}\n💺 सीटें: ${message}\n💰 कुल: ₹${total}\n\n🎫 टिकट ID: TKT${Math.floor(Math.random() * 90000 + 10000)}\nशुभ यात्रा! 🎉` :
                `✅ Booking Confirmed!\n\n🚌 ${d.from} → ${d.to}\n📅 Date: ${d.date}\n💺 Seats: ${message}\n💰 Total: ₹${total}\n\n🎫 Ticket ID: TKT${Math.floor(Math.random() * 90000 + 10000)}\nHave a great journey! 🎉`;
    }

    // Movie flow
    else if (session.step === 'get_movie') {
        session.data.movie = message;
        session.step = 'get_movie_date';
        reply = language === 'te' ? `${message} సినిమా! తేదీ మరియు సమయం? (ఉదా: మే 10, సాయంత్రం 6)` :
            language === 'hi' ? `${message} मूवी! तारीख और समय? (जैसे: 10 मई, शाम 6)` :
                `${message} movie! Date and showtime? (e.g. May 10, 6 PM)`;
    }

    else if (session.step === 'get_movie_date') {
        session.data.date = message;
        session.step = 'get_movie_seats';
        reply = language === 'te' ? 'ఎన్ని టికెట్లు కావాలి?' :
            language === 'hi' ? 'कितने टिकट चाहिए?' :
                'How many tickets do you need?';
    }

    else if (session.step === 'get_movie_seats') {
        session.data.seats = message;
        const total = parseInt(message) * 250 || 250;
        const d = session.data;
        session.step = 'idle';
        session.data = {};

        reply = language === 'te' ?
            `✅ బుకింగ్ నిర్ధారించబడింది!\n\n🎬 సినిమా: ${d.movie}\n📅 తేదీ: ${d.date}\n🎟️ టికెట్లు: ${message}\n💰 మొత్తం: ₹${total}\n\n🎫 టికెట్ ID: TKT${Math.floor(Math.random() * 90000 + 10000)}\nఆనందంగా చూడండి! 🍿` :
            language === 'hi' ?
                `✅ बुकिंग की पुष्टि!\n\n🎬 मूवी: ${d.movie}\n📅 तारीख: ${d.date}\n🎟️ टिकट: ${message}\n💰 कुल: ₹${total}\n\n🎫 टिकट ID: TKT${Math.floor(Math.random() * 90000 + 10000)}\nमज़े करें! 🍿` :
                `✅ Booking Confirmed!\n\n🎬 Movie: ${d.movie}\n📅 Date: ${d.date}\n🎟️ Tickets: ${message}\n💰 Total: ₹${total}\n\n🎫 Ticket ID: TKT${Math.floor(Math.random() * 90000 + 10000)}\nEnjoy the movie! 🍿`;
    }

    res.json({ reply });
});

// Simple users store (no database needed!)
const users = []

app.post('/register', (req, res) => {
    const { name, phone, password } = req.body
    const exists = users.find(u => u.phone === phone)
    if (exists) return res.status(400).json({ error: 'Phone already registered!' })
    const user = { id: Date.now(), name, phone, password }
    users.push(user)
    res.json({ user: { id: user.id, name: user.name, phone: user.phone } })
})

app.post('/login', (req, res) => {
    const { phone, password } = req.body
    const user = users.find(u => u.phone === phone && u.password === password)
    if (!user) return res.status(400).json({ error: 'Wrong phone or password!' })
    res.json({ user: { id: user.id, name: user.name, phone: user.phone } })
})
app.listen(5000, () => {
    console.log('Server running on http://localhost:5000');
});
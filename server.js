require('dotenv').config();
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8080;

// ── ElevenLabs config from environment ──────────────────────────────
const {
    ELEVENLABS_API_KEY,
    ELEVENLABS_VOICE_ID,
    ELEVENLABS_MODEL,
} = process.env;

const VOICE_SETTINGS = {
    stability: 0.45,
    similarity_boost: 0.80,
    style: 0.30,
    use_speaker_boost: true,
};

// ── Middleware ───────────────────────────────────────────────────────
app.use(express.json());

// Security headers
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
});

// Serve static files (index.html, sw.js, icons/, sounds/, manifest.json)
app.use(express.static(path.join(__dirname)));

// Health check endpoint (useful for uptime monitoring)
app.get('/health', (req, res) => {
    res.json({ status: 'ok', app: 'Calm Critters', timestamp: new Date().toISOString() });
});

// ── POST /api/tts ───────────────────────────────────────────────────
app.post('/api/tts', async (req, res) => {
    const { text } = req.body;

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
        return res.status(400).json({ error: 'Missing or empty "text" field' });
    }

    if (!ELEVENLABS_API_KEY) {
        return res.status(500).json({ error: 'ElevenLabs API key not configured' });
    }

    try {
        const response = await fetch(
            `https://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_VOICE_ID}`,
            {
                method: 'POST',
                headers: {
                    'xi-api-key': ELEVENLABS_API_KEY,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    text: text.trim(),
                    model_id: ELEVENLABS_MODEL || 'eleven_multilingual_v2',
                    voice_settings: VOICE_SETTINGS,
                    speed: 0.80,  // slower, calmer pace for children
                }),
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`ElevenLabs API error ${response.status}:`, errorText);
            return res.status(502).json({
                error: 'ElevenLabs API error',
                status: response.status,
            });
        }

        // Stream the audio blob back to the client
        res.set({
            'Content-Type': response.headers.get('content-type') || 'audio/mpeg',
            'Cache-Control': 'no-cache',
        });

        const arrayBuffer = await response.arrayBuffer();
        res.send(Buffer.from(arrayBuffer));
    } catch (err) {
        console.error('TTS proxy error:', err.message);
        res.status(502).json({ error: 'Failed to reach ElevenLabs API' });
    }
});

// ── Start server ────────────────────────────────────────────────────
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Calm Critters server running at http://localhost:${PORT}`);
    console.log(`Voice ID: ${ELEVENLABS_VOICE_ID}`);
    console.log(`Model:    ${ELEVENLABS_MODEL}`);
});

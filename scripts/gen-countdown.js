const c = require('crypto'), f = require('fs'), p = require('path');
require('dotenv').config();
const D = p.join(__dirname, '..', 'sounds', 'tts');
const MP = p.join(D, 'manifest.json');
const K = process.env.ELEVENLABS_API_KEY;
const V = process.env.ELEVENLABS_VOICE_ID;
const M = process.env.ELEVENLABS_MODEL;
const h = t => c.createHash('md5').update(t).digest('hex').slice(0, 12);
const ps = ["Let's count down together!", 'Five.', 'Four.', 'Three.', 'Two.', 'One.', 'BLAST OFF!'];
const mf = JSON.parse(f.readFileSync(MP));
(async () => {
    for (const t of ps) {
        const fp = p.join(D, h(t) + '.mp3');
        if (f.existsSync(fp)) { console.log('skip', t); mf[t] = h(t) + '.mp3'; continue; }
        console.log('generating:', t);
        const r = await fetch('https://api.elevenlabs.io/v1/text-to-speech/' + V, {
            method: 'POST', headers: { 'Content-Type': 'application/json', 'xi-api-key': K },
            body: JSON.stringify({ text: t, model_id: M, voice_settings: { stability: 0.5, similarity_boost: 0.75 } })
        });
        if (!r.ok) { console.log('ERR', r.status, t); continue; }
        f.writeFileSync(fp, Buffer.from(await r.arrayBuffer()));
        mf[t] = h(t) + '.mp3';
        console.log('OK', t);
    }
    f.writeFileSync(MP, JSON.stringify(mf, null, 2));
    console.log('Done!');
})();

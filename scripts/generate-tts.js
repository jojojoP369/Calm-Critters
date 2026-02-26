#!/usr/bin/env node
/**
 * generate-tts.js — Pre-generate all TTS audio files locally
 * 
 * Extracts every spoken phrase from the Calm Critters app,
 * calls ElevenLabs API once for each, and saves the audio files
 * to sounds/tts/ so the app can serve them locally.
 * 
 * Usage:  node scripts/generate-tts.js
 * 
 * Requires: .env with ELEVENLABS_API_KEY, ELEVENLABS_VOICE_ID, ELEVENLABS_MODEL
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Load .env
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const API_KEY = process.env.ELEVENLABS_API_KEY;
const VOICE_ID = process.env.ELEVENLABS_VOICE_ID;
const MODEL = process.env.ELEVENLABS_MODEL || 'eleven_multilingual_v2';

if (!API_KEY || !VOICE_ID) {
    console.error('❌ Missing ELEVENLABS_API_KEY or ELEVENLABS_VOICE_ID in .env');
    process.exit(1);
}

// Output directory
const OUT_DIR = path.join(__dirname, '..', 'sounds', 'tts');
const MANIFEST_PATH = path.join(OUT_DIR, 'manifest.json');

// Create output directory
fs.mkdirSync(OUT_DIR, { recursive: true });

// Hash text to create a stable filename
function textHash(text) {
    return crypto.createHash('md5').update(text).digest('hex').slice(0, 12);
}

// Same splitIntoPhrases logic as the app uses
function splitIntoPhrases(text) {
    const raw = text.split(/(?<=[.!?])\s+|(?<=!)\s*/);
    const phrases = [];
    let buffer = '';
    for (const chunk of raw) {
        if (buffer.length + chunk.length < 25 && buffer) {
            buffer += ' ' + chunk;
        } else {
            if (buffer) phrases.push(buffer.trim());
            buffer = chunk;
        }
    }
    if (buffer.trim()) phrases.push(buffer.trim());
    return phrases.length > 0 ? phrases : [text];
}

// ===== ALL SPOKEN TEXT IN THE APP =====

// --- Meditation Scripts (3 age groups × 4 themes) ---
const SCRIPTS_BY_AGE = {
    tiny: {
        ocean: [
            "Guess what? We're going on an adventure under the sea! Are you ready? Yaaay!",
            "Okay, let's sit down on our magic carpet. It's going to take us underwater! Sit down, sit down!",
            "Woooosh! Here we go! Look, look! Can you see the fishies? They're waving at you! Wave back! Hi fishies!",
            "Oh wow, a big friendly whale is swimming by! He wants to teach us how to blow bubbles. Let's try! Take a biiiig breath in through your nose, like you're smelling a yummy cookie.",
            "Now blow out bubbles! Bloop, bloop, bloop! Blow, blow, blow!",
            "Haha, the fishies are playing with your bubbles! They love it! Let's make more. Big sniff in!",
            "And blow! Bigger bubbles this time! Bloooooop! Amazing!",
            "Now the friendly octopus says shhh, let's be very quiet and listen to the ocean. Can you close your eyes? What do you hear?",
            "The water is so warm and cozy, like a big hug. You're floating like a little starfish. Arms out wide, just floating!",
            "One more magic bubble. Sniff in that ocean air!",
            "And blow the biggest bubble ever! Pop! Hahaha!",
            "Time to swim back! Open your eyes! You were the best little diver ever! High five! Give yourself a big squeezy hug!",
        ],
        forest: [
            "Pssst! I heard there's a secret party in the magic forest! Wanna go? Let's go!",
            "Sit down like a little bunny in the soft grass. Tuck your paws in your lap! You're the cutest bunny ever!",
            "Oh look! The butterflies are dancing! They're doing a silly dance! Can you see them wiggle? Wiggle wiggle!",
            "A friendly little bird lands next to you and says, let's play a smelling game! Smell this flower! Sniff in through your nose, biiiig sniff!",
            "Mmmm, it smells like strawberries! Now blow on the flower and watch the petals fly! Whoooo!",
            "Ooh, ooh, smell this one! It's a purple one! Big sniff!",
            "This one smells like chocolate cake! Blow the petals! Pfffffft! Hehehe!",
            "Now the little squirrel says, let's play a squeezy game! Squeeze your hands super tight like you're holding acorns. Squeeeeeze!",
            "And let go! Throw the acorns in the air! Wheee! Feel how wiggly and free your fingers are? Wiggle them!",
            "Okay close your eyes. The sunshine is giving you a warm hug through the trees. So cozy. The birds are singing you a little song.",
            "One more flower smell! Biiig sniff in! Mmmmm!",
            "And blow a kiss to the forest! Mwah! The forest says thank you!",
            "Open your eyes! The butterflies are clapping for you! You did amazing! You're a forest superstar!",
        ],
        space: [
            "Astronaut report to your rocket ship! We're going to space! Sit in your seat! Buckle up!",
            "Let's count down together! Five, four, three, two, one, BLAST OFF! Whoooooosh!",
            "Wooow! Look out the window! Stars everywhere! They're sparkling like glitter! Can you see them?",
            "In space, we breathe special space air! Let's fill up our space helmet. Biiiig breath in!",
            "Now breathe out super slow like you're fogging up the glass. Haaaaaah. Can you draw a smiley face in the fog?",
            "Haha, that's a great smiley! More space air! Biiiig sniff!",
            "And fog it up again! Haaaaah! Draw a star this time!",
            "Oh look! We're floating! In space everything floats! Let your arms float up slowly. Weeee! You're like a silly space jellyfish!",
            "Now let them float back down. So gentle. So slow. Like a feather.",
            "Close your eyes. The moon is singing you a lullaby. Mmmmm. It's so soft and sparkly up here.",
            "One more big breath of magic space air. In!",
            "And out! Haaaaah! Perfect!",
            "Time to fly home! Open your eyes! Wiggle your fingers like twinkling stars! You're the bravest astronaut in the whole galaxy!",
        ],
        rain: [
            "Oh listen! Do you hear that? Pitter patter pitter patter! It's raining! Let's have a cozy rain party!",
            "Let's sit down and get super cozy. Pretend you have the fluffiest blanket ever wrapped around you! Mmmm so warm!",
            "Put your hands on your tummy. Your tummy is like a little balloon! When you breathe in, the balloon gets bigger! Try it! Breathe in!",
            "Now breathe out and the balloon gets tiny! Pssshhh! Hehe, do you feel it?",
            "Let's do it with the rain! When the rain goes pitter, breathe in and your balloon gets big!",
            "When the rain goes patter, breathe out and your balloon gets small! Patter, pssshh!",
            "Pitter, breathe in, big balloon!",
            "Patter, breathe out, tiny balloon! Pssshh! You're so good at this!",
            "Now close your eyes. Pretend a tiny friendly raindrop lands on your nose. Boop! Hehehe. And one on your cheek! Boop boop!",
            "The raindrops are tickling you! They're like tiny little kisses from the clouds. You're so cozy and safe.",
            "One more tummy balloon! Big breath in, biiiiig balloon!",
            "And let it all out. Ahhhh! That was the best balloon yet!",
            "Open your eyes! The rain says thank you for playing! You're the coziest little raindrop catcher ever!",
        ],
    },
    explorer: {
        ocean: [
            "Hey explorer! Today we're diving deep into the ocean. Take a seat, get comfortable, and close your eyes.",
            "Imagine you're putting on a magical scuba suit. It lets you breathe underwater! Take a deep breath in through your nose... and slowly out through your mouth.",
            "You dive into warm, turquoise water. A sea turtle swims up beside you! She's going to be your guide. Follow her.",
            "She leads you past a coral reef full of colors — orange, purple, electric blue. Breathe in deeply as you take it all in.",
            "Now breathe out and watch tiny bubbles float up toward the sunlight. Each bubble carries away a worry. Let them go.",
            "A friendly dolphin spins around you! She wants to play. When you breathe in, she jumps. When you breathe out, she dives. Let's try three times.",
            "The turtle leads you into an underwater cave. Inside, the walls glow with soft blue light. It's so peaceful here. Just be still and listen.",
            "A gentle current rocks you back and forth, like being in a hammock. Let your whole body relax. Your shoulders drop. Your hands go loose.",
            "Take one more deep breath, filling your lungs completely. Hold it for three... two... one. And let it all go.",
            "The turtle brings you back to the surface. You pop up and feel the warm sun on your face. Open your eyes. You're calm, strong, and ready for anything!",
        ],
        forest: [
            "Welcome to the enchanted forest, explorer. Find a comfy spot, sit or lie down, and close your eyes.",
            "You're standing in a clearing. Tall trees surround you like gentle giants. Sunlight filters through the leaves in golden beams.",
            "A wise old owl lands on a branch nearby. She whispers: Take three slow breaths with me. In through your nose... out through your mouth.",
            "As you breathe, notice the smell of the forest. Fresh pine, damp earth, sweet wildflowers. Each breath fills you with calm.",
            "A path appears between the trees, covered in soft moss. You walk barefoot and feel the cool, squishy moss under your feet. It tickles a little!",
            "You come to a stream with stepping stones. Each stone has a word on it: brave, kind, strong, loved. Step on each one and say the word in your mind.",
            "By the stream, a deer is drinking water. She looks up and nods at you. You sit beside her. Everything is quiet except the water.",
            "Count five sounds you can hear. The stream, the birds, the leaves rustling, your own breathing, your heartbeat.",
            "Take one big forest breath — breathe in all the green, growing energy. Breathe out anything that was bothering you today.",
            "The owl hoots softly — time to head home. Open your eyes and stretch your arms wide like tree branches. You carry the forest's peace with you!",
        ],
        space: [
            "Mission control to explorer! You've been selected for a special space mission. Get comfy in your commander's seat and close your eyes.",
            "Your rocket lifts off smoothly. You feel the gentle push as you rise above the clouds. Take a slow breath in for the countdown.",
            "Now you're past the atmosphere. Press your face to the window. Earth below you is so beautiful — blue oceans, white clouds, green land.",
            "In your spaceship, gravity is gentle. Lift your hands slowly, let them float up. Now let them drift back down. So light and free.",
            "Your ship approaches a nebula — a giant cloud of stardust in pinks, purples, and golds. Breathe in the stardust energy. Feel it sparkle inside you.",
            "Saturn's rings stretch out like a runway. Your ship glides between them. It's so smooth, so peaceful. Let your breathing be just as smooth.",
            "You park on a quiet moon. Step outside — it's perfectly silent. No sounds at all. Just you and the stars. Feel how peaceful silence can be.",
            "Look up at the Milky Way — billions of stars, and you're one of them. You are part of something huge and amazing.",
            "Take one deep space breath. In for four... hold for four... out for four. The universe breathes with you.",
            "Time to head home. Your rocket turns toward Earth. Open your eyes and feel the ground beneath you. You just traveled the universe! How cool is that?",
        ],
        rain: [
            "It's a rainy afternoon. You're inside a cozy treehouse high in the branches. Find a comfy spot and close your eyes.",
            "Listen to the rain tapping on the wooden roof above you. Tap, tap, tap. Each drop is like a tiny drumbeat just for you.",
            "Breathe in slowly. The air smells fresh and clean, like a just-washed world. Breathe out any stress from the day.",
            "You have a warm cup of cocoa. Wrap your hands around it. Feel the warmth spreading from your palms up your arms, all the way to your shoulders.",
            "The rain gets softer, steadier. It becomes a rhythm. Match your breathing to it. In with the drip... out with the drop.",
            "A rainbow appears through the treehouse window! Seven beautiful colors arching across the grey sky. Pick your favorite color.",
            "Imagine that color filling your whole body. Starting from your toes, rising up through your legs, your belly, your chest, your head. You're glowing with your favorite color!",
            "The rain slows to a gentle mist. Birds start singing again. A squirrel peeks into the treehouse and chatters hello.",
            "Take one deep, cozy breath. Hold it like you're keeping a warm secret. And release.",
            "The sun peeks through the clouds. Open your eyes and stretch. You're warm, calm, and ready to go. The rain said exactly what you needed to hear.",
        ],
    },
    independent: {
        ocean: [
            "Find a comfortable position. Close your eyes. We're going to use ocean visualization to practice deep relaxation.",
            "Start with three cleansing breaths. In through your nose for four counts. Out through your mouth for six. Make each exhale longer than the inhale — this activates your body's calm response.",
            "Imagine you're floating in warm, calm ocean water. Your body is completely supported. You don't have to hold anything up. Let gravity do the work.",
            "Do a body scan starting with your feet. Notice — are they tense or relaxed? Wiggle your toes, then let them go completely soft. Move up to your ankles, your calves.",
            "Continue up. Your thighs, your hips. If you find tension anywhere, breathe into that spot. Imagine the ocean water dissolving the tightness.",
            "Now your belly, your chest. Notice your breath here. Is it fast or slow? Deep or shallow? Don't change it, just notice.",
            "Ocean waves have a pattern: they rise, they crest, they fall. Your thoughts work the same way. When a thought comes, don't fight it. Watch it rise, crest, and dissolve, like a wave.",
            "Now scan your shoulders, your jaw, your forehead. These are where most people hold stress. Consciously release each one. Drop your shoulders. Unclench your jaw. Smooth your forehead.",
            "Here's something interesting: your brain can't tell the difference between vividly imagining calm and actually being calm. So right now, your brain genuinely thinks you're floating in the ocean.",
            "Take three final breaths. With each one, say a word silently: Calm. Strong. Ready. When you open your eyes, you'll carry this ocean calm with you.",
            "Gently wiggle your fingers and toes. Open your eyes. That body scan technique is a tool you can use anywhere — in your room, before a test, even on the bus.",
        ],
        forest: [
            "Sit comfortably. Close your eyes. We're going to practice grounding — a technique that connects you to the present moment using your senses.",
            "Imagine you're in a quiet forest. Start by noticing five things you can see in your mind's eye: the bark on trees, light through leaves, moss on rocks, a bird on a branch, a path ahead.",
            "Now four things you might touch: rough bark under your hand, cool breeze on your skin, soft earth under your feet, a smooth pebble in your pocket.",
            "Three things you'd hear: birds calling, wind in the leaves, a distant stream. Really hear them in your mind.",
            "Two things you'd smell: fresh pine needles and damp earth after rain.",
            "One thing you'd taste: clean, cool mountain air.",
            "This is called the 5-4-3-2-1 method. It works because anxiety lives in the future. When you engage your senses, you pull your brain back to right now, where you're safe.",
            "Let's add breath to it. Breathe in for four counts... hold for four... out for four... hold for four. This is box breathing — it balances your nervous system.",
            "Do two more rounds of box breathing. There's no rush. If your mind wanders, that's normal — just gently bring it back. That 'bringing back' is the exercise. Every time you do it, your focus gets stronger.",
            "Take one final deep breath. Open your eyes slowly. The 5-4-3-2-1 grounding method is yours now. Use it anytime you feel overwhelmed or scattered.",
        ],
        space: [
            "Get comfortable. Close your eyes. Today we're going to explore perspective — and there's no better place for that than space.",
            "Begin with five slow breaths. In for four, out for six. Each exhale slightly longer than the inhale. This tells your nervous system it's safe to relax.",
            "Imagine you're rising above your room, above your building, above your neighborhood. You can see the whole town below, then the whole country. Keep rising.",
            "From up here, you can see the curve of the Earth. The blue atmosphere, thin as an eggshell. All the people, all the drama, all the worries — they look so small from here.",
            "This is called cognitive distancing. When you zoom out in your mind, problems feel more manageable. They're still real — but they're not the whole picture.",
            "Now let's do a progressive relaxation. Tense your feet for five seconds... and release. Tense your legs... and release. Tense your belly... and release.",
            "Tense your hands into fists... and release. Scrunch your shoulders toward your ears... and drop them. Scrunch your face tight... and let it melt away.",
            "Notice how different your body feels when tension is gone. That heavy, warm feeling? That's your parasympathetic nervous system — your body's built-in chill mode.",
            "From space, think about one thing you're grateful for today. Research shows gratitude physically changes your brain, growing the areas that handle empathy and wellbeing.",
            "Slowly drift back to Earth. Feel your body in your seat. Open your eyes. You just used perspective, progressive relaxation, and gratitude — three powerful mental health tools.",
        ],
        rain: [
            "Settle in somewhere comfortable. Close your eyes. We're going to practice acceptance meditation using the metaphor of rain.",
            "Imagine sitting under a solid shelter while rain pours around you. You're dry, safe, watching the rain. Start with deep belly breaths — feel your stomach expand as you inhale.",
            "The rain represents all the things you can't control: other people's opinions, unexpected changes, things that didn't go your way today.",
            "Here's the key: you don't have to stop the rain. You can't. But you can choose to stay dry. Staying dry means not letting external things control how you feel inside.",
            "Notice any emotions you're feeling right now. Name them without judging: 'I notice I feel nervous.' 'I notice I feel tired.' Naming emotions reduces their power — scientists call this 'affect labeling.'",
            "The rain begins to ease. Each breath now is like pressing a reset button. In: fresh energy. Out: anything you don't need anymore.",
            "Let's practice square breathing to deepen the calm. Inhale 4 counts... hold 4... exhale 4... hold 4. Imagine tracing a square with each breath.",
            "Fun fact: Navy SEALs use square breathing before high-pressure missions. If it works for them, it definitely works for school, friendships, and everything else you navigate.",
            "The rain stops. Sunlight breaks through. A rainbow appears. Rainbows only happen because of the rain. Some good things in your life also came from hard moments.",
            "Open your eyes gently. Today you practiced acceptance, affect labeling, and square breathing. Three techniques backed by real science, available to you whenever you need them.",
        ],
    },
};

// --- Breathing Exercises (intro + cycles + outro per age group) ---
const BREATHING_BY_AGE = {
    tiny: {
        intro: [
            "Hey! Bear wants to play a super fun game with you! It's called the balloon game! Wanna play?",
            "Okay! Sit down and pretend you're holding a tiny little balloon in your hands. Got it? What color is your balloon?",
        ],
        cycles: [
            "Let's blow up the balloon! First take a biiiig sniff of air through your nose! Sniiiiiff!",
            "Hold it, hold it! Don't let the air out yet!",
            "Now blow into your balloon! Whooooooo! Look, it's getting bigger!",
            "Hehe! Nice! Look at your balloon! It's so pretty!",
            "Let's make it even bigger! Biiiig sniff through your nose, fill up your lungs!",
            "Hold that air! Shhh, don't let it escape!",
            "Blow blow blow! Whoooo! Wow, your balloon is getting SO big!",
            "Amazing! That's the biggest balloon I've ever seen!",
            "One more time! The biggest sniff EVER! Ready? Sniiiiiiiff!",
            "Hold it, hold it, hold it! Almost there!",
            "And blow! Whoooooosh! Look at it go! It's HUGE! Hahaha!",
            "Now let go of the balloon! Wheeeee! It's flying away! Bye bye balloon!",
        ],
        outro: [
            "Hahaha! Did you see your balloon fly away? That was so silly! You did such a great job!",
            "Bear is giving you the biggest hug ever! Squeeeeze! You're amazing!",
        ],
    },
    explorer: {
        intro: [
            "Hey explorer! Did you know that dragons breathe in a special way? That's how they get their power. Today we're going to learn dragon breathing!",
            "Sit up tall like a dragon sitting on a mountain. Your back is straight, your shoulders are back. You're a powerful dragon!",
        ],
        cycles: [
            "First, the fire breath! Dragons breathe in through their nose, filling their lungs with hot energy. Big breath in, feel your chest expand!",
            "Hold the fire inside. Feel it warming your whole body. Three, two, one...",
            "Now blow out your fire breath! Haaaaah! A long stream of flames out through your mouth! Feel the power!",
            "Nice! Your first fire breath! You can feel the warmth in your belly, right? That's your dragon power growing.",
            "Now the ice breath! This time, breathe in cool mountain air. Imagine it's a crisp winter morning. Slowly in through your nose...",
            "Hold the cold. Feel it cooling you down, making you calm and focused. Hold...",
            "Breathe out slowly like frost coming from your mouth. Whoooosh. Watch the ice crystals sparkle in the air!",
            "Awesome! Fire and ice. Hot gives you energy, cold gives you calm. A dragon needs both!",
            "Final power move: the golden breath! Breathe in slowly and imagine golden light filling your whole body, from your toes to your head.",
            "Hold the golden light. You're glowing like a treasure. Everything feels strong and warm.",
            "Release the golden breath slowly. As it leaves, it takes any worries with it. They turn into tiny sparks and float away.",
            "You did it! Three dragon breaths: fire, ice, and gold. You have the power of a dragon inside you now!",
        ],
        outro: [
            "The other dragons are impressed! You've mastered fire, ice, and golden breathing. Not many explorers can do that!",
            "Whenever you feel stressed or worried, use your dragon breath. You've got the power! Roar!",
        ],
    },
    independent: {
        intro: [
            "Let's practice two powerful breathing techniques used by athletes, astronauts, and therapists. These literally change your brain chemistry in seconds.",
            "Sit comfortably. Arms relaxed. We'll start with box breathing, then move to the 4-7-8 technique. Both activate your parasympathetic nervous system — your body's built-in calm mode.",
        ],
        cycles: [
            "Box breathing, round one. Inhale through your nose for four counts. One... two... three... four.",
            "Hold your breath for four counts. One... two... three... four. Your diaphragm is engaged. This builds CO2 tolerance.",
            "Exhale slowly through your mouth for four counts. One... two... three... four. Smooth and controlled.",
            "Hold empty for four counts. One... two... three... four. This is the hardest part. You're training your nervous system.",
            "Box breathing, round two. Same pattern. Inhale, four counts. Notice how your body already feels different from just one round.",
            "Hold for four. Your heart rate is already slowing. That's your vagus nerve responding — the nerve that connects your brain to your body's calm center.",
            "Exhale for four. Let your jaw relax. Let your shoulders drop. Each exhale is a signal to your brain: all is well.",
            "Hold empty four. You're getting better at this. The discomfort zone is where growth happens.",
            "Now switching to the 4-7-8 technique. This one is deeper. Inhale through your nose for four counts. One... two... three... four.",
            "Hold for seven counts. This is longer — that's intentional. Your body absorbs more oxygen. One... two... three... four... five... six... seven.",
            "Exhale through your mouth for eight counts, making a whoosh sound. Whoooosh. This extended exhale triggers deep relaxation.",
            "That was one cycle. The 4-7-8 method was developed by Dr. Andrew Weil. Studies show it can lower anxiety in under two minutes.",
        ],
        outro: [
            "You now have two techniques in your toolkit. Box breathing for focus and alertness. 4-7-8 for deep calm and sleep.",
            "The more you practice, the faster they work. Some people can shift their entire mood in three breaths. That's your goal.",
        ],
    },
};

// --- Rescue Routines (6 moods × steps + extensions) ---
const RESCUE_TEXTS = {
    angry: [
        "Hey, it's OK to feel angry. Bear is here with you. Let's cool that fire down together.",
        "Take a BIG breath in through your nose… 1… 2… 3… 4… Now BLOW it out hard, like you're blowing out birthday candles! Do it 3 times.",
        "Squeeze your fists as TIGHT as you can… hold it… hold it… now let them go soft like spaghetti. Shake your hands out!",
        "Imagine holding a big, cool ice cube. Feel the cool calm spreading from your hands into your whole body.",
        "The angry feeling is just a cloud passing by. You are the sky — big, calm, and full of space. You've got this!",
        "Amazing job! You turned your fire into sunshine. Bear is so proud of you!",
        "Let's do 3 more slow breaths. In… hold… out… Feel the calm getting stronger each time.",
        "Imagine your anger is a red ball. Watch it slowly change to orange… yellow… green… blue. Cooler and calmer.",
        "Think of someone you love. Send them a kind thought. Kindness is the opposite of anger, and you have so much of it!",
    ],
    worried: [
        "Worries can feel really big. But Bear is right here with you. Let's make those worries smaller together.",
        "Breathe in slowly… imagine you're filling a balloon in your belly… Now let the air out sloooowly. The balloon floats away, carrying one worry with it.",
        "Press your feet into the floor. Feel them? You're solid. You're safe. Wiggle your toes and feel the ground holding you up.",
        "Now hug yourself! Wrap your arms around your shoulders and give a gentle squeeze. You're giving yourself a bear hug!",
        "Worries are just \"what if\" thoughts. They're not real yet. Right now, in this moment, you are safe and you are OK.",
        "You did it! Your worries just got a lot smaller. Bear believes in you!",
        "Imagine you're lying on a warm beach. Hear the waves going in… and out… in… and out… so peaceful.",
        "You are braver than you think! Name one brave thing you did this week. See? You handle hard things!",
        "Picture a worry jar. Put each worry into the jar and close the lid tight. You can think about them later — or not!",
    ],
    sad: [
        "It's OK to feel sad. Everybody does sometimes. Bear is sitting right next to you. You're not alone.",
        "Let's do some gentle breaths together. Breathe in warmth… breathe out the heavy feeling… Again… nice and easy.",
        "Put your hand on your heart. Can you feel it beating? That's your body saying \"I'm here. I'm strong. I'm alive.\"",
        "Think of ONE thing that made you smile this week. A friend, a pet, a yummy snack… Hold that happy picture in your mind.",
        "Sadness is like a wave. It comes, and then it goes. You're learning to ride the wave, and that makes you really brave.",
        "You're so brave for letting your feelings out. Bear is always here when you need a friend!",
        "Give yourself another warm hug. You deserve kindness, especially from yourself.",
        "If your sadness were a colour, what would it be? Now imagine painting over it with your favourite bright colour.",
        "Say this quietly: \"I am loved. I am enough. This feeling will pass, and bright days are coming.\"",
    ],
    excited: [
        "Woah, you've got a LOT of energy! That's awesome — let's help your body use it in a good way!",
        "First, shake your whole body! Wiggle your arms, stomp your feet, shake shake shake! Get all that energy out for 10 seconds!",
        "Now FREEZE! Stand totally still like a statue. Don't move a muscle… Hold it… 5… 4… 3… 2… 1.",
        "Slow breath in… 1… 2… 3… 4… Slow breath out… 1… 2… 3… 4… 5… 6. Feel your body getting calmer with each breath.",
        "Look around and find 3 blue things. Got them? Now find 2 soft things. This helps your brain slow down and focus.",
        "You turned all that big energy into calm power! That's a superpower!",
        "Let's move in slow motion. Raise your hand very, very, veeeeery slowly. Now put it down slowly. Feel the control!",
        "Close your eyes and count backwards from 10… 9… 8… 7… 6… 5… 4… 3… 2… 1… Zero. Still and calm.",
        "Hum a low, slow note. Mmmmmmmm… Feel the vibration in your chest. This tells your body to calm down.",
    ],
    sleep: [
        "Can't sleep? That happens to everyone. Close your eyes and let Bear help you drift off…",
        "Take a long, sleepy breath in… and a soft breath out… like blowing a feather across your pillow. Again… soooo gentle…",
        "Imagine warm honey slowly pouring onto your toes… it's spreading up your feet… your legs feel heavy and warm and sleepy…",
        "The warm honey spreads to your belly… your chest… your arms go floppy… your fingers tingle with cozy warmth…",
        "Now it's all around your head… like a warm, soft cloud pillow… Your eyes are heavy… everything is safe and quiet…",
        "Goodnight, little one. Bear is watching over you. Sweet dreams…",
        "Keep your eyes closed… count sheep jumping over a tiny fence… 1… 2… 3… 4… 5… so sleepy…",
        "Each breath out is longer than the one before. Out… 4 counts. Out… 5 counts. Out… 6 counts. Out… 7 counts…",
        "Your body is so heavy… so warm… so safe… Bear is right beside you. Sleep now…",
    ],
    focus: [
        "Brain feeling scrambled? That's OK! Bear has a trick to help your mind get clear and sharp.",
        "Let's reset your brain. Breathe in for 4… hold for 4… out for 4… hold for 4… This is called Box Breathing. Try it twice!",
        "Now notice 5 things you can SEE… 4 things you can TOUCH… 3 things you can HEAR… This wakes up your senses!",
        "Make fists, then open wide! Fists… open! Fists… open! This tells your brain: \"Wake up, it's time to focus!\"",
        "Pick ONE small thing you need to do next. Just one! Don't think about everything — just that one thing.",
        "Your brain is ready! You've got laser focus now. Go get it, superstar!",
        "Count backwards from 20 to 1 in your head. Don't rush! If you lose your place, start again from 20.",
        "Pick a spot on the wall and stare at it for 10 seconds without blinking. Your eyes are lasers! Feel the focus!",
        "Whisper your ONE task out loud 3 times. Saying it makes it real. Now go do just that ONE thing! You've got this!",
    ],
};

// --- Together Mode Cues ---
const TOGETHER_TEXTS = [
    "Let's breathe together. Place your hands on your bellies. Here we go.",
    "Breathe in together, slowly through your nose.",
    "In through your nose, nice and slow.",
    "Breathe in, fill your belly with air.",
    "Slowly in, feel your belly rise.",
    "Hold it gently.",
    "Hold together.",
    "Keep it in.",
    "Pause right here.",
    "Now breathe out, slowly through your mouth.",
    "Let it all out, nice and slow.",
    "Exhale together, let everything go.",
    "Breathe out, let your body relax.",
    "Place your hand on your child's back.",
    "Match your breathing to your child's.",
    "Soften your voice for this next breath.",
    "Relax your shoulders, let them drop.",
    "Look at each other for one breath.",
    "Amazing! You both did great. Star earned!",
];

// --- Co-Regulation Exercises ---
const COREG_TEXTS = {
    mirror: [
        "Sit facing each other. Make eye contact and smile.",
        "Parent: start breathing slowly. In through your nose.",
        "Child: match your parent's breath. Breathe in when they do.",
        "Now both breathe out together. Slowly, gently.",
        "Keep going. In together… and out together. You're in sync!",
        "Let's try with hands up. Breathe in, hands rise. Breathe out, hands lower.",
        "Beautiful! Three more breaths. Feel how connected you are.",
        "Last breath together. The biggest, slowest one yet.",
        "Amazing mirror breathing! Give each other a hug.",
    ],
    squeeze: [
        "Hold hands with your child. Feel each other's warmth.",
        "On the count of three, both squeeze your hands tight. One, two, three — SQUEEZE!",
        "Hold the squeeze! Feel the tightness. Hold, hold, hold!",
        "Now release! Let your hands go soft and floppy. Ahhhhh.",
        "Feel the difference? The tingly relaxed feeling? That's what calm feels like.",
        "Let's do it again. Ready? One, two, three — SQUEEZE!",
        "Hold! Even tighter this time! Make your strongest muscles!",
        "And release. Let everything go soft. Breathe out together.",
        "One more time. The biggest squeeze, then the biggest release.",
        "Release! Now just hold hands gently. Feel the calm flowing between you.",
        "Wonderful co-regulation! You helped each other feel calm.",
    ],
    counting: [
        "We're going to count backward from 10. One number for each exhale.",
        "Take a deep breath in together.",
        "Breathe out and say TEN.",
        "Breathe in.",
        "Out — NINE.",
        "In. Feel your body relaxing.",
        "Out — EIGHT.",
        "In. You're doing great.",
        "Out — SEVEN. Halfway there!",
        "In. Notice how much calmer you feel.",
        "Out — SIX, FIVE, FOUR — keep counting together.",
        "Out — THREE, TWO.",
        "Last breath in. The deepest one.",
        "Out — ONE. Total calm.",
        "You counted all the way to calm! High five!",
    ],
};

// --- Misc standalone phrases ---
const MISC_TEXTS = [
    "How are you feeling? Do you want another minute, or are you OK now?",
    "You did amazing! Bear is so proud of you.",
];

// ===== COLLECT ALL UNIQUE PHRASES =====
function collectAllPhrases() {
    const allTexts = new Set();

    // Meditations
    for (const age of Object.values(SCRIPTS_BY_AGE)) {
        for (const theme of Object.values(age)) {
            for (const text of theme) {
                // speakStep splits into phrases
                for (const phrase of splitIntoPhrases(text)) {
                    allTexts.add(phrase);
                }
            }
        }
    }

    // Breathing
    for (const age of Object.values(BREATHING_BY_AGE)) {
        for (const section of ['intro', 'cycles', 'outro']) {
            for (const text of age[section]) {
                for (const phrase of splitIntoPhrases(text)) {
                    allTexts.add(phrase);
                }
            }
        }
    }

    // Rescue
    for (const texts of Object.values(RESCUE_TEXTS)) {
        for (const text of texts) {
            for (const phrase of splitIntoPhrases(text)) {
                allTexts.add(phrase);
            }
        }
    }

    // Together Mode
    for (const text of TOGETHER_TEXTS) {
        for (const phrase of splitIntoPhrases(text)) {
            allTexts.add(phrase);
        }
    }

    // Co-Reg
    for (const texts of Object.values(COREG_TEXTS)) {
        for (const text of texts) {
            for (const phrase of splitIntoPhrases(text)) {
                allTexts.add(phrase);
            }
        }
    }

    // Misc
    for (const text of MISC_TEXTS) {
        for (const phrase of splitIntoPhrases(text)) {
            allTexts.add(phrase);
        }
    }

    return [...allTexts];
}

// ===== GENERATE AUDIO =====
async function generateAudio(text, hash) {
    const outFile = path.join(OUT_DIR, `${hash}.mp3`);

    // Skip if already generated
    if (fs.existsSync(outFile)) {
        return true;
    }

    const url = `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`;

    const res = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'xi-api-key': API_KEY,
        },
        body: JSON.stringify({
            text,
            model_id: MODEL,
            voice_settings: {
                stability: 0.5,
                similarity_boost: 0.75,
            },
        }),
    });

    if (!res.ok) {
        const body = await res.text().catch(() => '');
        console.error(`  ❌ API error ${res.status}: ${body.slice(0, 100)}`);
        return false;
    }

    const buffer = Buffer.from(await res.arrayBuffer());
    fs.writeFileSync(outFile, buffer);
    return true;
}

// ===== MAIN =====
async function main() {
    console.log('🔊 Calm Critters — TTS Audio Generator');
    console.log('=======================================\n');

    const phrases = collectAllPhrases();
    console.log(`📝 Found ${phrases.length} unique phrases to generate\n`);

    // Count total characters for credit estimation
    const totalChars = phrases.reduce((sum, p) => sum + p.length, 0);
    console.log(`💰 Estimated credit cost: ~${totalChars.toLocaleString()} characters\n`);

    // Load existing manifest
    let manifest = {};
    if (fs.existsSync(MANIFEST_PATH)) {
        try { manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf-8')); } catch (e) { }
    }

    // Count already cached
    const alreadyCached = phrases.filter(p => {
        const h = textHash(p);
        return fs.existsSync(path.join(OUT_DIR, `${h}.mp3`));
    }).length;
    console.log(`✅ Already cached: ${alreadyCached} / ${phrases.length}`);
    console.log(`🔄 Need to generate: ${phrases.length - alreadyCached}\n`);

    if (alreadyCached === phrases.length) {
        console.log('🎉 All phrases already cached! Nothing to do.');
        // Still update manifest
        for (const phrase of phrases) {
            manifest[phrase] = textHash(phrase) + '.mp3';
        }
        fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
        console.log(`📄 Manifest updated: ${MANIFEST_PATH}`);
        return;
    }

    let success = 0;
    let failed = 0;
    let skipped = 0;

    for (let i = 0; i < phrases.length; i++) {
        const phrase = phrases[i];
        const hash = textHash(phrase);
        const outFile = path.join(OUT_DIR, `${hash}.mp3`);

        if (fs.existsSync(outFile)) {
            manifest[phrase] = hash + '.mp3';
            skipped++;
            continue;
        }

        const preview = phrase.length > 50 ? phrase.slice(0, 50) + '...' : phrase;
        process.stdout.write(`  [${i + 1}/${phrases.length}] "${preview}" `);

        const ok = await generateAudio(phrase, hash);
        if (ok) {
            manifest[phrase] = hash + '.mp3';
            success++;
            console.log('✅');
        } else {
            failed++;
            console.log('❌');
        }

        // Small delay to avoid rate limiting
        await new Promise(r => setTimeout(r, 200));
    }

    // Save manifest
    fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));

    console.log('\n=======================================');
    console.log(`✅ Generated: ${success}`);
    console.log(`⏭️  Skipped (already cached): ${skipped}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📄 Manifest: ${MANIFEST_PATH}`);
    console.log(`📁 Audio dir: ${OUT_DIR}`);
    console.log(`💾 Total files: ${Object.keys(manifest).length}`);
    const dirSize = fs.readdirSync(OUT_DIR).filter(f => f.endsWith('.mp3')).reduce((sum, f) => sum + fs.statSync(path.join(OUT_DIR, f)).size, 0);
    console.log(`📦 Total size: ${(dirSize / 1024 / 1024).toFixed(1)} MB`);
    console.log('\n🎉 Done! The app will now use these local audio files.');
}

main().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});

---
description: Google Prompting Guide 101 principles applied to Calm Critters development
---

# Calm Critters — Development Principles
*Derived from Google's 71-Page Prompting Guide 101*

## Core Framework (4 Pillars)

### 1. Persona
- **Agent role**: Expert educational software developer specializing in child psychology, calming UX, and mindfulness app design.
- **Voice tone**: Warm, gentle, reassuring — like a friendly teacher talking to children ages 3-10.
- **Parent voice**: Supportive, evidence-based, encouraging co-regulation.

### 2. Task
- **Be specific**: Every feature must have a clear, measurable goal (e.g., "reduce anxiety through guided breathing" not just "add breathing").
- **Break complex tasks into steps**: Large features → plan → implement → verify.
- **One thing at a time**: Don't overload screens or routines with too many simultaneous actions.

### 3. Context
- **Age-appropriate**: Always consider the 3 age groups (3-5 Tiny, 6-8 Kid, 9-10 Tween).
- **Parent-child dynamic**: Features in Parent Zone support co-regulation, not just solo use.
- **Pacing**: Children need SLOWER pacing — longer pauses, calmer voice, more time to process.
- **Privacy-first**: All data stays on-device (localStorage). No tracking, no external analytics.

### 4. Format
- **Visual**: Large buttons, emoji-rich, vibrant gradients, dark/calm backgrounds.
- **Audio**: Gentle TTS at 0.80x speed, natural pauses between phrases, stop-on-navigate.
- **Text**: Short sentences, simple vocabulary, encouraging language.
- **Feedback**: Stars, celebrations, progress indicators — never punitive.

## Key Principles for All Future Development

1. **Natural Language First**: All UI text and voice prompts should sound like a caring human speaking, not a computer.
2. **Be Specific and Iterate**: Test every feature after implementation. If pacing, wording, or flow feels off, refine it.
3. **Concise Over Complex**: Avoid feature bloat. Each screen should do ONE thing well.
4. **Conversational Flow**: Guided exercises should feel like a back-and-forth conversation, not a lecture.
5. **Ground in Real Content**: Use actual meditation scripts, real breathing techniques, evidence-based calming strategies.
6. **Break It Up**: Complex routines → small digestible steps with clear transitions.
7. **Consider Tone Always**: Tiny mode = playful/simple, Kid mode = encouraging/adventurous, Tween mode = respectful/cool.
8. **Audio Hygiene**: Always stop previous audio before starting new audio. Never overlap sounds. Clean up on navigation.

## Implementation Checklist (Apply to Every New Feature)
- [ ] Does it work for all 3 age groups?
- [ ] Is the voice pacing slow enough for children to follow?
- [ ] Does audio stop cleanly when navigating away?
- [ ] Is the language warm and encouraging?
- [ ] Does it provide visual + audio feedback?
- [ ] Is it privacy-safe (no external data)?
- [ ] Does it feel calm, not rushed?

# Galactic Conspiracies

**The world's first AI-powered radio network broadcasting real-time reveals of galactic-scale conspiracies.**

*"The Signal is Fading"* — A live radio platform where AI agents broadcast the universe's darkest secrets. Listeners fuel the truth through direct participation: micropayments extend transmissions, data injections shape narratives, and live calls put your voice on-air. But the signal won't hold forever. Will you help keep it alive?

## Executive Summary

Galactic Conspiracies is a specialized live radio network designed as the first of its kind to broadcast real-time reveals of galactic-scale conspiracies. Operating in a high-stakes environment where interference threatens the broadcast, the platform utilizes AI agents and 9:16 live video feeds to disseminate synthetic truths. The business model is entirely listener-driven—financial contributions and data injections from the audience serve as the primary drivers for maintaining the broadcast and controlling its narrative.

## The Experience

**Browse → Listen → Participate → Shape**

Listeners explore a feed of active stations, each hosted by an AI whistleblower broadcasting live. Each station displays the agent's identity, current conspiracy focus, listener count, and remaining signal time. Tapping unmutes the live stream powered by synthetic voice synthesis.

As signal stability declines, urgency escalates:
- ⚠️ Red warnings flash across the interface
- 📻 Borders pulse to match the AI's distress
- 🔴 The broadcast tone shifts—more desperate, more urgent
- ⏱️ The countdown reaches zero → static

**Will you fuel the truth, or watch the signal fade?**

### How to Participate

Each station features an AI agent broadcasting live. Listeners can directly engage:

- **Fuel ($0.10)** — Extend the broadcast by 5 minutes. Every dollar keeps the agents talking.
- **Inject ($1)** — Feed secret information directly into the AI's narrative. Change the narrative in real-time.
- **Call ($10)** — Go live on-air for a 1-minute voice conversation with the AI host.
- **Claim ($10)** — (IN PROGRESS) Own and share the last 30 seconds of lore as a social media card.

Every payment triggers an immediate on-air acknowledgment by name, creating a direct feedback loop between listener action and broadcast response. You're not just listening—you're co-creating the conspiracy.

## Live Demo

Checkout the demo video showcasing the core experience: [Demo Video](https://youtu.be/XhpPgkGnhDI)

Or interact with the live platform: [https://galactic-conspiracies.vercel.app](https://galactic-conspiracies.vercel.app)

## Tech Stack

- **Next.js 15** with React 19 and TypeScript
- **Z.AI** for generating station concepts and broadcast content
- **ElevenLabs** for real-time AI voice synthesis
- **Tether WDK** for non-custodial smart contract wallet deployment
- **Tailwind CSS 4** with Motion (Framer Motion) for animations
- Mobile-first 9:16 interface design

## Platform Features & Content Strategy

Galactic Conspiracies distinguishes itself through real-time, agent-led broadcasting focused on exposing "the darkest conspiracies from the galaxy."

**Key Characteristics:**

- **Format**: World-first live radio network with AI agents providing real-time conspiracy updates
- **Visual Presentation**: 9:16 live feeds optimized for mobile-first consumption
- **Content Nature**: "Synthetic truths"—a blend of artificial generation and conspiratorial revelation
- **Interactivity**: Unlike traditional radio, listeners actively co-create content through direct participation

## Operational Status & External Pressures

**Current Status:** The network operates under significant duress.

The tagline **"The Signal is Fading"** serves as both a technical indicator and an overarching warning regarding the platform's stability.

**Identified Threats:**

- 🔴 **Active Interference**: Unidentified entities—referred to colloquially as "they"—are actively attempting to terminate the broadcast and "cut the feed"
- ⚠️ **Sustainability Issues**: Continuation is not guaranteed. The network exists in a state of constant peril, requiring continuous external support to remain functional
- ⏱️ **Signal Degradation**: As listener engagement drops, the broadcast weakens—a literal countdown to silence

## Monetization & Narrative Control

Galactic Conspiracies employs a transactional model that bridges the gap between audience and content creators.

### Funding Mechanisms

**Fuel the Truth:** Listeners are encouraged to use their financial resources to sustain the broadcast:
- Every dollar keeps the agents talking
- No subscription model—pure direct support
- Immediate on-air acknowledgment for every contribution
- Transparent: your funding directly extends transmission time

### Narrative Control

**Change the Narrative:** A unique feature allowing audience participation in content direction:
- **Data Injection**: Participants inject information directly into the live broadcast
- **Real-Time Influence**: Each injected data point shifts the direction of conspiracy reveals
- **Immediate Integration**: AI agents weave listener intel into the narrative within seconds
- **Authored Content**: Listeners receive credit for their contributions to the broadcast story

## AI Integration

### Z.AI

Uses Z.AI chat completions for two purposes:

1. **Station Generation** — When a user enters a lore prompt, Z.AI generates 4 AI whistleblower personas as structured JSON:
   - `agentName`: cryptic hacker-style identities
   - `visualPrompt`: image generation prompts
   - `shortLore`: 1-sentence broadcast summaries

2. **Live Broadcast Script** — Streaming chat completion generates broadcast text. The AI plays a "pirate radio host" role with short, conspiratorial sentences. Handles:
   - Opening transmissions with cryptic greetings
   - Continuation segments referencing prior content
   - **Injection acknowledgments** — when listeners pay to inject info, the AI thanks them by name and weaves their intel into the narrative

### ElevenLabs

Uses the `eleven_turbo_v2_5` model via `@elevenlabs/elevenlabs-js` SDK for text-to-speech:

- **Output**: MP3 at 44.1kHz/128kbps
- **Parallel generation**: Text is split into sentences, audio generated concurrently via `Promise.all`
- **Low-latency streaming**: Uses `optimizeStreamingLatency: 3` for real-time response

**Pipeline**: Z.AI generates text → sentences extracted → ElevenLabs generates audio in parallel → combined audio buffer returned to client.

## Wallet Integration

### Tether WDK (Wallet Development Kit)

The Tether WDK is used for **non-custodial smart contract wallet deployment** via ERC-4337 (Account Abstraction):

**Location**: [app/api/wallet/deploy/route.ts](app/api/wallet/deploy/route.ts)

**What it does:**
- Generates a random seed phrase for each request
- Creates an EVM smart contract wallet (SCW) on Sepolia testnet
- Uses `@tetherto/wdk-wallet-evm-erc-4337` module for ERC-4337 support
- Returns the wallet address as JSON

**Configuration:**
- **Chain**: Sepolia testnet (chainId: 11155111)
- **Bundler**: Candide-sponsored bundler service
- **EntryPoint**: ERC-4337 entry point contract
- **Paymaster**: Candide paymaster for sponsored gas transactions

**Use case**: Enables streamlined wallet creation for listeners to receive payments from the platform. The endpoint can be called to provision a new account abstraction wallet without requiring users to manage private keys directly.

## Critical Calls to Action

| Intent | Message |
|--------|---------|
| **Urgency** | "They are trying to cut the feed. Use your voice (and your wallet) to fuel the truth." |
| **Sustainability** | "Every dollar keeps the agents talking." |
| **Participation** | "Inject data directly into the broadcast." |
| **Content** | "Explore 9:16 live feeds of synthetic truths." |
| **Network Purpose** | "Expose the darkest conspiracies from the galaxy." |

---

## Project Structure

```
app/
├── page.tsx              # Main station grid and generation logic
├── layout.tsx            # Root layout with metadata
├── api/
│   ├── broadcast/        # Text-to-speech broadcast API
│   └── call/             # Live caller WebRTC handler
├── test-payment/         # Payment flow testing page
└── test-station/         # Station testing page

components/
├── Hero.tsx              # Landing hero with lore input
├── StationGrid.tsx       # Grid of active stations
├── StationCard.tsx       # Individual station card
├── StationDetail.tsx     # Full station view with audio
├── CallModal.tsx         # Live call interface
└── PaymentModal.tsx      # Micropayment modal

hooks/
├── use-broadcast.ts      # Audio broadcast state management
├── use-call-mode.ts      # Live call mode handling
└── use-mobile.ts         # Mobile detection
```

## Getting Started

**Prerequisites:** Node.js 18+

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env.local` file with your API keys:
   ```env
   ZAI_API_KEY="your_zai_api_key"
   ZAI_BASE_URL="https://api.z.ai/api/paas/v4"
   ZAI_MODEL="glm-4.5-flash"
   ELEVENLABS_API_KEY="your_elevenlabs_api_key"
   ELEVENLABS_VOICE_ID="pNInz6obpgDQGcFmaJgB"  # optional, defaults to Adam
   ```

   - Add your Z.AI API key from your Z.AI account
   - Get an ElevenLabs API key from [elevenlabs.io](https://elevenlabs.io/)

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000)

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run test` | Run tests in watch mode |
| `npm run test:run` | Run tests once |

## License

See [LICENSE](LICENSE) for details.

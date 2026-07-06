# KNOW AI — Agentic AI Search Engine

An AI-powered conversational search engine (inspired by Perplexity) that grounds every answer in live web search and real-time financial data — with inline citations, an autonomous tool-calling agent, and token-level streaming responses.

**Live:** [know-ai-search-engine.vercel.app](#) &nbsp;|&nbsp; **Backend:** Render

---

## ✨ Features

- **🔍 Live Web Search Grounding** — Answers are grounded in real-time search results (Tavily API) instead of relying solely on the model's training data.
- **🤖 Tool-Calling AI Agent** — Built with LangChain's agent framework. The agent autonomously decides *when* to search the web, *when* to fetch an exact financial quote, and *when* to just answer directly — no hardcoded routing.
- **📌 Inline Citations** — Every claim is traced back to its source. Citations are extracted from the agent's own tool-call trace and rendered as clickable, numbered badges (`[1]`, `[2]`, ...) with a sources list.
- **📈 Dedicated Financial Data Tool** — Stock, index, and crypto prices are fetched from a dedicated API (Twelve Data) instead of text search, since live numeric data isn't reliably present in crawled web content. Includes:
  - Self-healing ticker resolution (handles company renames/demergers automatically)
  - Live currency conversion for cross-currency price queries
  - Redis caching to reduce API calls and improve latency
- **🚫 Anti-Hallucination Guardrails** — The agent's system prompt enforces that numeric facts must be explicitly present in tool results — never estimated or recalled from memory.
- **⚡ Real-Time Streaming Responses** — Answers stream token-by-token over Server-Sent Events (SSE), replacing a blocking request/response flow with a live, ChatGPT-style typing experience.
- **🔐 Secure Authentication** — JWT-based auth with HTTP-only cookies, email verification, and Redis-backed token blacklisting for logout.
- **💬 Full Chat Experience** — Persistent chat history, global chat search, chat deletion, and auto-generated chat titles.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, Redux Toolkit, React Router, Tailwind CSS |
| Backend | Node.js, Express |
| Database | MongoDB (Mongoose) |
| Cache | Redis |
| AI / Agent | LangChain (`createAgent`), Google Gemini |
| Search | Tavily API |
| Financial Data | Twelve Data API |
| Auth | JWT, HTTP-only cookies, SendGrid (email verification) |
| Deployment | Vercel (frontend), Render (backend) |

---

## 🏗️ Architecture

```
React Client
     │
     ▼
Express API  ──────────────►  Tool-Calling Agent (LangChain)
     │                              │        │
     ▼                              ▼        ▼
MongoDB (chats,              Search Tool   Stock Quote Tool
messages, citations)         (Tavily)      (Twelve Data + Redis cache)
     │
     ▼
SSE Stream ──► React Client (live token rendering + citations)
```

**Request flow:**
1. User sends a message → saved to MongoDB.
2. Full conversation history is passed to the agent.
3. Agent decides which tool(s) to call — web search, stock quote, both, or neither.
4. Tool results are used to synthesize a grounded, cited answer.
5. Response streams back token-by-token via SSE; citations are extracted from the tool-call trace and sent once generation completes.
6. Final answer + citations are persisted to MongoDB.

---

## 📂 Key Modules

- `ai.service.js` — Agent definition, system prompt, streaming + non-streaming response generation, citation extraction.
- `internet.service.js` — Web search wrapper (Tavily).
- `stockQuote.service.js` — Financial data wrapper (Twelve Data) with Redis caching, ticker auto-resolution, and cross-currency conversion.
- `chat.controller.js` — Chat CRUD + SSE streaming endpoint.
- `ChatScreen.jsx` — Chat UI, citation rendering, streaming state.

---

## ⚙️ Environment Variables

**Backend**
```
MONGO_URI=
REDIS_URL=
JWT_SECRET=
GEMINI_API_KEY=
TAVILY_API_KEY=
TWELVE_DATA_API_KEY=
SENDGRID_API_KEY=
SENDGRID_FROM=
FRONTEND_URL=
BACKEND_URL=
```

**Frontend**
```
VITE_BACKEND_URL=
```

---

## 🚀 Running Locally

```bash
# Backend
cd backend
npm install
npm run dev

# Frontend
cd frontend
npm install
npm run dev
```

---

## 🧠 Engineering Notes

A few real-world problems that came up while building this, and how they were solved:

- **Hallucinated financial data:** General web search grounding couldn't reliably surface live stock/crypto prices (they're JS-rendered, not present in crawled HTML). Solved by adding a dedicated financial data tool and explicit guardrails against inventing numbers.
- **Unreliable third-party data:** A financial API's synthetic cross-currency pairs occasionally returned incorrect values. Fixed by detecting synthetic pairs and recomputing the conversion manually via a native-currency + forex-rate lookup.
- **Cloud IP blocking:** An unofficial scraping-based library was silently blocked on cloud infrastructure (Render). Migrated to an official, API-key-based provider.
- **Conversation integrity:** A crashed request could leave a user message "unanswered" in the database, confusing the agent on the next turn. Fixed by always persisting a fallback response on error.

---

## 📌 Roadmap

- [ ] Multi-currency support beyond USD/INR
- [ ] Voice input
- [ ] Shareable public chat links
- [ ] Rate limiting per user

---

## 👤 Author

**Het Patel**
Built as a placement-prep flagship project — MERN + LangChain + agentic AI search.

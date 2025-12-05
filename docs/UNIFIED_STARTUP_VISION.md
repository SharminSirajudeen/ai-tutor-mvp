# Unified Startup Vision: Democratizing Education

## The Mission
**"MIT/Harvard-level education accessible to anyone, anywhere, at zero cost."**

Starting with India (like Byjus/Xylem), then expanding worldwide.

---

## Project Portfolio Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    SHARMIN'S EDTECH ECOSYSTEM                           │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   ┌───────────────────────────────────────────────────────────────┐    │
│   │                    AI TUTOR MVP (Core)                        │    │
│   │   Mission: Socratic AI tutor for Theory of Computation        │    │
│   │   Stack: Next.js + LangGraph + ChromaDB                       │    │
│   │   Status: Active development                                   │    │
│   └───────────────────────────────────────────────────────────────┘    │
│                              │                                          │
│                              ▼                                          │
│   ┌───────────────────┐  ┌───────────────────┐  ┌─────────────────┐    │
│   │     TeachAI       │  │   automata-repo   │  │  Entrance Exam  │    │
│   │                   │  │                   │  │     Tutor       │    │
│   │ Extended tutor    │  │ JFLAP solutions   │  │                 │    │
│   │ platform          │  │ Reference impl    │  │ K-12 focused    │    │
│   │                   │  │                   │  │ India market    │    │
│   └───────────────────┘  └───────────────────┘  └─────────────────┘    │
│                                                                         │
│   ┌───────────────────────────────────────────────────────────────┐    │
│   │                  CONTENT CREATION TOOLS                        │    │
│   │   ┌─────────────────┐     ┌─────────────────────────────┐     │    │
│   │   │    ReelMint     │     │   musical-octo-system       │     │    │
│   │   │ Content gen     │     │   Video generation          │     │    │
│   │   │ (needs refocus) │     │   Educational content       │     │    │
│   │   └─────────────────┘     └─────────────────────────────┘     │    │
│   └───────────────────────────────────────────────────────────────┘    │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Project Details

### 1. AI Tutor MVP (Primary Focus)

**What**: Socratic AI tutor for Theory of Computation (DFA, NFA, Regex, etc.)

**Why**:
- TOC is notoriously difficult
- High failure rates in CS programs
- No good interactive tutors exist
- Unique founder-market fit (you studied this!)

**Status**: Active development

**Tech Stack** (Zero Cost):
| Component | Tool | Cost |
|-----------|------|------|
| Frontend | Next.js + Vercel | $0 |
| Agent | LangGraph | $0 |
| LLM | Gemini CLI / Ollama | $0 |
| Memory | ChromaDB | $0 |
| Canvas | ReactFlow | $0 |

**Key Differentiators**:
- Socratic method (questions, not answers)
- Visual automata builder
- Adaptive difficulty
- Session memory (remembers student progress)

---

### 2. TeachAI

**What**: Extended tutoring platform building on AI Tutor MVP

**Relationship to AI Tutor MVP**:
- AI Tutor MVP = core engine
- TeachAI = platform layer (auth, payments, courses)

**Wait Until**: AI Tutor MVP proves the core magic works

---

### 3. automata-repo

**What**: Collection of JFLAP solutions and TOC reference implementations

**Value**:
- Content library for AI Tutor
- Ground truth for evaluation
- SEO/discovery tool

**Synergy**:
- AI Tutor can reference these solutions
- Students can verify their work
- Training data for fine-tuning (future)

---

### 4. Entrance Exam Tutor

**What**: K-12 focused tutor for Indian entrance exams

**Market**:
- JEE (IIT entrance)
- NEET (Medical entrance)
- State board exams

**Competition**:
- Byjus ($22B valuation before collapse)
- Xylem (Kerala-focused)
- Unacademy

**Differentiator**:
- Socratic method (not lecture-based)
- Personalized to student level
- Zero cost for students (ad-supported or freemium)

**Wait Until**: AI Tutor MVP validates the Socratic approach

---

### 5. ReelMint

**What**: Content generation tool

**Issue**: "29 dependencies, no core feature"

**Lesson Learned**: Core First, Scale Second

**Options**:
1. **Pivot**: Use learnings, apply to education content
2. **Archive**: Document learnings, focus on AI Tutor
3. **Simplify**: Strip to core feature, validate

**Recommendation**: Archive for now, revisit when education products have traction

---

### 6. musical-octo-system

**What**: Video generation system

**Potential Use**: Educational video content

**Wait Until**:
- AI Tutor MVP is working
- Content creation becomes bottleneck
- Clear use case emerges

---

## Strategic Priorities

### Phase 1: Prove the Magic (Now - Month 2)
```
Focus: AI Tutor MVP only
Goal: One amazing feature that makes people say "wow"
Metric: 10 students complete a DFA lesson and report value
Budget: $0
```

**Actions**:
1. Complete LangGraph integration
2. Add memory (student remembers progress)
3. Test with 10 real users
4. Iterate based on feedback

### Phase 2: Validate Market (Month 3-4)
```
Focus: AI Tutor MVP + automata-repo
Goal: Organic growth, word of mouth
Metric: 100 monthly active users
Budget: $0-50
```

**Actions**:
1. Publish automata-repo content
2. Add more TOC topics
3. Social media presence
4. University partnerships (free)

### Phase 3: Expand Scope (Month 5-6)
```
Focus: TeachAI platform layer
Goal: Multiple subjects, user accounts
Metric: 500 MAU, first revenue
Budget: $50-200
```

**Actions**:
1. Add auth (free tier: Clerk/Auth.js)
2. Add more subjects
3. Monetization experiments
4. Consider K-12 entrance exam angle

### Phase 4: Scale (Month 7+)
```
Focus: Entrance Exam Tutor (India market)
Goal: Significant user base
Metric: 5000 MAU, $1000 MRR
Budget: Revenue-funded
```

---

## The Unified Vision

### How Projects Connect

```
automata-repo (Content)
        │
        ▼
   AI Tutor MVP ─────────────────────────────────┐
   (Core Engine)                                  │
        │                                         │
        ├──────────────────┐                     │
        │                  │                     │
        ▼                  ▼                     ▼
    TeachAI           Entrance Exam        Content Tools
   (Platform)           Tutor            (ReelMint, octo)
                     (India Market)         (Future)
```

### Shared Components

| Component | Used By | Status |
|-----------|---------|--------|
| Socratic Engine | All tutors | Building in MVP |
| LangGraph State | All tutors | Building in MVP |
| Memory System | All tutors | Building in MVP |
| Evaluation (ADK) | All tutors | Phase 3 |
| Visual Canvas | AI Tutor, TOC | Done |

### Kill Criteria (When to Pivot)

**AI Tutor MVP**:
- If 0 users after 3 months of launch → Pivot topic
- If students report it's not helpful → Pivot approach
- If unable to improve Socratic score > 50% → Simplify

**Entrance Exam Tutor**:
- Don't start until AI Tutor MVP has 100+ users
- Market is competitive, need differentiation

**Content Tools**:
- Only revisit when content is a bottleneck
- Avoid "platform before magic" trap

---

## Budget Philosophy

### Current Subscriptions to Evaluate

| Service | Monthly | Verdict |
|---------|---------|---------|
| AI subscriptions | $?? | Replace with free tiers |
| Cloud services | $?? | Use free tiers |
| Dev tools | $?? | Use open source |

### Zero-Cost Alternatives

| Need | Free Alternative |
|------|------------------|
| LLM API | Gemini CLI (1000/day) + Ollama |
| Vector DB | ChromaDB (local) |
| Hosting | Vercel hobby |
| Auth | Auth.js (self-hosted) |
| Payments | Stripe (only pay when earn) |
| Email | Resend free tier |

### Rule: Don't Pay Until Profitable

1. **$0 revenue** → $0 infrastructure cost
2. **$100 revenue** → $20 infrastructure ok
3. **$500 revenue** → $100 infrastructure ok
4. **Revenue > 5x cost** → Sustainable

---

## Success Metrics

### Near-term (3 months)
- [ ] AI Tutor MVP deployed
- [ ] 10 test users complete a lesson
- [ ] Socratic score > 70%
- [ ] $0 monthly cost

### Medium-term (6 months)
- [ ] 100 monthly active users
- [ ] 3 TOC topics covered
- [ ] First testimonial
- [ ] < $50/month cost

### Long-term (12 months)
- [ ] 1000 monthly active users
- [ ] First revenue ($1 is success)
- [ ] India market entry
- [ ] Sustainable unit economics

---

## YC Wisdom Applied

### From the Transcripts

1. **"Launch something bad quickly"**
   - AI Tutor MVP with just DFA is enough
   - Don't wait for NFA, Regex, etc.

2. **"Talk to users"**
   - Find 10 CS students struggling with TOC
   - Ask them what's hard
   - Build that

3. **"Daily problems > yearly problems"**
   - Students struggle with homework daily
   - Exams are yearly but practice is daily

4. **"Founder-market fit"**
   - You studied TOC
   - You know the pain
   - Unique insight into what's hard

5. **"Core First, Scale Second"**
   - One amazing DFA lesson
   - Not a platform with no lessons

---

## The One Thing

If you can only do ONE thing this week:

> **Get 3 CS students to use AI Tutor MVP and tell you what they think.**

Not 100 students. Not a perfect product. Not a platform.

3 students. Real feedback. Iterate.

---

## Document Links

- [Agent Framework Architecture](./AGENT_FRAMEWORK_ARCHITECTURE.md) - Technical design
- [Implementation Checklist](./IMPLEMENTATION_CHECKLIST.md) - Task list
- [FREE & Open-Source Tools](./FREE_OPENSOURCE_TOOLS.md) - Zero-cost stack
- [YouTube Knowledge Synthesis](./YOUTUBE_KNOWLEDGE_SYNTHESIS.md) - Research insights

---

*Vision created: December 2025*
*Principle: "Core First, Scale Second"*
*Budget: $0 until revenue*

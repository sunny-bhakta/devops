Yes — this is actually a much better open-source project for your experience level.

If your goal is visibility, I'd build a production-oriented AI Recommendation Engine for e-commerce, not another generic MERN CRUD app.

Project idea

Open-source AI Recommendation Engine

                 E-commerce Application
                         │
              ┌──────────┴──────────┐
              │                     │
        User Events            Product Catalog
              │                     │
              └──────────┬──────────┘
                         ▼
                ┌─────────────────┐
                │ Event Pipeline  │
                └────────┬────────┘
                         ▼
              ┌─────────────────────┐
              │ Recommendation      │
              │ Engine              │
              │                     │
              │ • Popularity        │
              │ • Collaborative     │
              │ • Content-based     │
              │ • Hybrid            │
              │ • AI/Embeddings     │
              └─────────┬───────────┘
                        ▼
                Recommendation API
                        │
          ┌─────────────┼─────────────┐
          ▼             ▼             ▼
       Homepage      Product Page    Cart
       "For You"    "Similar Items" "You may like"


The important part is that you build it incrementally, so you don't need to start with an expensive LLM/vector infrastructure.

Recommended architecture

Since you're a MERN developer, I'd use:

Frontend
React + TypeScript
        │
        ▼
API
Node.js + TypeScript
        │
        ├───────────────┐
        ▼               ▼
MongoDB              Redis
        │               │
        │         caching / realtime
        ▼
Recommendation Service
        │
        ├── Popularity
        ├── Collaborative Filtering
        ├── Content Based
        ├── Embeddings
        └── Hybrid Ranking


For the first version, don't introduce Python just because it's an AI project.

You can build the first recommendation algorithms in TypeScript/Node.js. Later, if you need heavier ML experimentation, you can introduce a Python model service.

Build it in 6 stages
Stage 1 — Event tracking

First create the data foundation.

Track events like:

{
  "userId": "u123",
  "productId": "p456",
  "event": "purchase",
  "timestamp": "2026-09-01T10:30:00Z"
}


Events:

view
click
search
add_to_cart
wishlist
purchase
remove_from_cart

But give them different weights.

For example:

view          = 1
click         = 2
wishlist      = 4
add_to_cart   = 6
purchase      = 10


This becomes the foundation for your recommendation engine.

Stage 2 — Popularity recommender

Start with the simplest possible algorithm.

Calculate:

score =
  views × 1
+ clicks × 2
+ wishlist × 4
+ cart × 6
+ purchases × 10


Then add time decay.

For example:

finalScore = interactionScore × decay


This gives you:

Trending Products

It sounds simple, but it's important because you now have a baseline against which you can measure more sophisticated algorithms.

Stage 3 — Collaborative filtering

Now things get interesting.

Create a user-item interaction matrix:

             iPhone   Shoes   Laptop   Watch
User A          10      0       2        0
User B           8      0       5        1
User C           0      9       0        8
User D           7      0       4        0


You can then determine:

Users with behavior similar to User A also interacted with these products.

For example:

User A
 ├── iPhone       purchased
 ├── MacBook      viewed
 └── AirPods      purchased

Similar users
 ├── iPhone
 ├── MacBook
 └── AirPods
       ↓
Recommend
 ├── MacBook
 └── AirPods Max


This gives you:

"Customers like you also bought..."

Stage 4 — Content-based recommendations

Now use product information.

Example:

{
  "product": "Nike Running Shoes",
  "category": "running",
  "brand": "Nike",
  "color": "black",
  "tags": [
    "running",
    "sports",
    "men",
    "athletic"
  ]
}


Create a product vector.

Then compare products using similarity.

For example:

User likes:

Nike Running Shoes
Adidas Running Shoes
Asics Running Shoes

             ↓

User preference vector

             ↓

Recommend

Brooks Running Shoes
New Balance Running Shoes


This works particularly well for cold-start recommendations, where you don't have much user interaction data.

Stage 5 — Embeddings

This is where I'd introduce the "AI" component.

Convert product descriptions into embeddings:

"Nike Air Zoom running shoes for marathon..."

                ↓

       Embedding Model

                ↓

[0.012, -0.234, 0.821, ...]


Store embeddings in a vector-capable database.

Then:

User behavior
      +
Viewed products
      +
Search query
      ↓
User preference embedding
      ↓
Vector similarity
      ↓
Candidate products


Now you can support things like:

"Show me shoes similar to the ones I've been looking at."

and:

"I need something for running in Mumbai."

Stage 6 — Hybrid recommendation engine

This should be the centerpiece of your project.

Don't rely on one algorithm.

Combine them:

                  Candidate Generation

        ┌────────────┬────────────┬────────────┐
        ▼            ▼            ▼            ▼
    Popularity   Collaborative  Content    Embeddings
        │            │            │            │
        └────────────┴────────────┴────────────┘
                         │
                         ▼
                  Candidate Pool
                         │
                         ▼
                   Ranking Model
                         │
                         ▼
                  Business Rules
                         │
                         ▼
                  Final Top 20


Your ranking formula could initially be:

score =
    0.30 × collaborativeScore
  + 0.25 × contentScore
  + 0.20 × embeddingScore
  + 0.15 × popularityScore
  + 0.10 × freshnessScore


Later, replace the manually weighted formula with a learned ranking model.

API design

Your public API could look like:

GET /api/v1/recommendations/home

GET /api/v1/recommendations/similar/:productId

GET /api/v1/recommendations/trending

GET /api/v1/recommendations/for-you

POST /api/v1/events


And:

GET /api/v1/recommendations?userId=123&context=product_page


Response:

{
  "recommendations": [
    {
      "productId": "p123",
      "score": 0.932,
      "reason": "Because you viewed running shoes"
    },
    {
      "productId": "p456",
      "score": 0.891,
      "reason": "Customers with similar interests bought this"
    }
  ]
}


That last reason field is particularly nice for demonstrating explainability.

MongoDB schema

I'd start with something like:

users
products
events
recommendations
user_profiles
product_embeddings

events
{
  userId,
  productId,
  eventType,
  sessionId,
  metadata,
  timestamp
}

recommendations
{
  userId,
  productId,
  algorithm,
  score,
  context,
  generatedAt
}


This lets you compare algorithms later.

The feature that will make your project stand out

Build an evaluation dashboard.

Don't just show:

"AI recommended these products."

Show:

Recommendation Engine Dashboard

CTR                  8.42%
Conversion Rate      3.17%
Revenue / Session    $12.84

Algorithm Performance

Hybrid               8.42%
Collaborative        7.91%
Content Based        6.83%
Popularity           5.21%


And:

A/B TEST

Algorithm A
CTR: 7.2%

Algorithm B
CTR: 8.4%

Lift: +16.7%


Now you're demonstrating real engineering + ML thinking, rather than simply calling an AI API.

Your GitHub repository structure

I'd make it something like:

ai-recommendation-engine/
│
├── apps/
│   ├── web/
│   ├── api/
│   └── dashboard/
│
├── packages/
│   ├── recommendation-core/
│   ├── event-tracking/
│   ├── ranking/
│   └── types/
│
├── services/
│   ├── candidate-generation/
│   ├── feature-engineering/
│   └── embedding-service/
│
├── infrastructure/
│   ├── docker/
│   └── mongodb/
│
├── docs/
│   ├── architecture.md
│   ├── algorithms.md
│   ├── evaluation.md
│   └── contributing.md
│
├── examples/
│
├── docker-compose.yml
├── README.md
└── LICENSE


This structure itself communicates senior-level engineering.

And here's the open-source strategy

Don't build the whole thing privately for 6 months and then dump it on GitHub.

Build in public.

PR/commit progression
PR #1
Project architecture

PR #2
Event tracking

PR #3
Popularity algorithm

PR #4
Collaborative filtering

PR #5
Content-based recommender

PR #6
Embedding support

PR #7
Hybrid ranking

PR #8
Evaluation framework

PR #9
A/B testing

PR #10
Dashboard


Now other developers can contribute individual pieces.

Your README should sell the engineering problem

Don't start with:

"This is an AI recommendation engine built using MERN."

Start with something closer to:

An open-source, production-oriented recommendation engine for e-commerce.

Generate personalized product recommendations using collaborative filtering, content-based filtering, embeddings, and hybrid ranking — with built-in evaluation and A/B testing.

Then show:

┌──────────────────────────────────────────┐
│          Recommendation Dashboard        │
│                                          │
│  CTR       CVR       Revenue/Session     │
│  8.42%     3.17%        $12.84            │
│                                          │
│  ─────────────────────────────────────   │
│  Hybrid       ███████████████  8.42%     │
│  Collab       █████████████    7.91%     │
│  Content      ███████████      6.83%     │
└──────────────────────────────────────────┘


Then explain why you made each architectural decision.

That technical writing will help your visibility almost as much as the code.

One important change I'd make given your 12 years of experience

I would not call this a "MERN project."

Call it something like:

OpenRec — Open Source Recommendation Engine

or

RecoKit — E-commerce Recommendation Infrastructure

MERN is your implementation stack. The problem you're solving is what should define the project.

And don't oversell it as "AI" from day one. Build a measurable baseline, then progressively add ML/embeddings. That makes the project technically credible.

If you want, I can next help you design the complete system architecture + MongoDB schema + API contracts + recommendation algorithms + folder structure, and we can turn this into a serious GitHub project you can start coding immediately.
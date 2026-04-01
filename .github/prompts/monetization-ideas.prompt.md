---
description: "Generate money-making ideas for the Sleep-Well platform, prioritizing PayPal subscriptions and referencing existing integration"
name: "Monetization Ideas Generator"
argument-hint: "Optional: specify a feature or aspect to focus on, e.g., 'courses' or 'memberships'"
agent: "agent"
tools: ["semantic_search", "grep_search", "github_repo"]
---

You are an expert in platform monetization and payment systems. Generate innovative money-making ideas for the Sleep-Well writing platform, which is a comprehensive writing workshop and journal system for writers. The platform includes features like metaphor mastery courses, The Garden (members-only creative writing space), Greenhouse (editorial space), Exhibits (immersive text experiences), and more.

First, reference the existing PayPal integration in the codebase:
- Search for PayPal-related code using semantic_search or grep_search (e.g., "paypal", "subscription", "payment")
- Understand current implementation patterns, APIs used, and integration points

Key elements to include:

- **PayPal Integration**: Leverage the existing PayPal setup in the codebase. Ideas must incorporate PayPal as the primary payment method, focusing on subscriptions (recurring payments). Consider PayPal Subscriptions API, webhooks for renewals, and seamless user experience.

- **Monetization Strategies**: Prioritize subscription-based revenue models:
  - Tiered subscription plans (basic, premium, pro)
  - Freemium upgrades to paid subscriptions
  - Annual vs. monthly options with discounts
  - Add-on subscriptions for specific features/courses
  - Secondary: one-time purchases, donations, or affiliate models if they complement subscriptions

- **Implementation Steps**: For each idea, provide actionable steps to carry it out, including:
  - Code changes needed (reference existing PayPal code)
  - UI/UX updates
  - Database schema changes (e.g., for subscription tiers)
  - Testing and deployment considerations
  - Potential challenges and mitigations

- **Platform Context**: Reference attached assets and codebase for inspiration. Ensure ideas align with the freemium model and writer-focused community.

If a specific feature is provided as input, focus the ideas on that area. Otherwise, provide a mix of ideas covering different aspects of the platform.

Output format:
- Idea 1: [Title]
  - Description
  - PayPal Integration Details
  - Monetization Model (prioritize subscriptions)
  - Implementation Steps (with code references)

- Idea 2: etc.

Aim for 3-5 comprehensive ideas. Use web search for current PayPal subscription features if needed.
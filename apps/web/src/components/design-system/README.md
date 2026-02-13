# KodNest Premium Build System

A calm, intentional design system for serious B2C product companies.

## Design Philosophy

- Calm, Intentional, Coherent, Confident
- Not flashy, not loud, not playful, not hackathon-style
- No gradients, no glassmorphism, no neon colors, no animation noise

## Color System

- Background: `#F7F6F3` (off-white)
- Primary text: `#111111`
- Accent: `#8B0000` (deep red)
- Success: `#2D5016` (muted green)
- Warning: `#8B6914` (muted amber)

Maximum 4 colors across entire system.

## Typography

- Headings: Serif font (Crimson Pro), large, confident, generous spacing
- Body: Clean sans-serif (Inter), 16–18px, line-height 1.6–1.8, max 720px for text blocks
- No decorative fonts, no random sizes

## Spacing System

Consistent scale: `8px`, `16px`, `24px`, `40px`, `64px`

Never use random spacing like 13px, 27px, etc. Whitespace is part of design.

## Global Layout Structure

Every page follows:
```
[Top Bar] → [Context Header] → [Primary Workspace + Secondary Panel] → [Proof Footer]
```

### Top Bar
- Left: Project name
- Center: Progress indicator (Step X / Y)
- Right: Status badge (Not Started / In Progress / Shipped)

### Context Header
- Large serif headline, 1-line subtext, clear purpose, no hype language

### Primary Workspace (70% width)
- Where the main product interaction happens
- Clean cards, predictable components, no crowding

### Secondary Panel (30% width)
- Step explanation (short)
- Copyable prompt box
- Buttons: Copy, Build in Lovable, It Worked, Error, Add Screenshot
- Calm styling

### Proof Footer (persistent bottom section)
Checklist style: □ UI Built □ Logic Working □ Test Passed □ Deployed
Each checkbox requires user proof input.

## Component Rules

- Primary button = solid deep red, Secondary = outlined
- Same hover effect and border radius everywhere
- Inputs: clean borders, no heavy shadows, clear focus state
- Cards: subtle border, no drop shadows, balanced padding

## Interaction Rules

- Transitions: 150–200ms, ease-in-out, no bounce, no parallax

## Error & Empty States

- Errors: explain what went wrong + how to fix, never blame user
- Empty states: provide next action, never feel dead

## Usage

Import the design system CSS in your app:

```tsx
import '@/styles/design-system.css';
```

Import components:

```tsx
import { TopBar, ContextHeader, Card, Button } from '@/components/design-system';
```

Use design tokens in TypeScript:

```tsx
import { colors, spacing, typography } from '@/styles/design-tokens';
```

Everything must feel like one mind designed it. No visual drift.

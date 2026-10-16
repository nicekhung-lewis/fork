# Design Brief

## Direction

ตลาดงาน (Work Market) — a Thai-language task marketplace that feels like a busy, trustworthy market stall: dense, warm, and fast to scan.

## Tone

Confident editorial marketplace — warm paper surfaces, deep indigo authority, and a single hot coral accent that says "get it done"; never sterile corporate blue.

## Differentiation

Every job card reads like a price tag at a market: a bold coral budget badge anchors the eye, status pills color-code the pipeline, and tabular figures keep offer columns razor-aligned.

## Color Palette

| Token      | OKLCH        | Role                                          |
| ---------- | ------------ | --------------------------------------------- |
| background | 0.975 0.006 85 | warm off-white paper                          |
| foreground | 0.22 0.03 275  | deep indigo ink (primary text)                |
| card       | 1.0 0.002 85   | crisp white job cards & panels                |
| primary    | 0.42 0.17 275  | indigo-violet brand — header, nav, primary CTA |
| accent     | 0.68 0.19 40   | coral — budgets, offer CTAs, star ratings      |
| muted      | 0.945 0.01 85  | warm neutral surfaces, chips, dividers         |
| success    | 0.58 0.15 152  | status pill "เปิดรับข้อเสนอ" (open)            |
| warning    | 0.72 0.15 78   | status pill "กำลังทำ" (in progress)            |
| destructive| 0.55 0.21 25   | delete / cancel / rejected actions             |
| info       | 0.6 0.13 245   | neutral status "เสร็จแล้ว" (done), hints       |

## Typography

- Display: Plus Jakarta Sans — headings, job titles, brand, numerals in badges
- Body: Plus Jakarta Sans — paragraphs, labels, UI text; Thai script falls through to Noto Sans Thai / Sarabun
- Mono: JetBrains Mono — prices, IDs, timestamps in dense tables
- Scale: hero `text-4xl md:text-5xl font-bold tracking-tight`, h2 `text-2xl md:text-3xl font-bold tracking-tight`, section label `text-xs font-semibold tracking-widest uppercase text-muted-foreground`, body `text-sm md:text-base`

## Elevation & Depth

Warm paper base with white cards lifted by `shadow-subtle`; `shadow-elevated` reserved for hovered cards, popovers, and the sticky detail panel — depth comes from layered surfaces, never gradients.

## Structural Zones

| Zone    | Background        | Border      | Notes                                                    |
| ------- | ----------------- | ----------- | -------------------------------------------------------- |
| Header  | `bg-primary`      | none        | indigo bar, white logo, coral "โพสต์งาน" pill, search box |
| Content | `bg-background`   | —           | job feed on warm paper; alternate sections `bg-muted/40`  |
| Sidebar | `bg-sidebar`      | `border-l`  | filters + sticky job detail panel                        |
| Footer  | `bg-muted/40`     | `border-t`  | category links, muted text                               |

## Spacing & Rhythm

Dense but breathable: `gap-3`/`gap-4` inside cards, `gap-6` between cards, `py-10 md:py-14` section rhythm, `p-4` card padding — tight enough for scanning many jobs per screen.

## Component Patterns

- Buttons: fully rounded pills; primary = indigo, accent = coral for post/offer CTAs, ghost = muted hover; `transition-smooth`
- Cards: `rounded-xl` white surface, `border-border`, `shadow-subtle`, hover lifts to `shadow-elevated`
- Badges: budget = coral solid pill with tabular figures; category chips = `bg-muted` rounded-full; status pills = soft tinted bg + darker text (`success`/`warning`/`info`)
- Avatars: circular, ring on hover, stacked overlap for bidder lists
- Ratings: coral filled stars, `text-xs` numeric alongside

## Motion

- Entrance: `animate-fade-in-up` on job cards, staggered ~40ms, 0.35s ease-out
- Hover: cards lift (`shadow-elevated`) and translate `-1px` over 0.2s
- Decorative: `animate-fade-in` for panels/popovers; no looping or glow effects

## Constraints

- Thai-first: every Latin font stack must end in a Thai-capable family (Noto Sans Thai / Sarabun)
- Semantic tokens only — no raw hex, `rgb()`, or arbitrary color classes in components
- Do not design payment/escrow or email-notification surfaces (out of scope)
- AA+ contrast in both light and dark; dark mode is a tuned indigo-charcoal, not an inversion

## Signature Detail

The market price tag: a coral budget badge with tabular figures that anchors every job card and offer row — category: branded data emphasis.

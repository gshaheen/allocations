# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Static HTML5, CSS3 with modern CSS custom properties, and vanilla ES Modules. Zero external build steps, package dependencies, or framework runtimes.

## Users

Everyday investors, personal finance enthusiasts, DIY portfolio builders, and financial advisors who need to quickly model, stress-test, and share portfolio allocations with clients, peers, or communities without signup friction or tool bloat.

## Product Purpose

Allocations is an experimental, keyboard-driven single-page application to construct, visualize, and share portfolio asset allocations with zero friction. Success is a user landing on a pristine empty page with a single blinking ASCII cursor, typing whatever asset classes, stocks, or funds they desire and their percentages, seeing a high-precision interactive donut chart materialize the moment allocations reach 100%, and sharing that portfolio with anyone via self-contained URL parameters.

## Positioning

Unlike complex, slow portfolio trackers or broker-locked platforms, Allocations has zero lookup friction, no accounts, and no data lock-in. Any user-defined asset name is accepted directly via keyboard, visualized immediately on a bespoke donut chart, and preserved 100% in the URL.

## Operating Context

Used in modern browsers on desktop and mobile. Fast, tactile, and expressive for exploring allocation splits (e.g. 60/40, All Weather, Core-Satellite, Barbell, Custom Funds) and sharing them cleanly.

## Capabilities and Constraints

- **Confirmed Functionality**:
  - Pristine landing state: Dead-center ultra-light grey page (`#ECECED`) with ONLY a blinking ASCII block cursor (`█`).
  - Fluid keyboard-driven input: Type any asset name or ticker label directly (no API lookup required). Press Enter, input %, and continue until 100% is reached.
  - Interactive Donut Chart: High-DPI canvas/SVG donut chart showing percentage allocation slices with segment hover, dynamic center readout (asset name, %, dollar amount), and synchronized legend.
  - Allocation Ledger: Inline editing of weights, live chart updates, add/remove assets, and auto-normalize to 100%.
  - Total Capital Control: Optional portfolio balance setting (default $10,000) that calculates exact dollar amounts per allocation.
  - Deep-link URL state synchronization: Encodes all allocations (`?p=US+Equities:60,Bonds:30,Cash:10&v=10000`) for 1-click sharing.
- **Durable Constraints**:
  - Zero-sign-in architecture: No accounts, no database, no session tokens.
  - Single mode: Neo-grotesque Swiss ultra-light grey theme.
  - Zero external runtime dependencies: 100% client-side vanilla JavaScript, CSS, and HTML5.

## Brand Commitments

- **Name**: allocations
- **Tagline**: Construct, backtest, and share investment portfolios via URL. No sign-in required.
- **Tone & Voice**: Impeccable, minimalist, neo-grotesque, stark, distraction-free.
- **Visual Identity**: Strict single mode on an ultra-light grey surface (`#ECECED`), neo-grotesque typography, high-contrast ink text (`#111113`), blinking ASCII block cursor (`█`), and a Swiss-palette stacked line growth chart.

## Evidence on Hand

- Complete 147-month verified historical total return series (2014-01 through 2026-03) covering core asset universe (SPY, QQQ, VTI, AAPL, MSFT, NVDA, AMZN, GOOGL, TSLA, BRK.B, VXUS, VEA, VWO, BND, TLT, SHY, TIP, HYG, VNQ, GLD, DBC, BTC, ETH, BIL).
- 8 iconic benchmark presets (Classic 60/40, Ray Dalio All Weather, Warren Buffett 90/10, Bogleheads 3-Fund, High-Growth Tech, Golden Butterfly, Permanent Portfolio, Modern Balanced + Crypto).

## Product Principles

1. **Zero Friction by Default**: No registration gates, onboarding surveys, or paywalls between the user and their portfolio model.
2. **URL as the Single Source of Truth**: The link is the portfolio. If a user tweaks an allocation, the URL reflects it immediately and permanently.
3. **Institutional Precision, Human Usability**: Financial backtesting and compounding math must be mathematically accurate, while sliders, presets, and charts feel fluid and tactile.
4. **Autonomous Portability**: Runs as a self-contained web app anywhere—open from local file, host on GitHub Pages, Vercel, or any static CDN.

## Accessibility & Inclusion

- Semantic HTML structure with accessible ARIA labels for screen readers.
- Keyboard accessible inputs, sliders, and modal controls with visible focus rings.
- High-contrast visual tokens meeting WCAG AA requirements on dark surfaces.
- Tabular figures (`tabular-nums`) for clean financial data alignment.

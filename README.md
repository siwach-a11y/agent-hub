# AgentHub — Voucher & Rewards

AI agent marketplace focused on vouchers, deals, and rewards.

## Live demo

**GitHub Pages:** [https://siwach-a11y.github.io/voucher-agent/](https://siwach-a11y.github.io/voucher-agent/)

Open `index.html` for the marketplace.

## Local development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

If the dev server shows 500 errors or missing styles, reset the cache:

```bash
npm run dev:clean
```

## Static export (offline demo folder)

```bash
npm run build:html
```

Outputs a shareable folder at `agenthub-demo/` and `agenthub-demo.zip`.

## GitHub Pages deploy

Manual build for Pages. Set `PAGES_BASE_PATH` to match the repo name:

```bash
PAGES_BASE_PATH=/voucher-agent npm run build:pages
```

This publishes the `out/` directory (deploy it to the `gh-pages` branch).

## Agents

- Voucher Discovery Agent — find vouchers
- Daily Deals Agent — daily deals
- Cashback Agent — cashback offers
- Promo Code Agent — promo codes
- Loyalty Rewards Agent — loyalty rewards
- Buy 1 Get 1 Agent — buy-one-get-one offers
- Flash Sale Agent — flash sales

The AI assistant on each agent page needs the live server (`npm run dev`) with `ANTHROPIC_API_KEY` set; the static build runs the browse/filter UI without a backend.

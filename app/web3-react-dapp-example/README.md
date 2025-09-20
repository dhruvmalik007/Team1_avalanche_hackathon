# Getting Started with Core web3-react connector

This package uses Next.js 14 App Router.

We use `@privy-io/react-auth` for login (wallet/OAuth) and viem for on-chain interactions.

This is meant to be the simplest example as possible and thus only deals with connecting dApps to the Core extension.

## Connect to Core Button

See `app/components/Topbar.tsx` and `app/providers.tsx` for the Privy provider and UI.

## Available Scripts

In the project directory, you can run:

### `yarn dev`

Runs the app in development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

---

## Environments Hub UX + Privy Login

This example now includes a minimal clone of PrimeIntellect's Environments Hub with Web3 + OAuth login using [Privy](https://docs.privy.io/basics/react/).

### Routes

- `/dashboard/environments` – Environments Hub (search, tags, featured grid).
- `/dashboard/environments/:owner/:slug` – Environment Detail page (code/files panel + right sidebar).
- `/dashboard/environments/new` – Protected route; requires Privy sign-in (wallet or OAuth). If unauthenticated, the Privy modal opens and a friendly gate is shown.
- `/homepage` – Marketing/homepage (optional landing page).

### Environment variables

Create `.env.local` with your settings:

```
NEXT_PUBLIC_PRIVY_APP_ID=your-privy-app-id
# Optional explorer base (e.g., Snowtrace):
NEXT_PUBLIC_EXPLORER_BASE=https://testnet.snowtrace.io
# On-chain registry options (one of):
NEXT_PUBLIC_REGISTRY_ADDRESS=0x...
NEXT_PUBLIC_REGISTRY_BYTECODE=0x...
# Server-side signer (optional API route):
NEXT_PUBLIC_USE_SERVER_SIGNER=0
NEXT_PRIVATE_DEPLOYER_KEY=0x...
NEXT_PRIVATE_RPC_URL=https://...
```

Privy app configuration docs: https://docs.privy.io/

### Dependencies used

- `next`, `react`, `styled-components`
- `@privy-io/react-auth` for login
- `viem` for wallet/chain calls

### File map of the new UX

- `app/layout.tsx`, `app/providers.tsx` – root layout and Privy provider
- `components/Topbar.tsx`, `components/Footer.tsx`
- `app/dashboard/environments/page.tsx` – Explore page
- `app/dashboard/environments/[owner]/[slug]/page.tsx` – Environment details
- `app/dashboard/environments/new/page.tsx` – Create Environment (on-chain registration)
- `app/homepage/page.tsx` – Optional landing
- `lib/environments.ts` – mock data for featured cards
- `middleware.ts` – normalizes legacy paths (`/` and `/environments/*`) to `/dashboard/environments/*`

After setting your App ID and installing dependencies, run `yarn dev` and navigate to `/dashboard/environments`.

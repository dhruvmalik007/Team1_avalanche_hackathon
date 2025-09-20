# Getting Started with Core web3-react connector

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

We then installed `@avalabs/avalanche-connector`. After that you can open `src -> context -> web3Connection.context.tsx`

This is meant to be the simplest example as possible and thus only deals with connecting dApps to the Core extension.

## Connect to Core Button

You can open `src -> pages -> connect.tsx` to see a VERY rudementary version of the checking for Core connector.

## Available Scripts

In the project directory, you can run:

### `yarn start`

Runs the app in the development mode.\
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

### Environment variables

Create `.env.local` in this package directory with your Privy App ID from https://dashboard.privy.io

```
REACT_APP_PRIVY_APP_ID=your-privy-app-id
```

An example file is provided at `.env.local.example`.

### Dependencies to install

```
yarn add react-router-dom @privy-io/react-auth
```

### File map of the new UX

- `src/index.tsx` – wraps the app with `PrivyProvider` and `BrowserRouter`.
- `src/components/Layout.tsx` – top bar with Sign In and Create Environment.
- `src/components/ProtectedRoute.tsx` – simple route guard that auto-opens Privy.
- `src/pages/EnvironmentsHub.tsx` – Hub page UI with filters and featured grid.
- `src/pages/EnvironmentDetails.tsx` – Detail page with files/tabs and sidebar.
- `src/pages/NewEnvironment.tsx` – Create Environment form (placeholder).
- `src/data/environments.ts` – mock data for featured cards.

After setting your App ID and installing dependencies, run `yarn start` and navigate to `/dashboard/environments`.

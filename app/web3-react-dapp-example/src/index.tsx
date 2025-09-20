import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { Web3ConnectionContextProvider } from './context/web3Connection.context';
import { PrivyProvider } from '@privy-io/react-auth';
import { BrowserRouter } from 'react-router-dom';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <PrivyProvider
      appId={process.env.REACT_APP_PRIVY_APP_ID as string}
      config={{
        loginMethods: ['wallet', 'email', 'google', 'github'],
        appearance: {
          theme: 'dark',
          accentColor: '#7C3AED',
        },
        embeddedWallets: {
          ethereum: {
            createOnLogin: 'users-without-wallets',
          },
        },
      }}
    >
      <Web3ConnectionContextProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </Web3ConnectionContextProvider>
    </PrivyProvider>
  </React.StrictMode>
);

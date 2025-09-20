import React from 'react';
import styled from 'styled-components';
import { useNavigate, Link } from 'react-router-dom';
import { usePrivy, useWallets } from '@privy-io/react-auth';

const Shell = styled.div`
  display: flex;
  min-height: 100vh;
  background: #0a0a0b;
  color: #fff;
`;

const Sidebar = styled.aside`
  width: 240px;
  border-right: 1px solid rgba(255, 255, 255, 0.06);
  padding: 16px 12px;
  display: none; /* keep minimal for now */

  @media (min-width: 1200px) {
    display: block;
  }
`;

const Main = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const Topbar = styled.header`
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  position: sticky;
  top: 0;
  background: rgba(10, 10, 11, 0.85);
  backdrop-filter: blur(8px);
  z-index: 10;
`;

const Title = styled(Link)`
  color: #fff;
  text-decoration: none;
  font-weight: 700;
  letter-spacing: 0.5px;
`;

const Right = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
`;

const Button = styled.button`
  height: 36px;
  padding: 0 14px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: #151517;
  color: #fff;
  font-weight: 600;
  cursor: pointer;

  &:hover {
    background: #1b1b1e;
  }
`;

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const { login, authenticated, logout, ready } = usePrivy();
  const { wallets } = useWallets();
  const primaryAddress = wallets[0]?.address;

  const onCreateClick = async () => {
    if (!ready) return;
    // Route first; the target is protected and will display login gate if needed
    navigate('/dashboard/environments/new');
  };

  return (
    <Shell>
      <Sidebar>{/* optional sidebar items */}</Sidebar>
      <Main>
        <Topbar>
          <Title to="/dashboard/environments">Environments Hub</Title>
          <Right>
            {authenticated ? (
              <>
                <span style={{ opacity: 0.8, fontSize: 14 }}>
                  {primaryAddress
                    ? `${primaryAddress.slice(0, 6)}...${primaryAddress.slice(-4)}`
                    : 'Signed in'}
                </span>
                <Button onClick={() => logout()}>Logout</Button>
              </>
            ) : (
              <Button onClick={() => login()}>Sign In</Button>
            )}
            <Button style={{ background: '#6d28d9' }} onClick={onCreateClick}>
              Create Environment
            </Button>
          </Right>
        </Topbar>
        {children}
      </Main>
    </Shell>
  );
};

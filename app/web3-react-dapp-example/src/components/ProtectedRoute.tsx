import React from 'react';
import styled from 'styled-components';
import { usePrivy } from '@privy-io/react-auth';

const Gate = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 60px);
`;

const Card = styled.div`
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: #141417;
  border-radius: 12px;
  padding: 24px;
  width: 100%;
  max-width: 560px;
  text-align: center;
`;

const Button = styled.button`
  margin-top: 16px;
  height: 40px;
  padding: 0 14px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: #6d28d9;
  color: #fff;
  font-weight: 700;
  cursor: pointer;
`;

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { authenticated, ready, login } = usePrivy();
  const [attempted, setAttempted] = React.useState(false);

  React.useEffect(() => {
    if (ready && !authenticated && !attempted) {
      setAttempted(true);
      login();
    }
  }, [ready, authenticated, attempted, login]);

  if (!ready) return null;

  if (!authenticated) {
    return (
      <Gate>
        <Card>
          <h2>Sign in required</h2>
          <p style={{ opacity: 0.8 }}>
            Please sign in with Privy (wallet or OAuth) to continue.
          </p>
          <Button onClick={() => login()}>Sign in with Privy</Button>
        </Card>
      </Gate>
    );
  }

  return <>{children}</>;
};

import React from 'react';
import styled from 'styled-components';
import { usePrivy, useWallets } from '@privy-io/react-auth';

const Container = styled.div`
  padding: 20px 16px 40px;
  max-width: 960px;
  width: 100%;
  margin: 0 auto;
`;

const Card = styled.div`
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: #141417;
  border-radius: 12px;
  padding: 16px;
`;

const Row = styled.div`
  display: grid;
  grid-template-columns: 200px 1fr;
  gap: 16px;
  align-items: center;
  & + & {
    margin-top: 12px;
  }

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const Input = styled.input`
  height: 40px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: #0f0f10;
  color: #fff;
  padding: 0 12px;
`;

const TextArea = styled.textarea`
  min-height: 100px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: #0f0f10;
  color: #fff;
  padding: 8px 12px;
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

export default function NewEnvironment() {
  const { user } = usePrivy();
  const { wallets } = useWallets();
  const primaryAddress = wallets[0]?.address;
  const [name, setName] = React.useState('');
  const [slug, setSlug] = React.useState('');
  const [desc, setDesc] = React.useState('');

  return (
    <Container>
      <h2 style={{ margin: '0 0 12px' }}>Create Environment</h2>
      <p style={{ opacity: 0.85 }}>
        Signed in as <strong>{primaryAddress ?? 'user'}</strong>
      </p>

      <Card>
        <Row>
          <label>Name</label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="My cool env" />
        </Row>
        <Row>
          <label>Slug</label>
          <Input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="owner/slug" />
        </Row>
        <Row>
          <label>Description</label>
          <TextArea value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Short description..." />
        </Row>

        <Button disabled={!name || !slug}>Save draft</Button>
      </Card>
    </Container>
  );
}

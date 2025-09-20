import React from 'react';
import styled from 'styled-components';
import { useParams } from 'react-router-dom';
import { featuredEnvironments } from '../data/environments';

const Wrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 20px;
  padding: 20px 16px 40px;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const Panel = styled.div`
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: #141417;
  border-radius: 12px;
`;

const Section = styled(Panel)`
  padding: 16px;
`;

const Heading = styled.h2`
  margin: 0 0 8px;
`;

const Tabs = styled.div`
  display: flex;
  gap: 8px;
  margin: 8px 0 12px;
`;

const Tab = styled.button<{ active?: boolean }>`
  height: 32px;
  padding: 0 10px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: ${({ active }) => (active ? '#1f1f22' : 'transparent')};
  color: #fff;
  cursor: pointer;
  font-weight: 600;
`;

const FileList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const FileItem = styled.li`
  display: flex;
  justify-content: space-between;
  padding: 10px 8px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  background: #101014;
  & + & {
    margin-top: 8px;
  }
`;

const Sidebar = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const Tag = styled.span`
  font-size: 12px;
  padding: 6px 8px;
  border-radius: 8px;
  background: #131316;
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: #bfbfd6;
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 12px;
`;

const Button = styled.button`
  height: 36px;
  padding: 0 12px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: #6d28d9;
  color: #fff;
  font-weight: 700;
  cursor: pointer;
`;

export default function EnvironmentDetails() {
  const { owner, slug } = useParams<{ owner: string; slug: string }>();
  const env =
    featuredEnvironments.find(
      (e) => e.owner === owner && e.slug === slug
    ) || {
      owner: owner || 'unknown',
      slug: slug || 'unknown',
      name: slug || 'unknown',
      description: 'An environment description.',
      stars: 0,
      tags: ['tag'],
      version: '0.1.0',
      updatedAt: new Date().toISOString(),
    };

  return (
    <Wrapper>
      <div>
        <Section>
          <Heading>{env.name}</Heading>
          <Tabs>
            <Tab active>Code</Tab>
            <Tab>Evals</Tab>
            <Tab>Discussions</Tab>
          </Tabs>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ opacity: 0.8 }}>Version</span>
            <select
              style={{
                height: 32,
                borderRadius: 8,
                background: '#0f0f10',
                border: '1px solid rgba(255,255,255,0.12)',
                color: '#fff',
                padding: '0 8px',
              }}
              defaultValue={env.version}
            >
              <option>{env.version}</option>
              <option>0.1.3</option>
              <option>0.1.2</option>
            </select>
          </div>

          <div style={{ height: 12 }} />

          <FileList>
            <FileItem>
              <span>outputs/</span>
              <span style={{ opacity: 0.7 }}>folder</span>
            </FileItem>
            <FileItem>
              <span>pyproject.toml</span>
              <span style={{ opacity: 0.7 }}>385 B</span>
            </FileItem>
            <FileItem>
              <span>README.md</span>
              <span style={{ opacity: 0.7 }}>1.6 KB</span>
            </FileItem>
            <FileItem>
              <span>{env.slug}.py</span>
              <span style={{ opacity: 0.7 }}>2.6 KB</span>
            </FileItem>
          </FileList>

          <div style={{ height: 16 }} />
          <h3 style={{ margin: '8px 0 6px' }}>{env.name}</h3>
          <p style={{ opacity: 0.9 }}>{env.description}</p>
        </Section>
      </div>

      <Sidebar>
        <Section>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div>
              <div style={{ opacity: 0.6, fontSize: 12 }}>Author</div>
              <div>@{env.owner}</div>
            </div>
            <div>
              <div style={{ opacity: 0.6, fontSize: 12 }}>Stars</div>
              <div>★ {env.stars}</div>
            </div>
          </div>

          <div style={{ height: 8 }} />
          <div style={{ opacity: 0.6, fontSize: 12 }}>Tags</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
            {env.tags.map((t) => (
              <Tag key={t}>{t}</Tag>
            ))}
          </div>

          <ButtonRow>
            <Button>Train with Environment</Button>
            <Button style={{ background: '#3b82f6' }}>Install Environment</Button>
          </ButtonRow>
        </Section>

        <Section>
          <div style={{ opacity: 0.6, fontSize: 12 }}>Last Modified</div>
          <div>{new Date(env.updatedAt).toDateString()}</div>

          <div style={{ height: 8 }} />
          <div style={{ opacity: 0.6, fontSize: 12 }}>Python Required</div>
          <div>{'>=3.8'}</div>

          <div style={{ height: 8 }} />
          <div style={{ opacity: 0.6, fontSize: 12 }}>Dependencies</div>
          <div>verifiers, nltk, textarena</div>
        </Section>
      </Sidebar>
    </Wrapper>
  );
}

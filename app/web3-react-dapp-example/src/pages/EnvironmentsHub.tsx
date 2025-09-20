import React from 'react';
import styled from 'styled-components';
import { featuredEnvironments } from '../data/environments';
import { useNavigate } from 'react-router-dom';

const Container = styled.div`
  padding: 20px 16px 40px;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
`;

const Tabs = styled.div`
  display: flex;
  gap: 12px;
`;

const Tab = styled.button<{ active?: boolean }>`
  height: 36px;
  padding: 0 12px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: ${({ active }) => (active ? '#1f1f22' : 'transparent')};
  color: #fff;
  cursor: pointer;
  font-weight: 600;
`;

const FilterBar = styled.div`
  display: flex;
  gap: 12px;
  margin: 16px 0 8px;
`;

const Input = styled.input`
  flex: 1;
  height: 40px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: #0f0f10;
  color: #fff;
  padding: 0 12px;
`;

const Select = styled.select`
  height: 40px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: #0f0f10;
  color: #fff;
  padding: 0 12px;
`;

const Tags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 8px 0 16px;
`;

const Tag = styled.span`
  font-size: 12px;
  padding: 6px 8px;
  border-radius: 8px;
  background: #131316;
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: #bfbfd6;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 16px;
`;

const Card = styled.button`
  background: #141417;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 14px;
  padding: 16px;
  text-align: left;
  color: #fff;
  cursor: pointer;

  &:hover {
    transform: translateY(-1px);
    background: #19191d;
  }
`;

const CardTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 700;
  margin-bottom: 8px;
`;

const Subtle = styled.div`
  color: #bfbfd6;
  font-size: 13px;
`;

const Footer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 16px;
  color: #bfbfd6;
  font-size: 12px;
`;

export default function EnvironmentsHub() {
  const navigate = useNavigate();
  const [query, setQuery] = React.useState('');

  const filtered = featuredEnvironments.filter(
    (e) =>
      e.name.toLowerCase().includes(query.toLowerCase()) ||
      e.description.toLowerCase().includes(query.toLowerCase()) ||
      e.tags.some((t) => t.toLowerCase().includes(query.toLowerCase()))
  );

  return (
    <Container>
      <Header>
        <Tabs>
          <Tab active>Explore</Tab>
          <Tab>My Stars</Tab>
          <Tab>Environments</Tab>
        </Tabs>
      </Header>

      <FilterBar>
        <Select defaultValue="most_stars">
          <option value="most_stars">Most stars</option>
          <option value="recent">Recently updated</option>
          <option value="name">Name</option>
        </Select>
        <Input
          placeholder="Search by name, author, description, tags..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </FilterBar>

      <Tags>
        {['eval', 'train', 'single-turn', 'multi-turn', 'math', 'tool-use', 'game'].map(
          (t) => (
            <Tag key={t}>{t}</Tag>
          )
        )}
      </Tags>

      <h3 style={{ margin: '8px 0 12px' }}>Featured</h3>

      <Grid>
        {filtered.map((env) => (
          <Card
            key={`${env.owner}/${env.slug}`}
            onClick={() => navigate(`/dashboard/environments/${env.owner}/${env.slug}`)}
          >
            <CardTitle>
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 999,
                  background: '#6d28d9',
                }}
              />
              {env.name}
            </CardTitle>
            <Subtle>{env.description}</Subtle>

            <Tags style={{ marginTop: 12 }}>
              {env.tags.slice(0, 3).map((t) => (
                <Tag key={t}>{t}</Tag>
              ))}
            </Tags>
            <Footer>
              <span>Version {env.version}</span>
              <span>★ {env.stars}</span>
            </Footer>
          </Card>
        ))}
      </Grid>
    </Container>
  );
}

export type Environment = {
  owner: string;
  slug: string;
  name: string;
  description: string;
  tags: string[];
  stars: number;
  version: string;
  updatedAt: string;
  costPerRunUSD?: number;
};

export const environments: Environment[] = [
  {
    owner: 'openai',
    slug: 'math-gym',
    name: 'Math Gym',
    description: 'Single-turn numerical reasoning tasks for LLMs.',
    tags: ['math', 'single-turn', 'eval'],
    stars: 431,
    version: '1.2.0',
    updatedAt: '2025-09-01T10:00:00Z',
    costPerRunUSD: 0.05,
  },
  {
    owner: 'vercel',
    slug: 'tool-arena',
    name: 'Tool Arena',
    description: 'Multi-tool use benchmarks and datasets.',
    tags: ['tool-use', 'multi-turn', 'eval'],
    stars: 288,
    version: '0.7.3',
    updatedAt: '2025-08-28T18:00:00Z',
    costPerRunUSD: 0.12,
  },
  {
    owner: 'avalabs',
    slug: 'avalanche-sim',
    name: 'Avalanche Sim',
    description: 'Blockchain tx simulation & analysis tasks.',
    tags: ['blockchain', 'simulation', 'train'],
    stars: 132,
    version: '0.3.1',
    updatedAt: '2025-08-16T12:00:00Z',
    costPerRunUSD: 0.19,
  }
];

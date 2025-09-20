export type Environment = {
  owner: string;
  slug: string;
  name: string;
  description: string;
  stars: number;
  tags: string[];
  version: string;
  updatedAt: string; // ISO date
};

export const featuredEnvironments: Environment[] = [
  {
    owner: 'will',
    slug: 'wordle',
    name: 'wordle',
    description:
      'Multi-turn Wordle game environment with thinking and partial credit.',
    stars: 26,
    tags: ['game', 'eval', 'multi-turn'],
    version: '0.1.4',
    updatedAt: new Date(Date.now() - 27 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    owner: 'hud',
    slug: 'hud-text-2048',
    name: 'hud-text-2048',
    description:
      'Text-based 2048 game for training agents to reach target tiles.',
    stars: 19,
    tags: ['game', 'text'],
    version: '0.1.0',
    updatedAt: new Date(Date.now() - 23 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    owner: 'daniel',
    slug: 'deepcoder',
    name: 'deepcoder',
    description:
      'DeepCoder environment for coding problems with executable tasks.',
    stars: 13,
    tags: ['coding', 'sandbox'],
    version: '0.1.8',
    updatedAt: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

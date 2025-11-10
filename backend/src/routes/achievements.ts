import { Router, Request, Response } from 'express';

const router = Router();

// Sample achievement data
const achievements = [
  {
    id: 1,
    title: 'National Robotics Competition 2024',
    description: 'First place in national robotics competition',
    year: '2024',
    category: 'Competition',
    image: '/images/achievement1.jpg',
    award: 'Gold Medal'
  },
  {
    id: 2,
    title: 'Best Innovation Award',
    description: 'Recognized for innovative IoT project',
    year: '2023',
    category: 'Award',
    image: '/images/achievement2.jpg',
    award: 'Certificate'
  }
];

router.get('/', (req: Request, res: Response) => {
  res.json(achievements);
});

router.get('/:id', (req: Request, res: Response) => {
  const achievement = achievements.find(a => a.id === parseInt(req.params.id));
  if (achievement) {
    res.json(achievement);
  } else {
    res.status(404).json({ message: 'Achievement not found' });
  }
});

export default router;

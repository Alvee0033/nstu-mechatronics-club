import { Router, Request, Response } from 'express';

const router = Router();

// Sample project data
const projects = [
  {
    id: 1,
    title: 'Line Following Robot',
    description: 'Autonomous line following robot with obstacle detection',
    category: 'Robotics',
    image: '/images/project1.jpg',
    technologies: ['Arduino', 'C++', 'Sensors'],
    github: 'https://github.com'
  },
  {
    id: 2,
    title: 'Smart Home Automation',
    description: 'IoT-based home automation system',
    category: 'IoT',
    image: '/images/project2.jpg',
    technologies: ['Raspberry Pi', 'Python', 'Node.js'],
    github: 'https://github.com'
  }
];

router.get('/', (req: Request, res: Response) => {
  res.json(projects);
});

router.get('/:id', (req: Request, res: Response) => {
  const project = projects.find(p => p.id === parseInt(req.params.id));
  if (project) {
    res.json(project);
  } else {
    res.status(404).json({ message: 'Project not found' });
  }
});

export default router;

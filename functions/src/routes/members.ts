import { Router, Request, Response } from 'express';

const router = Router();

// Sample member data
const members = [
  {
    id: 1,
    name: 'John Doe',
    role: 'President',
    department: 'Mechatronics Engineering',
    image: '/images/member1.jpg',
    social: {
      linkedin: 'https://linkedin.com',
      github: 'https://github.com'
    }
  },
  {
    id: 2,
    name: 'Jane Smith',
    role: 'Vice President',
    department: 'Mechatronics Engineering',
    image: '/images/member2.jpg',
    social: {
      linkedin: 'https://linkedin.com',
      github: 'https://github.com'
    }
  }
];

router.get('/', (req: Request, res: Response) => {
  res.json(members);
});

router.get('/:id', (req: Request, res: Response) => {
  const member = members.find(m => m.id === parseInt(req.params.id));
  if (member) {
    res.json(member);
  } else {
    res.status(404).json({ message: 'Member not found' });
  }
});

export default router;

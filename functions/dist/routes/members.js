"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
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
router.get('/', (req, res) => {
    res.json(members);
});
router.get('/:id', (req, res) => {
    const member = members.find(m => m.id === parseInt(req.params.id));
    if (member) {
        res.json(member);
    }
    else {
        res.status(404).json({ message: 'Member not found' });
    }
});
exports.default = router;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
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
router.get('/', (req, res) => {
    res.json(achievements);
});
router.get('/:id', (req, res) => {
    const achievement = achievements.find(a => a.id === parseInt(req.params.id));
    if (achievement) {
        res.json(achievement);
    }
    else {
        res.status(404).json({ message: 'Achievement not found' });
    }
});
exports.default = router;

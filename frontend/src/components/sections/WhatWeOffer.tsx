'use client';

import { motion } from 'framer-motion';
import { Cpu, Lightbulb, Users, Wrench } from 'lucide-react';
import GradientCard from '@/components/ui/GradientCard';

const features = [
  {
    icon: <Cpu size={40} />,
    title: 'Robotics',
    description: 'Build and program advanced robotic systems'
  },
  {
    icon: <Lightbulb size={40} />,
    title: 'Innovation',
    description: 'Create cutting-edge technology solutions'
  },
  {
    icon: <Users size={40} />,
    title: 'Community',
    description: 'Collaborate with passionate engineers'
  },
  {
    icon: <Wrench size={40} />,
    title: 'Hands-On',
    description: 'Practical experience with real projects'
  }
];

export default function WhatWeOffer() {
  return (
    <section className="py-12 md:py-20 px-4 relative overflow-hidden">
      {/* Background accent */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-900/5 to-transparent pointer-events-none" />

      <div className="container mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12 md:mb-16 px-4"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3 md:mb-4">
            <span className="bg-gradient-to-r from-white via-cyan-200 to-white bg-clip-text text-transparent">
              What We Offer
            </span>
          </h2>
          <p className="text-gray-400 text-base md:text-lg max-w-2xl mx-auto px-2">
            Empowering the next generation of engineers with cutting-edge knowledge and hands-on experience
          </p>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                delay: index * 0.1,
                type: "spring",
                stiffness: 100
              }}
              whileHover={{ y: -10 }}
              className="group"
            >
              <GradientCard className="relative overflow-hidden h-full">
                {/* Hover gradient effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/0 via-cyan-500/5 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                {/* Animated border glow */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{
                    boxShadow: 'inset 0 0 30px rgba(34, 211, 238, 0.1)'
                  }}
                />

                {/* Content */}
                <div className="relative z-10">
                  <motion.div
                    className="text-cyan-400 mb-4 text-4xl"
                    whileHover={{ scale: 1.2, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    {feature.icon}
                  </motion.div>
                  <h3 className="text-xl font-bold text-white mb-3 group-hover:text-cyan-300 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400 group-hover:text-gray-300 transition-colors leading-relaxed">
                    {feature.description}
                  </p>
                </div>

                {/* Corner accent */}
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-cyan-500/10 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </GradientCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
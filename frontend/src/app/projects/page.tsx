'use client';

import { motion } from 'framer-motion';
import GradientCard from '@/components/ui/GradientCard';
import LazyImage from '@/components/ui/LazyImage';
import { Github, ExternalLink } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getProjects, Project as FirestoreProject } from '@/lib/firestore';

interface Project {
  id: string;
  title: string;
  description: string;
  category: string;
  image: string;
  technologies: string[];
  github: string;
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const firestoreProjects = await getProjects();
        
        const formattedProjects: Project[] = firestoreProjects.map((project: FirestoreProject) => ({
          id: project.id || `project-${Date.now()}-${Math.random()}`,
          title: project.title,
          description: project.description,
          category: project.status || 'Ongoing', // Map status to category
          image: project.image || '/images/project-placeholder.jpg',
          technologies: project.technologies || [],
          github: project.githubUrl || 'https://github.com'
        }));

        setProjects(formattedProjects);
      } catch (error) {
        console.error('Error fetching projects:', error);
        // Fallback to hardcoded projects if Firestore fails
        setProjects([
          {
            id: '1',
            title: 'Line Following Robot',
            description: 'Autonomous line following robot with obstacle detection and avoidance capabilities using advanced sensor fusion',
            category: 'Robotics',
            image: '/images/project1.jpg',
            technologies: ['Arduino', 'C++', 'IR Sensors', 'Ultrasonic'],
            github: 'https://github.com'
          },
          {
            id: '2',
            title: 'Smart Home Automation',
            description: 'IoT-based home automation system with mobile app control and voice assistant integration',
            category: 'IoT',
            image: '/images/project2.jpg',
            technologies: ['Raspberry Pi', 'Python', 'Node.js', 'React Native'],
            github: 'https://github.com'
          },
          {
            id: '3',
            title: 'Gesture Controlled Arm',
            description: 'Robotic arm controlled by hand gestures using computer vision and machine learning',
            category: 'AI & Robotics',
            image: '/images/project3.jpg',
            technologies: ['Python', 'OpenCV', 'TensorFlow', 'Arduino'],
            github: 'https://github.com'
          },
          {
            id: '4',
            title: 'Solar Tracker System',
            description: 'Dual-axis solar tracker for maximum energy efficiency using LDR sensors and servo motors',
            category: 'Renewable Energy',
            image: '/images/project4.jpg',
            technologies: ['Arduino', 'C++', 'Servo Motors', 'LDR Sensors'],
            github: 'https://github.com'
          },
          {
            id: '5',
            title: 'Drone Navigation System',
            description: 'Autonomous drone with GPS navigation and obstacle avoidance for search and rescue operations',
            category: 'Aerospace',
            image: '/images/project5.jpg',
            technologies: ['Pixhawk', 'MAVLink', 'Python', 'Computer Vision'],
            github: 'https://github.com'
          },
          {
            id: '6',
            title: 'Industrial PLC System',
            description: 'Programmable Logic Controller system for automated manufacturing processes',
            category: 'Automation',
            image: '/images/project6.jpg',
            technologies: ['Ladder Logic', 'SCADA', 'HMI', 'PLC'],
            github: 'https://github.com'
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
            Our Projects
          </h1>
          <p className="text-white/60 text-lg max-w-2xl mx-auto">
            Explore the innovative projects created by our talented members
          </p>
        </motion.div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-white/60 text-lg">No projects found. Add some from the admin dashboard!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <GradientCard className="h-full">
                <div className="flex flex-col h-full">
                  {project.image && project.image.startsWith('data:') ? (
                    <LazyImage
                      src={project.image}
                      alt={project.title}
                      className="w-full h-48 object-cover rounded-lg mb-4"
                      placeholder={
                        <div className="h-48 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg mb-4 flex items-center justify-center">
                          <div className="text-6xl">🤖</div>
                        </div>
                      }
                    />
                  ) : (
                    <div className="h-48 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg mb-4 flex items-center justify-center">
                      <div className="text-6xl">🤖</div>
                    </div>
                  )}
                  <span className="inline-block px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-sm font-semibold mb-3 w-fit">
                    {project.category}
                  </span>
                  <h3 className="text-xl font-bold text-white mb-2">{project.title}</h3>
                  <p className="text-white/60 mb-4 flex-grow">{project.description}</p>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {project.technologies.map((tech, i) => (
                      <span 
                        key={i}
                        className="px-2 py-1 bg-white/5 text-white/70 rounded text-xs"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>

                  <div className="flex space-x-3">
                    <motion.a
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      href={project.github}
                      className="flex-1 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold flex items-center justify-center space-x-2"
                    >
                      <Github size={18} />
                      <span>View Code</span>
                    </motion.a>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="p-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
                    >
                      <ExternalLink size={18} />
                    </motion.button>
                  </div>
                </div>
              </GradientCard>
            </motion.div>
          ))}
          </div>
        )}
      </div>
    </div>
  );
}

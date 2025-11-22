'use client';

import { motion } from 'framer-motion';
import LazyImage from '@/components/ui/LazyImage';
import { Github, ExternalLink, Cpu, Terminal } from 'lucide-react';
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
    <div className="min-h-screen pt-32 pb-12 px-4 relative">
      {/* Background Grid */}
      <div className="absolute inset-0 z-0 pointer-events-none bg-[linear-gradient(to_right,#00f3ff05_1px,transparent_1px),linear-gradient(to_bottom,#00f3ff05_1px,transparent_1px)] bg-[size:40px_40px]" />

      <div className="container mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center gap-2 mb-4 text-neon-cyan tracking-[0.5em] text-sm font-mono">
            <Terminal className="w-4 h-4" /> PROJECT_DATABASE
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 font-display text-white tracking-tight">
            SYSTEM <span className="text-neon-cyan">BLUEPRINTS</span>
          </h1>
          <p className="text-cyan-100/60 text-lg max-w-2xl mx-auto font-sans">
            Access classified engineering projects and prototypes developed by our operatives.
          </p>
        </motion.div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block w-12 h-12 border-4 border-neon-cyan border-t-transparent rounded-full animate-spin shadow-[0_0_20px_rgba(0,243,255,0.5)]" />
            <p className="mt-4 text-neon-cyan font-mono text-sm animate-pulse">LOADING_DATA...</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-white/60 text-lg font-mono">NO_DATA_FOUND. INITIATE_UPLOAD_SEQUENCE.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="holo-card h-full flex flex-col group">
                  {project.image && project.image.startsWith('data:') ? (
                    <LazyImage
                      src={project.image}
                      alt={project.title}
                      className="w-full h-48 object-cover mb-4 border-b border-white/10"
                      placeholder={
                        <div className="h-48 bg-black/50 mb-4 flex items-center justify-center border-b border-white/10">
                          <Cpu className="w-16 h-16 text-neon-cyan animate-pulse" />
                        </div>
                      }
                    />
                  ) : (
                    <div className="h-48 bg-black/50 mb-4 flex items-center justify-center border-b border-white/10 relative overflow-hidden">
                      <div className="absolute inset-0 bg-neon-cyan/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <Cpu className="w-16 h-16 text-neon-cyan/50 group-hover:text-neon-cyan transition-all duration-500 group-hover:scale-110 drop-shadow-[0_0_10px_rgba(0,243,255,0.5)]" />
                    </div>
                  )}

                  <div className="p-6 flex flex-col flex-grow">
                    <span className="inline-block px-3 py-1 bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan text-xs font-mono uppercase tracking-wider w-fit mb-4">
                      {project.category}
                    </span>

                    <h3 className="text-2xl font-bold text-white mb-3 font-display group-hover:text-neon-cyan transition-colors">
                      {project.title}
                    </h3>

                    <p className="text-cyan-100/60 mb-6 flex-grow font-sans text-sm leading-relaxed">
                      {project.description}
                    </p>

                    <div className="flex flex-wrap gap-2 mb-6">
                      {project.technologies.map((tech, i) => (
                        <span
                          key={i}
                          className="px-2 py-1 bg-white/5 border border-white/10 text-cyan-100/50 rounded-none text-[10px] font-mono uppercase"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>

                    <div className="flex space-x-3 mt-auto">
                      <motion.a
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        href={project.github}
                        className="flex-1 py-3 bg-neon-cyan/10 border border-neon-cyan text-neon-cyan hover:bg-neon-cyan hover:text-black transition-all font-bold flex items-center justify-center space-x-2 font-mono text-sm uppercase tracking-wider"
                      >
                        <Github size={16} />
                        <span>Source</span>
                      </motion.a>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="p-3 bg-white/5 border border-white/20 text-white hover:border-neon-cyan hover:text-neon-cyan transition-all"
                      >
                        <ExternalLink size={18} />
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

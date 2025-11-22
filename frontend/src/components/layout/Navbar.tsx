'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';

const navItems = [
  { name: 'Home', href: '/' },
  { name: 'Members', href: '/members' },
  { name: 'Events', href: '/events' },
  { name: 'Projects', href: '/projects' },
  { name: 'Achievements', href: '/achievements' },
  { name: 'Doctor Finder', href: '/doctor-finder' },
  { name: 'AI Notebook', href: '/notebook' },
];

export default function Navbar() {
  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 bg-black/30 backdrop-blur-md border-b border-cyan-500/20"
    >
      <div className="w-full px-6 lg:px-12">
        <div className="flex items-center justify-between h-16 pl-0 pr-4">
          {/* Logo - Bigger and flush left */}
          <Link href="/" className="flex items-center space-x-2 group ml-[-31px] md:ml-[-41px]">
            <motion.div
              whileHover={{ scale: 1.03, rotate: 3 }}
              transition={{ type: "spring", stiffness: 300, damping: 14 }}
              className="w-24 h-24 md:w-20 md:h-20 relative"
            >
              <Image
                src="/logo.png"
                alt="NSTU Mechatronics Club Logo"
                width={96}
                height={96}
                className="object-contain"
              />
            </motion.div>
            <span className="hidden md:block text-white font-semibold text-sm bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent group-hover:from-cyan-300 group-hover:to-blue-300 transition-all duration-300">
              NSTU Mechatronics Club
            </span>
          </Link>

          {/* Desktop Navigation - Minimal Text Buttons */}
          <div className="hidden md:flex items-center space-x-1 ml-auto justify-end">
            {navItems.map((item, index) => (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link
                  href={item.href}
                  className="relative px-4 py-2 text-gray-300 hover:text-cyan-400 transition-all duration-300 group"
                >
                  <span className="relative z-10 text-sm">{item.name}</span>
                  {/* Animated underline */}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-cyan-400 to-blue-400 group-hover:w-full transition-all duration-300" />
                  {/* Hover background */}
                  <span className="absolute inset-0 bg-cyan-400/0 group-hover:bg-cyan-400/10 rounded-lg transition-all duration-300" />
                </Link>
              </motion.div>
            ))}
            
            {/* Join removed per request */}
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden absolute right-0 top-1/2 transform -translate-y-1/2 flex items-center gap-1 overflow-x-auto scrollbar-hide px-2 ml-auto justify-end max-w-[calc(100vw-120px)]">
            {navItems.map((item, index) => (
              <Link
                key={item.name}
                href={item.href}
                className="px-2 py-1.5 text-xs text-gray-200 hover:text-cyan-400 whitespace-nowrap rounded-md transition-colors duration-200 bg-black/20 hover:bg-cyan-400/10"
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </motion.nav>
  );
}

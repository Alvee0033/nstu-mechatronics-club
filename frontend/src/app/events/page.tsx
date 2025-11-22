'use client';

import { motion } from 'framer-motion';
import LazyImage from '@/components/ui/LazyImage';
import { Calendar, MapPin, Clock, Terminal } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getEvents, Event as FirestoreEvent } from '@/lib/firestore';

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  image: string;
  status: 'upcoming' | 'past';
  category?: string;
  organizer?: string;
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const firestoreEvents = await getEvents();
        const now = new Date();

        const formattedEvents: Event[] = firestoreEvents.map((event: FirestoreEvent) => {
          const eventDate = event.date.toDate();
          const status = eventDate > now ? 'upcoming' : 'past';

          return {
            id: event.id || `event-${Date.now()}-${Math.random()}`,
            title: event.title,
            description: event.description,
            date: eventDate.toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            }),
            location: event.location || 'TBA',
            image: event.image || '/images/event-placeholder.jpg',
            status,
            category: event.category,
            organizer: event.organizer
          };
        });

        setEvents(formattedEvents);
      } catch (error) {
        console.error('Error fetching events:', error);
        // Fallback to hardcoded events if Firestore fails
        setEvents([
          {
            id: '1',
            title: 'Robotics Workshop',
            description: 'Learn the basics of robotics and automation',
            date: new Date('2024-01-15').toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            }),
            location: 'NSTU Campus',
            image: '/images/event-placeholder.jpg',
            status: 'past',
            category: 'Workshop'
          },
          {
            id: '2',
            title: 'AI & Machine Learning Seminar',
            description: 'Explore the latest trends in AI and ML',
            date: new Date('2024-02-20').toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            }),
            location: 'NSTU Auditorium',
            image: '/images/event-placeholder.jpg',
            status: 'past',
            category: 'Seminar'
          },
          {
            id: '3',
            title: 'Drone Building Competition',
            description: 'Build and compete with custom drones',
            date: new Date('2024-03-10').toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            }),
            location: 'NSTU Field',
            image: '/images/event-placeholder.jpg',
            status: 'past',
            category: 'Competition'
          },
          {
            id: '4',
            title: 'Industry Visit',
            description: 'Visit local industries to see real-world applications',
            date: new Date('2024-04-05').toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            }),
            location: 'Local Industry',
            image: '/images/event-placeholder.jpg',
            status: 'past',
            category: 'Visit'
          },
          {
            id: '5',
            title: 'Arduino Workshop',
            description: 'Hands-on workshop on Arduino programming and electronics',
            date: new Date('2025-12-15').toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            }),
            location: 'NSTU Lab',
            image: '/images/event-placeholder.jpg',
            status: 'upcoming',
            category: 'Workshop'
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const upcomingEvents = events.filter(e => e.status === 'upcoming');
  const pastEvents = events.filter(e => e.status === 'past');

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
            <Terminal className="w-4 h-4" /> MISSION_LOG
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 font-display text-white tracking-tight">
            CLUB <span className="text-neon-cyan">OPERATIONS</span>
          </h1>
          <p className="text-cyan-100/60 text-lg max-w-2xl mx-auto font-sans">
            Join us for upcoming missions, workshops, and competitions.
          </p>
        </motion.div>

        {/* Upcoming Events */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-white mb-8 font-display border-l-4 border-neon-cyan pl-4">
            Upcoming <span className="text-neon-cyan">Missions</span>
          </h2>
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block w-12 h-12 border-4 border-neon-cyan border-t-transparent rounded-full animate-spin shadow-[0_0_20px_rgba(0,243,255,0.5)]" />
            </div>
          ) : upcomingEvents.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-white/60 text-lg font-mono">NO_UPCOMING_MISSIONS. STANDBY.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {upcomingEvents.map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="holo-card h-full flex flex-col group">
                    {event.image && event.image.startsWith('data:') ? (
                      <LazyImage
                        src={event.image}
                        alt={event.title}
                        className="w-full h-48 object-cover mb-4 border-b border-white/10"
                        placeholder={
                          <div className="h-48 bg-black/50 mb-4 flex items-center justify-center border-b border-white/10">
                            <Calendar size={48} className="text-neon-cyan animate-pulse" />
                          </div>
                        }
                      />
                    ) : (
                      <div className="h-48 bg-black/50 mb-4 flex items-center justify-center border-b border-white/10 relative overflow-hidden">
                        <div className="absolute inset-0 bg-neon-cyan/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <Calendar size={64} className="text-neon-cyan/50 group-hover:text-neon-cyan transition-all duration-500 group-hover:scale-110 drop-shadow-[0_0_10px_rgba(0,243,255,0.5)]" />
                      </div>
                    )}

                    <div className="p-6 flex flex-col flex-grow">
                      <h3 className="text-2xl font-bold text-white mb-3 font-display group-hover:text-neon-cyan transition-colors">
                        {event.title}
                      </h3>
                      <p className="text-cyan-100/60 mb-6 flex-grow font-sans text-sm leading-relaxed">
                        {event.description}
                      </p>

                      <div className="space-y-3 text-sm font-mono border-t border-white/10 pt-4 mb-6">
                        <div className="flex items-center text-neon-cyan">
                          <Clock size={16} className="mr-3" />
                          {event.date}
                        </div>
                        <div className="flex items-center text-neon-green">
                          <MapPin size={16} className="mr-3" />
                          {event.location}
                        </div>
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="mt-auto w-full py-3 bg-neon-cyan text-black font-bold font-mono uppercase tracking-wider hover:bg-white transition-colors clip-path-polygon"
                        style={{ clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)' }}
                      >
                        Engage
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Past Events */}
        <div>
          <h2 className="text-3xl font-bold text-white mb-8 font-display border-l-4 border-white/20 pl-4">
            Mission <span className="text-white/50">Archive</span>
          </h2>
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block w-12 h-12 border-4 border-neon-cyan/30 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : pastEvents.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-white/60 text-lg font-mono">ARCHIVE_EMPTY.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {pastEvents.map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="holo-card h-full flex flex-col group opacity-75 hover:opacity-100 transition-opacity">
                    <div className="h-48 bg-black/50 mb-4 flex items-center justify-center border-b border-white/10 relative overflow-hidden grayscale group-hover:grayscale-0 transition-all">
                      <Calendar size={64} className="text-white/20 group-hover:text-neon-cyan/50 transition-colors" />
                    </div>

                    <div className="p-6 flex flex-col flex-grow">
                      <h3 className="text-xl font-bold text-white/80 mb-2 font-display group-hover:text-white transition-colors">
                        {event.title}
                      </h3>
                      <p className="text-white/40 mb-4 flex-grow font-sans text-sm">
                        {event.description}
                      </p>

                      <div className="space-y-2 text-xs font-mono text-white/30">
                        <div className="flex items-center">
                          <Clock size={14} className="mr-2" />
                          {event.date}
                        </div>
                        <div className="flex items-center">
                          <MapPin size={14} className="mr-2" />
                          {event.location}
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-white/5 text-xs font-mono text-neon-cyan uppercase tracking-widest text-center">
                        MISSION_COMPLETE
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

'use client';

import { motion } from 'framer-motion';
import GradientCard from '@/components/ui/GradientCard';
import LazyImage from '@/components/ui/LazyImage';
import { Calendar, MapPin, Clock } from 'lucide-react';
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
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('all');

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
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
            Events
          </h1>
          <p className="text-white/60 text-lg max-w-2xl mx-auto">
            Join us for exciting workshops, competitions, and learning opportunities
          </p>
        </motion.div>

        {/* Upcoming Events */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-8">Upcoming Events</h2>
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : upcomingEvents.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-white/60 text-lg">No upcoming events at the moment. Check back soon!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingEvents.map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <GradientCard className="h-full">
                    <div className="flex flex-col h-full">
                      {event.image && event.image.startsWith('data:') ? (
                        <LazyImage
                          src={event.image}
                          alt={event.title}
                          className="w-full h-48 object-cover rounded-lg mb-4"
                          placeholder={
                            <div className="h-48 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg mb-4 flex items-center justify-center">
                              <Calendar size={48} className="text-white/30" />
                            </div>
                          }
                        />
                      ) : (
                        <div className="h-48 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg mb-4 flex items-center justify-center">
                          <Calendar size={64} className="text-white/30" />
                        </div>
                      )}
                      <h3 className="text-xl font-bold text-white mb-2">{event.title}</h3>
                      <p className="text-white/60 mb-4 flex-grow">{event.description}</p>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center text-purple-400">
                          <Clock size={16} className="mr-2" />
                          {event.date}
                        </div>
                        <div className="flex items-center text-pink-400">
                          <MapPin size={16} className="mr-2" />
                          {event.location}
                        </div>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="mt-4 w-full py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold"
                      >
                        Register Now
                      </motion.button>
                    </div>
                  </GradientCard>
                </motion.div>
              ))}
            </div>
          )}
        </div>
        <div>
          <h2 className="text-3xl font-bold text-white mb-8">Past Events</h2>
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : pastEvents.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-white/60 text-lg">No past events to show yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pastEvents.map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <GradientCard className="h-full opacity-75">
                    <div className="flex flex-col h-full">
                      {event.image && event.image.startsWith('data:') ? (
                        <LazyImage
                          src={event.image}
                          alt={event.title}
                          className="w-full h-48 object-cover rounded-lg mb-4 opacity-75"
                          placeholder={
                            <div className="h-48 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-lg mb-4 flex items-center justify-center">
                              <Calendar size={48} className="text-white/30" />
                            </div>
                          }
                        />
                      ) : (
                        <div className="h-48 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-lg mb-4 flex items-center justify-center">
                          <Calendar size={64} className="text-white/30" />
                        </div>
                      )}
                      <h3 className="text-xl font-bold text-white mb-2">{event.title}</h3>
                      <p className="text-white/60 mb-4 flex-grow">{event.description}</p>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center text-blue-400">
                          <Clock size={16} className="mr-2" />
                          {event.date}
                        </div>
                        <div className="flex items-center text-cyan-400">
                          <MapPin size={16} className="mr-2" />
                          {event.location}
                        </div>
                      </div>
                    </div>
                  </GradientCard>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

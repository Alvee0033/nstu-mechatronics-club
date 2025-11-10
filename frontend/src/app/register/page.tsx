'use client';

import { motion } from 'framer-motion';
import RegisterForm from '@/components/forms/RegisterForm';
import Link from 'next/link';
import { ArrowLeft, Heart } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getSettings, Settings } from '@/lib/firestore';

export default function RegisterPage() {
  const [settings, setSettings] = useState<Settings>({ applicationsEnabled: true });
  const [loading, setLoading] = useState(false); // Changed to false to show form immediately

  useEffect(() => {
    const loadSettings = async () => {
      try {
        // Add timeout to prevent hanging
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 3000)
        );
        
        const settingsPromise = getSettings();
        const appSettings = await Promise.race([settingsPromise, timeoutPromise]) as Settings;
        
        setSettings(appSettings);
      } catch (error) {
        console.error('Error loading settings:', error);
        // Keep default settings (applicationsEnabled: true) on error
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  // Don't show loading spinner - show form immediately and update when settings load
  return (
    <div className="min-h-screen pt-20 md:pt-24 pb-12 px-4">
      <div className="container mx-auto max-w-3xl">
        {/* Back Button */}
        <Link href="/" className="inline-flex items-center text-white/60 hover:text-white transition-colors mb-6 md:mb-8 touch-manipulation">
          <ArrowLeft size={20} className="mr-2" />
          Back to Home
        </Link>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8 md:mb-12"
        >
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
            Join Our Club
          </h1>
          <p className="text-white/60 text-base md:text-lg max-w-2xl mx-auto px-2">
            Fill out the registration form below to become a member of NSTU Mechatronics Club. 
            We're excited to have you on board!
          </p>
        </motion.div>

        {/* Form Card or Disabled Message */}
        {settings.applicationsEnabled ? (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl md:rounded-2xl p-4 md:p-8"
          >
            <RegisterForm />
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-red-900/20 to-pink-900/20 backdrop-blur-lg border border-red-500/30 rounded-xl md:rounded-2xl p-8 md:p-12 text-center"
          >
            <div className="mb-6">
              <Heart className="w-16 h-16 text-red-400 mx-auto mb-4" />
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                Applications Currently Closed
              </h2>
              <div className="text-white/80 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
                {settings.disabledMessage ? (
                  <div className="whitespace-pre-wrap">
                    {settings.disabledMessage.replace(/❤️/g, '❤️')}
                  </div>
                ) : (
                  <>
                    We're currently not accepting new member applications at this time.
                    Please check back later or follow us on social media for updates! ❤️
                  </>
                )}
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/"
                className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-105"
              >
                Back to Home
              </Link>
              <Link
                href="/events"
                className="inline-flex items-center justify-center px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg border border-white/20 transition-all duration-200"
              >
                View Our Events
              </Link>
            </div>
          </motion.div>
        )}

        {/* Info Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-6 md:mt-8 text-center text-white/60 text-sm md:text-base px-2"
        >
          <p>
            Questions? Contact us at{' '}
            <a href="mailto:info@nstumechatronics.com" className="text-purple-400 hover:text-purple-300 transition-colors break-all">
              info@nstumechatronics.com
            </a>
          </p>
        </motion.div>
      </div>
    </div>
  );
}

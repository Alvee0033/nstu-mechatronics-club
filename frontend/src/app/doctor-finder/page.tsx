'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, MapPin, Star, Phone, Mail, Clock, DollarSign, Stethoscope } from 'lucide-react';

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  location: string;
  experience: string;
  rating: number;
  phone: string;
  email: string;
  availability: string;
  fees: string;
  qualifications: string;
}

export default function DoctorFinderPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [locations, setLocations] = useState<string[]>([]);
  const [minRating, setMinRating] = useState<number>(0);
  const [maxFees, setMaxFees] = useState<number>(5000);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    searchDoctors();
  }, [searchTerm, selectedSpecialty, selectedLocation, minRating, maxFees]);

  const loadInitialData = async () => {
    try {
      // Load specialties and locations
      const [specialtiesRes, locationsRes] = await Promise.all([
        fetch('/api/doctors', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint: 'specialties' })
        }),
        fetch('/api/doctors', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint: 'locations' })
        })
      ]);

      const specialtiesData = await specialtiesRes.json();
      const locationsData = await locationsRes.json();

      if (specialtiesData.success) {
        setSpecialties(specialtiesData.specialties);
      }
      if (locationsData.success) {
        setLocations(locationsData.locations);
      }

      // Load all doctors initially
      await searchDoctors();
    } catch (error) {
      console.error('Error loading initial data:', error);
    }
  };

  const searchDoctors = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/doctors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint: 'search',
          specialty: selectedSpecialty ? [selectedSpecialty] : [],
          location: selectedLocation ? [selectedLocation] : [],
          minRating: minRating > 0 ? minRating : undefined,
          maxFees: maxFees < 5000 ? maxFees : undefined,
          searchTerm: searchTerm || undefined
        })
      });

      const data = await response.json();
      if (data.success) {
        setDoctors(data.doctors);
      }
    } catch (error) {
      console.error('Error searching doctors:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedSpecialty('');
    setSelectedLocation('');
    setMinRating(0);
    setMaxFees(5000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 py-16 md:py-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-3 mb-4"
          >
            <Stethoscope className="w-8 h-8 md:w-10 md:h-10 text-cyan-400" />
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 text-transparent bg-clip-text">
              Doctor Finder
            </h1>
          </motion.div>
          <p className="text-gray-400 text-sm md:text-base max-w-2xl mx-auto">
            Find qualified healthcare professionals in Bangladesh. Search by specialty, location, and more.
          </p>
        </div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 md:p-6 mb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search doctors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Specialty Filter */}
            <div>
              <select
                value={selectedSpecialty}
                onChange={(e) => setSelectedSpecialty(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="">All Specialties</option>
                {specialties.map(specialty => (
                  <option key={specialty} value={specialty}>{specialty}</option>
                ))}
              </select>
            </div>

            {/* Location Filter */}
            <div>
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="">All Locations</option>
                {locations.map(location => (
                  <option key={location} value={location}>{location}</option>
                ))}
              </select>
            </div>

            {/* Reset Button */}
            <div className="flex items-center">
              <button
                onClick={resetFilters}
                className="w-full px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors"
              >
                Reset Filters
              </button>
            </div>
          </div>

          {/* Advanced Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-300 mb-2">Minimum Rating</label>
              <input
                type="range"
                min="0"
                max="5"
                step="0.1"
                value={minRating}
                onChange={(e) => setMinRating(parseFloat(e.target.value))}
                className="w-full"
              />
              <div className="text-xs text-gray-400 mt-1">{minRating} stars and above</div>
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-2">Maximum Fees (BDT)</label>
              <input
                type="range"
                min="500"
                max="5000"
                step="100"
                value={maxFees}
                onChange={(e) => setMaxFees(parseInt(e.target.value))}
                className="w-full"
              />
              <div className="text-xs text-gray-400 mt-1">Up to BDT {maxFees}</div>
            </div>
          </div>
        </motion.div>

        {/* Results */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-400 mt-4">Searching doctors...</p>
          </div>
        ) : (
          <>
            <div className="mb-4 text-gray-400">
              Found {doctors.length} doctor{doctors.length !== 1 ? 's' : ''}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {doctors.map((doctor, index) => (
                <motion.div
                  key={doctor.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 hover:bg-gray-800/70 transition-all"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                      {doctor.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-white truncate">{doctor.name}</h3>
                      <p className="text-cyan-400 text-sm">{doctor.specialty}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-sm text-gray-300">{doctor.rating}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-300">{doctor.location}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-300">{doctor.availability}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-300">{doctor.fees}</span>
                    </div>

                    <div className="text-xs text-gray-400 mt-2">
                      {doctor.experience} • {doctor.qualifications}
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <a
                      href={`tel:${doctor.phone}`}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-600/20 text-green-400 rounded-lg hover:bg-green-600/30 transition-colors text-sm"
                    >
                      <Phone className="w-4 h-4" />
                      Call
                    </a>
                    <a
                      href={`mailto:${doctor.email}`}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600/20 text-blue-400 rounded-lg hover:bg-blue-600/30 transition-colors text-sm"
                    >
                      <Mail className="w-4 h-4" />
                      Email
                    </a>
                  </div>
                </motion.div>
              ))}
            </div>

            {doctors.length === 0 && !loading && (
              <div className="text-center py-12">
                <Stethoscope className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-400 mb-2">No doctors found</h3>
                <p className="text-gray-500">Try adjusting your search criteria</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
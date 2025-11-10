'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, X } from 'lucide-react';
import Button from '@/components/ui/Button';
import { addRegistration } from '@/lib/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase';

export default function RegisterForm() {
  const [formData, setFormData] = useState({
    fullName: '',
    studentId: '',
    email: '',
    phone: '',
    department: '',
    year: '',
    interests: '',
    experience: '',
    motivation: '',
    photo: null as File | null,
  });

  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, photo: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Helper function to resize image and convert to base64
  const resizeImage = (file: File, maxWidth: number, maxHeight: number): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.8));
        };
        img.onerror = reject;
      };
      reader.onerror = reject;
    });
  };

  const removePhoto = () => {
    setFormData(prev => ({ ...prev, photo: null }));
    setPhotoPreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError('');
    setSubmitSuccess(false);

    try {
      let profilePhotoDataUrl = '';
      let profilePhotoThumbDataUrl = '';

      // Create full resolution and thumbnail base64 images
      if (formData.photo) {
        // Full resolution (max 800x800)
        profilePhotoDataUrl = await resizeImage(formData.photo, 800, 800);
        // Thumbnail (max 150x150)
        profilePhotoThumbDataUrl = await resizeImage(formData.photo, 150, 150);
      }

      // Save registration to Firestore
      const registrationId = await addRegistration({
        fullName: formData.fullName,
        name: formData.fullName, // Keep for backward compatibility
        studentId: formData.studentId,
        email: formData.email,
        phone: formData.phone,
        department: formData.department,
        year: formData.year,
        interests: formData.interests,
        experience: formData.experience,
        motivation: formData.motivation,
        profilePhotoDataUrl: profilePhotoDataUrl || undefined,
        profilePhotoThumbDataUrl: profilePhotoThumbDataUrl || undefined,
        photoUrl: profilePhotoDataUrl || undefined, // Backward compatibility
      });

      if (registrationId) {
        setSubmitSuccess(true);
        // Reset form
        setFormData({
          fullName: '',
          studentId: '',
          email: '',
          phone: '',
          department: '',
          year: '',
          interests: '',
          experience: '',
          motivation: '',
          photo: null,
        });
        setPhotoPreview(null);
      } else {
        setSubmitError('Failed to submit registration. Please try again.');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setSubmitError('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Success Message */}
      {submitSuccess && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-green-500/20 border border-green-500/50 rounded-lg text-green-400"
        >
          Registration submitted successfully! We will contact you soon.
        </motion.div>
      )}

      {/* Error Message */}
      {submitError && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400"
        >
          {submitError}
        </motion.div>
      )}

      {/* Personal Information */}
      <div className="space-y-4">
        <h3 className="text-2xl font-bold text-white mb-4">Personal Information</h3>
        
        <div>
          <label htmlFor="fullName" className="block text-white mb-2">
            Full Name <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            id="fullName"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-purple-500 transition-colors"
            placeholder="Enter your full name"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="studentId" className="block text-white mb-2">
              Student ID <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              id="studentId"
              name="studentId"
              value={formData.studentId}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-purple-500 transition-colors"
              placeholder="e.g., 2021XXXXX"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-white mb-2">
              Email <span className="text-red-400">*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-purple-500 transition-colors"
              placeholder="your.email@example.com"
            />
          </div>
        </div>

        <div>
          <label htmlFor="phone" className="block text-white mb-2">
            Phone Number <span className="text-red-400">*</span>
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-purple-500 transition-colors"
            placeholder="+880 1XXX-XXXXXX"
          />
        </div>
      </div>

      {/* Academic Information */}
      <div className="space-y-4">
        <h3 className="text-2xl font-bold text-white mb-4">Academic Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="department" className="block text-white mb-2">
              Department <span className="text-red-400">*</span>
            </label>
            <select
              id="department"
              name="department"
              value={formData.department}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-500 transition-colors"
            >
              <option value="" className="bg-gray-900">Select Department</option>
              <option value="Mechatronics Engineering" className="bg-gray-900">Mechatronics Engineering</option>
              <option value="Computer Science" className="bg-gray-900">Computer Science</option>
              <option value="Electrical Engineering" className="bg-gray-900">Electrical Engineering</option>
              <option value="Mechanical Engineering" className="bg-gray-900">Mechanical Engineering</option>
              <option value="Other" className="bg-gray-900">Other</option>
            </select>
          </div>

          <div>
            <label htmlFor="year" className="block text-white mb-2">
              Year <span className="text-red-400">*</span>
            </label>
            <select
              id="year"
              name="year"
              value={formData.year}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-500 transition-colors"
            >
              <option value="" className="bg-gray-900">Select Year</option>
              <option value="1st Year" className="bg-gray-900">1st Year</option>
              <option value="2nd Year" className="bg-gray-900">2nd Year</option>
              <option value="3rd Year" className="bg-gray-900">3rd Year</option>
              <option value="4th Year" className="bg-gray-900">4th Year</option>
            </select>
          </div>
        </div>
      </div>

      {/* Technical Information */}
      <div className="space-y-4">
        <h3 className="text-2xl font-bold text-white mb-4">Technical Background</h3>
        
        <div>
          <label htmlFor="interests" className="block text-white mb-2">
            Areas of Interest <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            id="interests"
            name="interests"
            value={formData.interests}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-purple-500 transition-colors"
            placeholder="e.g., Robotics, IoT, AI, Automation"
          />
        </div>

        <div>
          <label htmlFor="experience" className="block text-white mb-2">
            Previous Experience
          </label>
          <textarea
            id="experience"
            name="experience"
            value={formData.experience}
            onChange={handleChange}
            rows={3}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-purple-500 transition-colors resize-none"
            placeholder="Tell us about your previous projects, competitions, or technical experience"
          />
        </div>

        <div>
          <label htmlFor="motivation" className="block text-white mb-2">
            Why do you want to join? <span className="text-red-400">*</span>
          </label>
          <textarea
            id="motivation"
            name="motivation"
            value={formData.motivation}
            onChange={handleChange}
            required
            rows={4}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-purple-500 transition-colors resize-none"
            placeholder="Share your motivation for joining NSTU Mechatronics Club"
          />
        </div>
      </div>

      {/* Photo Upload */}
      <div className="space-y-4">
        <h3 className="text-2xl font-bold text-white mb-4">Profile Photo</h3>
        
        <div>
          <label className="block text-white mb-2">
            Upload Your Photo <span className="text-red-400">*</span>
          </label>
          
          {!photoPreview ? (
            <label
              htmlFor="photo"
              className="block w-full p-8 border-2 border-dashed border-white/20 rounded-lg cursor-pointer hover:border-purple-500 transition-colors"
            >
              <div className="flex flex-col items-center justify-center space-y-3">
                <Upload size={48} className="text-white/40" />
                <div className="text-center">
                  <p className="text-white font-semibold">Click to upload photo</p>
                  <p className="text-white/60 text-sm">PNG, JPG up to 5MB</p>
                </div>
              </div>
              <input
                type="file"
                id="photo"
                name="photo"
                accept="image/*"
                onChange={handlePhotoChange}
                required
                className="hidden"
              />
            </label>
          ) : (
            <div className="relative">
              <img
                src={photoPreview}
                alt="Preview"
                className="w-48 h-48 object-cover rounded-lg mx-auto"
              />
              <button
                type="button"
                onClick={removePhoto}
                className="absolute top-2 right-2 p-2 bg-red-500 rounded-full hover:bg-red-600 transition-colors"
              >
                <X size={20} className="text-white" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Submit Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="pt-6"
      >
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-4 text-lg px-8 rounded-full font-semibold bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Registration'}
        </button>
      </motion.div>
    </form>
  );
}

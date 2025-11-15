'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

const SKILLS_OPTIONS = [
  'Customer Service',
  'Data Entry',
  'Social Media Management',
  'Email Management',
  'Calendar Management',
  'Research',
  'Content Creation',
  'Video Editing',
  'Graphic Design',
  'Bookkeeping',
  'Travel Planning',
  'Event Planning'
];

const EXPERIENCE_LEVELS = [
  { value: 'junior', label: 'Junior (0-2 years)', rate: '$10-$20/hr' },
  { value: 'mid', label: 'Mid-level (2-5 years)', rate: '$20-$40/hr' },
  { value: 'senior', label: 'Senior (5+ years)', rate: '$40-$80/hr' }
];

const DURATION_OPTIONS = [
  'short-term',
  'long-term',
  'ongoing'
];

const WORKING_HOURS = [
  'flexible',
  '9-5',
  'evenings',
  'weekends'
];

export function ContractCreationForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    skills: [] as string[],
    experienceLevel: 'mid',
    duration: 'short-term',
    budgetMin: '',
    budgetMax: '',
    workingHours: 'flexible',
    timezone: '',
    communication: 'email',
    tools: '',
    additionalRequirements: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSkillToggle = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/contracts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (result.success) {
        router.push('/employer/dashboard');
      } else {
        alert(result.message || 'Failed to create contract');
      }
    } catch (error) {
      console.error('Contract creation error:', error);
      alert('Failed to create contract');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl font-bold text-center mb-8">
            Create New Contract
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Contract Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contract Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                placeholder="e.g., Virtual Assistant for Customer Support"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Job Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                placeholder="Describe the work, responsibilities, and expectations..."
                required
              />
            </div>

            {/* Skills Required */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Skills Required *
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {SKILLS_OPTIONS.map(skill => (
                  <label
                    key={skill}
                    className="flex items-center space-x-2 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={formData.skills.includes(skill)}
                      onChange={() => handleSkillToggle(skill)}
                      className="text-yellow-600 focus:ring-yellow-400"
                    />
                    <span className="text-sm">{skill}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Experience Level */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Experience Level *
              </label>
              <select
                name="experienceLevel"
                value={formData.experienceLevel}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
              >
                {EXPERIENCE_LEVELS.map(level => (
                  <option key={level.value} value={level.value}>
                    {level.label} - {level.rate}
                  </option>
                ))}
              </select>
            </div>

            {/* Duration */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contract Duration *
              </label>
              <select
                name="duration"
                value={formData.duration}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
              >
                <option value="short-term">Short-term (1-3 months)</option>
                <option value="long-term">Long-term (3-12 months)</option>
                <option value="ongoing">Ongoing (1+ years)</option>
              </select>
            </div>

            {/* Budget Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Budget ($/hour) *
                </label>
                <input
                  type="number"
                  name="budgetMin"
                  value={formData.budgetMin}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                  placeholder="10"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maximum Budget ($/hour) *
                </label>
                <input
                  type="number"
                  name="budgetMax"
                  value={formData.budgetMax}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                  placeholder="50"
                  required
                />
              </div>
            </div>

            {/* Working Hours */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Working Hours Preference *
              </label>
              <select
                name="workingHours"
                value={formData.workingHours}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
              >
                {WORKING_HOURS.map(hours => (
                  <option key={hours} value={hours}>
                    {hours.charAt(0).toUpperCase() + hours.slice(1).replace('-', ' ')}
                  </option>
                ))}
              </select>
            </div>

            {/* Timezone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Timezone *
              </label>
              <input
                type="text"
                name="timezone"
                value={formData.timezone}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                placeholder="e.g., EST, PST, GMT"
                required
              />
            </div>

            {/* Tools & Software */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Required Tools & Software
              </label>
              <input
                type="text"
                name="tools"
                value={formData.tools}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                placeholder="e.g., Microsoft Office, Slack, Trello"
              />
            </div>

            {/* Additional Requirements */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Requirements
              </label>
              <textarea
                name="additionalRequirements"
                value={formData.additionalRequirements}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                placeholder="Any other specific requirements or preferences..."
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-center">
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 bg-yellow-500 text-black font-semibold rounded-lg hover:bg-yellow-400 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating Contract...' : 'Create Contract'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}

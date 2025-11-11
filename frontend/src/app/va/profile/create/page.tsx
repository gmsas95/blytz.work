// Complete VA Profile Creation Page
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/firebase';
import { apiClient, handleAPIError } from '@/lib/api';
import { 
  User, 
  FileText, 
  Upload, 
  MapPin, 
  DollarSign, 
  Briefcase, 
  CheckCircle,
  Save,
  ArrowLeft,
  Plus,
  X
} from 'lucide-react';
import { useAlert } from '@/components/ui/Alert';

export default function CreateVAProfilePage() {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    country: '',
    hourlyRate: '',
    skills: [] as string[],
    availability: true,
    email: '',
    phone: '',
    timezone: '',
    workExperience: [] as Array<{
      company: string;
      role: string;
      years: string;
      description: string;
    }>,
    education: [] as Array<{
      institution: string;
      degree: string;
      field: string;
      startDate: string;
      endDate: string;
    }>,
    languages: [] as Array<{
      code: string;
      level: string;
    }>
  });
  
  const { addAlert, AlertContainer } = useAlert();

  // Redirect if not logged in or not VA
  useEffect(() => {
    if (!user) {
      window.location.href = '/auth';
      return;
    }
    
    if (user.role !== 'va') {
      window.location.href = '/auth';
      return;
    }
  }, [user]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSkillsChange = (action: 'add' | 'remove', skill?: string) => {
    if (action === 'add' && skill) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, skill.trim()]
      }));
    } else if (action === 'remove' && skill) {
      setFormData(prev => ({
        ...prev,
        skills: prev.skills.filter(s => s !== skill)
      }));
    }
  };

  const handleWorkExperienceChange = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      workExperience: prev.workExperience.map((exp, i) => 
        i === index ? { ...exp, [field]: value } : exp
      )
    }));
  };

  const addWorkExperience = () => {
    setFormData(prev => ({
      ...prev,
      workExperience: [...prev.workExperience, { company: '', role: '', years: '', description: '' }]
    }));
  };

  const removeWorkExperience = (index: number) => {
    setFormData(prev => ({
      ...prev,
      workExperience: prev.workExperience.filter((_, i) => i !== index)
    }));
  };

  const handleEducationChange = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      education: prev.education.map((edu, i) => 
        i === index ? { ...edu, [field]: value } : edu
      )
    }));
  };

  const addEducation = () => {
    setFormData(prev => ({
      ...prev,
      education: [...prev.education, { institution: '', degree: '', field: '', startDate: '', endDate: '' }]
    }));
  };

  const removeEducation = (index: number) => {
    setFormData(prev => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      const profileData = {
        name: formData.name,
        bio: formData.bio,
        country: formData.country,
        hourlyRate: parseInt(formData.hourlyRate),
        skills: formData.skills,
        availability: formData.availability,
        email: formData.email || undefined,
        phone: formData.phone || undefined,
        timezone: formData.timezone || undefined,
        workExperience: formData.workExperience.filter(exp => exp.company && exp.role),
        education: formData.education.filter(edu => edu.institution && edu.degree),
        languages: formData.languages.filter(lang => lang.code && lang.level)
      };

      const response = await apiClient.va.createProfile(profileData);
      
      addAlert('success', 'VA profile created successfully!');
      window.location.href = '/va/profile';
    } catch (error: any) {
      addAlert('error', handleAPIError(error).message);
    } finally {
      setLoading(false);
    }
  };

  const skillOptions = [
    'JavaScript', 'TypeScript', 'React', 'Vue', 'Angular',
    'Node.js', 'Python', 'Ruby', 'PHP', 'Java',
    'HTML', 'CSS', 'Sass', 'Tailwind', 'Bootstrap',
    'MongoDB', 'PostgreSQL', 'MySQL', 'Redis',
    'AWS', 'Google Cloud', 'Azure', 'Docker', 'Kubernetes',
    'Git', 'CI/CD', 'Testing', 'Agile', 'Scrum'
  ];

  const languageOptions = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'it', name: 'Italian' },
    { code: 'pt', name: 'Portuguese' },
    { code: 'zh', name: 'Chinese' },
    { code: 'ja', name: 'Japanese' },
    { code: 'ko', name: 'Korean' },
    { code: 'ru', name: 'Russian' }
  ];

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  const isStepValid = () => {
    switch (step) {
      case 1:
        return formData.name.trim() !== '' && 
               formData.bio.trim().length >= 10 && 
               formData.country.trim() !== '' && 
               formData.hourlyRate && 
               formData.skills.length > 0;
      case 2:
        return true; // Work experience is optional
      case 3:
        return true; // Education is optional
      default:
        return true;
    }
  };

  return (
    <>
      <AlertContainer />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Create Your VA Profile</h1>
                <p className="text-gray-600 mt-1">Step {step} of 3</p>
              </div>
              <button
                onClick={() => window.location.href = '/auth'}
                className="btn-secondary flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            </div>

            {/* Progress Bar */}
            <div className="mt-6">
              <div className="flex items-center">
                {[1, 2, 3].map((s) => (
                  <div key={s} className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      s <= step ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-600'
                    }`}>
                      {s < step ? <CheckCircle className="w-4 h-4" /> : s}
                    </div>
                    {s < 3 && (
                      <div className={`w-full h-1 ${
                        s < step ? 'bg-primary-600' : 'bg-gray-200'
                      }`} />
                    )}
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-2">
                <span className="text-sm text-gray-600">Basic Info</span>
                <span className="text-sm text-gray-600">Experience</span>
                <span className="text-sm text-gray-600">Education</span>
              </div>
            </div>
          </div>

          {/* Step 1: Basic Information */}
          {step === 1 && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Basic Information</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bio * (at least 10 characters)
                  </label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Tell us about yourself, your expertise, and what makes you a great VA"
                  />
                  <p className="text-sm text-gray-600 mt-1">{formData.bio.length} characters</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <MapPin className="w-4 h-4 inline mr-1" />
                      Country *
                    </label>
                    <select
                      value={formData.country}
                      onChange={(e) => handleInputChange('country', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="">Select country</option>
                      <option value="United States">United States</option>
                      <option value="United Kingdom">United Kingdom</option>
                      <option value="Canada">Canada</option>
                      <option value="Australia">Australia</option>
                      <option value="Philippines">Philippines</option>
                      <option value="India">India</option>
                      <option value="Pakistan">Pakistan</option>
                      <option value="Bangladesh">Bangladesh</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <DollarSign className="w-4 h-4 inline mr-1" />
                      Hourly Rate ($) *
                    </label>
                    <input
                      type="number"
                      value={formData.hourlyRate}
                      onChange={(e) => handleInputChange('hourlyRate', e.target.value)}
                      min="5"
                      max="200"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Enter your hourly rate"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Skills * (at least one skill)
                  </label>
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      {formData.skills.map((skill) => (
                        <span
                          key={skill}
                          className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm flex items-center space-x-2"
                        >
                          <span>{skill}</span>
                          <button
                            onClick={() => handleSkillsChange('remove', skill)}
                            className="text-primary-600 hover:text-primary-700"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center space-x-2">
                      <select
                        onChange={(e) => e.target.value && handleSkillsChange('add', e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        defaultValue=""
                      >
                        <option value="" disabled>Select a skill</option>
                        {skillOptions
                          .filter(skill => !formData.skills.includes(skill))
                          .map((skill) => (
                            <option key={skill} value={skill}>{skill}</option>
                          ))}
                      </select>
                      <button
                        onClick={() => document.getElementById('custom-skill')?.focus()}
                        className="btn-secondary"
                      >
                        Add Custom
                      </button>
                    </div>
                    <input
                      id="custom-skill"
                      type="text"
                      placeholder="Enter custom skill and press Enter"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && (e.target as HTMLInputElement).value.trim()) {
                          handleSkillsChange('add', (e.target as HTMLInputElement).value);
                          (e.target as HTMLInputElement).value = '';
                        }
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Availability
                  </label>
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="true"
                        checked={formData.availability}
                        onChange={(e) => handleInputChange('availability', e.target.value === 'true')}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">Available</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="false"
                        checked={!formData.availability}
                        onChange={(e) => handleInputChange('availability', e.target.value === 'true')}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">Not Available</span>
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contact Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="your@email.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contact Phone
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Timezone
                  </label>
                  <select
                    value={formData.timezone}
                    onChange={(e) => handleInputChange('timezone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">Select timezone</option>
                    <option value="UTC">UTC</option>
                    <option value="EST">Eastern Time (EST)</option>
                    <option value="CST">Central Time (CST)</option>
                    <option value="MST">Mountain Time (MST)</option>
                    <option value="PST">Pacific Time (PST)</option>
                    <option value="GMT">Greenwich Mean Time (GMT)</option>
                    <option value="CET">Central European Time (CET)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end mt-8">
                <button
                  onClick={nextStep}
                  disabled={!isStepValid()}
                  className="btn-primary"
                >
                  Continue to Experience
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Work Experience */}
          {step === 2 && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Work Experience</h2>
              
              <div className="space-y-6">
                {formData.workExperience.map((exp, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg font-medium text-gray-900">Experience {index + 1}</h3>
                      <button
                        onClick={() => removeWorkExperience(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Company</label>
                        <input
                          type="text"
                          value={exp.company}
                          onChange={(e) => handleWorkExperienceChange(index, 'company', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          placeholder="Company name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                        <input
                          type="text"
                          value={exp.role}
                          onChange={(e) => handleWorkExperienceChange(index, 'role', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          placeholder="Job title"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Years of Experience</label>
                        <input
                          type="text"
                          value={exp.years}
                          onChange={(e) => handleWorkExperienceChange(index, 'years', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          placeholder="e.g., 2.5"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                      <textarea
                        value={exp.description}
                        onChange={(e) => handleWorkExperienceChange(index, 'description', e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="Describe your responsibilities and achievements"
                      />
                    </div>
                  </div>
                ))}

                <button
                  onClick={addWorkExperience}
                  className="btn-secondary w-full flex items-center justify-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Work Experience</span>
                </button>
              </div>

              <div className="flex justify-between mt-8">
                <button
                  onClick={prevStep}
                  className="btn-secondary"
                >
                  Back
                </button>
                <button
                  onClick={nextStep}
                  className="btn-primary"
                >
                  Continue to Education
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Education */}
          {step === 3 && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Education</h2>
              
              <div className="space-y-6">
                {formData.education.map((edu, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg font-medium text-gray-900">Education {index + 1}</h3>
                      <button
                        onClick={() => removeEducation(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Institution</label>
                        <input
                          type="text"
                          value={edu.institution}
                          onChange={(e) => handleEducationChange(index, 'institution', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          placeholder="University/College name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Degree</label>
                        <input
                          type="text"
                          value={edu.degree}
                          onChange={(e) => handleEducationChange(index, 'degree', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          placeholder="e.g., Bachelor of Science"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Field of Study</label>
                        <input
                          type="text"
                          value={edu.field}
                          onChange={(e) => handleEducationChange(index, 'field', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          placeholder="e.g., Computer Science"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                        <input
                          type="date"
                          value={edu.startDate}
                          onChange={(e) => handleEducationChange(index, 'startDate', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                        <input
                          type="date"
                          value={edu.endDate}
                          onChange={(e) => handleEducationChange(index, 'endDate', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  onClick={addEducation}
                  className="btn-secondary w-full flex items-center justify-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Education</span>
                </button>
              </div>

              <div className="flex justify-between mt-8">
                <button
                  onClick={prevStep}
                  className="btn-secondary"
                >
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading || !isStepValid()}
                  className="btn-primary flex items-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{loading ? 'Creating...' : 'Create Profile'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
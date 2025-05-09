import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { Building, MapPin, Mail, Phone, Share2, Github, Linkedin, Twitter } from 'lucide-react';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useToaster } from '@/components/ui/Toaster';

export default function Profile() {
  const navigate = useNavigate();
  const { currentUser, signOut } = useAuth();
  const { addToast } = useToaster();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [profileData, setProfileData] = useState({
    name: '',
    bio: '',
    skills: [],
    location: '',
    company: '',
    phone: '',
    email: '',
    github: '',
    linkedin: '',
    twitter: ''
  });

  useEffect(() => {
    if (!currentUser) {
      navigate('/signin');
      return;
    }

    const loadProfile = async () => {
      try {
        const profileDoc = await getDoc(doc(db, 'profiles', currentUser.uid));
        if (profileDoc.exists()) {
          const data = profileDoc.data();
          setProfileData({
            name: currentUser.displayName || '',
            bio: data.bio || '',
            skills: data.skills || [],
            location: data.location || '',
            company: data.company || '',
            phone: data.phone || '',
            email: currentUser.email || '',
            github: data.github || '',
            linkedin: data.linkedin || '',
            twitter: data.twitter || ''
          });
        } else {
          // Set default values if profile doesn't exist
          setProfileData({
            name: currentUser.displayName || '',
            email: currentUser.email || '',
            bio: '',
            skills: [],
            location: '',
            company: '',
            phone: '',
            github: '',
            linkedin: '',
            twitter: ''
          });
        }
      } catch (error) {
        console.error('Error loading profile:', error);
        addToast('Failed to load profile', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [currentUser, navigate, addToast]);

  const handleSaveProfile = async () => {
    try {
      setIsLoading(true);
      await setDoc(doc(db, 'profiles', currentUser.uid), {
        ...profileData,
        updatedAt: serverTimestamp()
      }, { merge: true });
      
      addToast('Profile updated successfully', 'success');
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving profile:', error);
      addToast('Failed to save profile', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/signin');
    } catch (error) {
      console.error('Error signing out:', error);
      addToast('Failed to sign out', 'error');
    }
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: 'SkillSetGo - Find Your Next Opportunity',
        text: 'Check out SkillSetGo - A platform to find your next job opportunity!',
        url: window.location.origin
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-6 mb-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gray-200 flex items-center justify-center">
                {currentUser?.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.displayName}
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover"
                  />
                ) : (
                  <span className="text-3xl sm:text-4xl text-gray-500">
                    {currentUser?.displayName?.[0]?.toUpperCase() || 'U'}
                  </span>
                )}
              </div>
              <div className="text-center sm:text-left">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{profileData.name}</h1>
                <p className="text-gray-600">{profileData.company}</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <Button
                onClick={handleShare}
                className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto"
              >
                <Share2 className="w-4 h-4" />
                <span>Share App</span>
              </Button>
              <Button
                onClick={handleSignOut}
                className="bg-red-600 hover:bg-red-700 text-white w-full sm:w-auto"
              >
                Sign Out
              </Button>
            </div>
          </div>

          {isEditing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Bio</label>
                <textarea
                  value={profileData.bio}
                  onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  rows="3"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Skills (comma-separated)</label>
                <input
                  type="text"
                  value={profileData.skills.join(', ')}
                  onChange={(e) => setProfileData({ ...profileData, skills: e.target.value.split(',').map(s => s.trim()) })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Location</label>
                  <input
                    type="text"
                    value={profileData.location}
                    onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Company</label>
                  <input
                    type="text"
                    value={profileData.company}
                    onChange={(e) => setProfileData({ ...profileData, company: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <input
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    value={profileData.email}
                    disabled
                    className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">GitHub</label>
                  <input
                    type="url"
                    value={profileData.github}
                    onChange={(e) => setProfileData({ ...profileData, github: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">LinkedIn</label>
                  <input
                    type="url"
                    value={profileData.linkedin}
                    onChange={(e) => setProfileData({ ...profileData, linkedin: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Twitter</label>
                  <input
                    type="url"
                    value={profileData.twitter}
                    onChange={(e) => setProfileData({ ...profileData, twitter: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 pt-4">
                <Button
                  onClick={handleSaveProfile}
                  className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={isLoading}
                >
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button
                  onClick={() => setIsEditing(false)}
                  className="w-full sm:w-auto bg-gray-100 hover:bg-gray-200 text-gray-700"
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-1">
                  <h2 className="text-lg font-semibold text-gray-900">About</h2>
                  <p className="text-gray-600">{profileData.bio || 'No bio added yet.'}</p>
                </div>
                <Button
                  onClick={() => setIsEditing(true)}
                  className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Edit Profile
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-5 w-5 text-gray-400" />
                    <span className="text-gray-600">{profileData.location || 'No location set'}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Building className="h-5 w-5 text-gray-400" />
                    <span className="text-gray-600">{profileData.company || 'No company set'}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Mail className="h-5 w-5 text-gray-400" />
                    <span className="text-gray-600">{profileData.email}</span>
                  </div>
                  {profileData.phone && (
                    <div className="flex items-center space-x-2">
                      <Phone className="h-5 w-5 text-gray-400" />
                      <span className="text-gray-600">{profileData.phone}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {profileData.skills.length > 0 ? (
                      profileData.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                        >
                          {skill}
                        </span>
                      ))
                    ) : (
                      <p className="text-gray-500">No skills added yet</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Social Links</h3>
                <div className="flex flex-wrap gap-4">
                  {profileData.github && (
                    <a
                      href={profileData.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
                    >
                      <Github className="h-5 w-5" />
                      <span>GitHub</span>
                    </a>
                  )}
                  {profileData.linkedin && (
                    <a
                      href={profileData.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
                    >
                      <Linkedin className="h-5 w-5" />
                      <span>LinkedIn</span>
                    </a>
                  )}
                  {profileData.twitter && (
                    <a
                      href={profileData.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
                    >
                      <Twitter className="h-5 w-5" />
                      <span>Twitter</span>
                    </a>
                  )}
                  {!profileData.github && !profileData.linkedin && !profileData.twitter && (
                    <p className="text-gray-500">No social links added yet</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Switch } from '@/components/ui/Switch';
import { Bell, Lock, Globe, Moon, Sun } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useToaster } from '@/components/ui/Toaster';

export default function Settings() {
  const { currentUser } = useAuth();
  const { addToast } = useToaster();
  const [isLoading, setIsLoading] = useState(true);
  const [settings, setSettings] = useState({
    emailNotifications: true,
    jobAlerts: true,
    messageNotifications: true,
    darkMode: false,
    language: 'English',
    privacy: {
      profileVisibility: 'public',
      showEmail: false,
      showPhone: false
    }
  });

  useEffect(() => {
    const loadSettings = async () => {
      if (!currentUser) return;

      try {
        const settingsDoc = await getDoc(doc(db, 'userSettings', currentUser.uid));
        if (settingsDoc.exists()) {
          setSettings(settingsDoc.data());
        }
      } catch (error) {
        console.error('Error loading settings:', error);
        addToast('Failed to load settings', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, [currentUser, addToast]);

  const handleToggle = (key) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handlePrivacyChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      privacy: {
        ...prev.privacy,
        [key]: value
      }
    }));
  };

  const handleSaveSettings = async () => {
    if (!currentUser) return;

    try {
      setIsLoading(true);
      await setDoc(doc(db, 'userSettings', currentUser.uid), {
        ...settings,
        updatedAt: serverTimestamp()
      }, { merge: true });
      addToast('Settings saved successfully', 'success');
    } catch (error) {
      console.error('Error saving settings:', error);
      addToast('Failed to save settings', 'error');
    } finally {
      setIsLoading(false);
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
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Account Settings</h1>

      <div className="space-y-8">
        {/* Notifications */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <Bell className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Notifications</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">Email Notifications</h3>
                <p className="text-sm text-gray-500">Receive updates about your applications</p>
              </div>
              <Switch
                checked={settings.emailNotifications}
                onCheckedChange={() => handleToggle('emailNotifications')}
                className="data-[state=checked]:bg-blue-600"
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">Job Alerts</h3>
                <p className="text-sm text-gray-500">Get notified about new job opportunities</p>
              </div>
              <Switch
                checked={settings.jobAlerts}
                onCheckedChange={() => handleToggle('jobAlerts')}
                className="data-[state=checked]:bg-blue-600"
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">Message Notifications</h3>
                <p className="text-sm text-gray-500">Receive notifications for new messages</p>
              </div>
              <Switch
                checked={settings.messageNotifications}
                onCheckedChange={() => handleToggle('messageNotifications')}
                className="data-[state=checked]:bg-blue-600"
              />
            </div>
          </div>
        </div>

        {/* Appearance */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            {settings.darkMode ? (
              <Moon className="h-6 w-6 text-blue-600" />
            ) : (
              <Sun className="h-6 w-6 text-blue-600" />
            )}
            <h2 className="text-xl font-semibold text-gray-900">Appearance</h2>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900">Dark Mode</h3>
              <p className="text-sm text-gray-500">Switch between light and dark theme</p>
            </div>
            <Switch
              checked={settings.darkMode}
              onCheckedChange={() => handleToggle('darkMode')}
              className="data-[state=checked]:bg-blue-600"
            />
          </div>
        </div>

        {/* Privacy */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <Lock className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Privacy</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Profile Visibility
              </label>
              <select
                value={settings.privacy.profileVisibility}
                onChange={(e) => handlePrivacyChange('profileVisibility', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-600 focus:ring-blue-600"
              >
                <option value="public">Public</option>
                <option value="private">Private</option>
                <option value="connections">Connections Only</option>
              </select>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">Show Email</h3>
                <p className="text-sm text-gray-500">Display your email on your profile</p>
              </div>
              <Switch
                checked={settings.privacy.showEmail}
                onCheckedChange={() => handlePrivacyChange('showEmail', !settings.privacy.showEmail)}
                className="data-[state=checked]:bg-blue-600"
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">Show Phone</h3>
                <p className="text-sm text-gray-500">Display your phone number on your profile</p>
              </div>
              <Switch
                checked={settings.privacy.showPhone}
                onCheckedChange={() => handlePrivacyChange('showPhone', !settings.privacy.showPhone)}
                className="data-[state=checked]:bg-blue-600"
              />
            </div>
          </div>
        </div>

        {/* Language */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <Globe className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Language</h2>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preferred Language
            </label>
            <select
              value={settings.language}
              onChange={(e) => setSettings(prev => ({ ...prev, language: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-600 focus:ring-blue-600"
            >
              <option value="English">English</option>
              <option value="Hindi">Hindi</option>
              <option value="Punjabi">Punjabi</option>
              <option value="Bengali">Bengali</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={handleSaveSettings}>
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
} 
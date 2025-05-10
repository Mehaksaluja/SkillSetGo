import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Switch } from '@/components/ui/Switch';
import { Bell, Lock, Globe, Moon, Sun } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useDarkMode } from '@/context/DarkModeContext';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useToaster } from '@/components/ui/Toaster';

const defaultSettings = {
  emailNotifications: true,
  jobAlerts: true,
  messageNotifications: true,
  language: 'English',
  privacy: {
    profileVisibility: 'public',
    showEmail: false,
    showPhone: false
  }
};

export default function Settings() {
  const { currentUser } = useAuth();
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const { addToast } = useToaster();
  const [isLoading, setIsLoading] = useState(true);
  const [settings, setSettings] = useState(defaultSettings);

  useEffect(() => {
    const loadSettings = async () => {
      if (!currentUser) {
        setIsLoading(false);
        return;
      }

      try {
        const settingsDoc = await getDoc(doc(db, 'userSettings', currentUser.uid));
        if (settingsDoc.exists()) {
          const data = settingsDoc.data();
          // Ensure all required fields are present
          setSettings({
            ...defaultSettings,
            ...data,
            privacy: {
              ...defaultSettings.privacy,
              ...(data.privacy || {})
            }
          });
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
        darkMode: isDarkMode,
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-bg-primary">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg-primary">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-dark-text-primary mb-8">Account Settings</h1>

        <div className="space-y-8">
          {/* Notifications */}
          <div className="bg-white dark:bg-dark-bg-secondary rounded-xl shadow-sm p-6 border border-gray-100 dark:border-dark-border">
            <div className="flex items-center gap-3 mb-6">
              <Bell className="h-6 w-6 text-primary-500" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-dark-text-primary">Notifications</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-dark-text-primary">Email Notifications</h3>
                  <p className="text-sm text-gray-500 dark:text-dark-text-tertiary">Receive updates about your applications</p>
                </div>
                <Switch
                  checked={settings.emailNotifications}
                  onCheckedChange={() => handleToggle('emailNotifications')}
                  className="data-[state=checked]:bg-primary-500"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-dark-text-primary">Job Alerts</h3>
                  <p className="text-sm text-gray-500 dark:text-dark-text-tertiary">Get notified about new job opportunities</p>
                </div>
                <Switch
                  checked={settings.jobAlerts}
                  onCheckedChange={() => handleToggle('jobAlerts')}
                  className="data-[state=checked]:bg-primary-500"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-dark-text-primary">Message Notifications</h3>
                  <p className="text-sm text-gray-500 dark:text-dark-text-tertiary">Receive notifications for new messages</p>
                </div>
                <Switch
                  checked={settings.messageNotifications}
                  onCheckedChange={() => handleToggle('messageNotifications')}
                  className="data-[state=checked]:bg-primary-500"
                />
              </div>
            </div>
          </div>

          {/* Appearance */}
          <div className="bg-white dark:bg-dark-bg-secondary rounded-xl shadow-sm p-6 border border-gray-100 dark:border-dark-border">
            <div className="flex items-center gap-3 mb-6">
              {isDarkMode ? (
                <Moon className="h-6 w-6 text-primary-500" />
              ) : (
                <Sun className="h-6 w-6 text-primary-500" />
              )}
              <h2 className="text-xl font-semibold text-gray-900 dark:text-dark-text-primary">Appearance</h2>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900 dark:text-dark-text-primary">Dark Mode</h3>
                <p className="text-sm text-gray-500 dark:text-dark-text-tertiary">Switch between light and dark theme</p>
              </div>
              <Switch
                checked={isDarkMode}
                onCheckedChange={toggleDarkMode}
                className="data-[state=checked]:bg-primary-500"
              />
            </div>
          </div>

          {/* Privacy */}
          <div className="bg-white dark:bg-dark-bg-secondary rounded-xl shadow-sm p-6 border border-gray-100 dark:border-dark-border">
            <div className="flex items-center gap-3 mb-6">
              <Lock className="h-6 w-6 text-primary-500" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-dark-text-primary">Privacy</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-2">
                  Profile Visibility
                </label>
                <select
                  value={settings.privacy.profileVisibility}
                  onChange={(e) => handlePrivacyChange('profileVisibility', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-dark-border shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-dark-bg-tertiary dark:text-dark-text-primary"
                >
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                  <option value="connections">Connections Only</option>
                </select>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-dark-text-primary">Show Email</h3>
                  <p className="text-sm text-gray-500 dark:text-dark-text-tertiary">Display your email on your profile</p>
                </div>
                <Switch
                  checked={settings.privacy.showEmail}
                  onCheckedChange={() => handlePrivacyChange('showEmail', !settings.privacy.showEmail)}
                  className="data-[state=checked]:bg-primary-500"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-dark-text-primary">Show Phone</h3>
                  <p className="text-sm text-gray-500 dark:text-dark-text-tertiary">Display your phone number on your profile</p>
                </div>
                <Switch
                  checked={settings.privacy.showPhone}
                  onCheckedChange={() => handlePrivacyChange('showPhone', !settings.privacy.showPhone)}
                  className="data-[state=checked]:bg-primary-500"
                />
              </div>
            </div>
          </div>

          {/* Language */}
          <div className="bg-white dark:bg-dark-bg-secondary rounded-xl shadow-sm p-6 border border-gray-100 dark:border-dark-border">
            <div className="flex items-center gap-3 mb-6">
              <Globe className="h-6 w-6 text-primary-500" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-dark-text-primary">Language</h2>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-2">
                Preferred Language
              </label>
              <select
                value={settings.language}
                onChange={(e) => setSettings(prev => ({ ...prev, language: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-dark-border shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-dark-bg-tertiary dark:text-dark-text-primary"
              >
                <option value="English">English</option>
                <option value="Hindi">Hindi</option>
                <option value="Punjabi">Punjabi</option>
                <option value="Bengali">Bengali</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end">
            <Button 
              className="bg-primary-500 hover:bg-primary-600 text-white px-8 py-2 rounded-lg shadow-sm hover:shadow-md transition-all"
              onClick={handleSaveSettings}
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 
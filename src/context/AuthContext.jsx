import { createContext, useContext, useState, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

// Create the context with a default value
const AuthContext = createContext({
  currentUser: null,
  userRole: null,
  signup: async () => {},
  login: async () => {},
  logout: async () => {},
  loading: true
});

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function signup(email, password, displayName, role) {
    try {
      setError(null);
      console.log('Starting signup process...');
      
      // Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log('User created successfully:', userCredential.user.uid);
      
      // Update profile with display name
      await updateProfile(userCredential.user, { displayName });
      console.log('Profile updated with display name');
      
      // Create user document in Firestore
      const userData = {
        uid: userCredential.user.uid,
        email,
        displayName,
        role,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
        profileCompleted: false,
        preferences: {
          jobAlerts: true,
          emailNotifications: true
        }
      };

      await setDoc(doc(db, 'users', userCredential.user.uid), userData);
      console.log('User document created in Firestore');
      
      return userCredential.user;
    } catch (err) {
      console.error('Error in signup:', err);
      let errorMessage = 'Failed to create an account.';
      
      switch (err.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'This email is already registered.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Please enter a valid email address.';
          break;
        case 'auth/operation-not-allowed':
          errorMessage = 'Email/password accounts are not enabled.';
          break;
        case 'auth/weak-password':
          errorMessage = 'Password should be at least 6 characters.';
          break;
        default:
          errorMessage = err.message;
      }
      
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }

  async function login(email, password) {
    try {
      setError(null);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Update last login timestamp
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        lastLogin: serverTimestamp(),
        updatedAt: serverTimestamp()
      }, { merge: true });
      
      return userCredential.user;
    } catch (err) {
      console.error('Error in login:', err);
      let errorMessage = 'Failed to sign in.';
      
      switch (err.code) {
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address.';
          break;
        case 'auth/user-disabled':
          errorMessage = 'This account has been disabled.';
          break;
        case 'auth/user-not-found':
          errorMessage = 'No account found with this email.';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Incorrect password.';
          break;
        default:
          errorMessage = err.message;
      }
      
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }

  async function logout() {
    try {
      await signOut(auth);
    } catch (err) {
      console.error('Error in logout:', err);
      throw new Error('Failed to sign out.');
    }
  }

  async function updateUserProfile(data) {
    try {
      if (!currentUser) throw new Error('No user logged in');
      
      // Update Firestore document
      await setDoc(doc(db, 'users', currentUser.uid), {
        ...data,
        updatedAt: serverTimestamp()
      }, { merge: true });
      
      // Update auth profile if displayName is provided
      if (data.displayName) {
        await updateProfile(auth.currentUser, { displayName: data.displayName });
      }
      
      // Refresh current user data
      const updatedUserDoc = await getDoc(doc(db, 'users', currentUser.uid));
      setCurrentUser({
        ...currentUser,
        ...updatedUserDoc.data()
      });
    } catch (err) {
      console.error('Error updating profile:', err);
      throw new Error('Failed to update profile.');
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Get user data from Firestore
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setCurrentUser({
            ...user,
            ...userDoc.data()
          });
        } else {
          setCurrentUser(user);
        }
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    loading,
    error,
    signup,
    login,
    logout,
    updateUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
} 
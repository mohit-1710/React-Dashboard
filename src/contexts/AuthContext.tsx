import { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, isAdmin: boolean) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  getUserProgress: () => Promise<any>;
  updateProjectProgress: (projectId: string, difficulty: string, completed: boolean) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('[AuthContext] Auth state changed:', { 
        uid: user?.uid,
        email: user?.email 
      });
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const initializeUserData = async (uid: string, email: string, isAdmin: boolean = false) => {
    console.log('[AuthContext] Initializing user data:', { uid, email, isAdmin });
    const userRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      console.log('[AuthContext] Creating new user document');
      await setDoc(userRef, {
        email,
        isAdmin,
        progress: {},
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
      });
    } else {
      console.log('[AuthContext] Updating user last login');
      await updateDoc(userRef, {
        lastLogin: serverTimestamp(),
      });
    }
  };

  const signUp = async (email: string, password: string, isAdmin: boolean) => {
    console.log('[AuthContext] Signing up new user:', { email, isAdmin });
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await initializeUserData(userCredential.user.uid, email, isAdmin);
  };

  const signIn = async (email: string, password: string) => {
    console.log('[AuthContext] Signing in user:', { email });
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    await initializeUserData(userCredential.user.uid, email);
  };

  const signInWithGoogle = async () => {
    console.log('[AuthContext] Initiating Google sign in');
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    await initializeUserData(userCredential.user.uid, userCredential.user.email || '');
  };

  const getUserProgress = async () => {
    if (!user) return null;
    
    const userRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userRef);
    const userData = userDoc.data();
    
    return userData?.progress || {
      beginner: {},
      intermediate: {},
      advanced: {}
    };
  };

  const updateProjectProgress = async (projectId: string, difficulty: string, completed: boolean) => {
    if (!user) throw new Error('No user logged in');

    const userRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userRef);
    const currentProgress = userDoc.data()?.progress || {};

    const difficultyKey = difficulty.toLowerCase();
    const updatedProgress = {
      ...currentProgress,
      [difficultyKey]: {
        ...currentProgress[difficultyKey],
        [projectId]: {
          completed,
          updatedAt: new Date().toISOString(),
        },
      },
    };

    await updateDoc(userRef, { progress: updatedProgress });
  };

  const logout = () => signOut(auth);

  const value = {
    user,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    logout,
    getUserProgress,
    updateProjectProgress,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

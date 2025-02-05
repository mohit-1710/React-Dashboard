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
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';

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
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signUp = async (email: string, password: string, isAdmin: boolean) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await initializeUserProgress(userCredential.user.uid, email, isAdmin);
  };

  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
    
    if (!userDoc.exists()) {
      await initializeUserProgress(userCredential.user.uid, userCredential.user.email || '', false);
    }
  };

  const initializeUserProgress = async (uid: string, email: string, isAdmin: boolean = false) => {
    const userRef = doc(db, 'users', uid);
    await setDoc(userRef, {
      email,
      isAdmin,
      progress: {},
      createdAt: new Date().toISOString(),
    });
  };

  const logout = () => signOut(auth);

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

    const updatedProgress = {
      ...currentProgress,
      [difficulty.toLowerCase()]: {
        ...(currentProgress[difficulty.toLowerCase()] || {}),
        [projectId]: {
          completed,
          completedAt: completed ? new Date().toISOString() : null,
        },
      },
    };

    await updateDoc(userRef, {
      progress: updatedProgress,
    });
  };

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

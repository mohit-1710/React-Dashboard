import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from './config';

export const setupAdminUser = async (email: string, uid: string) => {
  try {
    const userRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      // Create new user document with admin privileges
      await setDoc(userRef, {
        email,
        isAdmin: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      return { success: true, message: 'Admin user created successfully' };
    } else {
      // Update existing user to be an admin
      await setDoc(userRef, {
        ...userDoc.data(),
        isAdmin: true,
        updatedAt: new Date()
      }, { merge: true });
      return { success: true, message: 'User updated to admin successfully' };
    }
  } catch (error) {
    console.error('Error setting up admin user:', error);
    return { success: false, message: 'Error setting up admin user' };
  }
};

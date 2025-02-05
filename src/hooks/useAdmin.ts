import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useAuth } from '@/contexts/AuthContext';

export function useAdmin() {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const checkAdminStatus = async () => {
      setLoading(true);
      setError(null);

      if (!user) {
        if (isMounted) {
          setIsAdmin(false);
          setLoading(false);
        }
        return;
      }

      try {
        console.log('[useAdmin] Checking admin status for:', {
          uid: user.uid,
          email: user.email
        });

        const userDocRef = doc(db, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (!isMounted) return;

        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          console.log('[useAdmin] User data:', {
            hasData: !!userData,
            isAdmin: userData?.isAdmin,
            email: userData?.email
          });

          // Explicitly check for boolean true
          const adminStatus = userData?.isAdmin === true;
          setIsAdmin(adminStatus);

          if (adminStatus) {
            console.log('[useAdmin] User confirmed as admin');
          } else {
            console.log('[useAdmin] User is not an admin');
          }
        } else {
          console.log('[useAdmin] User document does not exist');
          setIsAdmin(false);
          setError('User document not found');
        }
      } catch (error) {
        console.error('[useAdmin] Error checking admin status:', error);
        setError('Failed to verify admin status');
        setIsAdmin(false);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    checkAdminStatus();

    return () => {
      isMounted = false;
    };
  }, [user]);

  return { isAdmin, loading, error };
}

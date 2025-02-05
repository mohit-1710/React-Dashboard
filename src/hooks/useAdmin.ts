import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useAuth } from '@/contexts/AuthContext';

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

export function useAdmin() {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    let retryCount = 0;

    const checkAdminStatus = async (retry = false) => {
      if (!user) {
        if (isMounted) {
          setIsAdmin(false);
          setLoading(false);
        }
        return;
      }

      try {
        console.log('[useAdmin] Checking admin status for user:', {
          uid: user.uid,
          email: user.email,
          retry: retryCount
        });

        const userDocRef = doc(db, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);
        
        if (!isMounted) return;

        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          console.log('[useAdmin] User data retrieved:', {
            hasData: !!userData,
            isAdmin: userData?.isAdmin
          });
          setIsAdmin(userData?.isAdmin === true);
        } else {
          console.log('[useAdmin] User document does not exist');
          setIsAdmin(false);
        }
        setLoading(false);
      } catch (error) {
        console.error('[useAdmin] Error checking admin status:', error);
        
        if (!isMounted) return;

        if (retry && retryCount < MAX_RETRIES) {
          retryCount++;
          console.log(`[useAdmin] Retrying (${retryCount}/${MAX_RETRIES})...`);
          setTimeout(() => checkAdminStatus(true), RETRY_DELAY);
          return;
        }

        setIsAdmin(false);
        setLoading(false);
      }
    };

    checkAdminStatus(true);

    return () => {
      isMounted = false;
    };
  }, [user]);

  return { isAdmin, loading };
}

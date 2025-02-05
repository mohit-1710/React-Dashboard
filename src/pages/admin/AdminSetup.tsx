import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { setupAdminUser } from '@/lib/firebase/adminSetup';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

export function AdminSetup() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleSetupAdmin = async () => {
    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be logged in to become an admin',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const result = await setupAdminUser(user.email!, user.uid);
      if (result.success) {
        toast({
          title: 'Success',
          description: result.message,
        });
      } else {
        toast({
          title: 'Error',
          description: result.message,
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to set up admin user',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto py-10">
        <h1 className="text-2xl font-bold mb-4">Admin Setup</h1>
        <p>Please log in first to become an admin.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-4">Admin Setup</h1>
      <div className="max-w-md">
        <div className="bg-secondary/50 p-4 rounded-md mb-4">
          <h2 className="font-semibold mb-2">Current User</h2>
          <p>Email: {user.email}</p>
          <p>UID: {user.uid}</p>
        </div>
        <Button 
          onClick={handleSetupAdmin} 
          disabled={loading}
        >
          {loading ? 'Setting up...' : 'Make me an Admin'}
        </Button>
      </div>
    </div>
  );
}

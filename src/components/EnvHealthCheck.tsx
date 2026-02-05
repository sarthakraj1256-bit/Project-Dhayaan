 import { useEffect } from 'react';
 import { toast } from 'sonner';
 import { backendEnvHealthy } from '@/integrations/backend/client';
 
 /**
  * Non-blocking component that shows a toast when backend environment
  * variables are missing (using fallback configuration).
  */
 const EnvHealthCheck = () => {
   useEffect(() => {
     if (!backendEnvHealthy) {
       toast.warning('Using fallback backend configuration', {
         description: 'Environment variables are syncing. Features should still work.',
         duration: 8000,
         id: 'env-health-warning',
       });
     }
   }, []);
 
   return null;
 };
 
 export default EnvHealthCheck;
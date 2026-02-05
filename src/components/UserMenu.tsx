 import { useState } from 'react';
 import { Link, useNavigate } from 'react-router-dom';
 import { User } from '@supabase/supabase-js';
 import { LayoutDashboard, LogOut, ChevronDown } from 'lucide-react';
 import { supabase } from '@/integrations/backend/client';
 import { toast } from 'sonner';
 import {
   DropdownMenu,
   DropdownMenuContent,
   DropdownMenuItem,
   DropdownMenuSeparator,
   DropdownMenuTrigger,
 } from '@/components/ui/dropdown-menu';
 
 interface UserMenuProps {
   user: User;
 }
 
 const UserMenu = ({ user }: UserMenuProps) => {
   const navigate = useNavigate();
   const [isLoggingOut, setIsLoggingOut] = useState(false);
 
   const handleLogout = async () => {
     setIsLoggingOut(true);
     const { error } = await supabase.auth.signOut();
     if (error) {
       toast.error('Failed to sign out');
       setIsLoggingOut(false);
     } else {
       toast.success('Signed out successfully');
       navigate('/');
     }
   };
 
   // Get initials from email
   const getInitials = () => {
     const email = user.email || '';
     return email.slice(0, 2).toUpperCase();
   };
 
   return (
     <DropdownMenu>
       <DropdownMenuTrigger asChild>
         <button
           className="flex items-center gap-2 px-3 py-2 rounded-full transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gold/50"
           style={{
             background: 'hsl(var(--void-light) / 0.6)',
             backdropFilter: 'blur(12px)',
             WebkitBackdropFilter: 'blur(12px)',
             border: '1px solid hsl(var(--gold) / 0.3)',
             boxShadow: '0 0 20px hsl(var(--gold) / 0.1)',
           }}
         >
           {/* Avatar */}
           <div
             className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-display tracking-wider"
             style={{
               background: 'linear-gradient(135deg, hsl(var(--gold) / 0.3), hsl(var(--gold) / 0.1))',
               border: '1px solid hsl(var(--gold) / 0.5)',
               color: 'hsl(var(--gold))',
             }}
           >
             {getInitials()}
           </div>
           <ChevronDown className="w-4 h-4 text-gold" />
         </button>
       </DropdownMenuTrigger>
       <DropdownMenuContent
         align="end"
         className="w-48 bg-void-dark border-gold/30 shadow-xl z-50"
         style={{
           backdropFilter: 'blur(16px)',
           WebkitBackdropFilter: 'blur(16px)',
         }}
       >
         <div className="px-3 py-2 text-xs text-muted-foreground truncate border-b border-gold/20">
           {user.email}
         </div>
         <DropdownMenuItem asChild>
           <Link
             to="/dashboard"
             className="flex items-center gap-2 cursor-pointer text-foreground hover:text-gold focus:text-gold"
           >
             <LayoutDashboard className="w-4 h-4" />
             <span>Dashboard</span>
           </Link>
         </DropdownMenuItem>
         <DropdownMenuSeparator className="bg-gold/20" />
         <DropdownMenuItem
           onClick={handleLogout}
           disabled={isLoggingOut}
           className="flex items-center gap-2 cursor-pointer text-foreground hover:text-destructive focus:text-destructive"
         >
           <LogOut className="w-4 h-4" />
           <span>{isLoggingOut ? 'Signing out...' : 'Sign Out'}</span>
         </DropdownMenuItem>
       </DropdownMenuContent>
     </DropdownMenu>
   );
 };
 
 export default UserMenu;
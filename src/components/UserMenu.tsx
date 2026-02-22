 import { useState, useEffect } from 'react';
 import { Link, useNavigate } from 'react-router-dom';
 import { User } from '@supabase/supabase-js';
 import { LayoutDashboard, LogOut, ChevronDown, UserCircle } from 'lucide-react';
 import { supabase } from '@/integrations/backend/client';
 import { toast } from 'sonner';
 import { useLanguage } from '@/contexts/LanguageContext';
 import {
   DropdownMenu,
   DropdownMenuContent,
   DropdownMenuItem,
   DropdownMenuSeparator,
   DropdownMenuTrigger,
 } from '@/components/ui/dropdown-menu';
 
   import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
 
 interface UserMenuProps {
   user: User;
 }
 
 const UserMenu = ({ user }: UserMenuProps) => {
   const navigate = useNavigate();
   const [isLoggingOut, setIsLoggingOut] = useState(false);
   const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
   const [displayName, setDisplayName] = useState<string | null>(null);
   const { t } = useLanguage();
 
   useEffect(() => {
     const fetchProfile = async () => {
       const { data } = await supabase
         .from('profiles')
         .select('avatar_url, display_name')
         .eq('user_id', user.id)
         .maybeSingle();
       if (data) {
         setAvatarUrl(data.avatar_url);
         setDisplayName(data.display_name);
       }
     };
     fetchProfile();
   }, [user.id]);
 
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
 
   const getInitials = () => {
     if (displayName) {
       return displayName.slice(0, 2).toUpperCase();
     }
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
           <Avatar className="w-8 h-8 border border-gold/50">
             <AvatarImage src={avatarUrl || undefined} />
             <AvatarFallback
               className="text-xs font-display tracking-wider"
               style={{
                 background: 'linear-gradient(135deg, hsl(var(--gold) / 0.3), hsl(var(--gold) / 0.1))',
                 color: 'hsl(var(--gold))',
               }}
             >
               {getInitials()}
             </AvatarFallback>
           </Avatar>
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
           {displayName || user.email}
         </div>
         <DropdownMenuItem asChild>
           <Link
             to="/profile"
             className="flex items-center gap-2 cursor-pointer text-foreground hover:text-gold focus:text-gold"
           >
             <UserCircle className="w-4 h-4" />
             <span>{t('menu.profile')}</span>
           </Link>
         </DropdownMenuItem>
         <DropdownMenuItem asChild>
           <Link
             to="/dashboard"
             className="flex items-center gap-2 cursor-pointer text-foreground hover:text-gold focus:text-gold"
           >
             <LayoutDashboard className="w-4 h-4" />
             <span>{t('menu.dashboard')}</span>
           </Link>
         </DropdownMenuItem>
         <DropdownMenuSeparator className="bg-gold/20" />
         <DropdownMenuItem
           onClick={handleLogout}
           disabled={isLoggingOut}
           className="flex items-center gap-2 cursor-pointer text-foreground hover:text-destructive focus:text-destructive"
         >
           <LogOut className="w-4 h-4" />
           <span>{isLoggingOut ? t('auth.signingOut') : t('auth.signOut')}</span>
         </DropdownMenuItem>
       </DropdownMenuContent>
     </DropdownMenu>
   );
 };
 
 export default UserMenu;

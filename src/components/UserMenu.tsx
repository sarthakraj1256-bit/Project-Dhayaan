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
           className="flex items-center gap-2 px-3 py-2 rounded-full transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary/30 bg-card/80 backdrop-blur-sm border border-border/60 shadow-sm"
         >
           <Avatar className="w-8 h-8 border border-primary/30">
             <AvatarImage src={avatarUrl || undefined} />
             <AvatarFallback
               className="text-xs font-display tracking-wider bg-primary/10 text-primary"
             >
               {getInitials()}
             </AvatarFallback>
           </Avatar>
           <ChevronDown className="w-4 h-4 text-primary" />
         </button>
       </DropdownMenuTrigger>
       <DropdownMenuContent
         align="end"
         className="w-48 bg-card border-border shadow-xl z-50"
       >
         <div className="px-3 py-2 text-xs text-muted-foreground truncate border-b border-border">
           {displayName || user.email}
         </div>
         <DropdownMenuItem asChild>
           <Link
             to="/profile"
             className="flex items-center gap-2 cursor-pointer text-foreground hover:text-primary focus:text-primary"
           >
             <UserCircle className="w-4 h-4" />
             <span>{t('menu.profile')}</span>
           </Link>
         </DropdownMenuItem>
         <DropdownMenuItem asChild>
           <Link
             to="/dashboard"
             className="flex items-center gap-2 cursor-pointer text-foreground hover:text-primary focus:text-primary"
           >
             <LayoutDashboard className="w-4 h-4" />
             <span>{t('menu.dashboard')}</span>
           </Link>
         </DropdownMenuItem>
         <DropdownMenuSeparator className="bg-border" />
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

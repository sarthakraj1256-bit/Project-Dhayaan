 import { useState } from 'react';
 import { Share2, Twitter, Facebook, Linkedin, Copy, Check } from 'lucide-react';
 import { motion, AnimatePresence } from 'framer-motion';
 import {
   Popover,
   PopoverContent,
   PopoverTrigger,
 } from '@/components/ui/popover';
 import { toast } from 'sonner';
 
 interface ShareButtonProps {
   title: string;
   text: string;
   hashtags?: string[];
 }
 
 const ShareButton = ({ title, text, hashtags = ['meditation', 'mindfulness', 'dhyaan'] }: ShareButtonProps) => {
   const [copied, setCopied] = useState(false);
   const [isOpen, setIsOpen] = useState(false);
 
   const shareUrl = typeof window !== 'undefined' ? window.location.origin : '';
   const hashtagString = hashtags.join(',');
 
   const shareLinks = {
     twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}&hashtags=${hashtagString}`,
     facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(text)}`,
     linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}&summary=${encodeURIComponent(text)}`,
   };
 
   const handleCopy = async () => {
     try {
       await navigator.clipboard.writeText(`${text}\n\n${shareUrl}`);
       setCopied(true);
       toast.success('Copied to clipboard!');
       setTimeout(() => setCopied(false), 2000);
     } catch {
       toast.error('Failed to copy');
     }
   };
 
   const handleShare = (platform: keyof typeof shareLinks) => {
     window.open(shareLinks[platform], '_blank', 'width=600,height=400');
     setIsOpen(false);
   };
 
   return (
     <Popover open={isOpen} onOpenChange={setIsOpen}>
       <PopoverTrigger asChild>
         <button
           className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-sm text-muted-foreground hover:text-foreground"
           title="Share your progress"
         >
           <Share2 className="w-4 h-4" />
           <span className="hidden sm:inline">Share</span>
         </button>
       </PopoverTrigger>
       <PopoverContent className="w-56 p-2 bg-void border-white/10" align="end">
         <div className="space-y-1">
           <p className="text-xs text-muted-foreground px-2 py-1">{title}</p>
           
           <button
             onClick={() => handleShare('twitter')}
             className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors text-sm text-foreground"
           >
             <Twitter className="w-4 h-4 text-[#1DA1F2]" />
             <span>Twitter / X</span>
           </button>
           
           <button
             onClick={() => handleShare('facebook')}
             className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors text-sm text-foreground"
           >
             <Facebook className="w-4 h-4 text-[#4267B2]" />
             <span>Facebook</span>
           </button>
           
           <button
             onClick={() => handleShare('linkedin')}
             className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors text-sm text-foreground"
           >
             <Linkedin className="w-4 h-4 text-[#0A66C2]" />
             <span>LinkedIn</span>
           </button>
           
           <div className="border-t border-white/10 my-1" />
           
           <button
             onClick={handleCopy}
             className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors text-sm text-foreground"
           >
             <AnimatePresence mode="wait">
               {copied ? (
                 <motion.div
                   key="check"
                   initial={{ scale: 0 }}
                   animate={{ scale: 1 }}
                   exit={{ scale: 0 }}
                 >
                   <Check className="w-4 h-4 text-emerald-500" />
                 </motion.div>
               ) : (
                 <motion.div
                   key="copy"
                   initial={{ scale: 0 }}
                   animate={{ scale: 1 }}
                   exit={{ scale: 0 }}
                 >
                   <Copy className="w-4 h-4 text-muted-foreground" />
                 </motion.div>
               )}
             </AnimatePresence>
             <span>{copied ? 'Copied!' : 'Copy link'}</span>
           </button>
         </div>
       </PopoverContent>
     </Popover>
   );
 };
 
 export default ShareButton;
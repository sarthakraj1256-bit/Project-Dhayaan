import { useState, useRef, lazy, Suspense } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Send, HandHeart, Upload, CheckCircle2, Clock, Star, Shield, ScrollText, AlertTriangle } from 'lucide-react';
import { PRESET_MANTRAS, type JapRequest } from '@/hooks/useJapBank';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const SpiritualTermsModal = lazy(() => import('./SpiritualTermsModal'));
const SankalpaReceipt = lazy(() => import('./SankalpaReceipt'));

interface JapRequestsProps {
  requests: JapRequest[];
  userId: string | null;
  onCreateRequest: (req: { mantraName: string; requiredCount: number; dedicatedTo?: string; deadline?: string; karmaReward?: number; escrowAmount?: number }) => void;
  onAcceptRequest: (id: string) => void;
  onSubmitProof: (data: { requestId: string; proofType: string; proofUrl: string; notes?: string }) => void;
  onComplete: (data: { requestId: string; rating?: number; feedback?: string }) => void;
  isCreating: boolean;
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  accepted: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  in_progress: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  proof_submitted: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  completed: 'bg-green-500/20 text-green-400 border-green-500/30',
  refunded: 'bg-red-500/20 text-red-400 border-red-500/30',
};

const escrowBadge: Record<string, string> = {
  none: '',
  held: '🔒 In Escrow',
  released: '✅ Released',
  refunded: '↩️ Refunded',
};

const JapRequests = ({ requests, userId, onCreateRequest, onAcceptRequest, onSubmitProof, onComplete, isCreating }: JapRequestsProps) => {
  const [showCreate, setShowCreate] = useState(false);
  const [mantra, setMantra] = useState(PRESET_MANTRAS[0]);
  const [count, setCount] = useState('108');
  const [dedicatedTo, setDedicatedTo] = useState('');
  const [deadline, setDeadline] = useState('');
  const [karma, setKarma] = useState('50');
  const [escrowAmount, setEscrowAmount] = useState('0');
  const [uploadingFor, setUploadingFor] = useState<string | null>(null);
  const [proofNotes, setProofNotes] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const [activeFileRequestId, setActiveFileRequestId] = useState<string | null>(null);

  // Terms modals
  const [showRequesterTerms, setShowRequesterTerms] = useState(false);
  const [showPerformerTerms, setShowPerformerTerms] = useState(false);
  const [pendingAcceptId, setPendingAcceptId] = useState<string | null>(null);

  // Receipt modal
  const [receiptData, setReceiptData] = useState<Record<string, unknown> | null>(null);

  const myRequests = requests.filter(r => r.requester_id === userId);
  const myPerforming = requests.filter(r => r.performer_id === userId);
  const openRequests = requests.filter(r => r.status === 'pending' && r.requester_id !== userId);

  const handleCreateWithTerms = () => {
    if (!mantra || !count) return;
    setShowRequesterTerms(true);
  };

  const handleTermsAccepted = () => {
    setShowRequesterTerms(false);
    onCreateRequest({
      mantraName: mantra,
      requiredCount: parseInt(count),
      dedicatedTo: dedicatedTo || undefined,
      deadline: deadline || undefined,
      karmaReward: parseInt(karma) || 50,
      escrowAmount: parseFloat(escrowAmount) || 0,
    });
    setShowCreate(false);
    setCount('108');
    setDedicatedTo('');
    setDeadline('');
    setKarma('50');
    setEscrowAmount('0');
  };

  const handleAcceptWithTerms = (requestId: string) => {
    setPendingAcceptId(requestId);
    setShowPerformerTerms(true);
  };

  const handlePerformerTermsAccepted = () => {
    setShowPerformerTerms(false);
    if (pendingAcceptId) {
      onAcceptRequest(pendingAcceptId);
      setPendingAcceptId(null);
    }
  };

  const handleFileUpload = async (requestId: string, file: File) => {
    if (!userId) return;
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'video/mp4', 'audio/mpeg', 'audio/mp4'];
    if (!allowedTypes.some(t => file.type.startsWith(t.split('/')[0]))) {
      toast.error('Only MP4 video, JPG/PNG images, or audio files accepted');
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      toast.error('File must be under 50MB');
      return;
    }
    setUploadingFor(requestId);
    try {
      const ext = file.name.split('.').pop();
      const path = `${userId}/${requestId}/${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from('jap-proofs').upload(path, file);
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from('jap-proofs').getPublicUrl(path);
      const proofType = file.type.startsWith('video') ? 'video' : file.type.startsWith('audio') ? 'audio' : 'screenshot';
      onSubmitProof({ requestId, proofType, proofUrl: publicUrl, notes: proofNotes || undefined });
      setProofNotes('');
    } catch (err) {
      console.error(err);
      toast.error('Failed to upload proof');
    } finally {
      setUploadingFor(null);
    }
  };

  const getAutoCompleteCountdown = (autoCompleteAt: string | null): string | null => {
    if (!autoCompleteAt) return null;
    const diff = new Date(autoCompleteAt).getTime() - Date.now();
    if (diff <= 0) return 'Auto-approving soon...';
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `Auto-approval in ${hours}h ${mins}m`;
  };

  const RequestCard = ({ req }: { req: JapRequest }) => {
    const isRequester = req.requester_id === userId;
    const isPerformer = req.performer_id === userId;

    return (
      <Card className="border-primary/20 bg-card/80">
        <CardContent className="p-4 space-y-2">
          <div className="flex justify-between items-start">
            <div>
              <p className="font-semibold text-foreground">{req.mantra_name}</p>
              {req.dedicated_to && <p className="text-xs text-muted-foreground">For: {req.dedicated_to}</p>}
            </div>
            <div className="flex flex-col items-end gap-1">
              <Badge className={statusColors[req.status] || ''} variant="outline">
                {req.status.replace('_', ' ')}
              </Badge>
              {req.escrow_status && req.escrow_status !== 'none' && (
                <span className="text-[10px] text-muted-foreground">
                  {escrowBadge[req.escrow_status]}
                </span>
              )}
            </div>
          </div>

          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{req.required_count.toLocaleString()} chants needed</span>
            <span className="text-primary font-semibold">{req.karma_reward} karma</span>
          </div>

          {req.deadline && (
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="w-3 h-3" /> Due: {new Date(req.deadline).toLocaleDateString()}
            </p>
          )}

          {/* Auto-complete countdown */}
          {req.status === 'proof_submitted' && req.auto_complete_at && (
            <p className="text-xs text-accent flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" /> {getAutoCompleteCountdown(req.auto_complete_at)}
            </p>
          )}

          {/* Sankalpa Receipt button */}
          {req.sankalpa_receipt && (isRequester || isPerformer) && (
            <Button
              size="sm"
              variant="ghost"
              className="w-full text-xs text-primary"
              onClick={() => setReceiptData(req.sankalpa_receipt)}
            >
              <ScrollText className="w-3 h-3 mr-1" /> View Sankalpa Receipt
            </Button>
          )}

          {/* Accept with terms */}
          {req.status === 'pending' && !isRequester && (
            <Button size="sm" onClick={() => handleAcceptWithTerms(req.id)} className="w-full mt-2">
              <HandHeart className="w-4 h-4 mr-1" /> Accept & Chant
            </Button>
          )}

          {/* Proof submission */}
          {(req.status === 'accepted' || req.status === 'in_progress') && isPerformer && (
            <div className="space-y-2 mt-2">
              <div className="p-2 rounded-md text-xs text-muted-foreground bg-muted/40 border border-primary/10">
                <Shield className="w-3 h-3 inline mr-1" />
                Funds will be released once the requester reviews your proof.
              </div>
              <Input
                placeholder="Blessing/dedication note for the requester..."
                value={activeFileRequestId === req.id ? proofNotes : ''}
                onChange={e => { setActiveFileRequestId(req.id); setProofNotes(e.target.value); }}
                maxLength={500}
                className="bg-muted"
              />
              <Button
                size="sm"
                variant="outline"
                className="w-full"
                disabled={uploadingFor === req.id}
                onClick={() => { setActiveFileRequestId(req.id); fileRef.current?.click(); }}
              >
                <Upload className="w-4 h-4 mr-1" />
                {uploadingFor === req.id ? 'Uploading...' : 'Upload Proof (Video/Photo)'}
              </Button>
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,video/mp4,audio/*"
                className="hidden"
                onChange={e => {
                  const file = e.target.files?.[0];
                  if (file && activeFileRequestId) handleFileUpload(activeFileRequestId, file);
                }}
              />
              <p className="text-[10px] text-muted-foreground text-center">
                Accepted: MP4 video, JPG/PNG images, Audio (max 50MB)
              </p>
            </div>
          )}

          {/* Requester review */}
          {req.status === 'proof_submitted' && isRequester && (
            <div className="space-y-2 mt-2">
              <div className="p-2 rounded-md text-xs text-accent bg-accent/10 border border-accent/20">
                🙏 Your Jap Seva is complete. Review the proof and approve to release funds.
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => onComplete({ requestId: req.id, rating: 5 })} className="flex-1">
                  <CheckCircle2 className="w-4 h-4 mr-1" /> Accept Seva
                </Button>
              </div>
            </div>
          )}

          {/* Completed rating */}
          {req.status === 'completed' && req.rating && (
            <div className="flex items-center gap-1 mt-1">
              {Array.from({ length: req.rating }).map((_, i) => (
                <Star key={i} className="w-3 h-3 fill-primary text-primary" />
              ))}
              {req.feedback && <span className="text-xs text-muted-foreground ml-2">{req.feedback}</span>}
            </div>
          )}

          {/* Refunded */}
          {req.status === 'refunded' && (
            <p className="text-xs text-destructive">↩️ Refunded — Performer did not submit proof by deadline.</p>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-4">
      <Button onClick={() => setShowCreate(!showCreate)} className="w-full" variant={showCreate ? 'secondary' : 'default'}>
        <Send className="w-4 h-4 mr-2" />
        {showCreate ? 'Cancel' : 'Create Jap Request'}
      </Button>

      {showCreate && (
        <Card className="border-primary/20 bg-card/80">
          <CardContent className="pt-4 space-y-3">
            <Select value={mantra} onValueChange={setMantra}>
              <SelectTrigger className="bg-muted"><SelectValue /></SelectTrigger>
              <SelectContent>
                {PRESET_MANTRAS.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
              </SelectContent>
            </Select>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground">Chant Count</label>
                <Input type="number" value={count} onChange={e => setCount(e.target.value)} min={1} className="bg-muted" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Karma Reward</label>
                <Input type="number" value={karma} onChange={e => setKarma(e.target.value)} min={10} className="bg-muted" />
              </div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Escrow Amount (optional)</label>
              <Input type="number" value={escrowAmount} onChange={e => setEscrowAmount(e.target.value)} min={0} className="bg-muted" placeholder="0" />
            </div>
            <Input placeholder="Dedicated to... (optional)" value={dedicatedTo} onChange={e => setDedicatedTo(e.target.value)} maxLength={200} className="bg-muted" />
            <Input type="date" value={deadline} onChange={e => setDeadline(e.target.value)} className="bg-muted" />
            <Button onClick={handleCreateWithTerms} disabled={isCreating} className="w-full">
              {isCreating ? 'Creating...' : '🙏 Create Request'}
            </Button>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="open">
        <TabsList className="w-full">
          <TabsTrigger value="open" className="flex-1">Open ({openRequests.length})</TabsTrigger>
          <TabsTrigger value="mine" className="flex-1">My Requests ({myRequests.length})</TabsTrigger>
          <TabsTrigger value="performing" className="flex-1">Performing ({myPerforming.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="open" className="space-y-3 mt-3">
          {openRequests.length === 0 && <p className="text-sm text-muted-foreground text-center py-6">No open requests right now.</p>}
          {openRequests.map(r => <RequestCard key={r.id} req={r} />)}
        </TabsContent>

        <TabsContent value="mine" className="space-y-3 mt-3">
          {myRequests.length === 0 && <p className="text-sm text-muted-foreground text-center py-6">You haven't created any requests.</p>}
          {myRequests.map(r => <RequestCard key={r.id} req={r} />)}
        </TabsContent>

        <TabsContent value="performing" className="space-y-3 mt-3">
          {myPerforming.length === 0 && <p className="text-sm text-muted-foreground text-center py-6">You're not performing any jap.</p>}
          {myPerforming.map(r => <RequestCard key={r.id} req={r} />)}
        </TabsContent>
      </Tabs>

      {/* Terms Modals */}
      <Suspense fallback={null}>
        <SpiritualTermsModal
          open={showRequesterTerms}
          onClose={() => setShowRequesterTerms(false)}
          onAccept={handleTermsAccepted}
          mode="requester"
        />
        <SpiritualTermsModal
          open={showPerformerTerms}
          onClose={() => { setShowPerformerTerms(false); setPendingAcceptId(null); }}
          onAccept={handlePerformerTermsAccepted}
          mode="performer"
        />
      </Suspense>

      {/* Sankalpa Receipt Modal */}
      <Dialog open={!!receiptData} onOpenChange={v => { if (!v) setReceiptData(null); }}>
        <DialogContent className="max-w-sm bg-card border-primary/20 p-0">
          <Suspense fallback={null}>
            {receiptData && (
              <SankalpaReceipt
                receipt={{
                  devotee_name: (receiptData.devotee_name as string) || 'Devotee',
                  mantra: (receiptData.mantra as string) || '',
                  count: (receiptData.count as number) || 0,
                  performer_name: (receiptData.performer_name as string) || null,
                  dedicated_to: (receiptData.dedicated_to as string) || null,
                  deadline: (receiptData.deadline as string) || null,
                  karma_reward: (receiptData.karma_reward as number) || 0,
                  escrow_amount: (receiptData.escrow_amount as number) || 0,
                  created_at: (receiptData.created_at as string) || '',
                  status: (receiptData.status as string) || 'pending',
                }}
              />
            )}
          </Suspense>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default JapRequests;

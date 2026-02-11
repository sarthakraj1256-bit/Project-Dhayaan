import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Send, HandHeart, Upload, CheckCircle2, Clock, Star } from 'lucide-react';
import { PRESET_MANTRAS, type JapRequest } from '@/hooks/useJapBank';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface JapRequestsProps {
  requests: JapRequest[];
  userId: string | null;
  onCreateRequest: (req: { mantraName: string; requiredCount: number; dedicatedTo?: string; deadline?: string; karmaReward?: number }) => void;
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
};

const JapRequests = ({ requests, userId, onCreateRequest, onAcceptRequest, onSubmitProof, onComplete, isCreating }: JapRequestsProps) => {
  const [showCreate, setShowCreate] = useState(false);
  const [mantra, setMantra] = useState(PRESET_MANTRAS[0]);
  const [count, setCount] = useState('108');
  const [dedicatedTo, setDedicatedTo] = useState('');
  const [deadline, setDeadline] = useState('');
  const [karma, setKarma] = useState('50');
  const [uploadingFor, setUploadingFor] = useState<string | null>(null);
  const [proofNotes, setProofNotes] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const myRequests = requests.filter(r => r.requester_id === userId);
  const myPerforming = requests.filter(r => r.performer_id === userId);
  const openRequests = requests.filter(r => r.status === 'pending' && r.requester_id !== userId);

  const handleCreate = () => {
    if (!mantra || !count) return;
    onCreateRequest({
      mantraName: mantra,
      requiredCount: parseInt(count),
      dedicatedTo: dedicatedTo || undefined,
      deadline: deadline || undefined,
      karmaReward: parseInt(karma) || 50,
    });
    setShowCreate(false);
  };

  const handleFileUpload = async (requestId: string, file: File) => {
    if (!userId) return;
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
            <Badge className={statusColors[req.status] || ''} variant="outline">
              {req.status.replace('_', ' ')}
            </Badge>
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

          {/* Actions */}
          {req.status === 'pending' && !isRequester && (
            <Button size="sm" onClick={() => onAcceptRequest(req.id)} className="w-full mt-2">
              <HandHeart className="w-4 h-4 mr-1" /> Accept & Chant
            </Button>
          )}

          {(req.status === 'accepted' || req.status === 'in_progress') && isPerformer && (
            <div className="space-y-2 mt-2">
              <Input
                placeholder="Notes about your session..."
                value={uploadingFor === req.id ? proofNotes : ''}
                onChange={e => { setUploadingFor(req.id); setProofNotes(e.target.value); }}
                maxLength={500}
                className="bg-muted"
              />
              <Button
                size="sm"
                variant="outline"
                className="w-full"
                disabled={uploadingFor === req.id && !proofNotes}
                onClick={() => fileRef.current?.click()}
              >
                <Upload className="w-4 h-4 mr-1" />
                {uploadingFor === req.id ? 'Uploading...' : 'Upload Proof'}
              </Button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*,video/*,audio/*"
                className="hidden"
                onChange={e => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(req.id, file);
                }}
              />
            </div>
          )}

          {req.status === 'proof_submitted' && isRequester && (
            <div className="flex gap-2 mt-2">
              <Button size="sm" onClick={() => onComplete({ requestId: req.id, rating: 5 })} className="flex-1">
                <CheckCircle2 className="w-4 h-4 mr-1" /> Approve & Complete
              </Button>
            </div>
          )}

          {req.status === 'completed' && req.rating && (
            <div className="flex items-center gap-1 mt-1">
              {Array.from({ length: req.rating }).map((_, i) => (
                <Star key={i} className="w-3 h-3 fill-primary text-primary" />
              ))}
            </div>
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
            <Input placeholder="Dedicated to... (optional)" value={dedicatedTo} onChange={e => setDedicatedTo(e.target.value)} maxLength={200} className="bg-muted" />
            <Input type="date" value={deadline} onChange={e => setDeadline(e.target.value)} className="bg-muted" />
            <Button onClick={handleCreate} disabled={isCreating} className="w-full">
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
    </div>
  );
};

export default JapRequests;

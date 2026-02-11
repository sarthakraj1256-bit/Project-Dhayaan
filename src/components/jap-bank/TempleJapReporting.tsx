import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Send, Building2, Clock, Copy, CheckCircle2, Plus, Sparkles, Share2 } from 'lucide-react';
import ShareOfferingModal from './ShareOfferingModal';
import { temples } from '@/data/templeStreams';
import { PRESET_MANTRAS } from '@/hooks/useJapBank';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface TempleReport {
  id: string;
  temple_id: string;
  temple_name: string;
  mantra_name: string;
  chant_count: number;
  dedication: string | null;
  notes: string | null;
  deadline: string | null;
  reference_id: string;
  status: string;
  created_at: string;
  acknowledged_at: string | null;
  blessing_message: string | null;
}

interface TempleJapReportingProps {
  userId: string | null;
}

const TempleJapReporting = ({ userId }: TempleJapReportingProps) => {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [shareReport, setShareReport] = useState<TempleReport | null>(null);
  const [templeId, setTempleId] = useState('');
  const [mantra, setMantra] = useState(PRESET_MANTRAS[0]);
  const [customMantra, setCustomMantra] = useState('');
  const [chantCount, setChantCount] = useState('');
  const [dedication, setDedication] = useState('');
  const [notes, setNotes] = useState('');
  const [deadline, setDeadline] = useState('');

  const templeOptions = temples.map(t => ({ id: t.id, name: t.name, location: t.location }));

  // Auto-acknowledge old submissions on load
  useQuery({
    queryKey: ['auto-acknowledge-temple'],
    queryFn: async () => {
      await supabase.rpc('auto_acknowledge_temple_reports');
      return null;
    },
    enabled: !!userId,
    staleTime: 60000,
  });

  const { data: reports = [] } = useQuery({
    queryKey: ['temple-jap-reports', userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from('temple_jap_reports')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (error) { console.error(error); return []; }
      return data as TempleReport[];
    },
    enabled: !!userId,
  });

  const submitReport = useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error('Not authenticated');
      const selectedTemple = temples.find(t => t.id === templeId);
      if (!selectedTemple) throw new Error('Please select a temple');
      const mantraName = mantra === 'custom' ? customMantra.trim() : mantra;
      if (!mantraName) throw new Error('Please select a mantra');
      const count = parseInt(chantCount);
      if (!count || count <= 0) throw new Error('Please enter a valid chant count');

      const { error } = await supabase.from('temple_jap_reports').insert({
        user_id: userId,
        temple_id: templeId,
        temple_name: selectedTemple.name,
        mantra_name: mantraName,
        chant_count: count,
        dedication: dedication.trim() || null,
        notes: notes.trim() || null,
        deadline: deadline || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['temple-jap-reports', userId] });
      toast.success('🙏 Your Jap offering has been submitted to the temple.');
      setShowForm(false);
      setChantCount('');
      setDedication('');
      setNotes('');
      setDeadline('');
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to submit report'),
  });

  const copyReferenceId = (refId: string) => {
    navigator.clipboard.writeText(refId);
    toast.success('Reference ID copied');
  };

  return (
    <div className="space-y-4">
      <Button onClick={() => setShowForm(!showForm)} className="w-full" variant={showForm ? 'secondary' : 'default'}>
        <Building2 className="w-4 h-4 mr-2" />
        {showForm ? 'Cancel' : 'Offer Jap to Temple'}
      </Button>

      {showForm && (
        <Card className="border-primary/20 bg-card/80">
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-primary font-[Cinzel] flex items-center gap-2">
              🙏 Submit Jap Offering
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Respectfully inform the temple about your completed mantra chanting.
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Temple Selection */}
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Select Temple</label>
              <Select value={templeId} onValueChange={setTempleId}>
                <SelectTrigger className="bg-muted">
                  <SelectValue placeholder="Choose a temple..." />
                </SelectTrigger>
                <SelectContent className="max-h-[200px]">
                  {templeOptions.map(t => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name} — {t.location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Mantra Selection */}
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Mantra</label>
              <Select value={mantra} onValueChange={setMantra}>
                <SelectTrigger className="bg-muted"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PRESET_MANTRAS.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                  <SelectItem value="custom">✏️ Custom Mantra</SelectItem>
                </SelectContent>
              </Select>
              {mantra === 'custom' && (
                <Input
                  placeholder="Enter your mantra..."
                  value={customMantra}
                  onChange={e => setCustomMantra(e.target.value)}
                  maxLength={200}
                  className="bg-muted mt-2"
                />
              )}
            </div>

            {/* Chant Count */}
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Completed Chant Count</label>
              <Input
                type="number"
                placeholder="e.g. 2000"
                value={chantCount}
                onChange={e => setChantCount(e.target.value)}
                min={1}
                max={10000000}
                className="bg-muted text-lg h-12"
              />
            </div>

            {/* Deadline */}
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Submission Deadline (optional)</label>
              <Input type="date" value={deadline} onChange={e => setDeadline(e.target.value)} className="bg-muted" />
            </div>

            {/* Dedication / Sankalp */}
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Dedication / Sankalp Name (optional)</label>
              <Input
                placeholder="e.g. For my family's well-being"
                value={dedication}
                onChange={e => setDedication(e.target.value)}
                maxLength={200}
                className="bg-muted"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Message / Notes (optional)</label>
              <Textarea
                placeholder="Any additional message for the temple..."
                value={notes}
                onChange={e => setNotes(e.target.value)}
                maxLength={500}
                rows={3}
                className="bg-muted resize-none"
              />
            </div>

            <Button
              onClick={() => submitReport.mutate()}
              disabled={submitReport.isPending || !templeId || !chantCount}
              className="w-full"
              size="lg"
            >
              <Send className="w-4 h-4 mr-2" />
              {submitReport.isPending ? 'Submitting Offering...' : '🙏 Submit Offering'}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Submitted Reports */}
      {reports.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-primary flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> Your Offerings
          </h3>
          {reports.map(report => (
            <Card key={report.id} className="border-primary/20 bg-card/80">
              <CardContent className="p-4 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-foreground text-sm">{report.temple_name}</p>
                    <p className="text-xs text-muted-foreground">{report.mantra_name}</p>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={`text-[10px] ${
                      report.status === 'acknowledged' 
                        ? 'bg-primary/10 text-primary border-primary/20' 
                        : 'bg-muted text-muted-foreground border-border'
                    }`}
                  >
                    {report.status === 'acknowledged' ? '✨ Acknowledged' : '⏳ Submitted'}
                  </Badge>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-primary font-bold font-[Cinzel]">{report.chant_count.toLocaleString()} chants</span>
                  {report.deadline && (
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {new Date(report.deadline).toLocaleDateString()}
                    </span>
                  )}
                </div>

                {report.dedication && (
                  <p className="text-xs text-muted-foreground italic">🕉️ {report.dedication}</p>
                )}

                {report.blessing_message && (
                  <div className="rounded-lg bg-primary/5 border border-primary/10 p-3 space-y-1">
                    <p className="text-[10px] font-semibold text-primary flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> Temple Blessing
                    </p>
                    <p className="text-xs text-foreground/80 italic leading-relaxed">
                      {report.blessing_message}
                    </p>
                    {report.acknowledged_at && (
                      <p className="text-[9px] text-muted-foreground/60">
                        Received {new Date(report.acknowledged_at).toLocaleString()}
                      </p>
                    )}
                  </div>
                )}

                <Separator className="bg-primary/10" />

                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground font-mono">
                    Ref: {report.reference_id}
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 px-2 text-[10px]"
                    onClick={() => copyReferenceId(report.reference_id)}
                  >
                    <Copy className="w-3 h-3 mr-1" /> Copy
                  </Button>
                </div>

                <p className="text-[9px] text-muted-foreground/60">
                  Submitted {new Date(report.created_at).toLocaleString()}
                </p>

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-1 h-7 text-[10px] border-primary/20 text-primary hover:bg-primary/10"
                  onClick={() => setShareReport(report)}
                >
                  <Share2 className="w-3 h-3 mr-1" /> Share Offering
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {reports.length === 0 && !showForm && (
        <div className="text-center py-8 space-y-2">
          <Building2 className="w-8 h-8 mx-auto text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">
            No temple offerings yet. Submit your completed chants to a temple.
          </p>
        </div>
      )}

      {/* Share Modal */}
      {shareReport && (
        <ShareOfferingModal
          isOpen={!!shareReport}
          onClose={() => setShareReport(null)}
          title="Share Temple Offering"
          shareText={`🙏 Temple Jap Offering\n\n🏛️ ${shareReport.temple_name}\n📿 ${shareReport.mantra_name}\n🔢 ${shareReport.chant_count.toLocaleString()} chants${shareReport.dedication ? `\n💝 ${shareReport.dedication}` : ''}${shareReport.blessing_message ? `\n\n✨ Blessing: "${shareReport.blessing_message}"` : ''}\n\nRef: ${shareReport.reference_id}`}
        >
          <Card className="border-primary/30 bg-gradient-to-b from-card to-card/80 overflow-hidden">
            <div
              className="px-4 py-3 text-center"
              style={{
                background: 'linear-gradient(135deg, hsl(var(--gold) / 0.2), hsl(var(--primary) / 0.15))',
                borderBottom: '1px solid hsl(var(--gold) / 0.3)',
              }}
            >
              <p className="text-[10px] uppercase tracking-[0.2em] text-primary/70">🏛️ Temple Offering</p>
              <h3 className="text-base font-bold text-primary font-[Cinzel] mt-1">{shareReport.temple_name}</h3>
            </div>
            <CardContent className="p-4 space-y-2">
              <p className="text-sm text-foreground">{shareReport.mantra_name}</p>
              <p className="text-lg font-bold text-primary font-[Cinzel]">{shareReport.chant_count.toLocaleString()} chants</p>
              {shareReport.dedication && <p className="text-xs italic text-muted-foreground">🕉️ {shareReport.dedication}</p>}
              {shareReport.blessing_message && (
                <div className="rounded-lg bg-primary/5 border border-primary/10 p-3 mt-2">
                  <p className="text-[10px] font-semibold text-primary flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Temple Blessing
                  </p>
                  <p className="text-xs text-foreground/80 italic">{shareReport.blessing_message}</p>
                </div>
              )}
              <p className="text-[9px] text-center text-muted-foreground/60 font-mono mt-2">Ref: {shareReport.reference_id}</p>
              <p className="text-[9px] text-center text-muted-foreground/60 italic">"सर्वे भवन्तु सुखिनः"</p>
            </CardContent>
          </Card>
        </ShareOfferingModal>
      )}
    </div>
  );
};

export default TempleJapReporting;

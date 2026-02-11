import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Shield, BookOpen } from 'lucide-react';

interface SpiritualTermsModalProps {
  open: boolean;
  onClose: () => void;
  onAccept: () => void;
  mode: 'requester' | 'performer';
}

const SpiritualTermsModal = ({ open, onClose, onAccept, mode }: SpiritualTermsModalProps) => {
  const [accepted, setAccepted] = useState(false);

  const handleAccept = () => {
    if (!accepted) return;
    onAccept();
    setAccepted(false);
  };

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) onClose(); }}>
      <DialogContent className="max-w-md bg-card border-primary/20">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-primary font-[Cinzel]">
            {mode === 'requester' ? (
              <><Shield className="w-5 h-5" /> Spiritual Service Terms</>
            ) : (
              <><BookOpen className="w-5 h-5" /> Performer Certification</>
            )}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[50vh] pr-4">
          {mode === 'requester' ? (
            <div className="space-y-4 text-sm text-muted-foreground">
              <section>
                <h4 className="font-semibold text-foreground mb-1">🏛️ Platform Role</h4>
                <p>Dhyaan acts solely as an intermediary platform connecting Requesters with Performers (Priests/Devotees). Performers are independent contractors, not employees of Dhyaan.</p>
              </section>

              <section>
                <h4 className="font-semibold text-foreground mb-1">🔒 Escrow & Proof System</h4>
                <p>Your deposit is held in Spiritual Escrow until the Performer submits proof and you approve it. You have a <strong>48-hour verification window</strong> to review the proof. If no action is taken, the system will automatically mark the request as completed and release the funds.</p>
              </section>

              <section>
                <h4 className="font-semibold text-foreground mb-1">🙏 Spiritual Disclaimer</h4>
                <p>Dhyaan provides a platform for the physical act of chanting and mantra repetition. The platform makes <strong>no claims, warranties, or guarantees</strong> regarding the spiritual, medical, or life-altering outcomes of any chanting performed. The "success" of a Jap is subjective and rests between the user and their faith.</p>
              </section>

              <section>
                <h4 className="font-semibold text-foreground mb-1">💰 Refund & Cancellation</h4>
                <ul className="list-disc list-inside space-y-1">
                  <li><strong>Non-Performance:</strong> 100% refund if Performer fails to submit proof by the deadline.</li>
                  <li><strong>Quality:</strong> Refunds are not issued based on "spiritual quality" if physical proof is provided.</li>
                  <li><strong>Cancellation:</strong> Requests cannot be cancelled once a Performer has accepted and started.</li>
                </ul>
              </section>

              <section>
                <h4 className="font-semibold text-foreground mb-1">📜 Code of Conduct</h4>
                <p>Any use of the platform for non-spiritual, political, or offensive purposes will result in an immediate permanent ban and forfeiture of funds.</p>
              </section>
            </div>
          ) : (
            <div className="space-y-4 text-sm text-muted-foreground">
              <section>
                <h4 className="font-semibold text-foreground mb-1">🙏 Performer Certification</h4>
                <p>By accepting this Jap Seva, I hereby certify and commit to the following:</p>
              </section>

              <section>
                <h4 className="font-semibold text-foreground mb-1">✅ Proof Requirements</h4>
                <ul className="list-disc list-inside space-y-1">
                  <li>I will provide <strong>authentic proof</strong> of chanting as per the guidelines.</li>
                  <li>Proof must include a <strong>video snippet</strong> (15s minimum) of the Sankalpa or final count, <strong>or</strong> a clear photo of the Jap counter/mala.</li>
                  <li>I will complete the requested count within the specified deadline.</li>
                </ul>
              </section>

              <section>
                <h4 className="font-semibold text-foreground mb-1">🕉️ Code of Conduct</h4>
                <ul className="list-disc list-inside space-y-1">
                  <li>I will maintain a <strong>clean and respectful environment</strong> while recording proof.</li>
                  <li>I will chant with <strong>sincerity and devotion</strong>.</li>
                  <li>I understand that fraudulent proof will result in an <strong>immediate ban</strong> and forfeiture of earnings.</li>
                </ul>
              </section>

              <section>
                <h4 className="font-semibold text-foreground mb-1">💰 Payment Terms</h4>
                <p>Funds are held in Spiritual Escrow and will only be released once the Requester approves my submitted proof, or after the 48-hour auto-approval window.</p>
              </section>
            </div>
          )}
        </ScrollArea>

        <DialogFooter className="flex-col gap-3 sm:flex-col">
          <div className="flex items-start gap-2">
            <Checkbox
              id="terms-accept"
              checked={accepted}
              onCheckedChange={v => setAccepted(v === true)}
              className="mt-0.5"
            />
            <label htmlFor="terms-accept" className="text-xs text-muted-foreground cursor-pointer leading-tight">
              {mode === 'requester'
                ? 'I agree to the Dhyaan Spiritual Service Terms and the Escrow Policy.'
                : 'I certify that I will provide authentic proof of chanting as per the guidelines.'}
            </label>
          </div>
          <Button onClick={handleAccept} disabled={!accepted} className="w-full">
            {mode === 'requester' ? '🙏 Accept & Proceed' : '🙏 Accept & Start Seva'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SpiritualTermsModal;

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ScrollText, User, BookOpen, Clock, Heart } from 'lucide-react';

interface SankalpaReceiptProps {
  receipt: {
    devotee_name: string;
    mantra: string;
    count: number;
    performer_name: string | null;
    dedicated_to: string | null;
    deadline: string | null;
    karma_reward: number;
    escrow_amount: number;
    created_at: string;
    status: string;
  };
}

const SankalpaReceipt = ({ receipt }: SankalpaReceiptProps) => {
  return (
    <Card className="border-primary/30 bg-gradient-to-b from-card to-card/80 overflow-hidden">
      {/* Header with saffron/gold gradient */}
      <div
        className="px-4 py-3 text-center"
        style={{
          background: 'linear-gradient(135deg, hsl(var(--gold) / 0.2), hsl(var(--primary) / 0.15))',
          borderBottom: '1px solid hsl(var(--gold) / 0.3)',
        }}
      >
        <p className="text-[10px] uppercase tracking-[0.2em] text-primary/70">
          ॐ Sankalpa Receipt ॐ
        </p>
        <h3 className="text-lg font-bold text-primary font-[Cinzel] mt-1">
          Dhyaan Spiritual Seva
        </h3>
      </div>

      <CardContent className="p-4 space-y-3">
        {/* Devotee */}
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-primary flex-shrink-0" />
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Devotee</p>
            <p className="text-sm font-semibold text-foreground">{receipt.devotee_name || 'Devotee'}</p>
          </div>
        </div>

        <Separator className="bg-primary/10" />

        {/* Mantra & Count */}
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-primary flex-shrink-0" />
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Mantra & Count</p>
            <p className="text-sm font-semibold text-foreground">{receipt.mantra}</p>
            <p className="text-xs text-primary font-bold">{receipt.count.toLocaleString()} chants</p>
          </div>
        </div>

        {receipt.dedicated_to && (
          <>
            <Separator className="bg-primary/10" />
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-accent flex-shrink-0" />
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Dedicated To</p>
                <p className="text-sm text-foreground">{receipt.dedicated_to}</p>
              </div>
            </div>
          </>
        )}

        <Separator className="bg-primary/10" />

        {/* Performer */}
        <div className="flex items-center gap-2">
          <ScrollText className="w-4 h-4 text-primary flex-shrink-0" />
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Performer</p>
            <p className="text-sm text-foreground">{receipt.performer_name || 'Awaiting assignment...'}</p>
          </div>
        </div>

        {receipt.deadline && (
          <>
            <Separator className="bg-primary/10" />
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary flex-shrink-0" />
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Estimated Completion</p>
                <p className="text-sm text-foreground">{new Date(receipt.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              </div>
            </div>
          </>
        )}

        {/* Footer */}
        <div
          className="mt-2 p-3 rounded-lg text-center"
          style={{ background: 'hsl(var(--gold) / 0.08)', border: '1px dashed hsl(var(--gold) / 0.3)' }}
        >
          <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">Karma Offering</p>
          <p className="text-xl font-bold text-primary font-[Cinzel]">{receipt.karma_reward} Karma</p>
          <Badge variant="outline" className="mt-1 text-[10px] border-primary/30 text-primary">
            {receipt.status === 'pending' ? 'In Escrow' : receipt.status.replace('_', ' ')}
          </Badge>
        </div>

        <p className="text-[9px] text-center text-muted-foreground/60 italic mt-2">
          "सर्वे भवन्तु सुखिनः" — May all beings be happy
        </p>
      </CardContent>
    </Card>
  );
};

export default SankalpaReceipt;

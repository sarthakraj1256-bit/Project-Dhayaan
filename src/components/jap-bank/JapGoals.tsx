import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Target, Plus, CheckCircle2 } from 'lucide-react';
import RadialProgress from './RadialProgress';
import { PRESET_MANTRAS, type JapGoal } from '@/hooks/useJapBank';

interface JapGoalsProps {
  goals: JapGoal[];
  onCreateGoal: (goal: { mantraName: string; targetCount: number; deadline?: string; dedication?: string }) => void;
  isCreating: boolean;
}

const JapGoals = ({ goals, onCreateGoal, isCreating }: JapGoalsProps) => {
  const [showForm, setShowForm] = useState(false);
  const [mantra, setMantra] = useState(PRESET_MANTRAS[0]);
  const [customMantra, setCustomMantra] = useState('');
  const [target, setTarget] = useState('108');
  const [deadline, setDeadline] = useState('');
  const [dedication, setDedication] = useState('');

  const handleCreate = () => {
    const name = mantra === 'custom' ? customMantra.trim() : mantra;
    if (!name || !target) return;
    onCreateGoal({
      mantraName: name,
      targetCount: parseInt(target),
      deadline: deadline || undefined,
      dedication: dedication || undefined,
    });
    setShowForm(false);
    setTarget('108');
    setDeadline('');
    setDedication('');
  };

  const activeGoals = goals.filter(g => g.status === 'active');
  const completedGoals = goals.filter(g => g.status === 'completed');

  return (
    <div className="space-y-4">
      <Button onClick={() => setShowForm(!showForm)} className="w-full" variant={showForm ? 'secondary' : 'default'}>
        <Plus className="w-4 h-4 mr-2" />
        {showForm ? 'Cancel' : 'Create Jap Goal'}
      </Button>

      {showForm && (
        <Card className="border-primary/20 bg-card/80">
          <CardContent className="pt-4 space-y-3">
            <Select value={mantra} onValueChange={setMantra}>
              <SelectTrigger className="bg-muted"><SelectValue /></SelectTrigger>
              <SelectContent>
                {PRESET_MANTRAS.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                <SelectItem value="custom">✏️ Custom</SelectItem>
              </SelectContent>
            </Select>
            {mantra === 'custom' && (
              <Input placeholder="Custom mantra..." value={customMantra} onChange={e => setCustomMantra(e.target.value)} maxLength={200} className="bg-muted" />
            )}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground">Target Count</label>
                <Select value={target} onValueChange={setTarget}>
                  <SelectTrigger className="bg-muted"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {['108', '500', '1000', '5000', '10000', '100000'].map(v => (
                      <SelectItem key={v} value={v}>{parseInt(v).toLocaleString()}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Deadline</label>
                <Input type="date" value={deadline} onChange={e => setDeadline(e.target.value)} className="bg-muted" />
              </div>
            </div>
            <Input placeholder="Dedicated to... (optional)" value={dedication} onChange={e => setDedication(e.target.value)} maxLength={200} className="bg-muted" />
            <Button onClick={handleCreate} disabled={isCreating} className="w-full">
              {isCreating ? 'Creating...' : '🎯 Set Goal'}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Active Goals */}
      {activeGoals.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-primary flex items-center gap-2">
            <Target className="w-4 h-4" /> Active Goals
          </h3>
          {activeGoals.map(g => {
            const pct = (g.current_count / g.target_count) * 100;
            return (
              <Card key={g.id} className="border-primary/20 bg-card/80">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <RadialProgress
                      percentage={pct}
                      current={g.current_count}
                      target={g.target_count}
                    />
                    <div className="flex-1 min-w-0 space-y-1">
                      <p className="font-semibold text-foreground truncate">{g.mantra_name}</p>
                      {g.dedication && <p className="text-xs text-muted-foreground truncate">For: {g.dedication}</p>}
                      <p className="text-xs text-muted-foreground">
                        {g.current_count.toLocaleString()} / {g.target_count.toLocaleString()} chants
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {g.deadline ? `Due: ${new Date(g.deadline).toLocaleDateString()}` : 'No deadline'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Completed Goals */}
      {completedGoals.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-accent flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> Completed Goals
          </h3>
          {completedGoals.map(g => (
            <Card key={g.id} className="border-accent/20 bg-card/80 opacity-80">
              <CardContent className="p-4">
                <div className="flex justify-between">
                  <div>
                    <p className="font-semibold text-foreground">{g.mantra_name}</p>
                    <p className="text-xs text-accent">✅ {g.target_count.toLocaleString()} chants completed</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {goals.length === 0 && !showForm && (
        <p className="text-center text-muted-foreground text-sm py-6">No goals yet. Create one to track your spiritual journey! 🎯</p>
      )}
    </div>
  );
};

export default JapGoals;

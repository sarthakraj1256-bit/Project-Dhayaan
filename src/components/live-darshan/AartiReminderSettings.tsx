import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, 
  BellOff, 
  Clock, 
  X, 
  Plus, 
  Trash2, 
  Sun, 
  Moon,
  TestTube,
  Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogDescription 
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useAartiReminders } from '@/hooks/useAartiReminders';

const AartiReminderSettings = () => {
  const {
    morningReminder,
    eveningReminder,
    customReminders,
    notificationsEnabled,
    permissionGranted,
    toggleNotifications,
    updateMorningReminder,
    updateEveningReminder,
    addCustomReminder,
    removeCustomReminder,
    testNotification
  } = useAartiReminders();

  const [isOpen, setIsOpen] = useState(false);
  const [newReminderName, setNewReminderName] = useState('');
  const [newReminderTime, setNewReminderTime] = useState('12:00');

  const handleAddCustomReminder = () => {
    if (!newReminderName.trim()) return;
    
    addCustomReminder({
      name: newReminderName,
      time: newReminderTime,
      enabled: true
    });
    
    setNewReminderName('');
    setNewReminderTime('12:00');
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button className="w-9 h-9 rounded-full flex items-center justify-center bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
          {notificationsEnabled ? (
            <Bell className="w-5 h-5 text-primary" />
          ) : (
            <BellOff className="w-5 h-5 text-muted-foreground" />
          )}
        </button>
      </DialogTrigger>

      <DialogContent className="max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display">
            <Bell className="w-5 h-5 text-primary" />
            Aarati Reminders
          </DialogTitle>
          <DialogDescription>
            Get notified for morning and evening Aarati times
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Master Toggle */}
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border border-border">
            <div className="flex items-center gap-3">
              {notificationsEnabled ? (
                <Bell className="w-5 h-5 text-primary" />
              ) : (
                <BellOff className="w-5 h-5 text-muted-foreground" />
              )}
              <div>
                <p className="font-medium text-foreground">Enable Notifications</p>
                <p className="text-xs text-muted-foreground">
                  {permissionGranted ? 'Notifications allowed' : 'Permission required'}
                </p>
              </div>
            </div>
            <Switch
              checked={notificationsEnabled}
              onCheckedChange={toggleNotifications}
            />
          </div>

          <AnimatePresence>
            {notificationsEnabled && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4"
              >
                {/* Morning Reminder */}
                <div className="p-4 rounded-lg border border-border space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sun className="w-4 h-4 text-amber-500" />
                      <span className="font-medium">Morning Aarati</span>
                    </div>
                    <Switch
                      checked={morningReminder.enabled}
                      onCheckedChange={(enabled) => updateMorningReminder({ enabled })}
                    />
                  </div>
                  
                  {morningReminder.enabled && (
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <Input
                        type="time"
                        value={morningReminder.time}
                        onChange={(e) => updateMorningReminder({ time: e.target.value })}
                        className="w-32 bg-background"
                      />
                      <span className="text-sm text-muted-foreground">
                        ({formatTime12h(morningReminder.time)})
                      </span>
                    </div>
                  )}
                </div>

                {/* Evening Reminder */}
                <div className="p-4 rounded-lg border border-border space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Moon className="w-4 h-4 text-indigo-400" />
                      <span className="font-medium">Evening Aarati</span>
                    </div>
                    <Switch
                      checked={eveningReminder.enabled}
                      onCheckedChange={(enabled) => updateEveningReminder({ enabled })}
                    />
                  </div>
                  
                  {eveningReminder.enabled && (
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <Input
                        type="time"
                        value={eveningReminder.time}
                        onChange={(e) => updateEveningReminder({ time: e.target.value })}
                        className="w-32 bg-background"
                      />
                      <span className="text-sm text-muted-foreground">
                        ({formatTime12h(eveningReminder.time)})
                      </span>
                    </div>
                  )}
                </div>

                {/* Custom Reminders */}
                {customReminders.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-muted-foreground">Custom Reminders</h4>
                    {customReminders.map((reminder) => (
                      <div 
                        key={reminder.id}
                        className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/30"
                      >
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-primary" />
                          <span className="text-sm">{reminder.name}</span>
                          <Badge variant="secondary" className="text-xs">
                            {formatTime12h(reminder.time)}
                          </Badge>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeCustomReminder(reminder.id)}
                          className="h-8 w-8 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add Custom Reminder */}
                <div className="p-4 rounded-lg border border-dashed border-border space-y-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Plus className="w-4 h-4" />
                    <span>Add Custom Reminder</span>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Reminder name..."
                      value={newReminderName}
                      onChange={(e) => setNewReminderName(e.target.value)}
                      className="flex-1 bg-background"
                    />
                    <Input
                      type="time"
                      value={newReminderTime}
                      onChange={(e) => setNewReminderTime(e.target.value)}
                      className="w-28 bg-background"
                    />
                    <Button
                      size="icon"
                      onClick={handleAddCustomReminder}
                      disabled={!newReminderName.trim()}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Test Notification */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={testNotification}
                  className="w-full gap-2"
                >
                  <TestTube className="w-4 h-4" />
                  Send Test Notification
                </Button>

                {/* Info */}
                <p className="text-xs text-muted-foreground text-center">
                  Notifications will appear when you have Dhyaan open in your browser.
                  Keep the tab open to receive reminders.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Helper function to format time in 12-hour format
function formatTime12h(time: string): string {
  const [hours, minutes] = time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const hours12 = hours % 12 || 12;
  return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
}

export default AartiReminderSettings;

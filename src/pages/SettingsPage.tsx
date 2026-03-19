import { useNavigate } from 'react-router-dom';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import {
  User, Bell, Shield, CircleDot, HelpCircle, LogOut,
  ChevronRight, Smartphone, Moon,
} from 'lucide-react';

const settingsGroups = [
  {
    label: 'Account',
    items: [
      { icon: User, label: 'Profile', path: '#' },
      { icon: Bell, label: 'Notifications', path: '#' },
      { icon: Shield, label: 'Privacy', path: '#' },
    ],
  },
  {
    label: 'Device',
    items: [
      { icon: CircleDot, label: 'Ring Settings', path: '#' },
      { icon: Smartphone, label: 'Connected Devices', path: '#' },
      { icon: Moon, label: 'Sleep Tracking', path: '#' },
    ],
  },
  {
    label: 'Support',
    items: [
      { icon: HelpCircle, label: 'Help & FAQ', path: '#' },
    ],
  },
];

export default function SettingsPage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <MobileLayout>
      <div className="px-4 pt-6 pb-4 space-y-6 max-w-lg mx-auto">
        <h1 className="text-xl font-bold text-foreground">Settings</h1>

        {/* User card */}
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {user?.user_metadata?.full_name || user?.email || 'User'}
              </p>
              <p className="text-2xs text-muted-foreground truncate">{user?.email}</p>
            </div>
          </CardContent>
        </Card>

        {/* Settings Groups */}
        {settingsGroups.map((group) => (
          <div key={group.label}>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 px-1">
              {group.label}
            </p>
            <Card>
              <CardContent className="p-0 divide-y divide-border">
                {group.items.map((item) => (
                  <button
                    key={item.label}
                    className="w-full flex items-center gap-3 p-3.5 hover:bg-muted/50 transition-colors text-left"
                  >
                    <item.icon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-foreground flex-1">{item.label}</span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </button>
                ))}
              </CardContent>
            </Card>
          </div>
        ))}

        {/* Sign Out */}
        <Button variant="ghost" className="w-full gap-2 text-destructive" onClick={handleSignOut}>
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>

        <p className="text-center text-2xs text-muted-foreground pb-4">
          Smart Ring Companion v1.0.0
        </p>
      </div>
    </MobileLayout>
  );
}

import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, CircleDot, Activity, Map, Settings } from 'lucide-react';

const tabs = [
  { label: 'Home', path: '/home', icon: Home },
  { label: 'Ring', path: '/ring', icon: CircleDot },
  { label: 'Activity', path: '/activity', icon: Activity },
  { label: 'Map', path: '/map', icon: Map },
  { label: 'Settings', path: '/settings', icon: Settings },
];

export function MobileLayout({ children }: { children: ReactNode }) {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-1 overflow-auto safe-bottom">{children}</main>

      {/* Bottom Tab Bar */}
      <nav className="tab-bar">
        <div className="flex items-center justify-around px-2 py-2">
          {tabs.map((tab) => {
            const active = location.pathname === tab.path || 
              (tab.path === '/home' && location.pathname === '/');
            return (
              <Link
                key={tab.path}
                to={tab.path}
                className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all duration-200 min-w-[56px] ${
                  active
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <tab.icon className={`h-5 w-5 transition-transform ${active ? 'scale-110' : ''}`} />
                <span className="text-2xs font-medium">{tab.label}</span>
                {active && (
                  <div className="absolute bottom-1 w-1 h-1 rounded-full bg-primary" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

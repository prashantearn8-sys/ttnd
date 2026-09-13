import React from 'react';
import { LayoutDashboard, CalendarCheck, UploadCloud, Settings } from 'lucide-react';
import { motion } from 'motion/react';

export type NavTab = 'home' | 'day' | 'upload' | 'account';

interface BottomNavBarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  dayBadgeCount?: number;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  currentTab,
  onSelectTab,
  dayBadgeCount = 4,
}) => {
  const tabs = [
    {
      id: 'home' as NavTab,
      label: 'Home',
      icon: LayoutDashboard,
    },
    {
      id: 'day' as NavTab,
      label: 'Day',
      icon: CalendarCheck,
      badge: dayBadgeCount,
    },
    {
      id: 'upload' as NavTab,
      label: 'Upload',
      icon: UploadCloud,
    },
    {
      id: 'account' as NavTab,
      label: 'Settings',
      icon: Settings,
    },
  ];

  return (
    <nav
      id="bottom-navigation-bar"
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-md border-t border-slate-200/80 shadow-[0_-4px_20px_rgba(0,0,0,0.02)]"
    >
      <div className="max-w-md mx-auto px-4 py-2 flex items-center justify-around">
        {tabs.map((tab) => {
          const isActive = currentTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              id={`nav-tab-${tab.id}`}
              type="button"
              onClick={() => onSelectTab(tab.id)}
              className="relative flex flex-col items-center justify-center py-2 px-3.5 min-w-[66px] rounded-2xl transition-all cursor-pointer group"
            >
              {/* Active aesthetic pill */}
              {isActive && (
                <motion.div
                  layoutId="activeNavBubble"
                  className="absolute inset-0 bg-slate-900 rounded-2xl -z-10 shadow-xs"
                  transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                />
              )}

              <div className="relative">
                <Icon
                  className={`w-4.5 h-4.5 transition-colors duration-150 ${
                    isActive ? 'text-white stroke-[2.25]' : 'text-slate-400 group-hover:text-slate-600 stroke-[1.75]'
                  }`}
                />
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span
                    className={`absolute -top-1 -right-2.5 w-4 h-4 rounded-full text-[9px] font-round font-bold flex items-center justify-center shadow-2xs ${
                      isActive ? 'bg-amber-400 text-slate-950' : 'bg-rose-500 text-white'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </div>

              <span
                className={`text-[10px] mt-1 transition-colors font-round ${
                  isActive ? 'font-bold text-white' : 'font-medium text-slate-400 group-hover:text-slate-600'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

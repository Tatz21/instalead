import React from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Users, MapPin, PenTool, Settings, 
  MessageCircleMore, Zap, Sun, Moon, Rocket, ShieldCheck, ChevronRight 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/', tour: 'dashboard' },
  { icon: Users, label: 'Leads', path: '/leads', tour: 'leads' },
  { icon: Rocket, label: 'Finder', path: '/finder', tour: 'finder' },
  { icon: PenTool, label: 'AI Writer', path: '/ai-writer', tour: 'writer' },
  { icon: ShieldCheck, label: 'Automation', path: '/automation', tour: 'automation' },
  { icon: MessageCircleMore, label: 'Chat', path: '/chat', tour: 'chat' },
  { icon: Settings, label: 'Settings', path: '/settings', tour: 'settings' },
];

interface LayoutProps {
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export default function Layout({ theme, onToggleTheme }: LayoutProps) {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = React.useState(() => {
    const saved = localStorage.getItem('sidebar-collapsed');
    return saved === 'true';
  });

  const toggleCollapse = () => {
    setIsCollapsed(prev => {
      const next = !prev;
      localStorage.setItem('sidebar-collapsed', String(next));
      return next;
    });
  };

  return (
    <div className={cn(
      "min-h-screen bg-background pb-20 md:pb-0 transition-all duration-300 ease-in-out",
      isCollapsed ? "md:pl-20" : "md:pl-64"
    )}>
      {/* Desktop Sidebar */}
      <aside className={cn(
        "hidden md:flex flex-col fixed left-0 top-0 bottom-0 border-r border-border bg-card/50 backdrop-blur-xl p-4 transition-all duration-300 ease-in-out z-40",
        isCollapsed ? "w-20" : "w-64"
      )}>
        <div className="flex items-center justify-between mb-12 h-10 px-2">
          {!isCollapsed ? (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3 group"
            >
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 transition-transform group-hover:scale-110">
                <MapPin className="text-primary-foreground w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <h1 className="text-lg font-black tracking-tighter leading-none italic uppercase">GoogleLead</h1>
                <span className="text-[10px] font-bold text-primary tracking-[0.2em] uppercase">Intelligence</span>
              </div>
            </motion.div>
          ) : (
            <div className="w-full flex justify-center">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                <MapPin className="text-primary-foreground w-6 h-6" />
              </div>
            </div>
          )}
        </div>
        
        <nav className="flex-1 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              data-tour={item.tour}
              title={isCollapsed ? item.label : undefined}
              className={({ isActive }: { isActive: boolean }) => cn(
                "flex items-center rounded-xl transition-all duration-300 relative group overflow-hidden h-11",
                isCollapsed ? "justify-center px-0" : "px-4 gap-3",
                isActive 
                  ? "text-primary font-bold bg-primary/10" 
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
              )}
            >
              {({ isActive }) => (
                <>
                  <item.icon className={cn(
                    "w-5 h-5 transition-transform duration-300 shrink-0",
                    isActive ? "scale-110" : "group-hover:scale-110"
                  )} />
                  <AnimatePresence>
                    {!isCollapsed && (
                      <motion.span 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="text-sm tracking-tight whitespace-nowrap"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                  {isActive && (
                    <motion.div 
                      layoutId="active-pill"
                      className="absolute left-0 w-1 h-5 bg-primary rounded-r-full"
                    />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className={cn(
          "mt-auto pt-4 border-t border-border/50",
          isCollapsed ? "px-0 space-y-4" : "px-2 space-y-4"
        )}>
          {/* New-age Theme Toggle */}
          {!isCollapsed ? (
            <div className="relative p-1 bg-secondary/50 rounded-xl border border-border/50 flex items-center h-10">
              <motion.div 
                layout
                className="absolute bg-primary shadow-lg shadow-primary/20 rounded-lg z-0 w-[calc(50%-4px)] h-8"
                initial={false}
                animate={{
                  x: theme === 'dark' ? "calc(100% + 0px)" : 0,
                }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
              
              <button
                onClick={() => theme === 'dark' && onToggleTheme()}
                className={cn(
                  "relative z-10 flex-1 flex items-center justify-center rounded-lg transition-colors duration-300 h-8",
                  theme !== 'dark' ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Sun className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => theme !== 'dark' && onToggleTheme()}
                className={cn(
                  "relative z-10 flex-1 flex items-center justify-center rounded-lg transition-colors duration-300 h-8",
                  theme === 'dark' ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Moon className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex justify-center">
              <button 
                onClick={onToggleTheme}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-secondary/50 border border-border/50 text-muted-foreground hover:text-primary hover:border-primary/30 transition-all group relative overflow-hidden"
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={theme}
                    initial={{ y: 15, opacity: 0, rotate: -45 }}
                    animate={{ y: 0, opacity: 1, rotate: 0 }}
                    exit={{ y: -15, opacity: 0, rotate: 45 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    {theme === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                  </motion.div>
                </AnimatePresence>
              </button>
            </div>
          )}

          {/* New-age Collapse Toggle */}
          <button 
            onClick={toggleCollapse}
            className={cn(
              "w-full flex items-center rounded-xl transition-all duration-300 group hover:bg-primary/5 border border-transparent hover:border-primary/20 h-10",
              isCollapsed ? "justify-center px-0" : "px-3 gap-3"
            )}
          >
            <div className={cn(
              "w-8 h-8 rounded-lg bg-accent/50 flex items-center justify-center transition-all duration-500 group-hover:bg-primary/10 group-hover:rotate-180",
              isCollapsed && "rotate-180"
            )}>
              <ChevronRight className={cn(
                "w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors",
                !isCollapsed && "rotate-180"
              )} />
            </div>
            {!isCollapsed && (
              <span className="font-bold text-[10px] uppercase tracking-[0.2em] text-muted-foreground group-hover:text-foreground">
                Terminal Lock
              </span>
            )}
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-card/80 backdrop-blur-lg border-t border-border flex items-center justify-around px-4 z-50">
        {navItems.slice(0, 4).map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }: { isActive: boolean }) => cn(
              "flex flex-col items-center justify-center gap-1 transition-all duration-200",
              isActive ? "text-primary" : "text-muted-foreground"
            )}
          >
            {({ isActive }) => (
              <>
                <item.icon className={cn("w-6 h-6", isActive && "scale-110")} />
                <span className="text-[10px] font-medium">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
        <button 
          onClick={onToggleTheme}
          className="flex flex-col items-center justify-center gap-1 text-muted-foreground"
        >
          {theme === 'dark' ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
          <span className="text-[10px] font-medium">Theme</span>
        </button>
      </nav>

      {/* Main Content */}
      <main className="p-4 md:p-8 max-w-7xl mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

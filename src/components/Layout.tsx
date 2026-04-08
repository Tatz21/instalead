import React from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, MapPin, PenTool, Settings, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/', tour: 'dashboard' },
  { icon: Users, label: 'Leads', path: '/leads', tour: 'leads' },
  { icon: MapPin, label: 'Finder', path: '/finder', tour: 'finder' },
  { icon: PenTool, label: 'AI Writer', path: '/ai-writer', tour: 'writer' },
  { icon: MessageCircle, label: 'Chat', path: '/chat', tour: 'chat' },
  { icon: Settings, label: 'Settings', path: '/settings', tour: 'settings' },
];

export default function Layout() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0 md:pl-64">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col fixed left-0 top-0 bottom-0 w-64 border-r border-border bg-card p-6">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
            <MapPin className="text-primary-foreground w-6 h-6" />
          </div>
          <h1 className="text-xl font-display font-bold tracking-tight">GoogleLead AI</h1>
        </div>
        
        <nav className="flex-1 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              data-tour={item.tour}
              className={({ isActive }: { isActive: boolean }) => cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                isActive 
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-card/80 backdrop-blur-lg border-t border-border flex items-center justify-around px-4 z-50">
        {navItems.map((item) => (
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

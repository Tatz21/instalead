import React from 'react';
import { motion } from 'motion/react';
import { MapPin, PenTool, Users, ArrowRight, CheckCircle2, Chrome, Zap, Shield, BarChart3 } from 'lucide-react';
import { cn } from '../lib/utils';

export default function LandingPage({ onGetStarted }: { onGetStarted: () => void }) {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <MapPin className="text-primary-foreground w-5 h-5" />
            </div>
            <span className="text-xl font-display font-bold tracking-tight">GoogleLead AI</span>
          </div>
          <button 
            onClick={onGetStarted}
            className="bg-primary text-primary-foreground px-5 py-2 rounded-full font-bold text-sm hover:scale-105 transition-all shadow-lg shadow-primary/20"
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative"
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-[10px] font-black mb-12 tracking-[0.3em] uppercase border border-primary/20">
              Intelligence System v2.0
            </span>
            <div className="relative group">
              <h1 className="text-6xl md:text-[10rem] font-black tracking-tighter mb-8 leading-[0.8] uppercase italic mix-blend-difference">
                Extract <br />
                <span className="text-primary not-italic">Value.</span>
              </h1>
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/20 blur-3xl rounded-full group-hover:bg-primary/40 transition-colors animate-pulse" />
            </div>
            
            <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-tight font-medium tracking-tight">
              Turn the world's largest business database into a <span className="text-foreground border-b-2 border-primary">stream of high-quality leads</span> using autonomous AI discovery.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <button 
                onClick={onGetStarted}
                className="group relative w-full sm:w-auto px-10 py-5 bg-primary text-primary-foreground rounded-full font-black text-xl flex items-center justify-center gap-3 hover:scale-105 transition-all shadow-[0_20px_50px_rgba(99,102,241,0.3)] overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                <span className="relative z-10">START EXTRACTION</span>
                <ArrowRight className="relative z-10 w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="w-full sm:w-auto px-10 py-5 bg-secondary/50 backdrop-blur-md text-foreground border border-border rounded-full font-black text-xl hover:bg-secondary transition-all">
                VIEW REEL
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="mt-20 relative"
          >
            <div className="absolute -inset-4 bg-primary/20 blur-3xl rounded-full opacity-50"></div>
            <div className="relative glass-dark rounded-[2rem] border border-white/10 overflow-hidden shadow-2xl shadow-black/50 aspect-video md:aspect-[21/9] flex items-center justify-center">
              <div className="flex flex-col items-center gap-4">
                <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center animate-pulse">
                  <Zap className="w-10 h-10 text-primary" />
                </div>
                <p className="text-muted-foreground font-medium">Interactive Dashboard Preview</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-accent/30">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">Everything you need to scale</h2>
            <p className="text-muted-foreground">Powerful tools designed for modern sales teams.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: 'Lead Discovery',
                desc: 'Search Google Maps by keywords and location to find local businesses instantly.',
                icon: MapPin,
                color: 'text-blue-500'
              },
              {
                title: 'AI Lead Scoring',
                desc: 'Our AI analyzes ratings, reviews, and categories to find your best prospects.',
                icon: BarChart3,
                color: 'text-purple-500'
              },
              {
                title: 'Smart Outreach',
                desc: 'Generate personalized emails and scripts that actually get replies.',
                icon: PenTool,
                color: 'text-pink-500'
              },
              {
                title: 'CRM Management',
                desc: 'Keep track of every conversation and lead status in one central place.',
                icon: Users,
                color: 'text-green-500'
              },
              {
                title: 'Task Reminders',
                desc: 'Never miss a follow-up with automated task reminders and notifications.',
                icon: Zap,
                color: 'text-yellow-500'
              },
              {
                title: 'Secure & Private',
                desc: 'Your data is encrypted and stored securely using Firebase infrastructure.',
                icon: Shield,
                color: 'text-indigo-500'
              }
            ].map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-card border border-border p-8 rounded-3xl hover:border-primary/50 transition-all group"
              >
                <div className={cn("w-12 h-12 rounded-2xl bg-accent flex items-center justify-center mb-6 group-hover:scale-110 transition-transform", feature.color)}>
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-10">Trusted by agencies and sales teams worldwide</p>
          <div className="flex flex-wrap justify-center items-center gap-12 opacity-50 grayscale">
            <Chrome className="w-10 h-10" />
            <MapPin className="w-10 h-10" />
            <Zap className="w-10 h-10" />
            <Zap className="w-10 h-10" />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto bg-primary rounded-[3rem] p-12 text-center text-primary-foreground relative overflow-hidden shadow-2xl shadow-primary/40">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative z-10">
            <h2 className="text-4xl font-display font-bold mb-6">Ready to find your next client?</h2>
            <p className="text-primary-foreground/80 mb-10 text-lg max-w-xl mx-auto">
              Join thousands of businesses using GoogleLead AI to automate their growth.
            </p>
            <button 
              onClick={onGetStarted}
              className="px-10 py-4 bg-white text-primary rounded-2xl font-bold text-lg hover:scale-105 transition-all"
            >
              Get Started Now
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-primary flex items-center justify-center">
              <MapPin className="text-primary-foreground w-4 h-4" />
            </div>
            <span className="font-display font-bold tracking-tight">GoogleLead AI</span>
          </div>
          <p className="text-sm text-muted-foreground">© 2026 GoogleLead AI. Built for growth.</p>
          <div className="flex gap-6 text-sm font-medium text-muted-foreground">
            <a href="#" className="hover:text-primary">Privacy</a>
            <a href="#" className="hover:text-primary">Terms</a>
            <a href="#" className="hover:text-primary">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

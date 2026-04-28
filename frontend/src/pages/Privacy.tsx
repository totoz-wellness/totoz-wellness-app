/**
 * ============================================
 * PRIVACY POLICY PAGE — TOTOZ WELLNESS
 * ============================================
 * @version     1.0.0
 * @description Human-centered, trust-first privacy policy
 * ============================================
 */

import React, { useEffect, useRef, useState } from 'react';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';

// ─── FADE-IN HOOK ────────────────────────────────────────────────────────────

function useFadeIn(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);
  return { ref, visible };
}

const Reveal: React.FC<{ children: React.ReactNode; className?: string; delay?: number }> = ({
  children, className = '', delay = 0,
}) => {
  const { ref, visible } = useFadeIn();
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

// ─── ICONS ───────────────────────────────────────────────────────────────────

const IconShield = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);
const IconEye = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);
const IconDatabase = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
    <ellipse cx="12" cy="5" rx="9" ry="3" />
    <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
    <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
  </svg>
);
const IconSettings = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);
const IconUsers = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);
const IconChild = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
    <circle cx="12" cy="7" r="4" />
    <path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
  </svg>
);
const IconShare = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
    <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
  </svg>
);
const IconLock = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);
const IconKey = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
    <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
  </svg>
);
const IconCookie = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
    <circle cx="12" cy="12" r="10" />
    <path d="M8 14s1.5 2 4 2 4-2 4-2" />
    <line x1="9" y1="9" x2="9.01" y2="9" /><line x1="15" y1="9" x2="15.01" y2="9" />
  </svg>
);
const IconRefresh = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
    <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" />
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
  </svg>
);
const IconMail = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);
const IconCheck = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const IconMask = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
    <path d="M12 2C6.48 2 2 5.58 2 10v2c0 4.42 4.48 8 10 8s10-3.58 10-8v-2C22 5.58 17.52 2 12 2z"/>
    <path d="M8 12s1 2 4 2 4-2 4-2"/>
    <circle cx="9" cy="9" r="1" fill="currentColor"/><circle cx="15" cy="9" r="1" fill="currentColor"/>
  </svg>
);

// ─── DATA ────────────────────────────────────────────────────────────────────

const glanceItems = [
  { text: 'We collect only what we need to serve you well', accent: '#e9924b' },
  { text: 'We do not sell your data — ever', accent: '#659ec3' },
  { text: 'We protect your identity, especially in anonymous spaces', accent: '#e9924b' },
  { text: 'Children\'s safety is our highest priority', accent: '#1e3a6e' },
  { text: 'You have real control over your information', accent: '#659ec3' },
  { text: 'We are transparent about how data is used', accent: '#1e3a6e' },
];

interface PolicySection {
  id: string;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  accent: string;
  content: React.ReactNode;
}

// ─── SECTION LABEL ───────────────────────────────────────────────────────────

const SectionLabel: React.FC<{ children: React.ReactNode; light?: boolean }> = ({ children, light }) => (
  <div className="flex items-center gap-3 mb-4">
    <div className="h-px w-8 bg-[#e9924b]" />
    <span className="text-[#e9924b] text-xs font-semibold tracking-[0.2em] uppercase">{children}</span>
  </div>
);

// ─── POLICY CARD ─────────────────────────────────────────────────────────────

const PolicyCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  accent: string;
  children: React.ReactNode;
  delay?: number;
  light?: boolean;
}> = ({ icon, title, subtitle, accent, children, delay = 0, light = true }) => {
  const [open, setOpen] = useState(false);

  return (
    <Reveal delay={delay}>
      <div
        className={`rounded-3xl overflow-hidden border transition-all duration-300 ${
          light
            ? 'bg-white border-[#1e3a6e]/8 shadow-sm hover:shadow-md'
            : 'bg-white/5 border-white/10 hover:bg-white/8'
        }`}
      >
        {/* Header — always visible */}
        <div
          className="p-7 cursor-pointer select-none"
          onClick={() => setOpen(!open)}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              {/* Icon */}
              <div
                className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{ backgroundColor: accent + '18', color: accent }}
              >
                {icon}
              </div>
              {/* Text */}
              <div>
                <h3 className={`font-heading font-extrabold text-lg mb-1 ${light ? 'text-[#1e3a6e]' : 'text-white'}`}>
                  {title}
                </h3>
                <p className={`text-sm leading-relaxed ${light ? 'text-[#1e3a6e]/55' : 'text-white/50'}`}>
                  {subtitle}
                </p>
              </div>
            </div>
            {/* Chevron */}
            <div
              className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-transform duration-300 mt-1 ${open ? 'rotate-180' : ''}`}
              style={{ backgroundColor: accent + '18', color: accent }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>
          </div>
        </div>

        {/* Expandable content */}
        <div className={`overflow-hidden transition-all duration-500 ${open ? 'max-h-[600px]' : 'max-h-0'}`}>
          <div className={`px-7 pb-7 border-t ${light ? 'border-[#1e3a6e]/8' : 'border-white/8'}`}>
            <div className={`pt-5 text-sm leading-relaxed space-y-3 ${light ? 'text-[#1e3a6e]/65' : 'text-white/60'}`}>
              {children}
            </div>
          </div>
        </div>
      </div>
    </Reveal>
  );
};

// ─── HERO ────────────────────────────────────────────────────────────────────

const Hero: React.FC = () => {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => { const t = setTimeout(() => setLoaded(true), 80); return () => clearTimeout(t); }, []);

  return (
    <section className="relative pt-32 pb-20 md:pb-28 overflow-hidden bg-[#1e3a6e] mt-16 sm:mt-20">
      {/* Blobs */}
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-[#659ec3]/15 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-[#e9924b]/10 blur-3xl pointer-events-none" />
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '28px 28px' }}
      />

      <div
        className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 lg:px-20 transition-all duration-1000"
        style={{ opacity: loaded ? 1 : 0, transform: loaded ? 'translateY(0)' : 'translateY(24px)' }}
      >
        {/* Icon badge */}
        <div className="flex items-center gap-3 mb-8">
          <div className="h-px w-10 bg-[#e9924b]" />
          <span className="text-[#e9924b] text-xs font-semibold tracking-[0.2em] uppercase">Privacy Policy</span>
        </div>

        <div className="max-w-2xl">
          <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-[1.08] mb-6">
            Your privacy<br />
            <span className="text-[#e9924b]">matters here.</span>
          </h1>
          <p className="text-white/65 text-base md:text-lg leading-relaxed mb-8 max-w-xl"
            style={{ opacity: loaded ? 1 : 0, transition: 'opacity 1s ease', transitionDelay: '200ms' }}
          >
            We are committed to protecting your information and creating a safe space for every child and caregiver who comes to Totoz Wellness.
          </p>

          {/* Last updated */}
          <div
            className="inline-flex items-center gap-2 bg-white/10 border border-white/15 rounded-full px-4 py-2 text-white/60 text-xs"
            style={{ opacity: loaded ? 1 : 0, transition: 'opacity 1s ease', transitionDelay: '350ms' }}
          >
            <div className="w-2 h-2 rounded-full bg-[#e9924b]" />
            Last updated: January 2025
          </div>
        </div>
      </div>
    </section>
  );
};

// ─── AT A GLANCE ─────────────────────────────────────────────────────────────

const AtAGlance: React.FC = () => (
  <section className="py-16 md:py-20 bg-[#f0f6fb]">
    <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
      <Reveal>
        <div className="bg-white rounded-3xl border border-[#1e3a6e]/8 shadow-sm overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-5">
            {/* Left label panel */}
            <div className="lg:col-span-2 bg-[#1e3a6e] p-8 md:p-10 flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-5">
                <div className="h-px w-8 bg-[#e9924b]" />
                <span className="text-[#e9924b] text-xs font-semibold tracking-[0.2em] uppercase">Quick summary</span>
              </div>
              <h2 className="font-heading text-2xl md:text-3xl font-extrabold text-white leading-tight mb-4">
                Privacy at<br />a Glance
              </h2>
              <p className="text-white/50 text-sm leading-relaxed">
                Before the details, here is what you need to know most. Simple, plain, honest.
              </p>
              <div className="mt-6 flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#e9924b]/20 flex items-center justify-center text-[#e9924b]">
                  <IconShield />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">We protect</p>
                  <p className="text-white/45 text-xs">Your data and identity</p>
                </div>
              </div>
            </div>

            {/* Right — checklist */}
            <div className="lg:col-span-3 p-8 md:p-10">
              <div className="space-y-4">
                {glanceItems.map((item, i) => (
                  <Reveal key={i} delay={i * 60}>
                    <div className="flex items-center gap-4">
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: item.accent }}
                      >
                        <span className="text-white"><IconCheck /></span>
                      </div>
                      <p className="text-[#1e3a6e]/75 text-sm leading-relaxed">{item.text}</p>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Reveal>
    </div>
  </section>
);

// ─── POLICY SECTIONS (LIGHT BG) ──────────────────────────────────────────────

const PolicySectionsLight: React.FC = () => (
  <section className="py-16 md:py-20 bg-[#fbfbfb]">
    <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
      <Reveal>
        <SectionLabel>What we collect & why</SectionLabel>
        <h2 className="font-heading text-2xl md:text-3xl font-extrabold text-[#1e3a6e] leading-tight mb-10">
          Detailed information — clearly explained.
        </h2>
      </Reveal>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

        <PolicyCard
          icon={<IconDatabase />}
          title="Information We Collect"
          subtitle="Only what we genuinely need to serve you."
          accent="#e9924b"
          delay={0}
        >
          <p>We collect three types of information:</p>
          <div className="space-y-3 mt-2">
            <div className="bg-[#fef6ee] rounded-xl p-4">
              <p className="font-semibold text-[#1e3a6e] text-sm mb-1">Personal information</p>
              <p>If you choose to create an account, we may collect your name and email address. This is entirely optional for some features.</p>
            </div>
            <div className="bg-[#f0f6fb] rounded-xl p-4">
              <p className="font-semibold text-[#1e3a6e] text-sm mb-1">Content you share</p>
              <p>Questions, stories, and comments you post on the platform. Some features allow anonymous posting — in those cases, no identifying information is attached to your content.</p>
            </div>
            <div className="bg-[#f0f6fb] rounded-xl p-4">
              <p className="font-semibold text-[#1e3a6e] text-sm mb-1">Usage data</p>
              <p>General information about how people use the platform — which pages are visited, what resources are most helpful. This is used to improve what we offer.</p>
            </div>
          </div>
          <p className="mt-2 text-[#1e3a6e]/50 text-xs italic">We never require sensitive information. If you choose to share personal experiences, that is your choice.</p>
        </PolicyCard>

        <PolicyCard
          icon={<IconSettings />}
          title="How We Use Your Information"
          subtitle="Data is used to help you — never to exploit you."
          accent="#659ec3"
          delay={80}
        >
          <p>Everything we collect serves a clear purpose:</p>
          <ul className="space-y-2 mt-3">
            {[
              'To operate and improve the platform so it works better for caregivers and children',
              'To respond to questions and support users who reach out to us',
              'To ensure the safety and wellbeing of everyone on the platform through moderation',
              'To improve our educational content, tools, and resources based on what people actually need',
              'To analyze usage patterns and make the platform more useful over time',
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#659ec3] mt-1.5 flex-shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 bg-[#f0f6fb] rounded-xl p-4">
            <p className="font-semibold text-[#1e3a6e] text-sm">What we will never do</p>
            <p className="mt-1">We will never use your data for targeted advertising, selling your information to third parties, or any purpose that doesn't directly serve your wellbeing.</p>
          </div>
        </PolicyCard>

        <PolicyCard
          icon={<IconMask />}
          title="Anonymity & Community Safety"
          subtitle="Your identity is yours to protect — we help you do that."
          accent="#e9924b"
          delay={160}
        >
          <div className="bg-[#fef6ee] rounded-xl p-4 mb-4">
            <p className="font-semibold text-[#e9924b] text-sm mb-1">Anonymous posting is supported</p>
            <p>Some spaces on Totoz allow you to share questions and experiences without revealing who you are. We take this seriously.</p>
          </div>
          <p>When you post anonymously:</p>
          <ul className="space-y-2 mt-2">
            {[
              'Your name or account details are not attached to your content',
              'Other users cannot identify you from your post',
              'We still moderate content to ensure community safety — but identity remains protected',
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#e9924b] mt-1.5 flex-shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4">Our community spaces are moderated to prevent harm, harassment, or misuse. Safety and anonymity work together — not against each other.</p>
        </PolicyCard>

        <PolicyCard
          icon={<IconChild />}
          title="Children's Privacy"
          subtitle="Extra protection for the people this platform is built to serve."
          accent="#1e3a6e"
          delay={240}
        >
          <div className="bg-[#f0f4ff] rounded-xl p-4 mb-4 border border-[#1e3a6e]/15">
            <p className="font-semibold text-[#1e3a6e] text-sm mb-1">This is our highest priority</p>
            <p>Totoz Wellness is designed around the wellbeing of children. Their safety — including their privacy — shapes every decision we make.</p>
          </div>
          <ul className="space-y-2">
            {[
              'We do not intentionally collect personal information from children without caregiver knowledge',
              'Content involving children is handled with the greatest sensitivity',
              'Our platform is designed to support caregivers — not to engage children directly in data collection',
              "If we become aware that a child's data has been collected without appropriate consent, we take immediate steps to remove it",
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#1e3a6e] mt-1.5 flex-shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </PolicyCard>

      </div>
    </div>
  </section>
);

// ─── POLICY SECTIONS (DARK BG) ───────────────────────────────────────────────

const PolicySectionsDark: React.FC = () => (
  <section className="py-16 md:py-20 bg-[#1e3a6e] relative overflow-hidden">
    <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-[#659ec3]/10 blur-3xl pointer-events-none" />
    <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-[#e9924b]/8 blur-3xl pointer-events-none" />

    <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
      <Reveal>
        <div className="flex items-center gap-3 mb-4">
          <div className="h-px w-8 bg-[#e9924b]" />
          <span className="text-[#e9924b] text-xs font-semibold tracking-[0.2em] uppercase">Security & Control</span>
        </div>
        <h2 className="font-heading text-2xl md:text-3xl font-extrabold text-white leading-tight mb-10">
          Your rights and our responsibilities.
        </h2>
      </Reveal>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

        <PolicyCard
          icon={<IconShare />}
          title="Data Sharing"
          subtitle="We do not sell your data. Full stop."
          accent="#e9924b"
          delay={0}
          light={false}
        >
          <p>We are explicit about this: <strong className="text-white/80">your data is never sold to any third party.</strong></p>
          <p className="mt-3">The only circumstances in which we may share information are:</p>
          <div className="space-y-3 mt-3">
            <div className="bg-white/5 rounded-xl p-4 border border-white/8">
              <p className="font-semibold text-white/80 text-sm mb-1">Legal requirements</p>
              <p>If we are legally required to share information — such as by court order — we will comply with the law. We will inform you when permitted.</p>
            </div>
            <div className="bg-white/5 rounded-xl p-4 border border-white/8">
              <p className="font-semibold text-white/80 text-sm mb-1">Safety concerns</p>
              <p>If we become aware of an immediate risk to someone's safety — especially a child — we may take necessary action and involve appropriate authorities.</p>
            </div>
            <div className="bg-white/5 rounded-xl p-4 border border-white/8">
              <p className="font-semibold text-white/80 text-sm mb-1">Service providers</p>
              <p>We may work with trusted technical service providers (such as hosting services). These partners are bound by confidentiality and may not use your data for their own purposes.</p>
            </div>
          </div>
        </PolicyCard>

        <PolicyCard
          icon={<IconLock />}
          title="Data Security"
          subtitle="We protect your data responsibly and honestly."
          accent="#659ec3"
          delay={80}
          light={false}
        >
          <p>We take data security seriously and use appropriate technical measures to protect the information on our platform.</p>
          <ul className="space-y-2 mt-3">
            {[
              'Encrypted data transmission where applicable',
              'Secure storage practices for account information',
              'Access controls to limit who can view sensitive data internally',
              'Regular review of our security practices as we grow',
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#659ec3] mt-1.5 flex-shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 bg-white/5 rounded-xl p-4 border border-white/8">
            <p className="font-semibold text-white/70 text-sm mb-1">An honest note</p>
            <p>No digital system is 100% secure. We will not over-promise. What we will do is work continuously to improve our practices and respond quickly to any incident.</p>
          </div>
        </PolicyCard>

        <PolicyCard
          icon={<IconKey />}
          title="Your Rights"
          subtitle="You have real control over your information."
          accent="#e9924b"
          delay={160}
          light={false}
        >
          <p>You have rights over the data you've provided to us. You can exercise them at any time:</p>
          <div className="space-y-3 mt-3">
            {[
              { right: 'Access your data', desc: 'Request a summary of what information we hold about you.' },
              { right: 'Update your information', desc: 'Correct or update any personal details associated with your account.' },
              { right: 'Delete your account', desc: 'Request that your account and associated data be removed from our systems.' },
              { right: 'Withdraw consent', desc: 'If you\'ve agreed to something, you can change your mind. We will respect that.' },
            ].map((item, i) => (
              <div key={i} className="bg-white/5 rounded-xl p-4 border border-white/8">
                <p className="font-semibold text-white/80 text-sm mb-1">{item.right}</p>
                <p>{item.desc}</p>
              </div>
            ))}
          </div>
          <p className="mt-3 text-white/45 text-xs">To exercise any of these rights, contact us at privacy@totoзwellness.org</p>
        </PolicyCard>

        <PolicyCard
          icon={<IconCookie />}
          title="Cookies & Tracking"
          subtitle="Minimal, purposeful, and transparent."
          accent="#659ec3"
          delay={240}
          light={false}
        >
          <p>We use cookies — small files stored in your browser — only where necessary to make the platform work properly.</p>
          <div className="space-y-3 mt-3">
            <div className="bg-white/5 rounded-xl p-4 border border-white/8">
              <p className="font-semibold text-white/80 text-sm mb-1">Essential cookies</p>
              <p>Required for the platform to function — things like keeping you logged in. You cannot opt out of these without affecting functionality.</p>
            </div>
            <div className="bg-white/5 rounded-xl p-4 border border-white/8">
              <p className="font-semibold text-white/80 text-sm mb-1">Analytics cookies</p>
              <p>Help us understand how the platform is used in aggregate — no personal profiles. You can opt out of these at any time.</p>
            </div>
          </div>
          <p className="mt-3">We do not use advertising cookies or third-party tracking for marketing purposes.</p>
        </PolicyCard>

      </div>
    </div>
  </section>
);

// ─── UPDATES & CONTACT ───────────────────────────────────────────────────────

const UpdatesAndContact: React.FC = () => (
  <section className="py-16 md:py-20 bg-[#fbfbfb]">
    <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

        {/* Policy changes */}
        <Reveal>
          <div className="bg-white rounded-3xl border border-[#1e3a6e]/8 shadow-sm p-8 h-full">
            <div className="w-11 h-11 rounded-2xl bg-[#e9924b]/12 text-[#e9924b] flex items-center justify-center mb-5">
              <IconRefresh />
            </div>
            <h3 className="font-heading font-extrabold text-[#1e3a6e] text-xl mb-3">Changes to This Policy</h3>
            <p className="text-[#1e3a6e]/60 text-sm leading-relaxed mb-4">
              As Totoz Wellness grows, this policy may be updated to reflect new features, legal requirements, or improvements in how we protect your data.
            </p>
            <ul className="space-y-2 text-[#1e3a6e]/60 text-sm">
              {[
                'We will post the updated policy on this page with a new date',
                'For significant changes, we will notify registered users directly',
                'Continued use of the platform means acceptance of the updated policy',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#e9924b] mt-1.5 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <div className="mt-6 bg-[#fef6ee] rounded-xl px-4 py-3">
              <p className="text-[#e9924b] text-xs font-semibold">Current version: January 2025</p>
            </div>
          </div>
        </Reveal>

        {/* Contact */}
        <Reveal delay={100}>
          <div className="bg-[#1e3a6e] rounded-3xl p-8 h-full flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-[#659ec3]/10 blur-2xl pointer-events-none" />
            <div className="relative z-10">
              <div className="w-11 h-11 rounded-2xl bg-[#e9924b]/20 text-[#e9924b] flex items-center justify-center mb-5">
                <IconMail />
              </div>
              <h3 className="font-heading font-extrabold text-white text-xl mb-3">Privacy Questions?</h3>
              <p className="text-white/60 text-sm leading-relaxed mb-6">
                If you have any questions, concerns, or requests about your privacy — we are here and we will respond. This is not a dead-end contact form.
              </p>

              <div className="space-y-3">
                <div className="bg-white/8 border border-white/10 rounded-2xl p-4 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#e9924b]/20 flex items-center justify-center flex-shrink-0">
                    <IconMail />
                  </div>
                  <div>
                    <p className="text-white/45 text-xs">Email us</p>
                    <p className="text-white font-semibold text-sm">privacy@totozwellness.org</p>
                  </div>
                </div>
                <div className="bg-white/8 border border-white/10 rounded-2xl p-4 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#659ec3]/20 flex items-center justify-center flex-shrink-0 text-[#659ec3]">
                    <IconUsers />
                  </div>
                  <div>
                    <p className="text-white/45 text-xs">Response time</p>
                    <p className="text-white font-semibold text-sm">Within 5 business days</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative z-10 mt-6">
              <a
                href="mailto:privacy@totozwellness.org"
                className="block w-full text-center bg-[#e9924b] text-white font-bold py-3 px-6 rounded-full text-sm hover:bg-[#d4762a] transition-all hover:-translate-y-0.5 hover:shadow-lg"
              >
                Contact Privacy Team
              </a>
            </div>
          </div>
        </Reveal>
      </div>
    </div>
  </section>
);

// ─── TRUST BANNER ────────────────────────────────────────────────────────────

const TrustBanner: React.FC = () => (
  <section className="relative py-16 md:py-20 overflow-hidden">
    <div
      className="absolute inset-0 bg-cover bg-center"
      style={{ backgroundImage: `url('https://images.unsplash.com/photo-1536337005238-94b997371b40?w=1800&auto=format&fit=crop&q=70')` }}
    />
    <div className="absolute inset-0 bg-[#e9924b]/93" />
    <div
      className="absolute inset-0 opacity-[0.04]"
      style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '24px 24px' }}
    />

    <Reveal>
      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
          {[
            {
              icon: <IconShield />,
              title: 'Built on trust',
              body: 'Privacy is not a legal formality for us — it is a core part of what makes Totoz a safe space.',
            },
            {
              icon: <IconChild />,
              title: 'Children first',
              body: 'Every policy decision is made with children\'s safety and dignity as the primary consideration.',
            },
            {
              icon: <IconEye />,
              title: 'Always transparent',
              body: 'We say what we do and do what we say. No hidden practices, no confusing language.',
            },
          ].map((item, i) => (
            <Reveal key={i} delay={i * 80}>
              <div className="flex flex-col md:flex-row items-center md:items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white/20 text-white flex items-center justify-center flex-shrink-0">
                  {item.icon}
                </div>
                <div>
                  <h3 className="font-heading font-extrabold text-white text-base mb-2">{item.title}</h3>
                  <p className="text-white/75 text-sm leading-relaxed">{item.body}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </Reveal>
  </section>
);

// ─── PAGE ────────────────────────────────────────────────────────────────────

const Privacy: React.FC = () => {
  return (
    <div className="bg-[#fbfbfb] overflow-x-hidden min-h-screen">
      <Navbar />
      <main>
        <Hero />
        <AtAGlance />
        <PolicySectionsLight />
        <PolicySectionsDark />
        <UpdatesAndContact />
        <TrustBanner />
      </main>
      <Footer />
    </div>
  );
};

export default Privacy;
/**
 * ============================================
 * FEATURES PAGE — TOTOZ WELLNESS
 * ============================================
 * @version     6.0.0
 * @updated     2025-04-23
 * @description Section-based product experience page
 * ============================================
 */

import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';

// ─── INLINE SVG ICONS ────────────────────────────────────────────────────────
// Using inline SVGs so we have full control over sizing & colour

const IconTalkEasy = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    <path d="M8 10h.01M12 10h.01M16 10h.01" />
  </svg>
);

const IconGrowTrack = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </svg>
);

const IconLearnWell = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
  </svg>
);

const IconConnectCare = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const IconParentCircle = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
    <circle cx="12" cy="12" r="10" />
    <path d="M8.56 2.75c4.37 6.03 6.02 9.42 8.03 17.72m2.54-15.38c-3.72 4.35-8.94 5.66-16.88 5.85m19.5 1.9c-3.5-.93-6.63-.82-8.94 0-2.58.92-5.01 2.86-7.44 6.32" />
  </svg>
);

const IconKidsCorner = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
    <path d="M12 2a5 5 0 1 0 0 10A5 5 0 0 0 12 2z" />
    <path d="M6.5 17.5C7.5 15 9.5 13.5 12 13.5s4.5 1.5 5.5 4M3 21h18" />
  </svg>
);

const IconArrow = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
);

// ─── DATA ─────────────────────────────────────────────────────────────────────

const coreTools = [
  {
    icon: <IconTalkEasy />,
    name: 'TalkEasy',
    tagline: 'AI-powered caregiver support',
    description: 'Navigate difficult emotional conversations with real-time, empathetic AI guidance. Available whenever you need it.',
    action: '/talkeasy',
    accent: '#e9924b',
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=900&auto=format&fit=crop&q=70',
  },
  {
    icon: <IconGrowTrack />,
    name: 'GrowTrack',
    tagline: 'Mood and behaviour tracking',
    description: 'Log moods, observe patterns, and understand your child\'s emotional landscape with clarity over time.',
    action: '/growtrack',
    accent: '#659ec3',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=900&auto=format&fit=crop&q=70',
  },
  {
    icon: <IconLearnWell />,
    name: 'LearnWell',
    tagline: 'Curated resource library',
    description: 'Articles, guides, and expert-backed insights organized for caregivers and educators — practical, not overwhelming.',
    action: '/learnwell',
    accent: '#1e3a6e',
    image: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=900&auto=format&fit=crop&q=70',
  },
];

const supportingTools = [
  {
    icon: <IconConnectCare />,
    name: 'ConnectCare',
    tagline: 'Professional referrals',
    description: 'When families need deeper support, ConnectCare connects them to verified mental health professionals.',
    action: '/connectcare',
    accent: '#e9924b',
  },
  {
    icon: <IconParentCircle />,
    name: 'ParentCircle',
    tagline: 'Peer community',
    description: 'A space for caregivers to share experiences, ask questions, and find support from people who understand.',
    action: '/parentcircle',
    accent: '#659ec3',
  },
  {
    icon: <IconKidsCorner />,
    name: 'Kids Corner',
    tagline: 'For children',
    description: 'Gentle, age-appropriate activities that help children understand and name their emotions through play.',
    action: '/kids-corner',
    accent: '#1e3a6e',
  },
];

const systemValues = [
  {
    number: '01',
    title: 'Guided conversations',
    body: 'TalkEasy helps caregivers navigate real, difficult moments — not hypothetical ones.',
  },
  {
    number: '02',
    title: 'Visible patterns',
    body: 'GrowTrack turns scattered observations into a clear picture of a child\'s emotional world.',
  },
  {
    number: '03',
    title: 'Contextual knowledge',
    body: 'LearnWell surfaces the right information at the right moment, without the noise.',
  },
  {
    number: '04',
    title: 'Human connection',
    body: 'ConnectCare and ParentCircle ensure no family has to figure this out alone.',
  },
];

// ─── FADE-IN HOOK ─────────────────────────────────────────────────────────────

function useFadeIn() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold: 0.12 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { ref, visible };
}

// ─── SECTION WRAPPER ─────────────────────────────────────────────────────────

const Reveal: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => {
  const { ref, visible } = useFadeIn();
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'} ${className}`}
    >
      {children}
    </div>
  );
};

// ─── HERO ─────────────────────────────────────────────────────────────────────

const Hero: React.FC = () => {
  const navigate = useNavigate();
  const [loaded, setLoaded] = useState(false);
  useEffect(() => { const t = setTimeout(() => setLoaded(true), 80); return () => clearTimeout(t); }, []);

  return (
    <section className="relative pt-32 pb-24 overflow-hidden bg-[#fbfbfb]">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-bl from-[#659ec3]/8 to-transparent pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-[#e9924b]/6 to-transparent rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
        <div
          className="max-w-2xl transition-all duration-900"
          style={{ opacity: loaded ? 1 : 0, transform: loaded ? 'none' : 'translateY(24px)' }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="h-px w-8 bg-[#e9924b]" />
            <span className="text-[#e9924b] text-xs font-semibold tracking-[0.2em] uppercase">Digital Tools</span>
          </div>

          <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-extrabold text-[#1e3a6e] leading-[1.06] mb-6">
            One ecosystem.<br />
            <span className="text-[#e9924b]">Every layer of support.</span>
          </h1>

          <p className="text-[#1e3a6e]/60 text-base md:text-lg leading-relaxed mb-10 max-w-lg">
            Six interconnected tools built for the people raising and educating children — from AI conversations to community spaces to professional referrals.
          </p>

          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => navigate('/talkeasy')}
              className="bg-[#e9924b] text-white font-semibold py-3 px-7 rounded-full text-sm hover:bg-[#d4762a] transition-all hover:-translate-y-px hover:shadow-lg hover:shadow-[#e9924b]/25"
            >
              Try TalkEasy
            </button>
            <button
              onClick={() => navigate('/learnwell')}
              className="border border-[#1e3a6e]/20 text-[#1e3a6e] font-semibold py-3 px-7 rounded-full text-sm hover:bg-[#1e3a6e]/5 transition-all"
            >
              Browse LearnWell
            </button>
          </div>
        </div>

        {/* Stats row */}
        <div
          className="mt-16 flex flex-wrap gap-8 transition-all duration-700 delay-300"
          style={{ opacity: loaded ? 1 : 0 }}
        >
          {[
            { value: '6', label: 'Integrated tools' },
            { value: 'AI', label: 'Powered conversations' },
            { value: '24/7', label: 'Always available' },
          ].map((s) => (
            <div key={s.label} className="flex items-center gap-3">
              <span className="font-heading font-extrabold text-[#e9924b] text-2xl">{s.value}</span>
              <span className="text-[#1e3a6e]/50 text-sm">{s.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ─── CORE TOOLS ───────────────────────────────────────────────────────────────

const CoreTools: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="py-20 md:py-28 bg-[#fbfbfb]">
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
        <Reveal>
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px w-8 bg-[#e9924b]" />
            <span className="text-[#e9924b] text-xs font-semibold tracking-[0.2em] uppercase">Core Tools</span>
          </div>
          <h2 className="font-heading text-3xl md:text-4xl font-extrabold text-[#1e3a6e] mb-14 max-w-lg leading-tight">
            The tools caregivers reach for first.
          </h2>
        </Reveal>

        <div className="space-y-6">
          {coreTools.map((tool, i) => (
            <Reveal key={tool.name}>
              <div
                className={`group grid grid-cols-1 lg:grid-cols-2 gap-0 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 cursor-pointer ${i % 2 === 1 ? 'lg:direction-rtl' : ''}`}
                onClick={() => navigate(tool.action)}
              >
                {/* Text side */}
                <div
                  className={`p-8 md:p-12 flex flex-col justify-center bg-white ${i % 2 === 1 ? 'lg:order-2' : ''}`}
                >
                  {/* Icon + name */}
                  <div className="flex items-center gap-3 mb-5">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: tool.accent + '18', color: tool.accent }}
                    >
                      {tool.icon}
                    </div>
                    <div>
                      <p className="text-xs text-[#1e3a6e]/40 tracking-widest uppercase">{tool.tagline}</p>
                      <h3 className="font-heading font-extrabold text-[#1e3a6e] text-xl">{tool.name}</h3>
                    </div>
                  </div>

                  <p className="text-[#1e3a6e]/60 text-sm leading-relaxed mb-8 max-w-sm">
                    {tool.description}
                  </p>

                  <div
                    className="flex items-center gap-2 text-sm font-semibold group-hover:gap-3 transition-all w-fit"
                    style={{ color: tool.accent }}
                  >
                    <span>Open {tool.name}</span>
                    <IconArrow />
                  </div>
                </div>

                {/* Image side */}
                <div className={`h-56 lg:h-auto overflow-hidden ${i % 2 === 1 ? 'lg:order-1' : ''}`}>
                  <img
                    src={tool.image}
                    alt={tool.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

// ─── SUPPORTING TOOLS ─────────────────────────────────────────────────────────

const SupportingTools: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="py-20 md:py-28 bg-[#1e3a6e]">
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
        <Reveal>
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px w-8 bg-[#e9924b]" />
            <span className="text-[#e9924b] text-xs font-semibold tracking-[0.2em] uppercase">Supporting Tools</span>
          </div>
          <h2 className="font-heading text-3xl md:text-4xl font-extrabold text-white mb-4 max-w-lg leading-tight">
            The rest of the ecosystem.
          </h2>
          <p className="text-white/50 text-sm mb-14 max-w-md leading-relaxed">
            No single tool solves everything. These features complete the picture — connecting families, professionals, and children.
          </p>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {supportingTools.map((tool) => (
            <Reveal key={tool.name}>
              <div
                className="group bg-white/5 border border-white/10 rounded-2xl p-8 hover:bg-white/10 hover:border-white/20 transition-all duration-300 cursor-pointer h-full flex flex-col"
                onClick={() => navigate(tool.action)}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-5 flex-shrink-0"
                  style={{ backgroundColor: tool.accent + '28', color: tool.accent }}
                >
                  {tool.icon}
                </div>

                <p className="text-white/40 text-xs tracking-widest uppercase mb-1">{tool.tagline}</p>
                <h3 className="font-heading font-extrabold text-white text-lg mb-3">{tool.name}</h3>
                <p className="text-white/55 text-sm leading-relaxed flex-1 mb-6">{tool.description}</p>

                <div
                  className="flex items-center gap-2 text-sm font-semibold group-hover:gap-3 transition-all w-fit mt-auto"
                  style={{ color: tool.accent }}
                >
                  <span>Explore</span>
                  <IconArrow />
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

// ─── SYSTEM VALUES ────────────────────────────────────────────────────────────

const SystemValues: React.FC = () => {
  return (
    <section className="py-20 md:py-28 bg-[#fbfbfb]">
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* Left */}
          <Reveal>
            <div className="flex items-center gap-3 mb-5">
              <div className="h-px w-8 bg-[#e9924b]" />
              <span className="text-[#e9924b] text-xs font-semibold tracking-[0.2em] uppercase">Why It Works Together</span>
            </div>
            <h2 className="font-heading text-3xl md:text-4xl font-extrabold text-[#1e3a6e] leading-tight mb-6">
              Designed as a system,<br />not a collection of apps.
            </h2>
            <p className="text-[#1e3a6e]/55 text-sm leading-relaxed max-w-md">
              Each tool solves a specific problem. Together, they form a support structure that meets caregivers wherever they are — in a difficult moment, over time, or when professional help is needed.
            </p>

            {/* Visual image */}
            <div className="mt-10 rounded-2xl overflow-hidden shadow-lg">
              <img
                src="https://images.unsplash.com/photo-1591474200742-8e512e6f98f8?w=900&auto=format&fit=crop&q=70"
                alt="Caregiver and child"
                className="w-full h-56 object-cover"
              />
            </div>
          </Reveal>

          {/* Right — numbered list */}
          <div className="space-y-6">
            {systemValues.map((item, i) => (
              <Reveal key={item.number}>
                <div
                  className="flex gap-5 p-6 rounded-2xl bg-white shadow-sm hover:shadow-md transition-all"
                  style={{ transitionDelay: `${i * 80}ms` }}
                >
                  <span className="font-heading font-extrabold text-[#e9924b]/40 text-2xl flex-shrink-0 w-8 leading-none">{item.number}</span>
                  <div>
                    <h4 className="font-heading font-bold text-[#1e3a6e] text-base mb-1">{item.title}</h4>
                    <p className="text-[#1e3a6e]/55 text-sm leading-relaxed">{item.body}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

// ─── CTA ─────────────────────────────────────────────────────────────────────

const CTA: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="relative py-20 md:py-28 overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url('https://images.unsplash.com/photo-1536337005238-94b997371b40?w=1800&auto=format&fit=crop&q=70')` }}
      />
      <div className="absolute inset-0 bg-[#e9924b]/92" />

      <Reveal>
        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 lg:px-20 text-center">
          <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-extrabold text-white mb-5 leading-tight">
            Start with the tool<br />that fits right now.
          </h2>
          <p className="text-white/75 text-sm md:text-base max-w-md mx-auto mb-10 leading-relaxed">
            You do not need to use everything at once. Pick one tool, explore it, and build from there.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={() => navigate('/talkeasy')}
              className="bg-white text-[#e9924b] font-bold py-3 px-8 rounded-full text-sm hover:shadow-xl hover:-translate-y-0.5 transition-all"
            >
              Try TalkEasy
            </button>
            <button
              onClick={() => navigate('/growtrack')}
              className="bg-white/15 border border-white/40 text-white font-semibold py-3 px-8 rounded-full text-sm hover:bg-white/25 transition-all"
            >
              Open GrowTrack
            </button>
            <button
              onClick={() => navigate('/signup')}
              className="bg-[#1e3a6e] text-white font-bold py-3 px-8 rounded-full text-sm hover:bg-[#1e3a6e]/90 transition-all hover:-translate-y-0.5"
            >
              Get Started
            </button>
          </div>
        </div>
      </Reveal>
    </section>
  );
};

// ─── PAGE ─────────────────────────────────────────────────────────────────────

const Features: React.FC = () => {
  return (
    <div className="bg-[#fbfbfb] overflow-x-hidden min-h-screen">
      <Navbar />
      <main className="pt-20">
        <Hero />
        <CoreTools />
        <SupportingTools />
        <SystemValues />
        <CTA />
      </main>
      <Footer />
    </div>
  );
};

export default Features;
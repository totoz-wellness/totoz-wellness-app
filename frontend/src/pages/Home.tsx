import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';

// ─── HERO ────────────────────────────────────────────────────────────────────

const Hero: React.FC = () => {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  return (
    <section className="relative min-h-screen flex flex-col justify-center overflow-hidden mt-16 sm:mt-20">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url('https://images.unsplash.com/photo-1529390079861-591de354faf5?w=1800&auto=format&fit=crop&q=80')` }}
      />

      {/* Layered overlay: dark-navy left → semi-transparent right */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#1e3a6e]/95 via-[#1e3a6e]/80 to-[#1e3a6e]/40" />
      {/* Subtle warm accent at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-[#e9924b]/20 to-transparent" />

      {/* Decorative vertical line */}
      <div className="absolute left-8 md:left-20 top-1/4 bottom-1/4 w-px bg-white/20 hidden md:block" />

      <div className="relative z-10 container mx-auto px-6 md:px-20 py-24">
        <div
          className="max-w-2xl transition-all duration-1000"
          style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(28px)' }}
        >
          {/* Eyebrow label */}
          <div className="flex items-center gap-3 mb-8">
            <div className="h-px w-10 bg-[#e9924b]" />
            <span className="text-[#e9924b] text-xs font-semibold tracking-[0.2em] uppercase">Totoz Wellness</span>
          </div>

          {/* Headline */}
          <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-[1.08] mb-6">
            Supporting Caregivers,
            <br />
            <span className="text-[#e9924b]">Nurturing Children's</span>
            <br />
            Mental Health
          </h1>

          {/* Supporting line */}
          <p
            className="text-white/70 text-base md:text-lg leading-relaxed mb-10 max-w-md"
            style={{ transitionDelay: '200ms', opacity: visible ? 1 : 0, transition: 'opacity 1s ease' }}
          >
            A connected system — outreach, education, and digital tools — built to raise emotionally healthy children.
          </p>

          {/* CTAs */}
          <div
            className="flex flex-wrap gap-4"
            style={{ transitionDelay: '400ms', opacity: visible ? 1 : 0, transition: 'opacity 1s ease' }}
          >
            <button
              onClick={() => navigate('/features')}
              className="bg-[#e9924b] text-white font-semibold py-3 px-8 rounded-full hover:bg-[#d4762a] transition-all hover:shadow-lg hover:shadow-[#e9924b]/30 hover:-translate-y-0.5 text-sm"
            >
              Explore What We Do
            </button>
            <button
              onClick={() => navigate('/community')}
              className="bg-white/10 backdrop-blur-sm border border-white/30 text-white font-semibold py-3 px-8 rounded-full hover:bg-white/20 transition-all text-sm"
            >
              Join the Community
            </button>
          </div>
        </div>
      </div>

      {/* Scroll cue */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 opacity-50">
        <div className="w-px h-10 bg-white animate-pulse" />
        <span className="text-white text-[10px] tracking-widest uppercase">Scroll</span>
      </div>
    </section>
  );
};

// ─── WHAT WE DO ───────────────────────────────────────────────────────────────

const pillars = [
  {
    label: '01',
    title: 'Community Outreach',
    body: 'School visits, awareness sessions, and community programs that bring children\'s mental health into everyday conversation.',
    img: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800&auto=format&fit=crop&q=70',
  },
  {
    label: '02',
    title: 'Caregiver Education',
    body: 'Practical knowledge and training that helps parents and educators understand children\'s emotions and respond with confidence.',
    img: 'https://images.unsplash.com/photo-1543269664-7eef42226a21?w=800&auto=format&fit=crop&q=70',
  },
  {
    label: '03',
    title: 'Digital Tools',
    body: 'Purpose-built apps that track wellbeing, guide difficult conversations, and surface resources when they are needed most.',
    img: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=70',
  },
  {
    label: '04',
    title: 'Professional Referrals',
    body: 'When families need deeper support, ConnectCare links them to verified mental health professionals.',
    img: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=800&auto=format&fit=crop&q=70',
  },
];

const WhatWeDo: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="py-20 md:py-28 bg-[#fbfbfb]">
      <div className="container mx-auto px-6 md:px-20">
        {/* Section header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-14 gap-6">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-px w-8 bg-[#e9924b]" />
              <span className="text-[#e9924b] text-xs font-semibold tracking-[0.2em] uppercase">What We Do</span>
            </div>
            <h2 className="font-heading text-3xl md:text-4xl font-extrabold text-[#1e3a6e] leading-tight">
              More than an app.<br />A full ecosystem.
            </h2>
          </div>
          <p className="text-[#1e3a6e]/60 text-sm max-w-sm leading-relaxed">
            Totoz operates across four connected layers — on the ground, in homes, through screens, and with professionals.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {pillars.map((p) => (
            <div
              key={p.label}
              className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1"
            >
              {/* Image */}
              <div className="h-44 overflow-hidden">
                <img
                  src={p.img}
                  alt={p.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
              </div>
              {/* Number badge */}
              <div className="absolute top-4 left-4 bg-[#e9924b] text-white text-[10px] font-bold tracking-widest px-2 py-1 rounded-full">
                {p.label}
              </div>
              {/* Text */}
              <div className="p-5">
                <h3 className="font-heading font-bold text-[#1e3a6e] text-base mb-2">{p.title}</h3>
                <p className="text-[#1e3a6e]/60 text-sm leading-relaxed">{p.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ─── TOOLS ────────────────────────────────────────────────────────────────────

const tools = [
  {
    name: 'TalkEasy',
    tagline: 'AI-powered support for caregivers',
    description: 'Navigate difficult emotional conversations with real-time, empathetic guidance.',
    action: '/talkeasy',
    accent: '#e9924b',
  },
  {
    name: 'GrowTrack',
    tagline: 'Mood & behaviour tracking',
    description: 'Spot patterns and understand your child\'s emotional landscape over time.',
    action: '/growtrack',
    accent: '#659ec3',
  },
  {
    name: 'LearnWell',
    tagline: 'Resource library',
    description: 'Articles, guides, and insights curated for caregivers and educators.',
    action: '/learnwell',
    accent: '#1e3a6e',
  },
];

const Tools: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="py-20 md:py-28 bg-[#1e3a6e]">
      <div className="container mx-auto px-6 md:px-20">
        {/* Header */}
        <div className="mb-14">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px w-8 bg-[#e9924b]" />
            <span className="text-[#e9924b] text-xs font-semibold tracking-[0.2em] uppercase">Digital Tools</span>
          </div>
          <h2 className="font-heading text-3xl md:text-4xl font-extrabold text-white leading-tight">
            Built for the people<br />raising children.
          </h2>
        </div>

        {/* Tool cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {tools.map((tool) => (
            <div
              key={tool.name}
              className="group relative bg-white/5 border border-white/10 rounded-2xl p-8 hover:bg-white/10 hover:border-white/20 transition-all duration-300 cursor-pointer"
              onClick={() => navigate(tool.action)}
            >
              {/* Accent dot */}
              <div className="w-3 h-3 rounded-full mb-6" style={{ backgroundColor: tool.accent }} />

              <p className="text-white/40 text-xs tracking-widest uppercase mb-2">{tool.tagline}</p>
              <h3 className="font-heading font-extrabold text-white text-2xl mb-3">{tool.name}</h3>
              <p className="text-white/60 text-sm leading-relaxed mb-8">{tool.description}</p>

              {/* Arrow CTA */}
              <div className="flex items-center gap-2 text-sm font-semibold group-hover:gap-3 transition-all" style={{ color: tool.accent }}>
                <span>Open</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ─── IMPACT ───────────────────────────────────────────────────────────────────

const Impact: React.FC = () => {
  return (
    <section className="py-20 md:py-28 bg-[#fbfbfb]">
      <div className="container mx-auto px-6 md:px-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Image collage */}
          <div className="relative h-[420px] hidden lg:block">
            <img
              src="https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800&auto=format&fit=crop&q=70"
              alt="Child and caregiver"
              className="absolute top-0 left-0 w-64 h-72 object-cover rounded-2xl shadow-xl"
            />
            <img
              src="https://images.unsplash.com/photo-1542810634-71277d95dcbb?w=800&auto=format&fit=crop&q=70"
              alt="Children in school"
              className="absolute bottom-0 right-0 w-64 h-64 object-cover rounded-2xl shadow-xl"
            />
            {/* Floating stat card */}
            <div className="absolute bottom-20 left-40 bg-white rounded-xl px-5 py-4 shadow-2xl border border-[#e9924b]/20">
              <p className="text-[#e9924b] font-extrabold text-2xl font-heading">Growing</p>
              <p className="text-[#1e3a6e]/60 text-xs mt-0.5">Schools & communities</p>
            </div>
          </div>

          {/* Text */}
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="h-px w-8 bg-[#e9924b]" />
              <span className="text-[#e9924b] text-xs font-semibold tracking-[0.2em] uppercase">Early Traction</span>
            </div>
            <h2 className="font-heading text-3xl md:text-4xl font-extrabold text-[#1e3a6e] leading-tight mb-6">
              Work that has<br />already begun.
            </h2>
            <p className="text-[#1e3a6e]/60 text-sm leading-relaxed mb-8 max-w-md">
              Totoz is an early-stage organization. Our programs are running, our tools are being built, and our community is growing — one school, one caregiver, one conversation at a time.
            </p>

            {/* Stat pills */}
            <div className="flex flex-wrap gap-4 mb-10">
              {[
                { value: 'Schools', sub: 'Active partnerships' },
                { value: 'Caregivers', sub: 'Reached through sessions' },
                { value: '24/7', sub: 'Digital support available' },
              ].map((s) => (
                <div key={s.value} className="bg-white rounded-xl px-5 py-3 shadow-sm border border-[#1e3a6e]/10">
                  <p className="font-heading font-extrabold text-[#e9924b] text-base">{s.value}</p>
                  <p className="text-[#1e3a6e]/50 text-xs mt-0.5">{s.sub}</p>
                </div>
              ))}
            </div>

            <p className="text-[#1e3a6e]/40 text-xs italic">
              Youth-led. Community-rooted. Built with care.
            </p>
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
      {/* BG */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url('https://images.unsplash.com/photo-1536337005238-94b997371b40?w=1800&auto=format&fit=crop&q=70')` }}
      />
      <div className="absolute inset-0 bg-[#e9924b]/90" />

      <div className="relative z-10 container mx-auto px-6 md:px-20 text-center">
        <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-extrabold text-white mb-5 leading-tight">
          Ready to be part<br />of this?
        </h2>
        <p className="text-white/80 text-base max-w-md mx-auto mb-10 leading-relaxed">
          Whether you are a caregiver, educator, or organization — there is a place for you in this work.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <button
            onClick={() => navigate('/signup')}
            className="bg-white text-[#e9924b] font-bold py-3 px-8 rounded-full hover:shadow-xl hover:-translate-y-0.5 transition-all text-sm"
          >
            Get Started
          </button>
          <button
            onClick={() => navigate('/about')}
            className="bg-transparent border-2 border-white text-white font-bold py-3 px-8 rounded-full hover:bg-white/10 transition-all text-sm"
          >
            Learn More
          </button>
        </div>
      </div>
    </section>
  );
};

// ─── PAGE ────────────────────────────────────────────────────────────────────

const Home: React.FC = () => {
  return (
    <div className="bg-[#fbfbfb] overflow-x-hidden min-h-screen">
      <Navbar />
      <main>
        <Hero />
        <WhatWeDo />
        <Tools />
        <Impact />
        <CTA />
      </main>
      <Footer />
    </div>
  );
};

export default Home;
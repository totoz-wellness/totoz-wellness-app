/**
 * ============================================
 * ABOUT PAGE — TOTOZ WELLNESS
 * ============================================
 * @version     1.0.0
 * @updated     2025-04-27
 * @description World-class About page — story, mission, meaning
 * ============================================
 */

import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';

// ─── FADE-IN HOOK ─────────────────────────────────────────────────────────────

function useFadeIn(threshold = 0.12) {
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

// ─── REVEAL WRAPPER ───────────────────────────────────────────────────────────

const Reveal: React.FC<{ children: React.ReactNode; className?: string; delay?: number }> = ({
  children,
  className = '',
  delay = 0,
}) => {
  const { ref, visible } = useFadeIn();
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

// ─── SECTION LABEL ────────────────────────────────────────────────────────────

const SectionLabel: React.FC<{ children: React.ReactNode; light?: boolean }> = ({ children, light }) => (
  <div className="flex items-center gap-3 mb-4">
    <div className={`h-px w-8 ${light ? 'bg-[#e9924b]' : 'bg-[#e9924b]'}`} />
    <span className={`text-[#e9924b] text-xs font-semibold tracking-[0.2em] uppercase`}>{children}</span>
  </div>
);

// ─── INLINE SVG ICONS ────────────────────────────────────────────────────────

const IconBrain = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
    <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.44-4.24Z" />
    <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.44-4.24Z" />
  </svg>
);

const IconUsers = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const IconGamepad = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
    <line x1="6" y1="12" x2="10" y2="12" /><line x1="8" y1="10" x2="8" y2="14" />
    <circle cx="15" cy="11" r=".5" fill="currentColor" /><circle cx="17" cy="13" r=".5" fill="currentColor" />
    <path d="M21.79 8.23A2 2 0 0 0 19.8 6H4.2a2 2 0 0 0-1.99 2.23l.93 8.4A2 2 0 0 0 5.13 18.5c1.1 0 2.08-.67 2.5-1.7l.5-1.3h7.74l.5 1.3a2.7 2.7 0 0 0 2.5 1.7 2 2 0 0 0 1.99-1.87Z" />
  </svg>
);

const IconFlask = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
    <path d="M9 3h6m-5 5V3m4 5V3" />
    <path d="M5 8h14l-3.8 9.5A2 2 0 0 1 13.4 19H10.6a2 2 0 0 1-1.8-1.5Z" />
  </svg>
);

const IconHandshake = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
    <path d="M20.42 4.58a5.4 5.4 0 0 0-7.65 0l-.77.78-.77-.78a5.4 5.4 0 0 0-7.65 0C1.46 6.7 1.33 10.28 4 13l8 8 8-8c2.67-2.72 2.54-6.3.42-8.42z" />
  </svg>
);

const IconMapPin = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const IconCalendar = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
  </svg>
);

const IconArrow = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
);

const IconStar = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);

// ─── DATA ─────────────────────────────────────────────────────────────────────

const pillars = [
  {
    icon: <IconBrain />,
    title: 'Education & Awareness',
    desc: 'Research-backed resources that help caregivers understand what children actually need — not just what they ask for.',
    accent: '#e9924b',
  },
  {
    icon: <IconUsers />,
    title: 'ParentCircle Community',
    desc: 'A safe, moderated space where parents, guardians, and educators share, learn, and grow together — without judgment.',
    accent: '#659ec3',
  },
  {
    icon: <IconGamepad />,
    title: 'Kids Corner',
    desc: 'Interactive, age-appropriate tools that help children name their feelings, build resilience, and feel genuinely seen.',
    accent: '#e9924b',
  },
  {
    icon: <IconFlask />,
    title: 'Research & Insights',
    desc: 'We track what\'s working — on the ground and in the data — to continuously improve what we offer to families.',
    accent: '#659ec3',
  },
  {
    icon: <IconHandshake />,
    title: 'Outreach & Partnerships',
    desc: 'Direct community presence in schools, churches, and grassroots settings — Kibera, Kandara, and beyond.',
    accent: '#1e3a6e',
  },
];

const howItems = [
  {
    num: '01',
    title: 'Research-Driven',
    body: 'Every resource we build is grounded in child development science and mental health best practices — not trends.',
  },
  {
    num: '02',
    title: 'Community-Centered',
    body: 'We design with communities, not for them. Caregiver feedback shapes what we build next.',
  },
  {
    num: '03',
    title: 'Real-World Presence',
    body: 'We show up in person — in schools, community halls, and local institutions — because trust isn\'t built online alone.',
  },
  {
    num: '04',
    title: 'Technology as a Bridge',
    body: 'Our platform makes quality mental health support accessible wherever there\'s a phone and a connection.',
  },
];

const timelineItems = [
  {
    year: '2023',
    title: 'The Reflection',
    body: 'Founders begin deep reflection on childhood experiences and the emotional gaps they observed around them.',
  },
  {
    year: 'Early 2024',
    title: 'The Idea Takes Shape',
    body: 'Conversations turn into structure. Research begins. The concept of a child-centered mental health ecosystem emerges.',
  },
  {
    year: 'Mid 2024',
    title: 'First Ground Presence',
    body: 'First community outreach sessions in Kibera and Kandara — listening, learning, and building trust before building products.',
  },
  {
    year: 'Late 2024',
    title: 'Platform Development',
    body: 'Digital tools begin development. ParentCircle community launched. First partnerships formed with local organizations.',
  },
  {
    year: '2025',
    title: 'Growing Ecosystem',
    body: 'Full platform goes live. Caregiver network expands. Research insights begin informing curriculum and content strategy.',
  },
];

const values = [
  {
    title: 'Children First',
    body: 'Every decision we make is filtered through one question: is this good for children?',
    accent: '#e9924b',
  },
  {
    title: 'Honest Empathy',
    body: 'We don\'t pretend caregiving is easy. We meet people in the reality of it.',
    accent: '#659ec3',
  },
  {
    title: 'Evidence, Not Assumptions',
    body: 'We ground our work in research. When we don\'t know, we find out before we act.',
    accent: '#e9924b',
  },
  {
    title: 'Access Without Exception',
    body: 'Quality mental health support shouldn\'t depend on where you live or what you earn.',
    accent: '#659ec3',
  },
  {
    title: 'Community Over Platform',
    body: 'The technology supports the human connection. Never the other way around.',
    accent: '#1e3a6e',
  },
  {
    title: 'Relentless Follow-Through',
    body: 'We started because we believed something needed to change. We\'re still here because we meant it.',
    accent: '#1e3a6e',
  },
];

// ─── HERO ─────────────────────────────────────────────────────────────────────

const Hero: React.FC = () => {
  const navigate = useNavigate();
  const [loaded, setLoaded] = useState(false);
  useEffect(() => { const t = setTimeout(() => setLoaded(true), 80); return () => clearTimeout(t); }, []);

  return (
    <section className="relative min-h-screen flex flex-col justify-center overflow-hidden mt-16 sm:mt-20">
      {/* BG image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url('https://images.unsplash.com/photo-1491013516836-7db643ee125a?w=1800&auto=format&fit=crop&q=80')` }}
      />
      {/* Overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#1e3a6e]/97 via-[#1e3a6e]/85 to-[#1e3a6e]/50" />
      <div className="absolute bottom-0 left-0 right-0 h-56 bg-gradient-to-t from-[#e9924b]/15 to-transparent" />
      {/* Dot texture */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '28px 28px' }}
      />
      {/* Vertical accent line */}
      <div className="absolute left-8 md:left-20 top-1/4 bottom-1/4 w-px bg-white/15 hidden md:block" />

      <div className="relative z-10 container mx-auto px-6 md:px-20 py-24">
        <div
          className="max-w-2xl transition-all duration-1000"
          style={{ opacity: loaded ? 1 : 0, transform: loaded ? 'translateY(0)' : 'translateY(28px)' }}
        >
          {/* Eyebrow */}
          <div className="flex items-center gap-3 mb-8">
            <div className="h-px w-10 bg-[#e9924b]" />
            <span className="text-[#e9924b] text-xs font-semibold tracking-[0.2em] uppercase">Our Story</span>
          </div>

          <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-[1.08] mb-6">
            Every child deserves<br />
            to grow up{' '}
            <span className="text-[#e9924b]">feeling<br />understood.</span>
          </h1>

          <p
            className="text-white/65 text-base md:text-lg leading-relaxed mb-10 max-w-md transition-opacity duration-1000"
            style={{ opacity: loaded ? 1 : 0, transitionDelay: '200ms' }}
          >
            Totoz Wellness exists because too many children carry emotions they were never taught to name — and too many caregivers were never shown how to help.
          </p>

          <div
            className="flex flex-wrap gap-4 transition-opacity duration-1000"
            style={{ opacity: loaded ? 1 : 0, transitionDelay: '400ms' }}
          >
            <button
              onClick={() => { const el = document.getElementById('origin'); el?.scrollIntoView({ behavior: 'smooth' }); }}
              className="bg-[#e9924b] text-white font-semibold py-3 px-8 rounded-full hover:bg-[#d4762a] transition-all hover:shadow-lg hover:shadow-[#e9924b]/30 hover:-translate-y-0.5 text-sm"
            >
              Explore Our Story
            </button>
            <button
              onClick={() => navigate('/features')}
              className="bg-white/10 backdrop-blur-sm border border-white/30 text-white font-semibold py-3 px-8 rounded-full hover:bg-white/20 transition-all text-sm"
            >
              What We Build
            </button>
          </div>
        </div>
      </div>

      {/* Scroll cue */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 opacity-40">
        <div className="w-px h-10 bg-white animate-pulse" />
        <span className="text-white text-[10px] tracking-widest uppercase">Scroll</span>
      </div>
    </section>
  );
};

// ─── ORIGIN STORY ─────────────────────────────────────────────────────────────

const OriginStory: React.FC = () => {
  return (
    <section id="origin" className="py-20 md:py-28 bg-[#fbfbfb]">
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Image side */}
          <Reveal className="relative">
            <div className="relative h-[480px]">
              <img
                src="https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800&auto=format&fit=crop&q=75"
                alt="Child and caregiver"
                className="absolute top-0 left-0 w-3/4 h-80 object-cover rounded-2xl shadow-xl"
              />
              <img
                src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800&auto=format&fit=crop&q=75"
                alt="Children in community"
                className="absolute bottom-0 right-0 w-3/5 h-64 object-cover rounded-2xl shadow-xl border-4 border-white"
              />
              {/* Floating quote */}
              <div className="absolute bottom-24 left-4 bg-[#1e3a6e] text-white rounded-xl px-5 py-4 shadow-2xl max-w-[200px] z-10">
                <p className="text-xs leading-relaxed italic text-white/85">
                  "Children weren't broken. Their environments just didn't know how to hold them."
                </p>
                <div className="mt-2 h-px bg-[#e9924b]/40" />
                <p className="text-[#e9924b] text-[10px] mt-1.5 tracking-wide">— Origin Principle</p>
              </div>
            </div>
          </Reveal>

          {/* Text side */}
          <div>
            <Reveal>
              <SectionLabel>Where it began</SectionLabel>
              <h2 className="font-heading text-3xl md:text-4xl font-extrabold text-[#1e3a6e] leading-tight mb-6">
                It started with a question<br />most people never ask.
              </h2>
            </Reveal>

            <Reveal delay={100}>
              <p className="text-[#1e3a6e]/60 text-sm leading-relaxed mb-5">
                Totoz Wellness began not in a boardroom, but in reflection — on what it felt like to be a child who didn't have the words, and to be around adults who didn't have the awareness.
              </p>
            </Reveal>
            <Reveal delay={180}>
              <p className="text-[#1e3a6e]/60 text-sm leading-relaxed mb-5">
                As our founders looked back on their own childhoods and the communities around them, a pattern became impossible to ignore: children were struggling emotionally, and the adults responsible for their care often had no idea. Not because they didn't love those children — but because no one had ever taught them what emotional safety looks like.
              </p>
            </Reveal>
            <Reveal delay={260}>
              <p className="text-[#1e3a6e]/60 text-sm leading-relaxed mb-8">
                Schools taught literacy. Churches taught morality. Families taught survival. But who taught anyone how a child actually <em>feels</em> — and what to do when they're not okay? That gap became the foundation of Totoz Wellness.
              </p>
            </Reveal>

            {/* Meta pills */}
            <Reveal delay={340}>
              <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-2 bg-white border border-[#1e3a6e]/10 rounded-xl px-4 py-2.5 shadow-sm">
                  <span className="text-[#659ec3]"><IconMapPin /></span>
                  <div>
                    <p className="font-semibold text-[#1e3a6e] text-xs">Based in Kenya</p>
                    <p className="text-[#1e3a6e]/45 text-[10px]">Kibera · Kandara · Nairobi</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-white border border-[#1e3a6e]/10 rounded-xl px-4 py-2.5 shadow-sm">
                  <span className="text-[#659ec3]"><IconCalendar /></span>
                  <div>
                    <p className="font-semibold text-[#1e3a6e] text-xs">Founded 2024</p>
                    <p className="text-[#1e3a6e]/45 text-[10px]">Youth-led · Structured</p>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
};

// ─── THE MEANING OF TOTOZ ─────────────────────────────────────────────────────

const TotoзMeaning: React.FC = () => {
  return (
    <section className="py-20 md:py-28 bg-[#1e3a6e] relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-[#e9924b]/8 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-[#659ec3]/10 blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* Text */}
          <div>
            <Reveal>
              <SectionLabel>The name behind the mission</SectionLabel>
              <h2 className="font-heading text-3xl md:text-4xl font-extrabold text-white leading-tight mb-4">
                What does <span className="text-[#e9924b]">"Totoz"</span> mean?
              </h2>
              <p className="text-white/55 text-sm leading-relaxed mb-8 max-w-md">
                The name is intentional. It's not corporate, not clinical, not borrowed from another language's playbook. It's warm, it's direct, and it points to exactly who this is for.
              </p>
            </Reveal>

            {/* Definition card */}
            <Reveal delay={100}>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-8 mb-8">
                <div className="flex items-start gap-4">
                  <div className="bg-[#e9924b]/20 rounded-xl p-3 flex-shrink-0">
                    <span className="text-[#e9924b] font-heading font-extrabold text-xl">T</span>
                  </div>
                  <div>
                    <p className="text-white font-heading font-extrabold text-2xl mb-1">Totoz</p>
                    <p className="text-white/40 text-xs tracking-widest uppercase mb-3">/ toh-toz / · noun</p>
                    <p className="text-white/75 text-sm leading-relaxed">
                      <em>Children. Little ones.</em> A term of warmth and closeness — the kind you'd use for a child you love, not a demographic you serve.
                    </p>
                  </div>
                </div>
              </div>
            </Reveal>

            <Reveal delay={180}>
              <p className="text-white/55 text-sm leading-relaxed">
                We chose this name because we believe language shapes culture. When you call children <em>totoz</em>, you're reminded of their smallness — not in a diminishing way, but in a way that calls you to be gentle, present, and protective. That's exactly the energy we want every caregiver to carry.
              </p>
            </Reveal>
          </div>

          {/* Values grid */}
          <Reveal delay={100}>
            <div className="grid grid-cols-2 gap-4">
              {[
                { word: 'Care', desc: 'Every feature, every resource, every word is built around the wellbeing of a child.', icon: '🤍' },
                { word: 'Growth', desc: 'Emotional health isn\'t a destination. It\'s something that grows — slowly, with the right conditions.', icon: '🌱' },
                { word: 'Protection', desc: 'Safe environments don\'t happen by accident. They\'re built, intentionally, by aware adults.', icon: '🛡️' },
                { word: 'Safety', desc: 'A child who feels emotionally safe can learn, connect, and become who they\'re meant to be.', icon: '🏠' },
              ].map((item, i) => (
                <div
                  key={item.word}
                  className="bg-white/5 border border-white/8 rounded-2xl p-6 hover:bg-white/10 hover:border-white/15 transition-all duration-300"
                >
                  <div className="text-2xl mb-3">{item.icon}</div>
                  <h4 className="font-heading font-extrabold text-white text-base mb-2">{item.word}</h4>
                  <p className="text-white/50 text-xs leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </Reveal>

        </div>
      </div>
    </section>
  );
};

// ─── THE PROBLEM ──────────────────────────────────────────────────────────────

const TheProblem: React.FC = () => {
  return (
    <section className="py-20 md:py-28 bg-[#fbfbfb]">
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">

          {/* Left — text */}
          <div>
            <Reveal>
              <SectionLabel>The problem we're solving</SectionLabel>
              <h2 className="font-heading text-3xl md:text-4xl font-extrabold text-[#1e3a6e] leading-tight mb-6">
                Emotional neglect rarely<br />looks like neglect.
              </h2>
              <p className="text-[#1e3a6e]/60 text-sm leading-relaxed mb-5">
                It looks like a parent who works hard but never asks how their child feels. A teacher who corrects behavior but never explores its cause. A child who learns that being quiet is safer than being honest.
              </p>
              <p className="text-[#1e3a6e]/60 text-sm leading-relaxed mb-5">
                This isn't about bad parents or failing schools. It's about a systemic gap — one that exists across families, across income levels, across cultures. The awareness and tools simply haven't been there.
              </p>
              <p className="text-[#1e3a6e]/60 text-sm leading-relaxed">
                Totoz Wellness exists to close that gap — not through judgment, but through education, access, and genuine community support.
              </p>
            </Reveal>
          </div>

          {/* Right — stat cards */}
          <div className="space-y-4">
            {[
              {
                stat: '1 in 5',
                title: 'Children experience a mental health challenge before age 18',
                note: 'yet most go unrecognized and unsupported in our communities.',
                accent: '#e9924b',
              },
              {
                stat: 'Most',
                title: 'Caregivers have never received guidance on emotional development',
                note: 'Not because they don\'t care — the tools simply weren\'t available.',
                accent: '#659ec3',
              },
              {
                stat: 'Early',
                title: 'Childhood experiences shape adult wellbeing more than almost any other factor',
                note: 'Making now the most critical time to act.',
                accent: '#1e3a6e',
              },
            ].map((item, i) => (
              <Reveal key={i} delay={i * 100}>
                <div className="bg-white rounded-2xl border border-[#1e3a6e]/8 p-6 shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-start gap-5">
                    <div
                      className="flex-shrink-0 font-heading font-extrabold text-3xl leading-none pt-1"
                      style={{ color: item.accent }}
                    >
                      {item.stat}
                    </div>
                    <div>
                      <p className="font-semibold text-[#1e3a6e] text-sm mb-1">{item.title}</p>
                      <p className="text-[#1e3a6e]/45 text-xs leading-relaxed">{item.note}</p>
                    </div>
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

// ─── WHAT WE DO / PILLARS ─────────────────────────────────────────────────────

const WhatWeDo: React.FC = () => {
  return (
    <section className="py-20 md:py-28 bg-[#f0f6fb]">
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
        <Reveal>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-14 gap-6">
            <div>
              <SectionLabel>What we do</SectionLabel>
              <h2 className="font-heading text-3xl md:text-4xl font-extrabold text-[#1e3a6e] leading-tight">
                Five pillars.<br />One mission.
              </h2>
            </div>
            <p className="text-[#1e3a6e]/55 text-sm max-w-sm leading-relaxed">
              Each pillar targets a different part of the ecosystem — together they create a whole greater than any single piece.
            </p>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {pillars.map((p, i) => (
            <Reveal key={i} delay={i * 80}>
              <div className="group bg-white rounded-2xl border border-[#1e3a6e]/8 p-7 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-400 h-full">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center mb-5 flex-shrink-0 transition-transform group-hover:scale-110 duration-300"
                  style={{ backgroundColor: p.accent + '18', color: p.accent }}
                >
                  {p.icon}
                </div>
                <h3 className="font-heading font-bold text-[#1e3a6e] text-base mb-2">{p.title}</h3>
                <p className="text-[#1e3a6e]/55 text-sm leading-relaxed">{p.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

// ─── HOW WE WORK ──────────────────────────────────────────────────────────────

const HowWeWork: React.FC = () => {
  return (
    <section className="py-20 md:py-28 bg-[#fbfbfb]">
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">

          {/* Left header + image */}
          <div>
            <Reveal>
              <SectionLabel>How we work</SectionLabel>
              <h2 className="font-heading text-3xl md:text-4xl font-extrabold text-[#1e3a6e] leading-tight mb-6">
                Claims mean nothing<br />without method.
              </h2>
              <p className="text-[#1e3a6e]/55 text-sm leading-relaxed mb-10 max-w-md">
                We're deliberate about how we operate. Every part of our approach was chosen to make the work actually work — not just sound good.
              </p>
            </Reveal>

            <Reveal delay={100}>
              <div className="rounded-2xl overflow-hidden shadow-lg">
                <img
                  src="https://images.unsplash.com/photo-1591474200742-8e512e6f98f8?w=900&auto=format&fit=crop&q=75"
                  alt="Community session"
                  className="w-full h-56 md:h-64 object-cover"
                />
              </div>
            </Reveal>
          </div>

          {/* Right — numbered cards */}
          <div className="space-y-5">
            {howItems.map((item, i) => (
              <Reveal key={i} delay={i * 80}>
                <div className="flex gap-5 p-6 rounded-2xl bg-white border border-[#1e3a6e]/8 shadow-sm hover:shadow-md transition-all">
                  <span className="font-heading font-extrabold text-[#e9924b]/30 text-3xl flex-shrink-0 w-10 leading-none pt-1">
                    {item.num}
                  </span>
                  <div>
                    <h4 className="font-heading font-bold text-[#1e3a6e] text-base mb-1.5">{item.title}</h4>
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

// ─── TIMELINE ─────────────────────────────────────────────────────────────────

const Timeline: React.FC = () => {
  return (
    <section className="py-20 md:py-28 bg-[#1e3a6e] relative overflow-hidden">
      <div className="absolute top-0 right-0 w-72 h-72 rounded-full bg-[#659ec3]/10 blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
        <Reveal>
          <SectionLabel>Our journey</SectionLabel>
          <h2 className="font-heading text-3xl md:text-4xl font-extrabold text-white leading-tight mb-14 max-w-lg">
            From reflection to movement.
          </h2>
        </Reveal>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-6 md:left-8 top-0 bottom-0 w-px bg-white/10" />

          <div className="space-y-10">
            {timelineItems.map((item, i) => (
              <Reveal key={i} delay={i * 80}>
                <div className="relative pl-16 md:pl-24">
                  {/* Dot */}
                  <div
                    className="absolute left-4 md:left-6 top-1.5 w-4 h-4 rounded-full border-2 border-[#e9924b] bg-[#1e3a6e] -translate-x-1/2 z-10"
                  />
                  {/* Year badge */}
                  <div className="inline-block bg-[#e9924b]/15 border border-[#e9924b]/25 rounded-full px-3 py-0.5 text-[#e9924b] text-xs font-semibold mb-2">
                    {item.year}
                  </div>
                  <h4 className="font-heading font-bold text-white text-base mb-1.5">{item.title}</h4>
                  <p className="text-white/50 text-sm leading-relaxed max-w-xl">{item.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

// ─── WHERE WE ARE ─────────────────────────────────────────────────────────────

const WhereWeAre: React.FC = () => {
  return (
    <section className="py-20 md:py-28 bg-[#fbfbfb]">
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* Text */}
          <div>
            <Reveal>
              <SectionLabel>Where we operate</SectionLabel>
              <h2 className="font-heading text-3xl md:text-4xl font-extrabold text-[#1e3a6e] leading-tight mb-6">
                Rooted in Kenya.<br />Thinking beyond it.
              </h2>
              <p className="text-[#1e3a6e]/60 text-sm leading-relaxed mb-5">
                We're based in Kenya, with active outreach in Nairobi's Kibera community and Kandara in Murang'a County — two places where the need for emotionally literate caregiving is acute and largely unmet.
              </p>
              <p className="text-[#1e3a6e]/60 text-sm leading-relaxed mb-8">
                We're not trying to scale to everywhere at once. We're building depth before we build breadth — because systems that actually work in one community can be adapted for many, but systems built for "everywhere" often serve no one well.
              </p>
            </Reveal>

            {/* Location tiles */}
            <Reveal delay={100}>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { name: 'Kibera, Nairobi', note: 'Active outreach' },
                  { name: 'Kandara, Murang\'a', note: 'Community presence' },
                  { name: 'Digital platform', note: 'Kenya-wide access' },
                  { name: 'Growing network', note: 'Partnerships forming' },
                ].map((loc) => (
                  <div
                    key={loc.name}
                    className="bg-white border border-[#1e3a6e]/8 rounded-xl px-4 py-3 shadow-sm"
                  >
                    <p className="font-semibold text-[#1e3a6e] text-xs mb-0.5">{loc.name}</p>
                    <p className="text-[#1e3a6e]/40 text-[10px]">{loc.note}</p>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>

          {/* Image + stat card */}
          <Reveal delay={80}>
            <div className="relative h-[400px]">
              <img
                src="https://images.unsplash.com/photo-1542810634-71277d95dcbb?w=900&auto=format&fit=crop&q=75"
                alt="Kenya community"
                className="absolute inset-0 w-full h-full object-cover rounded-2xl shadow-xl"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1e3a6e]/60 to-transparent rounded-2xl" />

              {/* Floating stat cards */}
              <div className="absolute bottom-6 left-6 right-6 grid grid-cols-3 gap-3">
                {[
                  { value: '2+', label: 'Counties' },
                  { value: '500+', label: 'Caregivers' },
                  { value: '3+', label: 'Partners' },
                ].map((s) => (
                  <div key={s.label} className="bg-white/90 backdrop-blur-sm rounded-xl px-3 py-2.5 text-center shadow-lg">
                    <p className="font-heading font-extrabold text-[#e9924b] text-lg leading-none">{s.value}</p>
                    <p className="text-[#1e3a6e]/60 text-[10px] mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

        </div>
      </div>
    </section>
  );
};

// ─── MISSION + VISION + VALUES ────────────────────────────────────────────────

const MissionVisionValues: React.FC = () => {
  return (
    <section className="py-20 md:py-28 bg-[#f0f6fb]">
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">

        {/* Mission + Vision */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          <Reveal>
            <div className="bg-[#1e3a6e] rounded-2xl p-8 md:p-10 h-full">
              <div className="flex items-center gap-3 mb-5">
                <div className="h-px w-8 bg-[#e9924b]" />
                <span className="text-[#e9924b] text-xs font-semibold tracking-[0.2em] uppercase">Mission</span>
              </div>
              <h3 className="font-heading font-extrabold text-white text-xl md:text-2xl leading-tight mb-4">
                To equip every caregiver with the awareness, tools, and community they need to raise emotionally healthy children.
              </h3>
              <p className="text-white/50 text-sm leading-relaxed">
                Practical, accessible, and grounded in what actually works for families — not what sounds good in a brochure.
              </p>
            </div>
          </Reveal>

          <Reveal delay={100}>
            <div className="bg-white border border-[#1e3a6e]/8 rounded-2xl p-8 md:p-10 h-full shadow-sm">
              <div className="flex items-center gap-3 mb-5">
                <div className="h-px w-8 bg-[#659ec3]" />
                <span className="text-[#659ec3] text-xs font-semibold tracking-[0.2em] uppercase">Vision</span>
              </div>
              <h3 className="font-heading font-extrabold text-[#1e3a6e] text-xl md:text-2xl leading-tight mb-4">
                A Kenya where emotionally safe childhoods are the norm, not the exception.
              </h3>
              <p className="text-[#1e3a6e]/50 text-sm leading-relaxed">
                Starting local, thinking long-term. Every child who grows up emotionally healthy changes the world around them — that's the scale we're working toward.
              </p>
            </div>
          </Reveal>
        </div>

        {/* Values */}
        <Reveal>
          <SectionLabel>What we stand for</SectionLabel>
          <h2 className="font-heading text-3xl md:text-4xl font-extrabold text-[#1e3a6e] leading-tight mb-10">
            Values that aren't<br />just words on a wall.
          </h2>
        </Reveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {values.map((v, i) => (
            <Reveal key={i} delay={i * 60}>
              <div className="bg-white rounded-2xl border border-[#1e3a6e]/8 p-6 shadow-sm hover:shadow-md transition-all h-full">
                <div
                  className="w-1 h-8 rounded-full mb-5"
                  style={{ backgroundColor: v.accent }}
                />
                <h4 className="font-heading font-bold text-[#1e3a6e] text-base mb-2">{v.title}</h4>
                <p className="text-[#1e3a6e]/55 text-sm leading-relaxed">{v.body}</p>
              </div>
            </Reveal>
          ))}
        </div>

      </div>
    </section>
  );
};

// ─── TEAM ─────────────────────────────────────────────────────────────────────

const Team: React.FC = () => {
  return (
    <section className="py-20 md:py-28 bg-[#fbfbfb]">
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* Image */}
          <Reveal>
            <div className="relative h-[380px] rounded-2xl overflow-hidden shadow-xl">
              <img
                src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=900&auto=format&fit=crop&q=75"
                alt="Team at work"
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1e3a6e]/70 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6">
                <div className="bg-[#e9924b] text-white rounded-xl px-4 py-2 inline-flex items-center gap-2 shadow-lg">
                  <span className="text-white"><IconStar /></span>
                  <span className="font-semibold text-sm">Youth-led · Structured · Serious</span>
                </div>
              </div>
            </div>
          </Reveal>

          {/* Text */}
          <div>
            <Reveal>
              <SectionLabel>Who we are</SectionLabel>
              <h2 className="font-heading text-3xl md:text-4xl font-extrabold text-[#1e3a6e] leading-tight mb-6">
                Young people with<br />a serious plan.
              </h2>
            </Reveal>
            <Reveal delay={100}>
              <p className="text-[#1e3a6e]/60 text-sm leading-relaxed mb-5">
                Totoz Wellness is youth-led — not as a tagline, but as a genuine commitment. The people building this organization are from the same generation that grew up feeling the gap they're now trying to close.
              </p>
            </Reveal>
            <Reveal delay={180}>
              <p className="text-[#1e3a6e]/60 text-sm leading-relaxed mb-5">
                But youth-led doesn't mean informal. We're structured, intentional, and organized — because this work requires that. Passion without systems doesn't scale. We're here to build something that lasts.
              </p>
            </Reveal>
            <Reveal delay={260}>
              <p className="text-[#1e3a6e]/60 text-sm leading-relaxed mb-10">
                Our team brings together backgrounds in mental health, education, technology, and community organizing. We don't have every answer — but we know who to ask, and we're not afraid to do the work.
              </p>
            </Reveal>

            <Reveal delay={320}>
              <div className="flex flex-wrap gap-3">
                {['Mental Health', 'Technology', 'Community Work', 'Education', 'Research'].map((tag) => (
                  <span
                    key={tag}
                    className="bg-[#1e3a6e]/6 text-[#1e3a6e] text-xs font-semibold px-3 py-1.5 rounded-full border border-[#1e3a6e]/10"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </Reveal>
          </div>

        </div>
      </div>
    </section>
  );
};

// ─── CTA ──────────────────────────────────────────────────────────────────────

const CTA: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="relative py-20 md:py-28 overflow-hidden">
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
        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 lg:px-20 text-center">
          <div className="inline-flex items-center gap-2 bg-white/15 border border-white/25 rounded-full px-4 py-1.5 text-white text-xs font-semibold tracking-wider uppercase mb-8">
            <span><IconStar /></span>
            Join the movement
          </div>
          <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-extrabold text-white mb-5 leading-tight">
            This work belongs<br />to all of us.
          </h2>
          <p className="text-white/80 text-sm md:text-base max-w-md mx-auto mb-10 leading-relaxed">
            Whether you're a parent looking for support, an organization wanting to partner, or someone who simply believes children deserve better — there's a place for you here.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={() => navigate('/community')}
              className="bg-white text-[#e9924b] font-bold py-3 px-8 rounded-full text-sm hover:shadow-xl hover:-translate-y-0.5 transition-all"
            >
              Join ParentCircle
            </button>
            <button
              onClick={() => navigate('/contact')}
              className="bg-transparent border-2 border-white text-white font-bold py-3 px-8 rounded-full text-sm hover:bg-white/15 transition-all"
            >
              Partner With Us
            </button>
            <button
              onClick={() => navigate('/signup')}
              className="bg-[#1e3a6e] text-white font-bold py-3 px-8 rounded-full text-sm hover:bg-[#1e3a6e]/90 transition-all hover:-translate-y-0.5"
            >
              Get Started Free
            </button>
          </div>
        </div>
      </Reveal>
    </section>
  );
};

// ─── PAGE ─────────────────────────────────────────────────────────────────────

const About: React.FC = () => {
  return (
    <div className="bg-[#fbfbfb] overflow-x-hidden min-h-screen">
      <Navbar />
      <main>
        <Hero />
        <OriginStory />
        <TotoзMeaning />
        <TheProblem />
        <WhatWeDo />
        <HowWeWork />
        <Timeline />
        <WhereWeAre />
        <MissionVisionValues />
        <Team />
        <CTA />
      </main>
      <Footer />
    </div>
  );
};

export default About;
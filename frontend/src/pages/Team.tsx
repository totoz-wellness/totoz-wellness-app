/**
 * ============================================
 * TEAM PAGE — TOTOZ WELLNESS
 * ============================================
 * @version     2.0.0
 * @description Deep revamp — real people, real structure, real story
 * ============================================
 */

import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';

// Import the images for some of the team members
import clintonPhoto from '../assets/team/Arogo.jpg';
import georgePhoto from '../assets/team/George2.png';
import vionaPhoto from '../assets/team/Viona.jpg';
import preciousPhoto from '../assets/team/Precious.jpg';
import faithPhoto from '../assets/team/Faith.jpg';
import davinePhoto from '../assets/team/Davine.jpg';
import khadijaPhoto from '../assets/team/Khadija.jpeg';
import naomiPhoto from '../assets/team/Naomi.jpg';
import austinPhoto from '../assets/team/Austine.jpg';
import roshanPhoto from '../assets/team/Roshan.jpg';


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
      className={`transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

// ─── SECTION LABEL ───────────────────────────────────────────────────────────

const SectionLabel: React.FC<{ children: React.ReactNode; light?: boolean }> = ({ children, light }) => (
  <div className="flex items-center gap-3 mb-4">
    <div className="h-px w-8 bg-[#e9924b]" />
    <span className="text-[#e9924b] text-xs font-semibold tracking-[0.2em] uppercase">{children}</span>
  </div>
);

// ─── ICONS ───────────────────────────────────────────────────────────────────

const IconChevronDown = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <path d="M6 9l6 6 6-6" />
  </svg>
);

const IconHeart = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

const IconCode = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
  </svg>
);

const IconBook = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
  </svg>
);

const IconMicroscope = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M6 18h8" /><path d="M3 21h18" /><path d="M14 21v-4" /><path d="M14 7l3 3" /><path d="M10 3L8 5l3 3 2-2" /><path d="M3 11a9 9 0 0 1 9-9" />
  </svg>
);

const IconGlobe = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

const IconCamera = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
    <circle cx="12" cy="13" r="4" />
  </svg>
);

const IconStar = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);

const IconLightbulb = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <line x1="9" y1="18" x2="15" y2="18" /><line x1="10" y1="22" x2="14" y2="22" />
    <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14" />
  </svg>
);

// ─── TYPES ────────────────────────────────────────────────────────────────────

interface TeamMember {
  id: number | string;
  name: string;
  role: string;
  team: string;
  tagline: string;
  bio: string;
  contribution: string;
  motivation: string;
  photo: string;
  accent: string;
}

// ─── DATA ────────────────────────────────────────────────────────────────────

const teamSections = [
  {
    id: 'development',
    title: 'Development Team',
    icon: <IconCode />,
    description: 'Building the digital backbone of Totoz — ConnectCare, TalkEasy, LearnWell, Parent Circle, and the systems that hold it all together.',
    accent: '#659ec3',
    note: null,
    members: [
      {
        id: 1,
        name: 'Clinton Omondi',
        role: 'Backend / Systems',
        team: 'Development',
        tagline: 'Systems that hold the mission together.',
        bio: 'Clinton built and continues to run the backend infrastructure of the Totoz platform — from database architecture using Prisma and PostgreSQL to the Node.js services that power every tool the team ships.',
        contribution: 'Architects the backend: API design, database schemas, authentication systems, and all server-side logic that makes the platform function reliably.',
        motivation: 'He believes that good intentions without good systems collapse under their own weight. His job is to make sure Totoz never does.',
        photo: clintonPhoto,
        accent: '#659ec3',
      },
      {
        id: 2,
        name: 'George Claudio',
        role: 'Frontend Developer',
        team: 'Development',
        tagline: 'Making care feel warm, even on a screen.',
        bio: 'George is responsible for the visual and interactive layer of every Totoz product. He takes complex emotional tools and makes them feel intuitive, accessible, and human.',
        contribution: 'Designs and implements all frontend interfaces across the platform — keeping accessibility, clarity, and emotional tone at the center of every screen.',
        motivation: 'He knows that a child\'s caregiver won\'t use a tool that feels cold or confusing. Design is care.',
        photo: georgePhoto,
        accent: '#659ec3',
      },
    ],
  },
  {
    id: 'content',
    title: 'Content Team',
    icon: <IconBook />,
    description: 'Telling the story, building awareness, and turning complex mental health knowledge into language that communities can actually use.',
    accent: '#1e3a6e',
    note: 'This team carries a real challenge: consistency. Building good content rhythms is hard, and the team knows it. The work continues.',
    members: [
      {
        id: 3,
        name: 'Viona',
        role: 'Content Lead',
        team: 'Content',
        tagline: 'Saying the right thing, in the right way, to the right people.',
        bio: 'Viona leads the content team with a focus on making Totoz\'s message land — not just reach. She manages social media presence, awareness campaigns, and ensures the organization speaks with clarity and consistency.',
        contribution: 'Drives the content strategy, manages the team\'s editorial calendar, and maintains Totoz\'s voice across all channels.',
        motivation: 'She understands that a misunderstood message is as dangerous as silence — and works hard to make sure Totoz says what it means.',
        photo: vionaPhoto,
        accent: '#1e3a6e',
      },
      {
        id: 4,
        name: 'Precious',
        role: 'Content & Outreach',
        team: 'Content',
        tagline: 'Bridging the story between teams.',
        bio: 'Precious works across the content and outreach teams — creating stories that reflect real community experiences and helping amplify the work happening on the ground.',
        contribution: 'Produces written and visual content that connects Totoz\'s field activities to its digital presence, making the work visible.',
        motivation: 'She believes the stories of real children and caregivers deserve to be told with honesty — not polished into something unrecognizable.',
        photo: preciousPhoto,
        accent: '#1e3a6e',
      },
      {
        id: 5,
        name: 'Faith',
        role: 'Content Contributor',
        team: 'Content',
        tagline: 'Bringing creative depth to the mission.',
        bio: 'Faith contributes to the content pipeline with a focus on educational storytelling — helping frame mental health concepts in ways that resonate with young caregivers and community members.',
        contribution: 'Creates content that educates without lecturing, supporting the team\'s awareness campaigns and digital materials.',
        motivation: 'She joined Totoz because she believes that better information can break cycles — and that starts with how we tell the story.',
        photo: faithPhoto,
        accent: '#1e3a6e',
      },
    ],
  },
  {
    id: 'outreach',
    title: 'Outreach & Community Engagement',
    icon: <IconGlobe />,
    description: 'An app cannot heal a child — the community must. This team takes Totoz into schools, children\'s homes, libraries, and living rooms.',
    accent: '#e9924b',
    note: null,
    members: [
      {
        id: 6,
        name: 'Khadija',
        role: 'Outreach Lead',
        team: 'Outreach',
        tagline: 'Real change happens where people actually live.',
        bio: 'Khadija leads community engagement for Totoz — coordinating school visits, partnerships with children\'s homes and libraries, caregiver sessions, and mentorship programs. She brings structure and warmth to every interaction.',
        contribution: 'Plans and executes all in-person outreach, builds relationships with institutions, and ensures that Totoz\'s presence in communities is consistent, not transactional.',
        motivation: 'She knows that trust takes time and must be earned. She shows up — repeatedly.',
        photo: khadijaPhoto,
        accent: '#e9924b',
      },
      {
        id: 7,
        name: 'Davine',
        role: 'Deputy Project Lead / Outreach',
        team: 'Outreach',
        tagline: 'The idea came from lived experience. That\'s still what drives it.',
        bio: 'Davine is the origin of the Totoz idea — a reflection on childhood, on the emotional gaps children face, and on what it means when the adults in a child\'s life simply don\'t know how to help. That reflection became a conversation. That conversation became this organization.',
        contribution: 'Brings original vision and lived insight to the outreach and research teams, grounding the work in its founding purpose.',
        motivation: 'The idea grew from what Davine observed — that children are not difficult. They are simply growing in environments that were never designed to support them emotionally.',
        photo: davinePhoto,
        accent: '#e9924b',
      },
      {
        id: 8,
        name: 'Precious',
        role: 'Outreach Support',
        team: 'Outreach',
        tagline: 'Present in the field, present in the story.',
        bio: 'Precious contributes to both the outreach and content teams — being present during community sessions and helping document and amplify the impact of that work.',
        contribution: 'Supports field activities and helps translate outreach experiences into content that builds organizational credibility.',
        motivation: 'She is driven by the belief that the most important work is the work done quietly, in person, where no one is watching.',
        photo: preciousPhoto,
        accent: '#e9924b',
      },
    ],
  },
  {
    id: 'research',
    title: 'Research Team',
    icon: <IconMicroscope />,
    description: 'Every Totoz decision is grounded in data. The research team exists to make sure the work is informed — not assumed.',
    accent: '#659ec3',
    note: null,
    members: [
      {
        id: 9,
        name: 'Naomi Moraa',
        role: 'Research Lead',
        team: 'Research',
        tagline: 'We cannot solve what we haven\'t taken the time to understand.',
        bio: 'Naomi leads the research function at Totoz — managing needs assessments, research calendars, and translating findings into direction that other teams can act on. She ensures Totoz never works from assumptions alone.',
        contribution: 'Designs and conducts community-based research, maintains the organization\'s research calendar, and provides regular insights that shape strategy across all teams.',
        motivation: 'She believes that the most dangerous kind of help is help that hasn\'t listened first.',
        photo: naomiPhoto,
        accent: '#659ec3',
      },
      {
        id: 10,
        name: 'Davine',
        role: 'Research Support / Deputy Lead',
        team: 'Research',
        tagline: 'The original question is still being asked.',
        bio: 'Davine\'s role in research connects back to the founding question: what do children actually need, and why are the systems around them failing them? That question drives the research agenda.',
        contribution: 'Contributes to research framing, community insights, and the continuous alignment of research findings with organizational purpose.',
        motivation: 'The research is personal. The findings are not abstract — they reflect childhoods Davine observed and cares about changing.',
        photo: davinePhoto,
        accent: '#659ec3',
      },
      {
        id: 11,
        name: 'June',
        role: 'Research Contributor',
        team: 'Research',
        tagline: 'Data is only useful when it asks the right question.',
        bio: 'June supports the research team with data collection, analysis support, and helping to ensure that Totoz\'s understanding of caregivers and children stays grounded in current realities.',
        contribution: 'Assists in fieldwork, data gathering, and synthesis — keeping the research pipeline active and relevant.',
        motivation: 'She joined Totoz because she believes that children\'s mental health deserves the same rigor of evidence that any medical or social question does.',
        photo: 'https://images.unsplash.com/photo-1592621385612-4d7129426394?w=600&auto=format&fit=crop&q=80',
        accent: '#659ec3',
      },
    ],
  },
  {
    id: 'media',
    title: 'Media Team',
    icon: <IconCamera />,
    description: 'Visual identity, photography, videography, and the branding that makes people stop, look, and understand what Totoz is doing.',
    accent: '#1e3a6e',
    note: null,
    members: [
      {
        id: 12,
        name: 'Roshan',
        role: 'Media — Visual Identity & Branding',
        team: 'Media',
        tagline: 'How something looks is part of what it says.',
        bio: 'Roshan handles the visual identity of Totoz — ensuring that everything the organization puts out looks deliberate, consistent, and true to its mission. From posters to brand systems, Roshan makes Totoz recognizable.',
        contribution: 'Leads visual branding, designs print and digital assets, and maintains the design standards that make Totoz look like a serious organization.',
        motivation: 'He believes that credibility is visual before it\'s verbal. People judge before they read.',
        photo: roshanPhoto,
        accent: '#1e3a6e',
      },
      {
        id: 13,
        name: 'Austin',
        role: 'Media — Photography & Videography',
        team: 'Media',
        tagline: 'The real work deserves to be seen.',
        bio: 'Austin documents the life of Totoz in the field — capturing outreach sessions, community interactions, and the human moments that make the mission real. His lens is the organization\'s memory.',
        contribution: 'Produces photo and video documentation of Totoz\'s work, supports visual storytelling, and helps create media assets for campaigns and reports.',
        motivation: 'He knows that one honest image of real work can do more for trust than a hundred polished statements.',
        photo: austinPhoto,
        accent: '#1e3a6e',
      },
    ],
  },
];

// ─── TEAM MEMBER CARD ────────────────────────────────────────────────────────

const TeamCard: React.FC<{ member: TeamMember; delay?: number }> = ({ member, delay = 0 }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <Reveal delay={delay}>
      <div
        className={`group relative bg-white rounded-3xl overflow-hidden shadow-sm transition-all duration-500 cursor-pointer
          ${expanded ? 'shadow-2xl -translate-y-1' : 'hover:shadow-xl hover:-translate-y-1'}`}
        style={{ border: expanded ? `1px solid ${member.accent}30` : '1px solid rgba(30,58,110,0.08)' }}
        onClick={() => setExpanded(!expanded)}
      >
        {/* Photo */}
        <div className="relative h-56 overflow-hidden">
          <img
            src={member.photo}
            alt={member.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1e3a6e]/60 via-transparent to-transparent" />

          <div
            className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center shadow-lg"
            style={{ backgroundColor: member.accent }}
          >
            <span className="text-white text-xs font-bold">{member.name.charAt(0)}</span>
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-4">
            <p className="font-heading font-extrabold text-white text-base leading-tight">{member.name}</p>
            <p className="text-white/70 text-xs mt-0.5">{member.role}</p>
          </div>
        </div>

        {/* Card body */}
        <div className="p-5">
          <p className="text-[#1e3a6e]/65 text-sm leading-relaxed italic mb-4">
            "{member.tagline}"
          </p>

          <div className="flex items-center justify-between" style={{ color: member.accent }}>
            <span className="text-xs font-semibold">{expanded ? 'Show less' : 'Their story'}</span>
            <div className={`transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`}>
              <IconChevronDown />
            </div>
          </div>

          <div className={`overflow-hidden transition-all duration-500 ${expanded ? 'max-h-[500px] mt-4' : 'max-h-0'}`}>
            <div className="border-t border-[#1e3a6e]/8 pt-4 space-y-3">
              <p className="text-[#1e3a6e]/65 text-sm leading-relaxed">{member.bio}</p>

              <div className="bg-[#f0f6fb] rounded-xl p-3">
                <p className="text-[#1e3a6e]/45 text-[10px] font-semibold tracking-widest uppercase mb-1">What they bring</p>
                <p className="text-[#1e3a6e]/70 text-xs leading-relaxed">{member.contribution}</p>
              </div>

              <div className="rounded-xl p-3" style={{ backgroundColor: member.accent + '10' }}>
                <p className="text-[10px] font-semibold tracking-widest uppercase mb-1" style={{ color: member.accent + 'aa' }}>
                  Why they care
                </p>
                <p className="text-[#1e3a6e]/70 text-xs leading-relaxed">{member.motivation}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Reveal>
  );
};

// ─── HERO SECTION ────────────────────────────────────────────────────────────

const Hero: React.FC = () => {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => { const t = setTimeout(() => setLoaded(true), 80); return () => clearTimeout(t); }, []);

  return (
    <section className="relative min-h-[80vh] flex flex-col justify-center overflow-hidden mt-16 sm:mt-20">
      <div className="absolute inset-0 bg-gradient-to-br from-[#1e3a6e] via-[#2a4f8a] to-[#1a3560]" />
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '28px 28px' }}
      />
      <div className="absolute bottom-0 left-0 right-0 h-80 bg-gradient-to-t from-[#e9924b]/15 to-transparent" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-[#659ec3]/15 blur-[80px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-[#e9924b]/10 blur-[60px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 lg:px-20 py-24">
        <div
          className="max-w-3xl transition-all duration-1000"
          style={{ opacity: loaded ? 1 : 0, transform: loaded ? 'translateY(0)' : 'translateY(28px)' }}
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="h-px w-10 bg-[#e9924b]" />
            <span className="text-[#e9924b] text-xs font-semibold tracking-[0.2em] uppercase">Meet the Team</span>
          </div>

          <h1 className="font-heading text-4xl md:text-5xl lg:text-[3.5rem] font-extrabold text-white leading-[1.06] mb-6">
            Built from a question<br />
            no one was asking.
          </h1>

          <p
            className="text-white/65 text-base md:text-lg leading-relaxed mb-4 max-w-2xl"
            style={{ opacity: loaded ? 1 : 0, transition: 'opacity 1s ease', transitionDelay: '200ms' }}
          >
            Why are children growing up without the emotional language they need — and why is no one building the systems to change that?
          </p>

          <p
            className="text-white/45 text-sm leading-relaxed max-w-xl mb-10"
            style={{ opacity: loaded ? 1 : 0, transition: 'opacity 1s ease', transitionDelay: '350ms' }}
          >
            Totoz Wellness didn't start as a project proposal or a funding application. It started as a reflection — honest, uncomfortable, and necessary. The people on this page are here because they believed the answer mattered.
          </p>

          {/* Stats row */}
          <div
            className="flex flex-wrap gap-6 mt-8"
            style={{ opacity: loaded ? 1 : 0, transition: 'opacity 1s ease', transitionDelay: '500ms' }}
          >
            {[
              { n: '5', label: 'Functional Teams' },
              { n: '13+', label: 'Team Members' },
              { n: '1', label: 'Founding Idea' },
            ].map(({ n, label }) => (
              <div key={label} className="flex flex-col">
                <span className="text-white font-extrabold text-2xl leading-none">{n}</span>
                <span className="text-white/40 text-xs mt-1 tracking-wide">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 opacity-30">
        <div className="w-px h-10 bg-white animate-pulse" />
        <span className="text-white text-[10px] tracking-widest uppercase">Scroll</span>
      </div>
    </section>
  );
};

// ─── ORIGIN STORY ─────────────────────────────────────────────────────────────

const OriginStory: React.FC = () => (
  <section className="py-20 md:py-28 bg-[#fbfbfb]">
    <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

        {/* Image collage */}
        <Reveal className="relative h-[460px]">
          <img
            src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=900&auto=format&fit=crop&q=80"
            alt="Team together"
            className="absolute top-0 left-0 w-3/4 h-72 object-cover rounded-3xl shadow-xl"
          />
          <img
            src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800&auto=format&fit=crop&q=75"
            alt="Community work"
            className="absolute bottom-0 right-0 w-3/5 h-56 object-cover rounded-3xl shadow-xl border-4 border-white"
          />
          <div className="absolute bottom-24 left-2 bg-[#1e3a6e] text-white rounded-2xl px-5 py-4 shadow-2xl max-w-[220px] z-10">
            <p className="text-xs leading-relaxed italic text-white/85">
              "It started as a reflection. It grew into a responsibility."
            </p>
            <div className="mt-2 h-px bg-[#e9924b]/40" />
            <p className="text-[#e9924b] text-[10px] mt-1.5 tracking-wide">— How Totoz began</p>
          </div>
        </Reveal>

        {/* Text */}
        <div>
          <Reveal>
            <SectionLabel>How we came together</SectionLabel>
            <h2 className="font-heading text-3xl md:text-4xl font-extrabold text-[#1e3a6e] leading-tight mb-6">
              Not a pitch deck.<br />A lived observation.
            </h2>
          </Reveal>
          <Reveal delay={80}>
            <p className="text-[#1e3a6e]/60 text-sm leading-relaxed mb-4">
              Totoz Wellness was not born in a boardroom or from a grant application. It started when Davine began to reflect — honestly — on what childhood actually looks like for many children in this region. Children raised without emotional language. Caregivers doing their best without the tools to do better. Teachers and religious institutions carrying enormous influence but often no training in emotional safety.
            </p>
          </Reveal>
          <Reveal delay={140}>
            <p className="text-[#1e3a6e]/60 text-sm leading-relaxed mb-4">
              That reflection became a conversation. The conversation found people. And over time, the idea needed more than a conversation — it needed structure, execution, and someone to build the systems that would make it real.
            </p>
          </Reveal>
          <Reveal delay={200}>
            <p className="text-[#1e3a6e]/60 text-sm leading-relaxed mb-8">
              Clinton took on that responsibility. Not because the idea was his — but because the mission deserved someone willing to build it properly, lead across every team, and see it through. That's the honest version of how Totoz became what it is today.
            </p>
          </Reveal>
          <Reveal delay={260}>
            <div className="flex flex-wrap gap-2">
              {['Youth-led', 'Community-rooted', 'Research-backed', 'Structured for impact', 'Honestly built'].map(tag => (
                <span key={tag} className="bg-[#1e3a6e]/6 text-[#1e3a6e] text-xs font-semibold px-3 py-1.5 rounded-full border border-[#1e3a6e]/10">
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

// ─── LEADERSHIP SECTION ──────────────────────────────────────────────────────

const Leadership: React.FC = () => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const leaders = [
    {
      id: 'clinton',
      name: 'Clinton Omondi',
      role: 'Project Lead — Chairperson',
      badge: 'Builder & Driver',
      badgeColor: '#e9924b',
      tagline: 'Building systems that make the mission impossible to ignore.',
      bio: 'Clinton is the person who took a founding idea and turned it into a functioning organization. He structured the teams, built the systems, drove execution, and leads across every department of Totoz Wellness. His fingerprints are on every major decision — from the backend architecture of the platform to the way the organization plans and prioritizes its work.',
      contribution: 'Overall strategy, organizational structure, execution leadership, team management, and backend development. Clinton runs the organization.',
      motivation: 'He believes that passion without systems is just noise — and that children deserve work that is built to last, not just to impress.',
      photo: clintonPhoto,
      clarification: 'Clinton did not originate the idea — but he is the reason it exists as an organization today.',
    },
    {
      id: 'davine',
      name: 'Davine',
      role: 'Deputy Project Lead',
      badge: 'Origin & Vision',
      badgeColor: '#659ec3',
      tagline: 'The question Totoz was built to answer came from here.',
      bio: 'Davine is where the idea of Totoz Wellness began. Not as a strategy — but as a genuine reckoning with childhood: what it costs a child to grow up without emotional safety, and what it means when caregivers, teachers, and institutions don\'t have the tools to provide it. Davine shared that reflection, and it found people who cared.',
      contribution: 'Founding vision, early direction, and ongoing contribution to the Research and Outreach teams. Davine remains an active part of the mission.',
      motivation: 'The observation was personal. The commitment is ongoing. The question that started Totoz is still worth answering.',
      photo: davinePhoto,
      clarification: 'Davine started the idea — and continues to shape it through research and community work.',
    },
  ];

  return (
    <section className="py-20 md:py-28 bg-[#1e3a6e] relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-[#e9924b]/8 blur-[80px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-[#659ec3]/10 blur-[60px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
        <Reveal>
          <SectionLabel>Leadership</SectionLabel>
          <h2 className="font-heading text-3xl md:text-4xl font-extrabold text-white leading-tight mb-3">
            Two people. Two roles.<br />One honest story.
          </h2>
          <p className="text-white/45 text-sm leading-relaxed mb-12 max-w-lg">
            Totoz has two leaders who are not interchangeable. One originated the idea. One built the organization. Both are essential — and the distinction matters.
          </p>
        </Reveal>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {leaders.map((leader, i) => (
            <Reveal key={leader.id} delay={i * 100}>
              <div
                className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden hover:bg-white/8 transition-all duration-300 cursor-pointer"
                onClick={() => setExpandedId(expandedId === leader.id ? null : leader.id)}
              >
                {/* Top: image + name */}
                <div className="flex gap-5 p-6 pb-0 items-start">
                  <div className="relative flex-shrink-0">
                    <img
                      src={leader.photo}
                      alt={leader.name}
                      className="w-20 h-20 rounded-2xl object-cover"
                    />
                    <div
                      className="absolute -bottom-2 -right-2 rounded-full px-2.5 py-0.5 text-[9px] font-bold text-white shadow-lg whitespace-nowrap"
                      style={{ backgroundColor: leader.badgeColor }}
                    >
                      {leader.badge}
                    </div>
                  </div>
                  <div className="pt-1">
                    <h3 className="font-heading font-extrabold text-white text-xl mb-0.5">{leader.name}</h3>
                    <p className="text-white/50 text-xs font-semibold tracking-wide uppercase">{leader.role}</p>
                  </div>
                </div>

                <div className="p-6">
                  <p className="text-white/60 text-sm leading-relaxed italic mb-4">"{leader.tagline}"</p>

                  {/* Clarification pill */}
                  <div className="bg-white/5 border border-white/8 rounded-xl px-4 py-2.5 mb-4">
                    <p className="text-white/50 text-xs leading-relaxed">{leader.clarification}</p>
                  </div>

                  <div className="flex items-center justify-between" style={{ color: leader.badgeColor }}>
                    <span className="text-xs font-semibold">{expandedId === leader.id ? 'Show less' : 'Full profile'}</span>
                    <div className={`transition-transform duration-300 ${expandedId === leader.id ? 'rotate-180' : ''}`}>
                      <IconChevronDown />
                    </div>
                  </div>

                  <div className={`overflow-hidden transition-all duration-500 ${expandedId === leader.id ? 'max-h-[500px] mt-4' : 'max-h-0'}`}>
                    <div className="border-t border-white/8 pt-4 space-y-3">
                      <p className="text-white/60 text-sm leading-relaxed">{leader.bio}</p>
                      <div className="bg-white/5 rounded-xl p-3">
                        <p className="text-white/35 text-[10px] font-semibold tracking-widest uppercase mb-1">What they own</p>
                        <p className="text-white/60 text-xs leading-relaxed">{leader.contribution}</p>
                      </div>
                      <div className="rounded-xl p-3" style={{ backgroundColor: leader.badgeColor + '15' }}>
                        <p className="text-[10px] font-semibold tracking-widest uppercase mb-1" style={{ color: leader.badgeColor + 'aa' }}>
                          Why they're here
                        </p>
                        <p className="text-white/60 text-xs leading-relaxed">{leader.motivation}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

// ─── TEAM SECTIONS ───────────────────────────────────────────────────────────

const TeamSections: React.FC = () => (
  <section className="py-20 md:py-28 bg-[#fbfbfb]">
    <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
      <Reveal>
        <SectionLabel>The Full Team</SectionLabel>
        <h2 className="font-heading text-3xl md:text-4xl font-extrabold text-[#1e3a6e] leading-tight mb-3">
          Five teams. One mission.
        </h2>
        <p className="text-[#1e3a6e]/55 text-sm leading-relaxed mb-16 max-w-lg">
          Totoz is not random people with good intentions. It's a structured organization where each team owns a critical part of the mission — and knows why their part matters.
        </p>
      </Reveal>

      <div className="space-y-20">
        {teamSections.map((section, si) => (
          <div key={section.id}>
            <Reveal>
              <div
                className="flex items-start gap-4 mb-6 pb-6 border-b"
                style={{ borderColor: section.accent + '20' }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ backgroundColor: section.accent + '18', color: section.accent }}
                >
                  {section.icon}
                </div>
                <div className="flex-1">
                  <h3 className="font-heading font-extrabold text-[#1e3a6e] text-xl mb-1">{section.title}</h3>
                  <p className="text-[#1e3a6e]/50 text-sm max-w-2xl leading-relaxed">{section.description}</p>
                  {section.note && (
                    <div
                      className="mt-3 inline-flex items-start gap-2 bg-[#e9924b]/8 border border-[#e9924b]/20 rounded-xl px-4 py-2.5 max-w-xl"
                    >
                      <span className="text-[#e9924b] text-xs mt-0.5 flex-shrink-0">⚠</span>
                      <p className="text-[#1e3a6e]/55 text-xs leading-relaxed italic">{section.note}</p>
                    </div>
                  )}
                </div>
              </div>
            </Reveal>

            <div className={`grid grid-cols-1 sm:grid-cols-2 ${section.members.length >= 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-2'} gap-5`}>
              {section.members.map((member, mi) => (
                <TeamCard key={`${section.id}-${member.id}-${mi}`} member={member as TeamMember} delay={mi * 80} />
              ))}
            </div>

            {si < teamSections.length - 1 && (
              <div className="mt-16 h-px bg-[#1e3a6e]/6" />
            )}
          </div>
        ))}
      </div>
    </div>
  </section>
);

// ─── VOLUNTEERS SECTION ──────────────────────────────────────────────────────

const VolunteersSection: React.FC = () => (
  <section className="py-20 md:py-28 bg-[#f0f6fb]">
    <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-16 items-start">
        {/* Text */}
        <div className="lg:sticky lg:top-28">
          <Reveal>
            <SectionLabel>Volunteers</SectionLabel>
            <h2 className="font-heading text-3xl md:text-4xl font-extrabold text-[#1e3a6e] leading-tight mb-5">
              This organization<br />is bigger than<br />its core team.
            </h2>
          </Reveal>
          <Reveal delay={80}>
            <p className="text-[#1e3a6e]/60 text-sm leading-relaxed mb-5">
              Volunteers are not extras. They are part of why Totoz can show up in more places, reach more people, and do more than a small core team could alone.
            </p>
          </Reveal>
          <Reveal delay={140}>
            <p className="text-[#1e3a6e]/60 text-sm leading-relaxed mb-8">
              From community sessions to content support, from research fieldwork to media — each volunteer brings something real. The mission is held by more hands than this page can fully capture.
            </p>
          </Reveal>

          <Reveal delay={200}>
            <div className="flex flex-wrap gap-3">
              <div className="bg-white border border-[#1e3a6e]/10 rounded-xl px-5 py-3 shadow-sm">
                <p className="font-heading font-extrabold text-[#e9924b] text-xl">6+</p>
                <p className="text-[#1e3a6e]/50 text-xs">Active volunteers</p>
              </div>
              <div className="bg-white border border-[#1e3a6e]/10 rounded-xl px-5 py-3 shadow-sm">
                <p className="font-heading font-extrabold text-[#659ec3] text-xl">Growing</p>
                <p className="text-[#1e3a6e]/50 text-xs">Network expanding</p>
              </div>
            </div>
          </Reveal>

          <Reveal delay={260}>
            <div className="mt-8 bg-[#1e3a6e]/5 border border-[#1e3a6e]/10 rounded-2xl p-5">
              <p className="text-[#1e3a6e] text-xs font-semibold mb-2 tracking-wide uppercase">Want to volunteer?</p>
              <p className="text-[#1e3a6e]/55 text-sm leading-relaxed">
                If you bring time, skills, lived experience, or simply a genuine desire to support children's mental health — there is space for you here.
              </p>
            </div>
          </Reveal>
        </div>

        {/* Volunteer grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {[
            { id: 'v1', name: 'Volunteer — Community Support', role: 'Community outreach & engagement', photo: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=300&auto=format&fit=crop&q=80' },
            { id: 'v2', name: 'Volunteer — Content', role: 'Writing & social media', photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&auto=format&fit=crop&q=80' },
            { id: 'v3', name: 'Volunteer — Outreach', role: 'Field activities & community sessions', photo: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=300&auto=format&fit=crop&q=80' },
            { id: 'v4', name: 'Volunteer — Research', role: 'Data collection & analysis', photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80' },
            { id: 'v5', name: 'Volunteer — Media', role: 'Visual content & documentation', photo: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=300&auto=format&fit=crop&q=80' },
            { id: 'v6', name: 'Volunteer — Community Support', role: 'Mentorship & caregiver engagement', photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80' },
          ].map((vol, i) => (
            <Reveal key={vol.id} delay={i * 60}>
              <div className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 border border-[#1e3a6e]/8">
                <div className="h-32 overflow-hidden relative">
                  <img
                    src={vol.photo}
                    alt="Volunteer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1e3a6e]/30 to-transparent" />
                </div>
                <div className="p-3">
                  <p className="font-heading font-bold text-[#1e3a6e] text-xs leading-tight">{vol.name}</p>
                  <p className="text-[#1e3a6e]/40 text-[10px] mt-0.5 leading-tight">{vol.role}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </div>
  </section>
);

// ─── CULTURE & VALUES ────────────────────────────────────────────────────────

const CultureValues: React.FC = () => {
  const values = [
    { icon: '🤝', title: 'Empathy first', statement: '"We listen before we act — especially in communities where trust is not given, it is earned."', accent: '#e9924b' },
    { icon: '🔬', title: 'Evidence, not assumption', statement: '"We do not guess what children or caregivers need. We research it, then we respond."', accent: '#659ec3' },
    { icon: '🌱', title: 'Honesty about where we are', statement: '"We are not finished. Some things are not working yet. We say so — and we keep working."', accent: '#e9924b' },
    { icon: '🛡️', title: 'Integrity over polish', statement: '"We would rather show real work than present a version of ourselves that doesn\'t exist."', accent: '#659ec3' },
    { icon: '🏘️', title: 'Community over platform', statement: '"Technology supports human connection. It does not replace the work of being present."', accent: '#e9924b' },
    { icon: '🎯', title: 'Systems, not just passion', statement: '"Good intentions without structure collapse. We are here to build something that lasts."', accent: '#659ec3' },
  ];

  return (
    <section className="py-20 md:py-28 bg-[#1e3a6e] relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-[#659ec3]/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-[#e9924b]/8 blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
        <Reveal>
          <SectionLabel>How we show up</SectionLabel>
          <h2 className="font-heading text-3xl md:text-4xl font-extrabold text-white leading-tight mb-4">
            Our values are not<br />words on a wall.
          </h2>
          <p className="text-white/50 text-sm leading-relaxed mb-14 max-w-md">
            These are patterns of behavior — ways the team holds itself accountable, especially when no one is watching.
          </p>
        </Reveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {values.map((v, i) => (
            <Reveal key={i} delay={i * 60}>
              <div
                className="bg-white/5 border border-white/8 rounded-2xl p-6 hover:bg-white/10 hover:border-white/15 transition-all duration-300 h-full flex flex-col"
              >
                <div className="text-2xl mb-4">{v.icon}</div>
                <h4 className="font-heading font-bold text-white text-base mb-3">{v.title}</h4>
                <p className="text-white/50 text-sm leading-relaxed italic flex-1">{v.statement}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

// ─── JOIN CTA ────────────────────────────────────────────────────────────────

const JoinCTA: React.FC = () => {
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
            <span><IconHeart /></span>
            Be part of this
          </div>

          <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-extrabold text-white mb-5 leading-tight">
            This work needs<br />more people who mean it.
          </h2>
          <p className="text-white/80 text-sm md:text-base max-w-lg mx-auto mb-10 leading-relaxed">
            Whether you bring time, skills, research ability, or lived experience — there is a place for you in the work of building emotionally safe childhoods in Kenya.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={() => navigate('/volunteer')}
              className="bg-white text-[#e9924b] font-bold py-3 px-8 rounded-full text-sm hover:shadow-xl hover:-translate-y-0.5 transition-all"
            >
              Join as Volunteer
            </button>
            <button
              onClick={() => navigate('/contact')}
              className="bg-transparent border-2 border-white text-white font-bold py-3 px-8 rounded-full text-sm hover:bg-white/15 transition-all"
            >
              Partner With Us
            </button>
            <button
              onClick={() => navigate('/contact')}
              className="bg-[#1e3a6e] text-white font-bold py-3 px-8 rounded-full text-sm hover:bg-[#1e3a6e]/90 transition-all hover:-translate-y-0.5"
            >
              Contact the Team
            </button>
          </div>
        </div>
      </Reveal>
    </section>
  );
};

// ─── PAGE ────────────────────────────────────────────────────────────────────

const Team: React.FC = () => {
  return (
    <div className="bg-[#fbfbfb] overflow-x-hidden min-h-screen">
      <Navbar />
      <main>
        <Hero />
        <OriginStory />
        <Leadership />
        <TeamSections />
        <VolunteersSection />
        <CultureValues />
        <JoinCTA />
      </main>
      <Footer />
    </div>
  );
};

export default Team;
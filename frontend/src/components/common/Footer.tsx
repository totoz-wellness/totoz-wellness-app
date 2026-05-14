import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FacebookIcon } from '../icons/FacebookIcon';
import { InstagramIcon } from '../icons/InstagramIcon';
import { LinkedInIcon } from '../icons/LinkedInIcon';
import { XLogo } from '../icons/XLogo';
import { TiktokIcon } from '../icons/TiktokIcon';
import { YoutubeIcon } from '../icons/YoutubeIcon';
import { WhatsappChannelIcon } from '../icons/WhatsappChannelIcon';

const Footer: React.FC = () => {
  const navigate = useNavigate();

  const linkClass =
    'text-sm text-white/50 hover:text-white transition-colors duration-200 text-left w-fit block';

  return (
    <footer className="bg-[#1e3a6e] text-white">
      {/* Top accent line */}
      <div className="h-1 w-full bg-gradient-to-r from-[#e9924b] via-[#659ec3] to-[#e9924b]" />

      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 py-16 md:py-20">
        {/* Main grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">

          {/* ── Brand ──────────────────────────────── */}
          <div className="sm:col-span-2 lg:col-span-1">
            <p className="font-heading font-extrabold text-white text-lg mb-2 tracking-tight">
              Totoz Wellness
            </p>
            <p className="text-sm text-white/50 leading-relaxed mb-6 max-w-xs">
              Supporting caregivers and communities in raising emotionally healthy children.
            </p>

            {/* Social icons */}
            <div className="flex flex-wrap gap-4">
              {[
                { href: 'https://x.com/totozwellness', icon: <XLogo />, label: 'X' },
                { href: 'https://web.facebook.com/profile.php?id=61582845514552', icon: <FacebookIcon />, label: 'Facebook' },
                { href: 'https://www.instagram.com/totozwellness', icon: <InstagramIcon />, label: 'Instagram' },
                { href: 'https://www.linkedin.com/company/totozwellness/', icon: <LinkedInIcon />, label: 'LinkedIn' },
                { href: 'https://www.tiktok.com/@totoz.wellness', icon: <TiktokIcon />, label: 'TikTok' },
                { href: 'https://www.youtube.com/@totozwellness', icon: <YoutubeIcon />, label: 'YouTube' },
                { href: 'https://whatsapp.com/channel/0029Vb796fyId7nG2ecaJQ2F', icon: <WhatsappChannelIcon />, label: 'WhatsApp' },
              ].map(({ href, icon, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="text-white/40 hover:text-[#e9924b] transition-colors duration-200"
                >
                  {icon}
                </a>
              ))}
            </div>
          </div>

          {/* ── Explore ────────────────────────────── */}
          <div>
            <p className="text-xs font-semibold tracking-[0.15em] uppercase text-[#e9924b] mb-4">
              Explore
            </p>
            <ul className="space-y-2.5">
              {[
                { label: 'Home',         path: '/' },
                { label: 'Features',     path: '/features' },
                { label: 'Programs',     path: '/programs' },
                { label: 'Get Involved', path: '/get-involved' },
                { label: 'About',        path: '/about' },
              ].map(({ label, path }) => (
                <li key={label}>
                  <button onClick={() => navigate(path)} className={linkClass}>
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Tools ──────────────────────────────── */}
          <div>
            <p className="text-xs font-semibold tracking-[0.15em] uppercase text-[#e9924b] mb-4">
              Tools
            </p>
            <ul className="space-y-2.5">
              {[
                { label: 'TalkEasy',  path: '/talkeasy' },
                { label: 'GrowTrack', path: '/growtrack' },
                { label: 'LearnWell', path: '/learnwell' },
              ].map(({ label, path }) => (
                <li key={label}>
                  <button onClick={() => navigate(path)} className={linkClass}>
                    {label}
                  </button>
                </li>
              ))}
            </ul>

            <p className="text-xs font-semibold tracking-[0.15em] uppercase text-[#e9924b] mb-4 mt-8">
              Legal
            </p>
            <ul className="space-y-2.5">
              {[
                { label: 'Privacy Policy', path: '/privacy' },
                { label: 'FAQ',            path: '/faq' },
              ].map(({ label, path }) => (
                <li key={label}>
                  <button onClick={() => navigate(path)} className={linkClass}>
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Contact ────────────────────────────── */}
          <div>
            <p className="text-xs font-semibold tracking-[0.15em] uppercase text-[#e9924b] mb-4">
              Contact
            </p>
            <ul className="space-y-2.5">
              <li>
                <a
                  href="mailto:contact@totozwellness.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-white/50 hover:text-white transition-colors duration-200"
                >
                  contact@totozwellness.org
                </a>
              </li>
              <li>
                <span className="text-sm text-white/50">0797641690</span>
              </li>
            </ul>

            {/* CTA nudge */}
            <button
              onClick={() => navigate('/signup')}
              className="mt-8 px-5 py-2.5 text-sm font-semibold text-white bg-[#e9924b] hover:bg-[#d4762a] rounded-full transition-all hover:shadow-lg hover:shadow-[#e9924b]/20 hover:-translate-y-px"
            >
              Get Started
            </button>
          </div>
        </div>

        {/* ── Bottom bar ─────────────────────────────── */}
        <div className="mt-14 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-white/30">
            &copy; {new Date().getFullYear()} Totoz Wellness. All rights reserved.
          </p>
          <p className="text-xs text-white/20 italic">
            Supporting Caregivers, Nurturing Children's Mental Health
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
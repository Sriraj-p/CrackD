'use client'

import Link from 'next/link'
import { Zap, Twitter, Linkedin, Github, Heart } from 'lucide-react'

const footerLinks = {
  Product: [
    { label: 'ATS Analysis', href: '/analysis-center' },
    { label: 'Mock Interview', href: '/mock-interview' },
    { label: 'Career Chat', href: '/career-chat' },
    { label: 'Pricing', href: '#pricing' },
  ],
  Resources: [
    { label: 'Interview Guides', href: '#' },
    { label: 'Resume Templates', href: '#' },
    { label: 'Blog', href: '#' },
  ],
  Company: [
    { label: 'About', href: '#' },
    { label: 'Privacy Policy', href: '#' },
    { label: 'Terms of Service', href: '#' },
    { label: 'Contact', href: '#' },
  ],
}

export default function Footer() {
  return (
    <footer className="py-20 px-4 border-t border-border">
      <div className="max-w-5xl mx-auto">
        <div className="glass-card rounded-3xl p-10 mb-16 text-center glow-primary" style={{ borderColor: 'var(--glass-border)' }}>
          <span className="inline-block glass-card px-4 py-1.5 rounded-full text-xs font-sans text-primary uppercase tracking-widest mb-5">Start for Free</span>
          <h2 className="font-serif text-4xl md:text-5xl font-medium text-foreground text-balance mb-4">
            Your next interview is <span className="italic text-primary">closer than you think.</span>
          </h2>
          <p className="font-sans text-muted-foreground text-lg max-w-xl mx-auto leading-relaxed mb-8 text-pretty">
            Join thousands of students who prep smarter, stress less, and walk into interviews with calm confidence.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/login" className="btn-pill bg-primary text-primary-foreground text-base glow-primary hover:opacity-90 hover:scale-105 active:scale-95">Get Started — Free</Link>
            <Link href="/login" className="btn-pill glass-card text-foreground text-base border border-border hover:scale-105 active:scale-95">Try Mock Interview</Link>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-14">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-xl bg-primary flex items-center justify-center">
                <Zap className="w-3.5 h-3.5 text-primary-foreground" strokeWidth={2.5} />
              </div>
              <span className="font-serif text-lg font-semibold text-foreground">Crack<span className="text-primary italic">D</span></span>
            </div>
            <p className="font-sans text-sm text-muted-foreground leading-relaxed max-w-52 mb-5">AI-powered multi-agent interview prep designed for calm, focused students.</p>
            <div className="flex items-center gap-3">
              {[
                { Icon: Twitter, href: '#', label: 'Twitter' },
                { Icon: Linkedin, href: '#', label: 'LinkedIn' },
                { Icon: Github, href: 'https://github.com/Sriraj-p/CrackD', label: 'GitHub' },
              ].map(({ Icon, href, label }) => (
                <a key={label} href={href} aria-label={label} target={href.startsWith('http') ? '_blank' : undefined} rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  className="w-9 h-9 glass-card rounded-full flex items-center justify-center hover:scale-110 hover:border-primary/30 transition-all duration-200">
                  <Icon className="w-4 h-4 text-muted-foreground" />
                </a>
              ))}
            </div>
          </div>

          {Object.entries(footerLinks).map(([section, links]) => (
            <div key={section}>
              <p className="font-sans text-xs font-semibold text-primary uppercase tracking-widest mb-4">{section}</p>
              <ul className="flex flex-col gap-2.5">
                {links.map((l) => (
                  <li key={l.label}><Link href={l.href} className="font-sans text-sm text-muted-foreground hover:text-foreground transition-colors duration-200">{l.label}</Link></li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-border">
          <p className="font-sans text-xs text-muted-foreground">&copy; {new Date().getFullYear()} CrackD. All rights reserved.</p>
          <p className="font-sans text-xs text-muted-foreground flex items-center gap-1.5">Made with <Heart className="w-3 h-3 text-primary fill-primary" /> for students everywhere</p>
        </div>
      </div>
    </footer>
  )
}

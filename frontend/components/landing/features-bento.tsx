"use client"

import { useEffect, useRef, useState } from "react"
import { 
  FileText, 
  BarChart3, 
  MessageSquare, 
  Zap, 
  Shield, 
  Brain,
  Target,
  Clock
} from "lucide-react"

const features = [
  {
    id: "resume",
    title: "Smart Resume Parser",
    description: "AI extracts skills, experience, and achievements from any format. PDF, DOCX, or even LinkedIn.",
    icon: FileText,
    size: "large", // spans 2 cols
    gradient: true,
  },
  {
    id: "ats",
    title: "ATS Score Analysis",
    description: "Get a detailed compatibility score with keyword matching and optimization tips.",
    icon: BarChart3,
    size: "medium",
    stat: "94%",
    statLabel: "avg improvement",
  },
  {
    id: "speed",
    title: "Instant Results",
    description: "Analysis in under 30 seconds.",
    icon: Zap,
    size: "small",
  },
  {
    id: "interview",
    title: "AI Mock Interviews",
    description: "Practice with adaptive AI that adjusts difficulty based on your responses. Get real-time feedback.",
    icon: MessageSquare,
    size: "large",
    gradient: true,
  },
  {
    id: "secure",
    title: "Bank-Grade Security",
    description: "Your data is encrypted and never shared.",
    icon: Shield,
    size: "small",
  },
  {
    id: "ai",
    title: "Multi-Agent AI",
    description: "Specialized agents for parsing, scoring, and interviewing work together seamlessly.",
    icon: Brain,
    size: "medium",
  },
  {
    id: "targeted",
    title: "Role-Specific Prep",
    description: "Tailored questions for SWE, PM, Consulting, Finance, and more.",
    icon: Target,
    size: "medium",
  },
  {
    id: "time",
    title: "Save 10+ Hours",
    description: "Streamlined prep workflow.",
    icon: Clock,
    size: "small",
  },
]

export default function FeaturesBento() {
  const sectionRef = useRef<HTMLElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <section
      ref={sectionRef}
      className="relative py-32 overflow-hidden"
    >
      {/* Background glow */}
      <div 
        className="glow-orb glow-orb-lg opacity-30"
        style={{ top: "20%", left: "-20%" }}
      />

      <div className="max-w-7xl mx-auto px-6">
        {/* Section header */}
        <div className="text-center mb-20">
          <p
            className={`text-sm font-medium text-primary uppercase tracking-widest mb-4 transition-all duration-700 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            Features
          </p>
          <h2
            className={`text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 transition-all duration-700 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
            style={{ transitionDelay: "100ms" }}
          >
            Everything you need to{" "}
            <span className="gradient-text">ace interviews</span>
          </h2>
          <p
            className={`text-lg text-muted-foreground max-w-2xl mx-auto transition-all duration-700 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
            style={{ transitionDelay: "200ms" }}
          >
            Our multi-agent AI system handles every aspect of interview preparation,
            from resume optimization to realistic practice sessions.
          </p>
        </div>

        {/* Bento grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
          {features.map((feature, index) => {
            const Icon = feature.icon
            const isLarge = feature.size === "large"
            const isMedium = feature.size === "medium"

            return (
              <div
                key={feature.id}
                className={`
                  group relative rounded-2xl p-6 lg:p-8 border border-border bg-card
                  transition-all duration-500 hover:border-primary/50 hover:shadow-lg
                  ${isLarge ? "md:col-span-2 lg:col-span-2" : ""}
                  ${isMedium ? "lg:col-span-1" : ""}
                  ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}
                `}
                style={{ transitionDelay: `${300 + index * 80}ms` }}
              >
                {/* Gradient highlight for large cards */}
                {feature.gradient && (
                  <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />
                  </div>
                )}

                {/* Icon */}
                <div className={`
                  inline-flex items-center justify-center rounded-xl mb-4
                  ${isLarge ? "w-14 h-14" : "w-12 h-12"}
                  bg-primary/10 text-primary
                  group-hover:bg-primary group-hover:text-primary-foreground
                  transition-all duration-300
                `}>
                  <Icon className={isLarge ? "w-7 h-7" : "w-6 h-6"} />
                </div>

                {/* Content */}
                <h3 className={`font-semibold mb-2 ${isLarge ? "text-xl" : "text-lg"}`}>
                  {feature.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {feature.description}
                </p>

                {/* Stat badge */}
                {feature.stat && (
                  <div className="mt-6 pt-6 border-t border-border">
                    <div className="text-3xl font-bold gradient-text">{feature.stat}</div>
                    <div className="text-xs text-muted-foreground mt-1">{feature.statLabel}</div>
                  </div>
                )}

                {/* Hover arrow */}
                <div className="absolute bottom-6 right-6 lg:bottom-8 lg:right-8 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                  <svg
                    className="w-5 h-5 text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 17L17 7M17 7H7M17 7v10"
                    />
                  </svg>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

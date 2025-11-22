"use client"

import type React from "react"

import { useEffect } from "react"
import { LS_KEYS } from "@/lib/constants"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Sparkles, Zap, Brain, Volume2, GraduationCap, BookOpen, MessageCircle, Headphones, ArrowRight, CheckCircle2, Users, Mic } from "lucide-react"

export default function Home() {
  useEffect(() => {
    try {
      localStorage.removeItem(LS_KEYS.uploads)
      localStorage.removeItem(LS_KEYS.messages)
      localStorage.removeItem(LS_KEYS.active)
    } catch (e) {
      console.warn("Failed to clear persisted data on mount:", e)
    }
  }, [])

  return (
    <main className="min-h-screen from-background via-background to-primary/5">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="mb-16 text-center">
          <div className="flex items-center justify-center gap-3 mb-6 animate-fade-in">
            <div className="p-4 rounded-2xl from-primary to-secondary shadow-2xl shadow-primary/40">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-6xl md:text-7xl font-bold text-gradient">Brofessor</h1>
          </div>
          <p className="text-2xl md:text-3xl font-semibold text-foreground mb-4">
            Your AI Tutor That Talks, Explains, and Engages
          </p>
          <p className="text-lg text-muted-foreground mb-6 max-w-3xl mx-auto leading-relaxed">
            Meet <span className="font-semibold text-primary">Brofessor</span>, the world's first AI tutor designed for <span className="font-semibold text-secondary">auditory learning</span>. Perfect for those who learn best by listening, Brofessor talks, explains, and adapts — just like a real tutor.
          </p>
          <div className="flex items-center justify-center gap-4 mt-8">
            <Link href="/conversation">
              <Button size="lg" className="btn-primary rounded-full px-8 py-6 text-lg font-semibold group">
                <Headphones className="w-5 h-5 mr-2" />
                Start Learning with Brofessor
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Main Value Proposition */}
        <div className="mb-16">
            <div className="glass-effect rounded-3xl p-8 md:p-12 border-gradient shadow-2xl">
              <div className="text-center mb-8">
                <h2 className="text-3xl md:text-4xl font-bold text-gradient mb-4">
                  🎓 Learn From Your PDFs Like Never Before
                </h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Just upload any PDF — textbooks, manuals, work documents, research papers — and Brofessor becomes your personal <span className="font-semibold text-primary">audio tutor</span> for that content.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
                <div className="text-center p-6 rounded-xl bg-white/5 border border-white/10">
                  <BookOpen className="w-8 h-8 text-primary mx-auto mb-3" />
                  <h3 className="font-semibold text-foreground mb-2">Extracts & Understands</h3>
                  <p className="text-sm text-muted-foreground">Your notes from PDFs</p>
                </div>
                <div className="text-center p-6 rounded-xl bg-white/5 border border-white/10">
                  <Volume2 className="w-8 h-8 text-secondary mx-auto mb-3" />
                  <h3 className="font-semibold text-foreground mb-2">Explains in Real-Time</h3>
                  <p className="text-sm text-muted-foreground">Through clear speech</p>
                </div>
                <div className="text-center p-6 rounded-xl bg-white/5 border border-white/10">
                  <Zap className="w-8 h-8 text-primary mx-auto mb-3" />
                  <h3 className="font-semibold text-foreground mb-2">Study Faster & Smarter</h3>
                  <p className="text-sm text-muted-foreground">With auditory learning</p>
                </div>
              </div>
            </div>
          </div>

        {/* Animated AI Tutor Section */}
        <div className="mb-16">
            <div className="glass-effect rounded-3xl p-8 md:p-12 border-gradient">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="flex-1">
                  <h2 className="text-3xl md:text-4xl font-bold text-gradient mb-4">
                    🧑‍🏫 Meet the Animated AI Tutor
                  </h2>
                  <p className="text-lg text-muted-foreground mb-6">
                    A friendly, animated figure — <span className="font-semibold">glasses, red bow tie, full personality</span> — that:
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-primary mt-1 shrink-0" />
                      <span className="text-foreground">Speaks to you in <span className="font-semibold">real time</span></span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-primary mt-1 shrink-0" />
                      <span className="text-foreground">Moves and animates while talking</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-primary mt-1 shrink-0" />
                      <span className="text-foreground">Gives visual feedback to complement audio explanations</span>
                    </li>
                  </ul>
                  <p className="text-lg font-semibold text-primary mt-6">
                    It's like having a tutor who teaches <span className="text-secondary">with your ears first</span>.
                  </p>
                </div>
                <div className="shrink-0">
                  <Link href="/conversation">
                    <div className="w-64 h-64 rounded-2xl from-primary/20 to-secondary/20 border-2 border-primary/30 flex items-center justify-center cursor-pointer hover:scale-105 transition-transform group">
                      <div className="text-center">
                        <GraduationCap className="w-16 h-16 text-primary mx-auto mb-3 group-hover:scale-110 transition-transform" />
                        <p className="text-sm font-semibold text-foreground">See Brofessor in Action</p>
                      </div>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </div>

        {/* Features Grid */}
        <div className="mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-gradient mb-10">
              ⚡ Why Choose Brofessor?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FeatureCard
                icon={MessageCircle}
                title="Cross-Question Your Tutor"
                description="Confused? Ask again. Want deeper clarity? Ask why. Don't agree? Challenge it. Brofessor responds instantly, keeping the conversation going — all through auditory interaction."
                color="primary"
              />
              <FeatureCard
                icon={GraduationCap}
                title="Modes That Match Your Style"
                description="Choose Beginner (simple), Advanced (detailed), or Expert (deep technical). Switch modes anytime based on your comfort level."
                color="secondary"
              />
              <FeatureCard
                icon={Mic}
                title="Voice-Focused Learning"
                description="Have a live voice conversation with Brofessor. Audio-first experience with optional text support. Brofessor stays context-aware, using your PDF to guide every explanation."
                color="primary"
              />
              <FeatureCard
                icon={Users}
                title="Real-Time Feedback Loop"
                description="Tell Brofessor if you understood, you're confused, or want more examples. The tutor adapts instantly, keeping your auditory learning experience smooth and personalized."
                color="secondary"
              />
            </div>
          </div>

        {/* How It Works */}
        <div className="mb-16">
            <div className="glass-effect rounded-3xl p-8 md:p-12 border-gradient">
              <h2 className="text-3xl md:text-4xl font-bold text-center text-gradient mb-10">
                🚀 Start Learning Smarter
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StepCard number={1} title="Upload Your PDF" description="Drag and drop or browse your files" />
                <StepCard number={2} title="Choose Your Mode" description="Beginner, Advanced, or Expert" />
                <StepCard number={3} title="Start Talking" description="Listen and talk with Brofessor" />
                <StepCard number={4} title="Learn Faster" description="Get deeper, better understanding" />
              </div>
              <div className="text-center mt-10">
                <p className="text-xl font-semibold text-foreground mb-2">
                  Your PDF. Your pace. Your <span className="text-gradient">auditory tutor</span>.
                </p>
                <p className="text-lg text-muted-foreground">
                  <span className="font-bold text-primary">Brofessor</span> — Turning your notes into knowledge you can hear.
                </p>
              </div>
            </div>
          </div>

        {/* Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {/* Chat with Brofessor Card */}
            <Link href="/chat">
              <div className="glass-effect rounded-3xl p-8 border-gradient cursor-pointer hover:shadow-2xl hover:shadow-primary/20 transition-all duration-300 group from-primary/10 via-secondary/5 to-transparent h-full">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-4 rounded-2xl from-primary to-secondary group-hover:scale-110 transition-transform shadow-lg">
                    <GraduationCap className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors">Chat with Brofessor</h3>
                    <p className="text-sm text-muted-foreground mt-1">Text-based Learning</p>
                  </div>
                </div>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  Upload your PDF and ask questions about it. Get instant text responses from Brofessor about your documents.
                </p>
                <div className="flex items-center gap-2 text-primary font-semibold group-hover:gap-3 transition-all">
                  Start Chatting
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>

            {/* Talk with Brofessor Card */}
            <Link href="/conversation">
              <div className="glass-effect rounded-3xl p-8 border-gradient cursor-pointer hover:shadow-2xl hover:shadow-primary/20 transition-all duration-300 group from-primary/10 via-secondary/5 to-transparent h-full">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-4 rounded-2xl from-primary to-secondary group-hover:scale-110 transition-transform shadow-lg">
                    <Headphones className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors">Talk with Brofessor</h3>
                    <p className="text-sm text-muted-foreground mt-1">Live Voice Conversation</p>
                  </div>
                </div>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  Have a real-time voice conversation with Brofessor. The animated avatar speaks and responds to you in real-time.
                </p>
                <div className="flex items-center gap-2 text-primary font-semibold group-hover:gap-3 transition-all">
                  Start Conversation
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          </div>

        {/* Features Showcase */}
        <div className="glass-effect rounded-2xl p-6 border-gradient">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2 text-lg">
            <Zap className="w-5 h-5 text-primary" />
            Key Features
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FeatureItem icon={Brain} label="Smart Analysis" desc="Instant PDF insights" />
            <FeatureItem icon={Volume2} label="Voice Learning" desc="Auditory-first experience" />
            <FeatureItem icon={Sparkles} label="AI Responses" desc="Expert explanations" />
          </div>
        </div>

      </div>
    </main>
  )
}

function FeatureItem({ icon: Icon, label, desc }: { icon: any; label: string; desc: string }) {
  return (
    <div className="flex items-start gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors">
      <Icon className="w-4 h-4 text-secondary mt-1 " />
      <div>
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
    </div>
  )
}

function FeatureCard({ icon: Icon, title, description, color }: { icon: any; title: string; description: string; color: "primary" | "secondary" }) {
  return (
    <div className="glass-effect rounded-2xl p-6 border-gradient card-hover group">
      <div className={`p-3 w-fit rounded-lg from-${color} to-${color === "primary" ? "secondary" : "primary"} mb-4 group-hover:shadow-lg group-hover:shadow-${color}/30 smooth-transition`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <h3 className="text-xl font-semibold text-foreground mb-3">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </div>
  )
}

function StepCard({ number, title, description }: { number: number; title: string; description: string }) {
  return (
    <div className="text-center p-6 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
      <div className="w-12 h-12 rounded-full from-primary to-secondary flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl">
        {number}
      </div>
      <h3 className="font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  )
}

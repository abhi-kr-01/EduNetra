"use client";

import Link from "next/link";
import { Card } from "@/components/Card";
import { useEffect, useState } from "react";
import { 
  CheckCircle2, 
  ArrowRight, 
  Play, 
  Mic, 
  FileText, 
  Cpu, 
  BarChart3, 
  ShieldCheck, 
  Users, 
  Building2, 
  Binary, 
  Sparkles 
} from "lucide-react";

export default function HomePage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkLogin = () => {
      const token = localStorage.getItem("shikshanetra_token");
      const loggedIn = localStorage.getItem("shikshanetra_logged_in") === "true";
      setIsLoggedIn(!!token || loggedIn);
    };
    checkLogin();
    window.addEventListener("storage", checkLogin);
    const interval = setInterval(checkLogin, 1000);
    return () => {
      window.removeEventListener("storage", checkLogin);
      clearInterval(interval);
    };
  }, []);

  const getStartedLink = isLoggedIn ? "/upload" : "/signup";

  return (
    <div className="font-sans">
      
      {/* 1️⃣ HERO SECTION */}
      <section className="relative overflow-hidden bg-slate-50 pt-16 pb-20 sm:pt-24 sm:pb-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
            {/* Left Content */}
            <div className="max-w-2xl">
               <div className="inline-flex items-center gap-2 rounded-full bg-primary-50 px-3 py-1 text-sm font-medium text-primary-700 ring-1 ring-inset ring-primary-700/10 mb-6">
                  <span className="flex h-2 w-2 rounded-full bg-primary-600"></span>
                  AI-Powered Mentor Evaluation
               </div>
               <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-6xl mb-6 leading-[1.1]">
                 Transform Teaching Quality with <span className="text-primary-600">Fair AI Evaluation</span>
               </h1>
               <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                 Analyze teaching sessions using multimodal AI (Video, Audio, Text). Get unbiased, actionable feedback to improve mentor performance and student outcomes.
               </p>
               
               <div className="flex flex-wrap gap-4">
                 <Link href={getStartedLink} className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-8 py-4 text-base font-bold text-white shadow-lg hover:bg-slate-800 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200">
                    Get Started Free <ArrowRight className="ml-2 h-4 w-4" />
                 </Link>
                 <Link href="#how-it-works" className="inline-flex items-center justify-center rounded-xl bg-white px-8 py-4 text-base font-bold text-slate-700 border border-slate-200 shadow-sm hover:bg-slate-50 hover:border-slate-300 transition-all duration-200">
                    How It Works
                 </Link>
               </div>

               <div className="mt-8 flex items-center gap-6 text-sm font-medium text-slate-500">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    <span>No credit card required</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    <span>Instant analysis</span>
                  </div>
               </div>
            </div>

            {/* Right Visual (System Diagram) */}
            <div className="relative isolate hidden lg:block">
               <div className="absolute -inset-4 bg-gradient-to-r from-primary-100 to-indigo-100 rounded-3xl blur-3xl opacity-40 -z-10"></div>
               <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-white/50 shadow-2xl shadow-slate-200/50 p-10 transform rotate-1 hover:rotate-0 transition-transform duration-700 ease-out">
                  <div className="flex flex-col items-center gap-10">
                      {/* Inputs */}
                      <div className="flex gap-8 relative">
                          {/* Connecting lines - visual only */}
                          <div className="absolute top-full left-1/2 -translate-x-1/2 w-[80%] h-10 border-b border-r border-l border-slate-200/60 rounded-b-3xl -z-10 opacity-50"></div>
                          
                          <DataNode 
                            icon={Play} 
                            color="blue" 
                            label="Video" 
                            sublabel="Visual cues" 
                          />
                          <DataNode 
                            icon={Mic} 
                            color="purple" 
                            label="Audio" 
                            sublabel="Speech clarity" 
                          />
                          <DataNode 
                            icon={FileText} 
                            color="amber" 
                            label="Transcript" 
                            sublabel="Content depth" 
                          />
                      </div>
                      
                      {/* Processing Line with AI Core */}
                      <div className="relative flex flex-col items-center -mt-2">
                          <div className="h-8 w-0.5 bg-gradient-to-b from-slate-200 to-primary-200"></div>
                          
                          {/* AI Core Node */}
                          <div className="relative group cursor-default">
                              <div className="absolute -inset-8 bg-primary-500/10 blur-2xl rounded-full animate-pulse-slow"></div>
                              <div className="absolute -inset-1 bg-gradient-to-br from-primary-400 to-indigo-500 rounded-2xl blur opacity-40 group-hover:opacity-60 transition-opacity"></div>
                              
                              <div className="h-24 w-24 bg-slate-900 rounded-2xl flex flex-col items-center justify-center text-white shadow-2xl shadow-primary-900/20 relative z-10 border border-slate-700/50">
                                  <Sparkles className="h-8 w-8 text-primary-400 mb-1" />
                                  <span className="text-[10px] font-bold text-primary-200/80 uppercase tracking-widest">AI Engine</span>
                              </div>

                              {/* Decoration dots */}
                              <div className="absolute top-1/2 -left-4 w-2 h-2 rounded-full bg-slate-200"></div>
                              <div className="absolute top-1/2 -right-4 w-2 h-2 rounded-full bg-slate-200"></div>
                          </div>

                          <div className="h-8 w-0.5 bg-gradient-to-b from-primary-200 to-emerald-200"></div>
                      </div>

                      {/* Result Card - Mini Insight Preview */}
                      <div className="w-full max-w-sm bg-white rounded-2xl border border-slate-100 shadow-xl shadow-slate-200/50 p-5 relative overflow-hidden group">
                          <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
                          
                          <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center gap-3">
                                  <div className="h-12 w-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 font-bold text-xl shadow-sm">
                                      A+
                                  </div>
                                  <div>
                                      <div className="text-sm font-bold text-slate-900">Overall Evaluation</div>
                                      <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium mt-0.5">
                                          <CheckCircle2 className="h-3 w-3" />
                                          Analysis Complete
                                      </div>
                                  </div>
                              </div>
                          </div>

                          {/* Skeleton Metrics */}
                          <div className="space-y-3 opacity-60 mix-blend-multiply">
                              <div className="flex items-center gap-3">
                                  <div className="w-16 h-2 bg-slate-100 rounded"></div>
                                  <div className="flex-1 h-2 bg-slate-50 rounded-full overflow-hidden">
                                      <div className="h-full w-[85%] bg-emerald-400/50 rounded-full"></div>
                                  </div>
                              </div>
                              <div className="flex items-center gap-3">
                                  <div className="w-20 h-2 bg-slate-100 rounded"></div>
                                  <div className="flex-1 h-2 bg-slate-50 rounded-full overflow-hidden">
                                      <div className="h-full w-[72%] bg-emerald-400/30 rounded-full"></div>
                                  </div>
                              </div>
                          </div>
                      </div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2️⃣ HOW IT WORKS */}
      <section id="how-it-works" className="py-24 bg-white">
         <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="text-center max-w-3xl mx-auto mb-16">
               <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                  From Upload to Insight in Minutes
               </h2>
               <p className="mt-4 text-lg text-slate-600">
                  Our pipeline automates the entire evaluation process, saving hours of manual review time.
               </p>
            </div>

            <div className="grid gap-8 md:grid-cols-3 relative">
                <div className="hidden md:block absolute top-12 left-[20%] right-[20%] h-0.5 bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 -z-10"></div>
                
                <StepCard 
                   step="1"
                   title="Upload Session"
                   desc="Upload any MP4/MOV teaching session. We check video quality securely."
                   icon={Play}
                />
                <StepCard 
                   step="2"
                   title="AI Analysis"
                   desc="We process multimodal signals: tone, confidence, engagement, and content."
                   icon={Cpu}
                />
                <StepCard 
                   step="3"
                   title="Get Feedback"
                   desc="Receive a detailed scorecard with actionable coaching tips for improvement."
                   icon={BarChart3}
                />
            </div>
         </div>
      </section>

      {/* 3️⃣ FAIRNESS & ETHICS (NEW) */}
      <section className="py-24 bg-slate-900 text-white relative overflow-hidden">
         <div className="absolute top-0 right-0 -mr-20 -mt-20 h-[500px] w-[500px] rounded-full bg-primary-900/20 blur-3xl"></div>
         <div className="absolute bottom-0 left-0 -ml-20 -mb-20 h-[500px] w-[500px] rounded-full bg-indigo-900/20 blur-3xl"></div>

         <div className="mx-auto max-w-7xl px-4 sm:px-6 relative z-10">
            <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
               <div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-slate-800 px-3 py-1 text-sm font-medium text-slate-300 ring-1 ring-inset ring-slate-700 mb-6">
                     <ShieldCheck className="h-4 w-4 text-emerald-400" />
                     Ethical AI Standard
                  </div>
                  <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl mb-6">
                     Evaluation That Is Fair, Not Biased
                  </h2>
                  <p className="text-lg text-slate-400 mb-8 leading-relaxed">
                     Traditional evaluation is subjective. ShikshaNetra uses standardized signals tuned to reduce bias, ensuring every educator gets a fair assessment regardless of accent or background.
                  </p>
                  
                  <ul className="space-y-4">
                     <FairnessPoint text="Accent-neutral speech processing" />
                     <FairnessPoint text="Content-focused, not just style-focused" />
                     <FairnessPoint text="Consistent scoring criteria across all sessions" />
                  </ul>
               </div>
               
               <div className="grid gap-6 sm:grid-cols-2">
                   <Card className="bg-slate-800 border-slate-700 p-6">
                       <h4 className="text-white font-bold text-lg mb-2">Subjective</h4>
                       <div className="flex gap-2 mb-4">
                          <div className="h-2 w-full bg-red-500/20 rounded-full"></div>
                          <div className="h-2 w-1/3 bg-red-500 rounded-full"></div>
                       </div>
                       <p className="text-sm text-slate-400">Varries by reviewer mood and bias.</p>
                   </Card>
                   <Card className="bg-emerald-900/20 border-emerald-500/30 p-6">
                       <h4 className="text-white font-bold text-lg mb-2">ShikshaNetra</h4>
                       <div className="flex gap-2 mb-4">
                          <div className="h-2 w-full bg-emerald-500/20 rounded-full"></div>
                          <div className="h-2 w-3/4 bg-emerald-500 rounded-full"></div>
                       </div>
                       <p className="text-sm text-emerald-200">Consistent, data-driven, fair.</p>
                   </Card>
               </div>
            </div>
         </div>
      </section>

      {/* 4️⃣ WHO IT'S FOR (NEW) */}
      <section className="py-24 bg-slate-50">
         <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="text-center mb-16">
               <h2 className="text-3xl font-bold tracking-tight text-slate-900">
                  Built for the Education Ecosystem
               </h2>
            </div>
            
            <div className="grid gap-8 md:grid-cols-3">
               <AudienceCard 
                  icon={Users}
                  title="Educators & Mentors"
                  desc="Self-evaluate your teaching style, identify blind spots, and grow your career with private AI feedback."
               />
               <AudienceCard 
                  icon={Building2}
                  title="Universities & Schools"
                  desc="Standardize teaching quality across departments and provide scalable mentorship to faculty."
               />
               <AudienceCard 
                  icon={Binary}
                  title="EdTech Platforms"
                  desc="Automate quality assurance for thousands of recorded sessions and maintain high platform standards."
               />
            </div>
         </div>
      </section>

      {/* 5️⃣ FINAL CTA */}
      <section className="py-20 bg-white">
         <div className="mx-auto max-w-5xl px-4 sm:px-6">
            <div className="relative rounded-3xl bg-slate-900 px-6 py-16 sm:px-16 md:pt-20 lg:flex lg:gap-x-20 lg:px-24 lg:pt-0 overflow-hidden">
               <div className="absolute top-0 left-0 -ml-20 -mt-20 h-[400px] w-[400px] rounded-full bg-primary-500/20 blur-3xl"></div>
               
               <div className="mx-auto max-w-md text-center lg:mx-0 lg:flex-auto lg:py-24 lg:text-left relative z-10">
                  <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                     Ready to evaluate teaching<br />the right way?
                  </h2>
                  <p className="mt-6 text-lg leading-8 text-slate-300">
                     Join the future of educator evaluation. Simple, fair, and powered by advanced AI.
                  </p>
                  <div className="mt-10 flex items-center justify-center gap-x-6 lg:justify-start">
                     <Link href={getStartedLink} className="rounded-xl bg-white px-8 py-3.5 text-sm font-bold text-slate-900 shadow-sm hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white transition-all">
                        Get Started Free
                     </Link>
                  </div>
               </div>
            </div>
         </div>
      </section>

    </div>
  );
}

// --- Subcomponents ---

function DataNode({ icon: Icon, color, label, sublabel }: { icon: any, color: string, label: string, sublabel?: string }) {
    const colors = {
        blue: "bg-blue-50 text-blue-600 border-blue-100",
        purple: "bg-purple-50 text-purple-600 border-purple-100",
        amber: "bg-amber-50 text-amber-600 border-amber-100"
    };

    return (
        <div className={`flex flex-col items-center gap-3`}>
            <div className={`h-14 w-14 rounded-2xl flex items-center justify-center border shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5 hover:scale-105 ${colors[color as keyof typeof colors]}`}>
                <Icon className="h-6 w-6" strokeWidth={1.5} />
            </div>
            <div className="text-center">
               <div className="text-sm font-semibold text-slate-700">{label}</div>
               {sublabel && <div className="text-[10px] uppercase tracking-wide font-medium text-slate-400">{sublabel}</div>}
            </div>
        </div>
    );
}

function StepCard({ step, title, desc, icon: Icon }: { step: string, title: string, desc: string, icon: any }) {
    return (
        <div className="relative flex flex-col items-center text-center bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
            <div className="h-12 w-12 rounded-xl bg-slate-900 text-white flex items-center justify-center mb-6 shadow-lg shadow-slate-900/20 z-10">
                <Icon className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
            <p className="text-slate-600 leading-relaxed">{desc}</p>
            <div className="absolute top-6 right-6 text-6xl font-black text-slate-50 opacity-[0.05]">{step}</div>
        </div>
    );
}

function FairnessPoint({ text }: { text: string }) {
    return (
        <li className="flex gap-3">
             <div className="mt-1 h-5 w-5 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                 <CheckCircle2 className="h-3 w-3 text-emerald-400" strokeWidth={3} />
             </div>
             <span className="text-slate-300">{text}</span>
        </li>
    );
}

function AudienceCard({ icon: Icon, title, desc }: { icon: any, title: string, desc: string }) {
    return (
        <div className="group p-8 rounded-2xl bg-white border border-slate-200 hover:border-primary-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className="h-12 w-12 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center mb-6 group-hover:bg-primary-600 group-hover:text-white transition-colors">
                <Icon className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-3">{title}</h3>
            <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
        </div>
    );
}

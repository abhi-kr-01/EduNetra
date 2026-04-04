import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/Card";

const steps = [
  {
    title: "Session Upload",
    description: "Teaching video uploaded by mentor or coordinator from LMS or local storage.",
    tag: "Video",
    icon: "📤"
  },
  {
    title: "Audio & Speech Analysis",
    description: "Clarity, pace, pause patterns, and filler words extracted from audio.",
    tag: "Audio",
    icon: "🎤"
  },
  {
    title: "Visual & Engagement Cues",
    description: "Body language, focus, and engagement hints derived from video frames.",
    tag: "Video",
    icon: "👁️"
  },
  {
    title: "Content Understanding",
    description: "Transcript analysis for technical depth, coverage, and structure.",
    tag: "Text",
    icon: "📝"
  },
  {
    title: "Scoring & Normalization",
    description: "Signals combined into scores with fairness-aware normalization.",
    tag: "Scoring",
    icon: "⚖️"
  },
  {
    title: "Mentor Feedback & Dashboards",
    description: "Metrics translated into suggestions and visual analytics.",
    tag: "LLM + UI",
    icon: "📊"
  },
];

export default function PlatformPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 pb-12 pt-8 sm:pt-10">
      <PageHeader
        title="Platform Overview"
        subtitle="How ShikshaNetra processes teaching sessions and delivers insights."
        badge={<span className="badge-pill">Product view</span>}
      />

      {/* Timeline - Chain Design */}
      <section className="mt-12">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-slate-900">
            How it works – from upload to feedback
          </h2>
          <p className="mt-2 text-sm text-slate-600 sm:text-base">
            A focused evaluation pipeline that respects existing LMS and classroom workflows.
          </p>
        </div>

        {/* Chain Design: First 3 steps in one row, then backtracking 3 in another row - Smaller */}
        <div className="space-y-6">
          {/* First Row: Steps 1-3 */}
          <div className="relative">
            <div className="hidden md:block absolute left-0 right-0 top-1/2 h-0.5 -translate-y-1/2 bg-gradient-to-r from-primary-300 via-accent-300 to-primary-300" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative">
              {steps.slice(0, 3).map((step, index) => (
                <div key={step.title} className="relative">
                  <div className="flex flex-col items-center">
                    <Card className="w-full border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md">
                      <div className="flex flex-col items-center text-center">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary-100 to-primary-200 text-lg shadow-sm ring-2 ring-white mb-2">
                          {step.icon}
                        </div>
                        <div className="flex items-center justify-center gap-1.5 mb-1.5 flex-wrap">
                          <h3 className="text-sm font-semibold text-slate-900">{step.title}</h3>
                          <span className="rounded-full bg-primary-50 px-1.5 py-0.5 text-[10px] font-medium text-primary-700">
                            {step.tag}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 text-center leading-relaxed">{step.description}</p>
                      </div>
                    </Card>
                    {/* Connection arrow pointing right (except last) */}
                    {index < 2 && (
                      <div className="hidden md:block absolute top-1/2 -right-2 z-10">
                        <div className="text-primary-400 text-lg">→</div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Second Row: Steps 4-6 (backtracking - reversed order) */}
          <div className="relative">
            <div className="hidden md:block absolute left-0 right-0 top-1/2 h-0.5 -translate-y-1/2 bg-gradient-to-l from-primary-300 via-accent-300 to-primary-300" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative">
              {[...steps.slice(3, 6)].reverse().map((step, index) => (
                <div key={step.title} className="relative">
                  <div className="flex flex-col items-center">
                    <Card className="w-full border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md">
                      <div className="flex flex-col items-center text-center">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary-100 to-primary-200 text-lg shadow-sm ring-2 ring-white mb-2">
                          {step.icon}
                        </div>
                        <div className="flex items-center justify-center gap-1.5 mb-1.5 flex-wrap">
                          <h3 className="text-sm font-semibold text-slate-900">{step.title}</h3>
                          <span className="rounded-full bg-primary-50 px-1.5 py-0.5 text-[10px] font-medium text-primary-700">
                            {step.tag}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 text-center leading-relaxed">{step.description}</p>
                      </div>
                    </Card>
                    {/* Connection arrow pointing left (except last in backtracking row) */}
                    {index < 2 && (
                      <div className="hidden md:block absolute top-1/2 -right-2 z-10">
                        <div className="text-primary-400 text-lg">←</div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Under the hood - Horizontal Card Design */}
      <section className="mt-16 space-y-6">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Under the hood</h2>
          <p className="mt-2 text-sm text-slate-600 sm:text-base">
            ShikshaNetra is structured like a production-ready AI SaaS platform, with a clean split
            between the frontend experience, APIs, and AI services.
          </p>
        </div>
        <div className="space-y-4">
          <Card className="relative overflow-hidden border-l-4 border-l-primary-500 bg-gradient-to-r from-primary-50/50 to-white p-5 shadow-md transition hover:shadow-lg hover:scale-[1.02]">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 text-2xl shadow-lg">
                💻
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-slate-900 mb-2">Frontend Experience</h3>
                <p className="text-sm text-slate-600 mb-3">
                  Built with Next.js App Router and Tailwind CSS, optimized for coordinators and
                  mentors. Includes dashboard-style views, demo upload flows, and responsive design.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-md bg-white px-3 py-1 text-xs font-semibold text-primary-700 shadow-sm border border-primary-200">Next.js</span>
                  <span className="rounded-md bg-white px-3 py-1 text-xs font-semibold text-primary-700 shadow-sm border border-primary-200">Tailwind</span>
                  <span className="rounded-md bg-white px-3 py-1 text-xs font-semibold text-primary-700 shadow-sm border border-primary-200">TypeScript</span>
                </div>
              </div>
            </div>
          </Card>
          <Card className="relative overflow-hidden border-l-4 border-l-accent-500 bg-gradient-to-r from-accent-50/50 to-white p-5 shadow-md transition hover:shadow-lg hover:scale-[1.02]">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-accent-400 to-accent-600 text-2xl shadow-lg">
                🔌
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-slate-900 mb-2">API & Services</h3>
                <p className="text-sm text-slate-600 mb-3">
                  REST-style endpoints for session upload, evaluation status, and analytics. Designed
                  to sit behind secure institution or platform authentication.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-md bg-white px-3 py-1 text-xs font-semibold text-accent-700 shadow-sm border border-accent-200">REST API</span>
                  <span className="rounded-md bg-white px-3 py-1 text-xs font-semibold text-accent-700 shadow-sm border border-accent-200">Secure Auth</span>
                  <span className="rounded-md bg-white px-3 py-1 text-xs font-semibold text-accent-700 shadow-sm border border-accent-200">Scalable</span>
                </div>
              </div>
            </div>
          </Card>
          <Card className="relative overflow-hidden border-l-4 border-l-slate-500 bg-gradient-to-r from-slate-50/50 to-white p-5 shadow-md transition hover:shadow-lg hover:scale-[1.02]">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-slate-400 to-slate-600 text-2xl shadow-lg">
                🤖
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-slate-900 mb-2">AI & Data Layer</h3>
                <p className="text-sm text-slate-600 mb-3">
                  Multimodal models combine video, audio, and transcript signals into consistent
                  scores. Generative AI turns raw metrics into mentor-friendly feedback narratives.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-md bg-white px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm border border-slate-200">Multimodal</span>
                  <span className="rounded-md bg-white px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm border border-slate-200">LLM</span>
                  <span className="rounded-md bg-white px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm border border-slate-200">Fairness</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Who is it for - Icon-Focused Vertical Design */}
      <section className="mt-16 space-y-6">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Who is it for?</h2>
          <p className="mt-2 text-sm text-slate-600 sm:text-base">
            ShikshaNetra fits seamlessly into different education and training environments.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              title: "Universities",
              description: "Institution-wide visibility into teaching quality and mentoring impact.",
              icon: "🏛️",
              color: "primary"
            },
            {
              title: "EdTech Platforms",
              description: "Track mentor performance across live and recorded courses.",
              icon: "💻",
              color: "accent"
            },
            {
              title: "Training Institutes",
              description: "Standardize feedback loops across trainers, topics, and cohorts.",
              icon: "📚",
              color: "slate"
            }
          ].map((item) => (
            <Card key={item.title} className="relative overflow-hidden h-full border-2 border-slate-200 bg-white p-6 transition hover:shadow-xl hover:scale-105 hover:-translate-y-1">
              <div className={`absolute top-0 right-0 w-20 h-20 rounded-bl-full opacity-10 ${
                item.color === "primary" ? "bg-primary-500" :
                item.color === "accent" ? "bg-accent-500" :
                "bg-slate-500"
              }`} />
              <div className="relative flex flex-col items-center text-center">
                <div className={`flex h-20 w-20 items-center justify-center rounded-2xl text-4xl mb-4 shadow-lg ${
                  item.color === "primary" ? "bg-gradient-to-br from-primary-100 to-primary-200 ring-4 ring-primary-100" :
                  item.color === "accent" ? "bg-gradient-to-br from-accent-100 to-accent-200 ring-4 ring-accent-100" :
                  "bg-gradient-to-br from-slate-100 to-slate-200 ring-4 ring-slate-100"
                }`}>
                  {item.icon}
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{item.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{item.description}</p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* How it fits in your workflow - Numbered Timeline Design */}
      <section className="mt-16 space-y-6">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">
            How it fits in your workflow
          </h2>
          <p className="mt-2 text-sm text-slate-600 sm:text-base">
            Minimal friction for mentors, rich analytics for coordinators.
          </p>
        </div>
        <div className="relative">
          {/* Vertical connecting line for desktop */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary-300 via-accent-300 to-primary-300 hidden md:block" />
          
          <div className="space-y-6">
            {[
              {
                step: "1",
                title: "Upload lecture sessions",
                desc: "Mentors or coordinators upload recorded lectures or live session captures.",
                icon: "📤"
              },
              {
                step: "2",
                title: "AI evaluates and scores",
                desc: "Multimodal models analyze clarity, engagement, technical depth, and more.",
                icon: "🤖"
              },
              {
                step: "3",
                title: "Mentors improve with feedback",
                desc: "Actionable strengths and suggestions feed back into future teaching plans.",
                icon: "📈"
              }
            ].map((stepItem, index) => (
              <div key={stepItem.step} className="relative flex gap-6">
                {/* Step number circle */}
                <div className="relative z-10 flex shrink-0 flex-col items-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-accent-500 text-xl font-bold text-white shadow-lg ring-4 ring-white">
                    {stepItem.step}
                  </div>
                  {index < 2 && (
                    <div className="hidden md:block mt-2 h-12 w-0.5 bg-gradient-to-b from-primary-300 to-accent-300" />
                  )}
                </div>
                
                {/* Content card */}
                <Card className="flex-1 border-2 border-slate-200 bg-gradient-to-r from-white to-primary-50/30 p-5 shadow-md transition hover:shadow-lg hover:scale-[1.02]">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-100 text-2xl shadow-sm">
                      {stepItem.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-base font-bold text-slate-900 mb-2">{stepItem.title}</h3>
                      <p className="text-sm text-slate-600 leading-relaxed">{stepItem.desc}</p>
                    </div>
                  </div>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Integration */}
      <section className="mt-16">
        <Card className="bg-gradient-to-r from-primary-50 via-slate-50 to-accent-50 p-5">
          <h2 className="text-sm font-semibold text-slate-900">
            Ready for integration
          </h2>
          <p className="mt-1 text-xs text-slate-600 sm:text-sm">
            This prototype is wired like a real product, prepared to plug into AI services and
            institution infrastructure.
          </p>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-xs text-slate-700 sm:text-sm">
            <li>Frontend prototype wired with clean demo flows and stateful components.</li>
            <li>Planned endpoints for multimodal session analysis and aggregated analytics.</li>
            <li>
              Layout and architecture are ready to scale to institution-wide deployments and
              multiple roles.
            </li>
          </ul>
        </Card>
      </section>
    </div>
  );
}



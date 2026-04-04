import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/Card";

const team = [
  {
    name: "Om Jha",
    role: "Backend & AI Integration",
    description: "Focus: APIs, AI pipeline integration.",
    initials: "OJ",
  },
  {
    name: "Vikas Saini",
    role: "Frontend & UI/UX",
    description: "Focus: Next.js, Tailwind, product experience.",
    initials: "VS",
  },
  {
    name: "Mudit Chourasiya",
    role: "Research & Evaluation",
    description: "Focus: metric design and benchmarking.",
    initials: "MC",
  },
  {
    name: "Asmit Yadav",
    role: "AI & Model Development",
    description: "Focus: multimodal models and feedback generation.",
    initials: "AY",
  },
];

export default function TeamPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 pb-12 pt-8 sm:pt-10">
      <PageHeader
        title="Meet the Team"
        subtitle="Data-Not-Valid – building AI for better teaching quality."
      />

      <section className="grid gap-5 md:grid-cols-2">
        {team.map((member) => (
          <Card key={member.name} className="flex items-center gap-4 p-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 text-sm font-semibold text-primary-800">
              {member.initials}
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">
                {member.name}
              </p>
              <p className="text-xs text-primary-700">{member.role}</p>
              <p className="mt-1 text-xs text-slate-600 sm:text-sm">
                {member.description}
              </p>
            </div>
          </Card>
        ))}
      </section>

      <p className="mt-8 text-xs text-slate-500 sm:text-sm">
        ShikshaNetra is developed for HCL GUVI UpSkill India Challenge – Techfest
        IIT Bombay.
      </p>
    </div>
  );
}



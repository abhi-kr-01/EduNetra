import Link from "next/link";
import { Github, Twitter, Linkedin, Facebook, Instagram, Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-slate-50 border-t border-slate-200 font-sans">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 lg:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 lg:gap-12">
          
          {/* Brand Column */}
          <div className="col-span-2 lg:col-span-2">
            <Link href="/" className="inline-block">
               <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-indigo-600 bg-clip-text text-transparent">
                  ShikshaNetra
               </span>
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-slate-500 max-w-xs">
              AI-powered mentor evaluation platform analyzing teaching sessions with multimodal signals. Built for the HCL GUVI – UpSkill India Challenge.
            </p>
            <div className="mt-6 flex items-center gap-4">
               <SocialLink href="#" icon={Twitter} label="Twitter" />
               <SocialLink href="#" icon={Github} label="Github" />
               <SocialLink href="#" icon={Linkedin} label="LinkedIn" />
               <SocialLink href="#" icon={Instagram} label="Instagram" />
            </div>
          </div>

          {/* Links Column 1 */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 tracking-wider uppercase mb-4">Product</h3>
            <ul className="space-y-3 text-sm">
              <FooterLink href="/dashboard">Dashboard</FooterLink>
              <FooterLink href="/upload">Upload Analysis</FooterLink>
              <FooterLink href="/insights">Insights</FooterLink>
              <FooterLink href="/changelog">Changelog</FooterLink>
            </ul>
          </div>

          {/* Links Column 2 */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 tracking-wider uppercase mb-4">Resources</h3>
            <ul className="space-y-3 text-sm">
              <FooterLink href="#">Documentation</FooterLink>
              <FooterLink href="#">API Reference</FooterLink>
              <FooterLink href="#">Community</FooterLink>
              <FooterLink href="#">Help Center</FooterLink>
            </ul>
          </div>

          {/* Links Column 3 */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 tracking-wider uppercase mb-4">Company</h3>
            <ul className="space-y-3 text-sm">
              <FooterLink href="#">About Us</FooterLink>
              <FooterLink href="#">Privacy Policy</FooterLink>
              <FooterLink href="#">Terms of Service</FooterLink>
              <FooterLink href="/team">Developers</FooterLink>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2025 ShikshaNetra. All rights reserved.</p>
          <p className="flex items-center gap-1">
             Made with <Heart className="h-3 w-3 text-red-500 fill-current" /> by Team ShikshaNetra at IIT Bombay
          </p>
        </div>
      </div>
    </footer>
  );
}

function SocialLink({ href, icon: Icon, label }: { href: string; icon: any; label: string }) {
  return (
    <a 
      href={href} 
      aria-label={label}
      className="h-8 w-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition-all"
    >
      <Icon className="h-4 w-4" />
    </a>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link href={href} className="text-slate-500 hover:text-primary-600 transition-colors">
        {children}
      </Link>
    </li>
  );
}

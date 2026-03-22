import { Heart, PawPrint } from "lucide-react";

export default function Footer() {
  const year = new Date().getFullYear();
  const utmUrl = `https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`;

  return (
    <footer className="bg-footer text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 font-heading font-bold text-xl mb-3">
              <PawPrint className="w-6 h-6" />
              <span>FurLogic</span>
            </div>
            <p className="text-white/70 text-sm leading-relaxed">
              Professional doorstep pet grooming delivered to your home with
              love and care.
            </p>
          </div>
          <div>
            <h4 className="font-heading font-semibold mb-3 text-sm uppercase tracking-wider text-white/50">
              Services
            </h4>
            <ul className="space-y-2 text-sm text-white/70">
              <li>Pet Grooming</li>
              <li>Premium Grooming</li>
              <li>Anti-Tick Treatment</li>
              <li>De-Shedding Cure</li>
            </ul>
          </div>
          <div>
            <h4 className="font-heading font-semibold mb-3 text-sm uppercase tracking-wider text-white/50">
              Company
            </h4>
            <ul className="space-y-2 text-sm text-white/70">
              <li>About Us</li>
              <li>Our Groomers</li>
              <li>Blog</li>
              <li>Careers</li>
            </ul>
          </div>
          <div>
            <h4 className="font-heading font-semibold mb-3 text-sm uppercase tracking-wider text-white/50">
              Support
            </h4>
            <ul className="space-y-2 text-sm text-white/70">
              <li>Contact</li>
              <li>FAQ</li>
              <li>Privacy Policy</li>
              <li>Terms of Service</li>
            </ul>
          </div>
        </div>
        <div className="mt-10 pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-3 text-sm text-white/50">
          <span>
            © {year}. Built with{" "}
            <Heart className="inline w-3.5 h-3.5 text-red-400" /> using{" "}
            <a
              href={utmUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-white/80"
            >
              caffeine.ai
            </a>
          </span>
          <span>Making pets happy, one groom at a time 🐾</span>
        </div>
      </div>
    </footer>
  );
}

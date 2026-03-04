import { Film, Instagram, Twitter, Facebook, Youtube } from "lucide-react";
import { Link } from "react-router-dom";

const SOCIAL_LINKS = [
  {
    icon: Facebook,
    href: "https://facebook.com",
    label: "Facebook",
    color: "hover:text-blue-600",
  },
  {
    icon: Twitter,
    href: "https://twitter.com",
    label: "Twitter",
    color: "hover:text-sky-500",
  },
  {
    icon: Instagram,
    href: "https://instagram.com",
    label: "Instagram",
    color: "hover:text-pink-600",
  },
  {
    icon: Youtube,
    href: "https://youtube.com",
    label: "YouTube",
    color: "hover:text-red-600",
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3 md:items-center">
          <div className="flex flex-col items-center md:items-start gap-4">
            <Link
              to="/"
              className="flex items-center gap-2 text-xl font-bold text-primary"
            >
              <Film className="h-6 w-6" />
              CineBook
            </Link>
            <p className="text-sm text-muted-foreground text-center md:text-left max-w-xs">
              Your premium destination for booking the latest Indian and
              international blockbusters.
            </p>
          </div>

          <div className="flex flex-col items-center gap-4">
            <div className="flex gap-4">
              {SOCIAL_LINKS.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noreferrer"
                  className={`text-muted-foreground transition-colors ${social.color}`}
                  aria-label={social.label}
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              Follow us for the latest updates
            </p>
          </div>

          <div className="flex flex-col items-center md:items-end gap-2">
            <p className="text-sm text-muted-foreground">
              Movie data powered by{" "}
              <a
                href="https://www.themoviedb.org/"
                target="_blank"
                rel="noreferrer"
                className="font-medium underline hover:text-foreground"
              >
                TMDB
              </a>
            </p>
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} CineBook. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

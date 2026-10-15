import Link from "next/link";
import { logoutUser } from "@/app/login/actions";

type NavLink = {
  href: string;
  label: string;
  isPrimary?: boolean;
};

type NavbarProps = {
  user: {
    name: string;
    email: string;
    role: "ADMIN" | "INDIVIDUAL";
  };
  activePath?: string;
};

export default function Navbar({ user, activePath }: NavbarProps) {
  const isAdmin = user.role === "ADMIN";

  const adminLinks: NavLink[] = [
    { href: "/", label: "Dashboard" },
    { href: "/admin/calendar", label: "Calendar" },
    { href: "/admin/bookings", label: "Review Bookings" },
    { href: "/admin/resources", label: "Resources" },
  ];

  const userLinks: NavLink[] = [
    { href: "/", label: "Dashboard" },
    { href: "/bookings", label: "My Bookings" },
    { href: "/bookings/new", label: "+ New Booking", isPrimary: true },
  ];

  const links = isAdmin ? adminLinks : userLinks;

  return (
    <nav className="shrink-0 border-b border-slate-200 bg-white/90 shadow-xs backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600">
            <svg
              className="h-4 w-4 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"
              />
            </svg>
          </div>
          <Link href="/" className="text-base font-bold tracking-tight text-slate-900">
            Reservify
          </Link>
          {isAdmin && (
            <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-semibold text-indigo-700">
              Admin
            </span>
          )}
        </div>

        <div className="hidden items-center gap-1 sm:flex">
          {links.map((link) => {
            const isActive = activePath === link.href;
            if (link.isPrimary) {
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white shadow-xs transition hover:bg-indigo-700"
                >
                  {link.label}
                </Link>
              );
            }
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                  isActive
                    ? "bg-indigo-50 font-semibold text-indigo-700"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-2 sm:flex">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <span className="text-sm font-medium text-slate-700">{user.name}</span>
          </div>
          <form action={logoutUser}>
            <button
              type="submit"
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
            >
              Logout
            </button>
          </form>
        </div>
      </div>
    </nav>
  );
}

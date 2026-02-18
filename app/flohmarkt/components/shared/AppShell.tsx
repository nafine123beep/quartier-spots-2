"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, LogOut } from "lucide-react";
import { useFlohmarkt } from "../../FlohmarktContext";

export interface AppShellAction {
  icon: ReactNode;
  label: string;
  href?: string;
  onClick?: () => void;
  showLabel?: "always" | "sm-hidden" | "never";
}

interface AppShellProps {
  title: string | ReactNode;
  subtitle?: string | ReactNode;
  backHref?: string;
  onBack?: () => void;
  backLabel?: string;
  actions?: AppShellAction[];
  showLogout?: boolean;
  children: ReactNode;
}

export function AppShell({
  title,
  subtitle,
  backHref,
  onBack,
  backLabel = "Zurück",
  actions,
  showLogout = true,
  children,
}: AppShellProps) {
  const { logout } = useFlohmarkt();

  const backButton = (backHref || onBack) && (
    onBack ? (
      <button
        onClick={onBack}
        className="bg-transparent border-none text-white cursor-pointer hover:opacity-80 p-1"
        aria-label={backLabel}
      >
        <ArrowLeft className="h-6 w-6" />
      </button>
    ) : (
      <Link
        href={backHref!}
        className="bg-transparent border-none text-white cursor-pointer hover:opacity-80 no-underline p-1"
        aria-label={backLabel}
      >
        <ArrowLeft className="h-6 w-6" />
      </Link>
    )
  );

  return (
    <div className="fixed inset-0 bg-gray-100 z-[3500] flex flex-col">
      <header className="bg-[#003366] text-white p-5 flex justify-between items-center">
        <div className="flex items-center gap-4 min-w-0">
          {backButton}
          <div className="min-w-0">
            {typeof title === "string" ? (
              <span className="font-bold text-lg block truncate">{title}</span>
            ) : (
              title
            )}
            {subtitle && (
              <div className="text-sm text-gray-300 mt-0.5">
                {subtitle}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {actions?.map((action, i) => {
            const labelEl = action.showLabel === "never" ? null : (
              <span className={action.showLabel === "sm-hidden" ? "hidden sm:inline" : undefined}>
                {action.label}
              </span>
            );

            if (action.href) {
              return (
                <Link
                  key={i}
                  href={action.href}
                  className="bg-transparent border border-white text-white px-2.5 py-1.5 rounded cursor-pointer hover:bg-white/10 no-underline flex items-center gap-1.5"
                  aria-label={action.label}
                >
                  {action.icon}
                  {labelEl}
                </Link>
              );
            }

            return (
              <button
                key={i}
                onClick={action.onClick}
                className="bg-transparent border border-white text-white px-2.5 py-1.5 rounded cursor-pointer hover:bg-white/10 flex items-center gap-1.5"
                aria-label={action.label}
              >
                {action.icon}
                {labelEl}
              </button>
            );
          })}

          {showLogout && (
            <button
              onClick={logout}
              className="bg-transparent border border-white text-white px-2.5 py-1.5 rounded cursor-pointer hover:bg-white/10 flex items-center gap-1.5"
              aria-label="Abmelden"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          )}
        </div>
      </header>

      <main className="flex-grow overflow-y-auto">
        {children}
      </main>
    </div>
  );
}

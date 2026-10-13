import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  Sun,
  Barcode,
  Refrigerator,
  CookingPot,
  Sprout,
  Mic,
} from "lucide-react";

const NAV = [
  { to: "/", label: "Tonight", icon: Sun },
  { to: "/kitchen", label: "Kitchen", icon: Refrigerator },
  { to: "/cook", label: "Cook", icon: CookingPot },
  { to: "/impact", label: "Impact", icon: Sprout },
];

const FOCUS_PREFIXES = ["/scan", "/prep", "/cooking", "/voice"];

export default function Layout() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const focus = FOCUS_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  return (
    <div className="min-h-[100dvh] w-full bg-ground">
      <div className="mx-auto flex min-h-[100dvh] w-full max-w-[1200px]">
        {!focus ? (
          <aside className="sticky top-0 hidden h-[100dvh] w-[220px] shrink-0 flex-col border-r border-rule bg-card/60 lg:flex">
            <div className="border-b border-rule px-5 pb-4 pt-6">
              <NavLink to="/" className="block">
                <span className="inline-flex items-center gap-2">
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-tag-canary font-mono text-[13px] font-bold text-ink ring-[1.5px] ring-ink">
                    FP
                  </span>
                  <span className="text-[18px] font-black uppercase tracking-[0.04em]">
                    FreshPlate
                  </span>
                </span>
              </NavLink>
              <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.1em] text-soft">
                Open · cook what&apos;s closest
              </p>
            </div>

            <nav className="flex-1 px-3 py-4">
              <ul className="space-y-1">
                {NAV.map((tab) => (
                  <SideTab key={tab.to} {...tab} />
                ))}
              </ul>
            </nav>

            <div className="space-y-2 border-t border-rule p-3">
              <button
                onClick={() => navigate("/scan")}
                className="flex w-full items-center justify-center gap-2 rounded-[8px] border-[1.5px] border-ink bg-tag-canary px-4 py-3 text-[13px] font-bold uppercase tracking-[0.06em] transition hover:bg-tag-canary-deep active:translate-y-px"
              >
                <Barcode size={17} /> Scan grocery
              </button>
              <button
                onClick={() => navigate("/voice")}
                className="flex w-full items-center justify-center gap-2 rounded-[8px] border border-rule bg-card px-4 py-2.5 text-[12px] font-bold uppercase tracking-[0.06em] text-soft transition hover:border-ink hover:text-ink active:translate-y-px"
              >
                <Mic size={15} /> Voice help
              </button>
            </div>
          </aside>
        ) : null}

        <div className="flex min-w-0 flex-1 flex-col">
          {!focus ? (
            <header className="sticky top-0 z-40 flex items-center justify-between border-b border-rule bg-ground/95 px-4 py-3 backdrop-blur-sm lg:hidden">
              <NavLink to="/" className="flex items-center gap-2">
                <span className="grid h-7 w-7 place-items-center rounded-full bg-tag-canary font-mono text-[11px] font-bold text-ink ring-[1.5px] ring-ink">
                  FP
                </span>
                <span className="text-[16px] font-black uppercase tracking-[0.04em]">FreshPlate</span>
              </NavLink>
              <button
                onClick={() => navigate("/voice")}
                aria-label="Voice help"
                className="grid h-9 w-9 place-items-center rounded-[8px] border border-rule bg-card text-ink transition active:translate-y-px"
              >
                <Mic size={16} />
              </button>
            </header>
          ) : null}

          <main className={`flex-1 ${focus ? "" : "pb-28 lg:pb-12"}`}>
            <Outlet />
          </main>
        </div>
      </div>

      {!focus ? (
        <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-ink bg-card lg:hidden">
          <ul className="relative mx-auto grid max-w-[520px] grid-cols-5 items-stretch">
            {NAV.slice(0, 2).map((tab) => (
              <TabItem key={tab.to} {...tab} />
            ))}
            <li className="relative">
              <button
                onClick={() => navigate("/scan")}
                aria-label="Scan a grocery"
                className="absolute -top-5 left-1/2 grid h-14 w-14 -translate-x-1/2 place-items-center rounded-full border-[1.5px] border-ink bg-tag-canary text-ink shadow-sticker transition active:translate-y-px"
              >
                <Barcode size={22} />
              </button>
            </li>
            {NAV.slice(2).map((tab) => (
              <TabItem key={tab.to} {...tab} />
            ))}
          </ul>
          <div className="h-[env(safe-area-inset-bottom)]" />
        </nav>
      ) : null}
    </div>
  );
}

function TabItem({
  to,
  label,
  icon: Icon,
}: {
  to: string;
  label: string;
  icon: typeof Sun;
}) {
  return (
    <li>
      <NavLink
        to={to}
        end={to === "/"}
        className={({ isActive }) =>
          `flex flex-col items-center gap-0.5 pb-1.5 pt-2.5 text-[10px] font-bold uppercase tracking-[0.08em] transition ${
            isActive ? "text-ink" : "text-soft"
          }`
        }
      >
        {({ isActive }) => (
          <>
            <Icon size={19} strokeWidth={isActive ? 2.4 : 2} />
            <span>{label}</span>
            <span
              className={`h-[3px] w-6 rounded-full ${isActive ? "bg-tag-canary" : "bg-transparent"}`}
            />
          </>
        )}
      </NavLink>
    </li>
  );
}

function SideTab({
  to,
  label,
  icon: Icon,
}: {
  to: string;
  label: string;
  icon: typeof Sun;
}) {
  return (
    <li>
      <NavLink
        to={to}
        end={to === "/"}
        className={({ isActive }) =>
          `flex items-center gap-3 rounded-[8px] px-3 py-2.5 text-[13px] font-bold uppercase tracking-[0.06em] transition ${
            isActive ? "bg-ink text-ground" : "text-soft hover:bg-ground hover:text-ink"
          }`
        }
      >
        {({ isActive }) => (
          <>
            <Icon size={18} strokeWidth={isActive ? 2.4 : 2} />
            <span>{label}</span>
            {isActive ? (
              <span className="ml-auto h-2 w-2 rounded-full bg-tag-canary" aria-hidden />
            ) : null}
          </>
        )}
      </NavLink>
    </li>
  );
}

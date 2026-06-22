import { Switch, Route, Router, Link, useLocation } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";

import TodayPage from "./pages/TodayPage";
import SplashPage from "./pages/SplashPage";
import CalendarPage from "./pages/CalendarPage";
import ComparisonPage from "./pages/ComparisonPage";
import ChatPage from "./pages/ChatPage";
import SettingsPage from "./pages/SettingsPage";
import DragonBallHistoryPage from "./pages/DragonBallHistoryPage";
import { useEffect, useState } from "react";
import { Home, Calendar, BarChart2, MessageSquare, Settings, Sparkles, Sun, Moon } from "lucide-react";
import { createContext, useContext } from "react";
import { unlockAudio } from "./lib/sounds";

const DarkContext = createContext<{ dark: boolean; setDark: (v: boolean) => void }>({
  dark: true, setDark: () => {},
});

const NAV_LINKS = [
  { href: "/",           icon: Home,          label: "Today"     },
  { href: "/calendar",   icon: Calendar,      label: "Calendar"  },
  { href: "/comparison", icon: BarChart2,      label: "Standings" },
  { href: "/balls",      icon: Sparkles,       label: "Balls"     },
  { href: "/chat",       icon: MessageSquare,  label: "Chat"      },
  { href: "/settings",   icon: Settings,       label: "Edit"      },
];

const SIDEBAR_LINKS = [
  { href: "/",           icon: Home,          label: "Today"            },
  { href: "/calendar",   icon: Calendar,      label: "Calendar"         },
  { href: "/comparison", icon: BarChart2,      label: "Standings"        },
  { href: "/balls",      icon: Sparkles,       label: "Dragon Balls"     },
  { href: "/chat",       icon: MessageSquare,  label: "Chat"             },
  { href: "/settings",   icon: Settings,       label: "Edit Assignments" },
];

function Nav() {
  const [location] = useLocation();
  const { dark, setDark } = useContext(DarkContext);
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border flex md:hidden">
      {NAV_LINKS.map(({ href, icon: Icon, label }) => {
        const active = location === href;
        return (
          <Link key={href} href={href}
            className={`flex-1 flex flex-col items-center py-2 gap-0.5 text-xs font-medium transition-colors
              ${active ? "text-primary" : "text-muted-foreground"}`}>
            <Icon className="w-5 h-5" />
            <span className="truncate text-[10px]">{label}</span>
          </Link>
        );
      })}
      {/* Dark/light toggle */}
      <button
        onClick={() => setDark(!dark)}
        className="flex-1 flex flex-col items-center py-2 gap-0.5 text-xs font-medium text-muted-foreground hover:text-amber-300 transition-colors"
      >
        {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        <span className="truncate text-[10px]">{dark ? "Light" : "Dark"}</span>
      </button>
    </nav>
  );
}

function Sidebar({ dark, setDark }: { dark: boolean; setDark: (v: boolean) => void }) {
  const [location] = useLocation();
  return (
    <aside className="hidden md:flex flex-col w-64 h-screen fixed left-0 top-0 bg-sidebar border-r border-sidebar-border p-5 gap-1">
      {/* Hero image + logo */}
      <div className="mb-5">
        {/* Shenron image banner */}
        <div className="relative rounded-xl overflow-hidden mb-4 dbz-orange-glow">
          <img
            src="/og-image.png"
            alt="Shenron the Divine Dragon"
            className="w-full object-cover"
            style={{ height: 148, objectPosition: "center 20%" }}
          />
          {/* Gold gradient overlay at bottom */}
          <div className="absolute inset-0 bg-gradient-to-t from-sidebar via-transparent to-transparent" />
          <div className="absolute bottom-2 left-0 right-0 text-center">
            <div className="text-[11px] font-black tracking-[0.2em] uppercase dbz-title">SANCHEZ</div>
            <div className="text-[8px] font-bold tracking-widest uppercase text-amber-300/70">Tournament of Cleaning</div>
          </div>
        </div>
      </div>

      {SIDEBAR_LINKS.map(({ href, icon: Icon, label }) => {
        const active = location === href;
        return (
          <Link key={href} href={href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all
              ${
                active
                  ? "bg-primary text-primary-foreground dbz-gold-glow"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-amber-200"
              }`}>
            <Icon className="w-4 h-4 flex-shrink-0" />
            {label}
          </Link>
        );
      })}

      <div className="mt-auto flex flex-col gap-2">
        {/* Dark / Light toggle */}
        <button
          onClick={() => setDark(!dark)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold text-sidebar-foreground hover:bg-sidebar-accent hover:text-amber-200 transition-all w-full"
        >
          {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          {dark ? "Light Mode" : "Dark Mode"}
        </button>
        <div className="text-xs font-bold text-center dbz-title opacity-70">
          Power Level: Over 9000 🔥
        </div>
        <div className="text-[10px] text-muted-foreground text-center opacity-30 italic">
          <Link href="/splash" className="hover:text-amber-300 transition-colors">A Fargin Bastage Production</Link>
        </div>
      </div>
    </aside>
  );
}

export default function App() {
  const [dark, setDark] = useState(true);
  // Show splash on first visit per browser session
  const [showSplash, setShowSplash] = useState(
    () => !sessionStorage.getItem("splashSeen")
  );

  function handleSplashDone() {
    sessionStorage.setItem("splashSeen", "1");
    setShowSplash(false);
  }

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [dark]);

  // Unlock audio on first interaction
  useEffect(() => {
    const unlock = () => {
      unlockAudio();
      window.removeEventListener("click", unlock);
      window.removeEventListener("touchstart", unlock);
    };
    window.addEventListener("click", unlock);
    window.addEventListener("touchstart", unlock);
    return () => {
      window.removeEventListener("click", unlock);
      window.removeEventListener("touchstart", unlock);
    };
  }, []);

  return (
    <DarkContext.Provider value={{ dark, setDark }}>
      <Router hook={useHashLocation}>
        <div className="min-h-screen bg-background text-foreground">
          <Sidebar dark={dark} setDark={setDark} />
          <main className="md:ml-64 pb-20 md:pb-0 min-h-screen">
            <Switch>
              <Route path="/splash" component={() => <SplashPage onDone={handleSplashDone} />} />
              <Route path="/"           component={TodayPage}            />
              <Route path="/calendar"   component={CalendarPage}         />
              <Route path="/comparison" component={ComparisonPage}       />
              <Route path="/balls"      component={DragonBallHistoryPage} />
              <Route path="/chat"       component={ChatPage}             />
              <Route path="/settings"   component={SettingsPage}         />
            </Switch>
          </main>
          <Nav />
        </div>
        {/* Auto-show splash overlay on first load */}
        {showSplash && <SplashPage onDone={handleSplashDone} />}
      </Router>
    </DarkContext.Provider>
  );
}

import { lazy, Suspense, useEffect, useState } from "react";
import { Landing } from "./components/Landing";

const Workspace = lazy(() => import("./components/Workspace").then(module => ({ default: module.Workspace })));

export type Language = "tr" | "en";
export type Theme = "light" | "dark" | "system";

export default function App() {
  const [inWorkspace, setInWorkspace] = useState(false);
  const [language, setLanguage] = useState<Language>(() => (localStorage.getItem("world-language") as Language) || "tr");
  const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem("world-theme") as Theme) || "system");

  useEffect(() => {
    localStorage.setItem("world-language", language);
    document.documentElement.lang = language;
  }, [language]);

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () => document.documentElement.dataset.theme = theme === "system" ? (media.matches ? "dark" : "light") : theme;
    apply();
    localStorage.setItem("world-theme", theme);
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, [theme]);

  return inWorkspace ? (
    <Suspense fallback={<div className="app-loading"><span/><strong>WORLD OS</strong></div>}>
      <Workspace
        language={language}
        onExit={() => setInWorkspace(false)}
        onLanguageChange={setLanguage}
        onThemeChange={setTheme}
        theme={theme}
      />
    </Suspense>
  ) : (
    <Landing language={language} onEnter={() => setInWorkspace(true)} onLanguageChange={setLanguage} />
  );
}

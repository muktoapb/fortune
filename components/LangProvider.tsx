"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { dicts, type Dict, type Lang } from "@/lib/i18n";
import { toBn } from "@/lib/site";

type Ctx = { lang: Lang; t: Dict; setLang: (l: Lang) => void; num: (n: string | number) => string };

const LangContext = createContext<Ctx | null>(null);

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("ft-lang");
      if (saved === "en" || saved === "bn") setLangState(saved);
    } catch {}
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = (l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem("ft-lang", l);
    } catch {}
  };

  const num = (n: string | number) => (lang === "bn" ? toBn(n) : String(n));

  return <LangContext.Provider value={{ lang, t: dicts[lang], setLang, num }}>{children}</LangContext.Provider>;
}

export function useLang() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error("useLang must be used inside LangProvider");
  return ctx;
}

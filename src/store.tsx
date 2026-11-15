import {createContext, useCallback, useContext, useEffect, useMemo, useState} from 'react';
import {api, ApiError, getToken, setToken} from '@/lib/api';
import {tr} from '@/i18n';
import type {Lang} from '@/lib/format';

export type Theme = 'dark' | 'light';
export type DataMode = 'demo' | 'live';

interface StoreCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (k: string) => string;
  theme: Theme;
  setTheme: (t: Theme) => void;
  authed: boolean;
  mode: DataMode;
  user: {name: string; email: string; role: string};
  signIn: (email: string, password: string) => Promise<string | null>;
  logout: () => void;
  refresh: () => void;
  refreshedAt: Date;
}

const Ctx = createContext<StoreCtx | null>(null);
const DEMO_USER = {name: 'Islam Al-Nashar', email: 'admin@aura.com', role: 'admin'};

export function StoreProvider({children}: {children: React.ReactNode}) {
  const [lang, setLangState] = useState<Lang>(() => ((localStorage.getItem('aura_lang') as Lang) ?? 'ar'));
  const [theme, setThemeState] = useState<Theme>(() => ((localStorage.getItem('aura_theme') as Theme) ?? 'dark'));
  const [authed, setAuthed] = useState(Boolean(getToken()));
  const [mode, setMode] = useState<DataMode>('demo');
  const [refreshedAt, setRefreshedAt] = useState(new Date());

  const t = useMemo(() => tr(lang), [lang]);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.title = lang === 'ar' ? 'منصة الأعمال | Aura Suite' : 'Aura Suite — Business Platform';
    localStorage.setItem('aura_lang', lang);
  }, [lang]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('aura_theme', theme);
  }, [theme]);

  /* Try the live store API first; gracefully fall back to demo data. */
  const signIn = useCallback(async (email: string, password: string): Promise<string | null> => {
    try {
      const r = await api<{token: string; user: {role: string}}>('/auth/login', {
        method: 'POST',
        body: {email: email.trim(), password},
      });
      if (r.user.role !== 'admin') throw new Error('not-admin');
      setToken(r.token);
      setMode('live');
      setAuthed(true);
      setRefreshedAt(new Date());
      return null;
    } catch (err) {
      const serverRejected = err instanceof ApiError && err.status >= 400 && err.status < 500;
      if (serverRejected) return 'errInvalid'; // server explicitly said no
      // Server unreachable (5xx / proxy down / network error) → demo mode
      if (email.trim() === 'admin@aura.com' && password === 'Admin@123') {
        setMode('demo');
        setAuthed(true);
        setRefreshedAt(new Date());
        return null;
      }
      return 'errInvalid';
    }
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setAuthed(false);
  }, []);

  const refresh = useCallback(() => setRefreshedAt(new Date()), []);
  const setLang = useCallback((l: Lang) => setLangState(l), []);
  const setTheme = useCallback((th: Theme) => setThemeState(th), []);

  const value = useMemo<StoreCtx>(() => ({
    lang, setLang, t, theme, setTheme, authed, mode, user: DEMO_USER,
    signIn, logout, refresh, refreshedAt,
  }), [lang, t, theme, authed, mode, signIn, logout, refresh, refreshedAt, setLang, setTheme]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore(): StoreCtx {
  const c = useContext(Ctx);
  if (!c) throw new Error('useStore outside provider');
  return c;
}

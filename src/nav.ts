import { createContext, useContext } from 'react';

export type Route =
  | { name: 'home' }
  | { name: 'worlds' }
  | { name: 'world'; id: string }
  | { name: 'explore'; id: string }
  | { name: 'find'; id: string }
  | { name: 'match'; id: string }
  | { name: 'calm' }
  | { name: 'parent' };

export type Nav = { go: (r: Route) => void; back: () => void; home: () => void; openCaa: () => void };
export const NavContext = createContext<Nav>(null as any);
export const useNav = () => useContext(NavContext);

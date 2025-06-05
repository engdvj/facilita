// Minimal React type declarations to satisfy TypeScript without @types/react

declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: any
  }
}

declare namespace React {
  interface FormEvent<T = Element> extends Event {
    readonly target: T
  }
}

declare module 'react' {
  export const Fragment: any
  export function useState<T>(initial: T): [T, (val: T) => void]
  export function useEffect(...args: any[]): void
  export function useRef<T = any>(init?: T): { current: T }
}

declare module 'react/jsx-runtime' {
  export const jsx: any
  export const jsxs: any
  export const Fragment: any
}

declare module 'react-router-dom' {
  export const BrowserRouter: any
  export const Routes: any
  export const Route: any
  export const Outlet: any
  export const Link: any
  export const useNavigate: any
}

declare module 'react-hot-toast' {
  export const Toaster: any
  const toast: any
  export default toast
}

declare module 'axios' {
  const axios: any
  export default axios
}

declare module 'framer-motion' {
  export const motion: any
}

declare module 'react-dom/client' {
  const ReactDOM: any
  export default ReactDOM
}


/// <reference lib="WebWorker" />
/// <reference types="vite/client" />
declare module 'virtual:pwa-register/react' {
  interface UseRegisterSWReturn {
    needRefresh: [boolean, (flag: boolean) => void];
    offlineReady: [boolean, (flag: boolean) => void];
    updateServiceWorker: (reloadPage?: boolean) => Promise<void>;
  }

  interface RegisterSWOptions {
    immediate?: boolean;
    onRegisteredSW?: (registration: ServiceWorkerRegistration | undefined) => void;
    onRegisterError?: (error: unknown) => void;
  }

  export function useRegisterSW(options?: RegisterSWOptions): UseRegisterSWReturn;
}

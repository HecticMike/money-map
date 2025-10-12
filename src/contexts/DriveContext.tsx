import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react';
import {
  GoogleOAuthProvider,
  googleLogout,
  type TokenResponse,
  useGoogleLogin
} from '@react-oauth/google';

export type DriveStatus = 'disabled' | 'idle' | 'authenticating' | 'syncing' | 'error' | 'success';

interface DriveMetadata {
  fileId: string | null;
  lastSyncedAt: string | null;
}

interface DriveContextValue {
  isEnabled: boolean;
  isAuthenticated: boolean;
  status: DriveStatus;
  accessToken: string | null;
  login: () => void;
  logout: () => void;
  fileId: string | null;
  setFileId: (fileId: string | null) => void;
  lastSyncedAt: string | null;
  setLastSyncedAt: (timestamp: string | null) => void;
  setStatus: (status: DriveStatus) => void;
  setError: (message: string | null) => void;
  error: string | null;
}

const noop = () => {};

const DEFAULT_CONTEXT: DriveContextValue = {
  isEnabled: false,
  isAuthenticated: false,
  status: 'disabled',
  accessToken: null,
  login: noop,
  logout: noop,
  fileId: null,
  setFileId: noop,
  lastSyncedAt: null,
  setLastSyncedAt: noop,
  setStatus: noop,
  setError: noop,
  error: 'Google Drive sync is disabled. Add VITE_GOOGLE_CLIENT_ID to enable it.'
};

const DriveContext = createContext<DriveContextValue>(DEFAULT_CONTEXT);

const STORAGE_KEY = 'money-map-drive-metadata';
const DRIVE_SCOPE = 'https://www.googleapis.com/auth/drive.file';
const DRIVE_FILE_NAME = 'money-map-data.json';

const readMetadata = (): DriveMetadata => {
  if (typeof window === 'undefined') {
    return { fileId: null, lastSyncedAt: null };
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw == null) return { fileId: null, lastSyncedAt: null };
    const parsed = JSON.parse(raw) as DriveMetadata & { version?: number; fileName?: string };
    return {
      fileId: parsed.fileName === DRIVE_FILE_NAME ? parsed.fileId ?? null : parsed.fileId ?? null,
      lastSyncedAt: parsed.lastSyncedAt ?? null
    };
  } catch {
    return { fileId: null, lastSyncedAt: null };
  }
};

const writeMetadata = (metadata: DriveMetadata): void => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        ...metadata,
        fileName: DRIVE_FILE_NAME,
        version: 1
      })
    );
  } catch (error) {
    console.warn('Unable to persist Google Drive metadata', error);
  }
};

const DriveAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<TokenResponse | null>(null);
  const [status, setStatus] = useState<DriveStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<DriveMetadata>(() => readMetadata());

  const login = useGoogleLogin({
    scope: DRIVE_SCOPE,
    flow: 'implicit',
    prompt: 'consent',
    onSuccess: (response) => {
      setToken(response);
      setStatus('idle');
      setError(null);
    },
    onError: () => {
      setStatus('error');
      setError('Google sign-in was cancelled or failed. Please try again.');
    }
  });

  const handleLogin = useCallback(() => {
    setStatus('authenticating');
    login();
  }, [login]);

  const handleLogout = useCallback(() => {
    googleLogout();
    setToken(null);
    setStatus('idle');
    setError(null);
  }, []);

  const setFileId = useCallback(
    (fileId: string | null) => {
      setMetadata((previous) => ({ ...previous, fileId }));
    },
    [setMetadata]
  );

  const setLastSyncedAt = useCallback(
    (timestamp: string | null) => {
      setMetadata((previous) => ({ ...previous, lastSyncedAt: timestamp }));
    },
    [setMetadata]
  );

  useEffect(() => {
    writeMetadata(metadata);
  }, [metadata]);

  const value = useMemo<DriveContextValue>(
    () => ({
      isEnabled: true,
      isAuthenticated: token?.access_token != null,
      status,
      accessToken: token?.access_token ?? null,
      login: handleLogin,
      logout: handleLogout,
      fileId: metadata.fileId,
      setFileId,
      lastSyncedAt: metadata.lastSyncedAt,
      setLastSyncedAt,
      setStatus,
      setError,
      error
    }),
    [
      token?.access_token,
      status,
      handleLogin,
      handleLogout,
      metadata.fileId,
      metadata.lastSyncedAt,
      setFileId,
      setLastSyncedAt,
      error
    ]
  );

  return <DriveContext.Provider value={value}>{children}</DriveContext.Provider>;
};

interface DriveProviderProps {
  clientId?: string;
  children: React.ReactNode;
}

export const DriveProvider: React.FC<DriveProviderProps> = ({ clientId, children }) => {
  const disabledValue = useMemo(
    () => ({
      ...DEFAULT_CONTEXT,
      isEnabled: false,
      status: 'disabled' as DriveStatus
    }),
    []
  );

  if (clientId == null || clientId.trim().length === 0) {
    return <DriveContext.Provider value={disabledValue}>{children}</DriveContext.Provider>;
  }

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <DriveAuthProvider>{children}</DriveAuthProvider>
    </GoogleOAuthProvider>
  );
};

export const useDriveContext = (): DriveContextValue => {
  return useContext(DriveContext);
};

export const DRIVE_FILE_TITLE = DRIVE_FILE_NAME;

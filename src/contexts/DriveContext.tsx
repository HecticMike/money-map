// src/contexts/DriveContext.tsx
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode
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
  fetchDriveData?: () => void;
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
const DATA_STORAGE_KEY = 'money-map-drive-data';
const DRIVE_SCOPE = 'https://www.googleapis.com/auth/drive.file';
const DRIVE_FILE_NAME = 'money-map-data.json';
const GOOGLE_CLIENT_ID_PATTERN =
  /[0-9]+-[0-9a-z\-_]+\.apps\.googleusercontent\.com/i;

const sanitizeGoogleClientId = (raw?: string | null): string | null => {
  if (raw == null) return null;
  const trimmed = raw.trim();
  if (trimmed.length === 0) return null;
  const match = trimmed.match(GOOGLE_CLIENT_ID_PATTERN);
  if (match == null) return null;
  return match[0];
};

// Persist metadata in localStorage
const readMetadata = (): DriveMetadata => {
  if (typeof window === 'undefined') return { fileId: null, lastSyncedAt: null };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { fileId: null, lastSyncedAt: null };
    const parsed = JSON.parse(raw) as DriveMetadata & { fileName?: string };
    return {
      fileId: parsed.fileName === DRIVE_FILE_NAME ? parsed.fileId ?? null : parsed.fileId ?? null,
      lastSyncedAt: parsed.lastSyncedAt ?? null
    };
  } catch {
    return { fileId: null, lastSyncedAt: null };
  }
};

const writeMetadata = (metadata: DriveMetadata) => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ ...metadata, fileName: DRIVE_FILE_NAME, version: 1 })
    );
  } catch {
    console.warn('Unable to persist metadata');
  }
};

const writeDriveData = (data: any) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(DATA_STORAGE_KEY, JSON.stringify(data));
  } catch {
    console.warn('Unable to persist Drive data');
  }
};

const readDriveData = (): any | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(DATA_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

// Provider handling login and metadata
const DriveAuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
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
      setError('Google sign-in failed. Please try again.');
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

  const setFileId = useCallback((fileId: string | null) => {
    setMetadata((prev) => ({ ...prev, fileId }));
  }, []);

  const setLastSyncedAt = useCallback((timestamp: string | null) => {
    setMetadata((prev) => ({ ...prev, lastSyncedAt: timestamp }));
  }, []);

  useEffect(() => writeMetadata(metadata), [metadata]);

  const fetchDriveData = useCallback(() => {
    const data = readDriveData();
    console.log('Fetched Drive data', data);
  }, []);

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
      error,
      fetchDriveData
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
      error,
      fetchDriveData
    ]
  );

  return <DriveContext.Provider value={value}>{children}</DriveContext.Provider>;
};

interface DriveProviderProps {
  clientId?: string;
  children: ReactNode;
}

export const DriveProvider: React.FC<DriveProviderProps> = ({ clientId, children }) => {
  const normalizedClientId = useMemo(() => sanitizeGoogleClientId(clientId ?? null), [clientId]);

  const disabledValue = useMemo<DriveContextValue>(() => {
    const base = {
      ...DEFAULT_CONTEXT,
      isEnabled: false as const
    };

    if (clientId == null || clientId.trim().length === 0) {
      return base;
    }

    if (normalizedClientId == null) {
      return {
        ...base,
        error:
          'Google Drive sync disabled: the VITE_GOOGLE_CLIENT_ID value looks malformed. Use the client ID that ends with .apps.googleusercontent.com.'
      };
    }

    return base;
  }, [clientId, normalizedClientId]);

  if (normalizedClientId == null) {
    return <DriveContext.Provider value={disabledValue}>{children}</DriveContext.Provider>;
  }

  return (
    <GoogleOAuthProvider clientId={normalizedClientId}>
      <DriveAuthProvider>{children}</DriveAuthProvider>
    </GoogleOAuthProvider>
  );
};

export const useDriveContext = (): DriveContextValue => useContext(DriveContext);
export const useDriveSync = (): Pick<DriveContextValue, 'fetchDriveData'> => ({ fetchDriveData: useContext(DriveContext).fetchDriveData });
export const DRIVE_FILE_TITLE = DRIVE_FILE_NAME;

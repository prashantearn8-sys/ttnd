import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  signOut,
  User,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  getDocFromServer,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firestore
export const db = (firebaseConfig as any).firestoreDatabaseId
  ? getFirestore(app, (firebaseConfig as any).firestoreDatabaseId)
  : getFirestore(app);

// Initialize Firebase Auth
export const auth = getAuth(app);

// All approved Google Calendar Scopes for the integration
export const GOOGLE_CALENDAR_SCOPES = [
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/calendar.events',
  'https://www.googleapis.com/auth/calendar.readonly',
];

// Configure Google Auth Provider with Calendar Scopes
const googleProvider = new GoogleAuthProvider();
GOOGLE_CALENDAR_SCOPES.forEach((scope) => googleProvider.addScope(scope));
googleProvider.setCustomParameters({ prompt: 'select_account' });

// In-memory token cache (NEVER in localStorage per security guidelines)
let cachedAccessToken: string | null = null;
let isSigningIn = false;

export const getCachedAccessToken = (): string | null => cachedAccessToken;
export const setCachedAccessToken = (token: string | null) => {
  cachedAccessToken = token;
};

// Firestore Error Handling conforming to FirestoreErrorInfo
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((p) => ({
          providerId: p.providerId,
          email: p.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Test initial connection to Firestore
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firestore offline / configuration notice:', error.message);
    }
    return false;
  }
}

// Interactive Google Sign In with Calendar Scopes
export const signInWithGoogleCalendar = async (): Promise<{
  user: User;
  accessToken: string;
} | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, googleProvider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const token = credential?.accessToken || null;

    if (token) {
      cachedAccessToken = token;
    }

    return { user: result.user, accessToken: token || '' };
  } catch (error: any) {
    // If the user deliberately closed or dismissed the popup window, handle gracefully
    if (
      error?.code === 'auth/popup-closed-by-user' ||
      error?.code === 'auth/cancelled-popup-request'
    ) {
      console.info('Google Sign In popup was closed by the user.');
      return null;
    }
    console.warn('Google Sign In warning:', error?.message || error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

// Listen to Auth State
export const initAuthListener = (
  onUserChanged: (user: User | null, accessToken: string | null) => void
) => {
  return onAuthStateChanged(auth, async (currentUser) => {
    if (!currentUser) {
      cachedAccessToken = null;
      onUserChanged(null, null);
    } else {
      onUserChanged(currentUser, cachedAccessToken);
    }
  });
};

// Sign Out
export const logoutUser = async () => {
  await signOut(auth);
  cachedAccessToken = null;
};

// Helper to check if client error is offline/network
function isOfflineError(err: unknown): boolean {
  if (!err) return false;
  const msg = err instanceof Error ? err.message : String(err);
  return (
    msg.includes('offline') ||
    msg.includes('network') ||
    (err as any)?.code === 'unavailable' ||
    (err as any)?.code === 'failed-precondition'
  );
}

// Save User Profile to Firestore
export async function saveUserProfileToFirestore(userId: string, profile: any) {
  if (!userId || userId.startsWith('usr-') || !auth.currentUser) {
    return;
  }
  const path = `users/${userId}`;
  try {
    await setDoc(
      doc(db, 'users', userId),
      {
        ...profile,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (error: any) {
    if (isOfflineError(error)) {
      console.warn('Firestore offline, skipping profile cloud sync.');
      return;
    }
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Save User Attendance to Firestore
export async function saveAttendanceToFirestore(userId: string, data: any) {
  if (!userId || userId.startsWith('usr-') || !auth.currentUser) {
    return;
  }
  const path = `users/${userId}/data/attendance`;
  try {
    await setDoc(
      doc(db, 'users', userId, 'data', 'attendance'),
      {
        ...data,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (error: any) {
    if (isOfflineError(error)) {
      console.warn('Firestore offline, attendance persisted locally.');
      return;
    }
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Fetch User Attendance from Firestore
export async function getAttendanceFromFirestore(userId: string) {
  if (!userId || userId.startsWith('usr-') || !auth.currentUser) {
    return null;
  }
  const path = `users/${userId}/data/attendance`;
  try {
    const snap = await getDoc(doc(db, 'users', userId, 'data', 'attendance'));
    if (snap.exists()) {
      return snap.data();
    }
    return null;
  } catch (error: any) {
    if (isOfflineError(error)) {
      console.warn('Firestore offline, reading from local state.');
      return null;
    }
    handleFirestoreError(error, OperationType.GET, path);
  }
}

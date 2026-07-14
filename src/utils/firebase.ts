import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  onSnapshot, 
  query, 
  orderBy,
  getDocFromServer
} from 'firebase/firestore';
import { isSupported, getAnalytics } from 'firebase/analytics';
import { StudentReport } from '../types';

// Web App's Firebase Configuration with fallbacks to user-provided keys
const firebaseConfig = {
  apiKey: (import.meta as any).env.VITE_FIREBASE_API_KEY || "AIzaSyCU-mHbBZdRPiXOpFLPO6MxLed8WSNVkXQ",
  authDomain: (import.meta as any).env.VITE_FIREBASE_AUTH_DOMAIN || "chandunghocsinh.firebaseapp.com",
  projectId: (import.meta as any).env.VITE_FIREBASE_PROJECT_ID || "chandunghocsinh",
  storageBucket: (import.meta as any).env.VITE_FIREBASE_STORAGE_BUCKET || "chandunghocsinh.firebasestorage.app",
  messagingSenderId: (import.meta as any).env.VITE_FIREBASE_MESSAGING_SENDER_ID || "293067667131",
  appId: (import.meta as any).env.VITE_FIREBASE_APP_ID || "1:293067667131:web:adc4efeb9ec571d6499b9e",
  measurementId: (import.meta as any).env.VITE_FIREBASE_MEASUREMENT_ID || "G-QG7121Z0ZT"
};

// Initialize Firebase safely
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Services
export const auth = getAuth(app);
export const db = getFirestore(app);

// Lazy initialize Analytics to prevent crashes in non-browser environments
export let analytics: any = null;
isSupported().then((supported) => {
  if (supported) {
    analytics = getAnalytics(app);
  }
}).catch((err) => {
  console.warn('Firebase Analytics not supported in this environment:', err);
});

// Operation Type Enum for Error Handling
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

// Structured Firestore Error Info conforming to SKILL.md rules
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
  }
}

// Robust central error handling for Firebase operations
export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid || null,
      email: auth.currentUser?.email || null,
      emailVerified: auth.currentUser?.emailVerified || null,
      isAnonymous: auth.currentUser?.isAnonymous || null,
      tenantId: auth.currentUser?.tenantId || null,
    },
    operationType,
    path
  };
  console.warn('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Test Firebase connection as recommended in SKILL.md
export async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test_connection_placeholder_doc', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn("Please check your Firebase configuration or network status.");
    }
  }
}

// Execute test connection immediately
testConnection();

// --- FIRESTORE DATA PERSISTENCE API WRAPPERS ---

/**
 * Save / Update a single student report in Firestore and local storage.
 */
export async function saveStudentReportToFirestore(report: StudentReport): Promise<void> {
  const docPath = `student_reports/${report.id}`;
  try {
    const docRef = doc(db, 'student_reports', report.id);
    await setDoc(docRef, {
      ...report,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, docPath);
  }
}

/**
 * Fetch all student reports from Firestore.
 */
export async function getStudentReportsFromFirestore(): Promise<StudentReport[]> {
  const collectionPath = 'student_reports';
  try {
    const querySnapshot = await getDocs(collection(db, collectionPath));
    const reports: StudentReport[] = [];
    querySnapshot.forEach((docSnap) => {
      reports.push(docSnap.data() as StudentReport);
    });
    return reports;
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, collectionPath);
  }
}

/**
 * Real-time listener helper for student reports.
 */
export function subscribeToStudentReports(onUpdate: (reports: StudentReport[]) => void, onError?: (err: Error) => void) {
  const collectionPath = 'student_reports';
  return onSnapshot(
    collection(db, collectionPath),
    (snapshot) => {
      const reports: StudentReport[] = [];
      snapshot.forEach((docSnap) => {
        reports.push(docSnap.data() as StudentReport);
      });
      onUpdate(reports);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.GET, collectionPath);
      } catch (err) {
        if (onError && err instanceof Error) {
          onError(err);
        }
      }
    }
  );
}

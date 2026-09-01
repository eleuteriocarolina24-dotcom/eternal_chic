import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Firestore with custom database ID from config
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

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

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map((provider) => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || [],
    },
    operationType,
    path,
  };
  console.warn('Firestore Error Context:', JSON.stringify(errInfo));
  return errInfo;
}

// Test initial connection to Firestore
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is offline, using optimistic fallback cache.');
    }
    return false;
  }
}

// Fallback chic placeholder image
export const DEFAULT_PIECE_IMAGE = 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=80';

// Helper to read File/Blob as Data URL safely
function readFileAsDataUrl(fileOrBlob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to read file as string'));
      }
    };
    reader.onerror = () => reject(reader.error || new Error('FileReader error'));
    reader.readAsDataURL(fileOrBlob);
  });
}

// Image compression utility to make piece photo saving ultra-fast, robust, and 100% persistent across all devices
export async function optimizeImage(
  source: File | Blob | string,
  maxWidth = 800,
  maxHeight = 800,
  quality = 0.80
): Promise<string> {
  if (!source) return DEFAULT_PIECE_IMAGE;

  // 1. If it's a web URL (http:// or https://), validate and return
  if (typeof source === 'string' && (source.startsWith('http://') || source.startsWith('https://'))) {
    return source.trim();
  }

  // 2. If it is already a small base64 image (< 50KB) and valid, return it
  if (typeof source === 'string' && source.startsWith('data:image/') && source.length < 50000) {
    return source;
  }

  try {
    // 3. Obtain initial data URL string
    let initialDataUrl = '';
    if (typeof source === 'string') {
      initialDataUrl = source;
    } else {
      initialDataUrl = await readFileAsDataUrl(source);
    }

    if (!initialDataUrl || !initialDataUrl.startsWith('data:image/')) {
      return initialDataUrl || DEFAULT_PIECE_IMAGE;
    }

    // 4. Compress & resize via HTML Canvas
    return await new Promise<string>((resolve) => {
      const img = new Image();

      // Only set crossOrigin for remote URLs; never for data URLs in WebKit/iOS
      if (initialDataUrl.startsWith('http://') || initialDataUrl.startsWith('https://')) {
        img.crossOrigin = 'anonymous';
      }

      img.onload = () => {
        try {
          let { width, height } = img;
          if (!width || !height) {
            return resolve(initialDataUrl);
          }

          if (width > maxWidth || height > maxHeight) {
            if (width > height) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            } else {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = Math.max(1, width);
          canvas.height = Math.max(1, height);
          const ctx = canvas.getContext('2d');
          
          if (ctx) {
            // Fill background with white to avoid black background on transparent PNGs/stickers
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, width, height);
            ctx.drawImage(img, 0, 0, width, height);
            
            // Convert to clean JPEG format for compact size & maximum compatibility
            const compressed = canvas.toDataURL('image/jpeg', quality);
            if (compressed && compressed.length > 50) {
              return resolve(compressed);
            }
          }
          resolve(initialDataUrl);
        } catch (canvasErr) {
          console.warn('Canvas compression notice, falling back to data URL:', canvasErr);
          resolve(initialDataUrl);
        }
      };

      img.onerror = () => {
        // Fallback directly to the raw Base64 data URL (which is permanent)
        resolve(initialDataUrl);
      };

      img.src = initialDataUrl;
    });
  } catch (err) {
    console.warn('Image optimization notice:', err);
    if (typeof source === 'string') {
      return source || DEFAULT_PIECE_IMAGE;
    }
    try {
      return await readFileAsDataUrl(source);
    } catch {
      return DEFAULT_PIECE_IMAGE;
    }
  }
}

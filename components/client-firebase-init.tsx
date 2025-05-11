"use client";

import dynamic from 'next/dynamic';

// Dynamically import the FirebaseInit component with SSR disabled
const FirebaseInitComponent = dynamic(
  () => import('@/components/firebase-init').then((mod) => mod.FirebaseInit),
  { ssr: false }
);

export function ClientFirebaseInit() {
  return <FirebaseInitComponent />;
}

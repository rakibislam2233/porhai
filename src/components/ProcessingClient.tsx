"use client";

import { useEffect, useState } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import ProcessingScreen from '@/components/ProcessingScreen';

export default function ProcessingClient() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const docId = params?.id as string;
  const [fileName, setFileName] = useState('');

  // When using searchParams inside a client component, Next.js requires a suspense boundary,
  // but for simplicity in this file, we can just use it. If there is a build error, we can wrap it.
  useEffect(() => {
    if (searchParams) {
      setFileName(searchParams.get('name') || 'Document.pdf');
    }
  }, [searchParams]);

  useEffect(() => {
    if (docId) {
      // Simulate processing time
      const timer = setTimeout(() => {
        router.push(`/chat/${docId}`);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [docId, router]);

  return <ProcessingScreen fileName={fileName} />;
}

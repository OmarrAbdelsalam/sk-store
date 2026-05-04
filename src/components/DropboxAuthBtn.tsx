"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";

export default function DropboxAuthBtn() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleAuth = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/dropbox-auth', {
        method: 'POST',
        body: JSON.stringify({ code: 'fbOVjDZzCWsAAAAAAAAAHmRwz2PexG9lVjAh43vYWO0' }),
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      console.log('DROPBOX TOKEN RESULT:', data);
      setResult(data);
      alert('Check Console for full result! Refresh Token: ' + (data.refresh_token || 'Not found'));
    } catch (e) {
      console.error(e);
      alert('Error - check console');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed top-24 right-4 z-[9999] bg-white p-4 shadow-xl border rounded">
      <Button onClick={handleAuth} disabled={loading} className="bg-blue-600">
        {loading ? 'Getting Token...' : 'Get Dropbox Token'}
      </Button>
      {result && (
        <pre className="mt-2 text-xs max-w-sm overflow-auto max-h-40 bg-gray-100 p-2">
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  );
}

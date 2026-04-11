'use client';

import { useState } from 'react';
import { triggerAdminBackup } from '@/lib/api';

export default function BackupButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleBackup = async () => {
    setIsLoading(true);
    setError('');
    setStatus('');
    try {
      const res = await triggerAdminBackup();
      setStatus(`Backup created: ${res.backupDir} | Size: ${res.backupSize} | Duration: ${res.durationSeconds}s`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Backup failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="font-semibold text-gray-900">Database Backup</h2>
          <p className="text-sm text-gray-500">Create a full MongoDB backup to the shared backup volume.</p>
        </div>
        <button
          type="button"
          onClick={handleBackup}
          disabled={isLoading}
          className="px-4 py-2 rounded-lg bg-iimst-orange text-white hover:bg-iimst-orange-dark disabled:opacity-60"
        >
          {isLoading ? 'Creating backup...' : 'Trigger Backup'}
        </button>
      </div>
      {status ? <p className="text-sm text-green-700 mt-3">{status}</p> : null}
      {error ? <p className="text-sm text-red-600 mt-3">{error}</p> : null}
    </div>
  );
}

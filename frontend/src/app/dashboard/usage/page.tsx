'use client';

import { useEffect, useState } from 'react';
import { api, UsageLog } from '@/lib/api';
import { useRequireAuth } from '@/lib/auth';

export default function UsagePage() {
  useRequireAuth();
  const [logs, setLogs] = useState<UsageLog[]>([]);

  useEffect(() => {
    api.usage().then(setLogs).catch(() => setLogs([]));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold">Histórico de uso</h1>
      <p className="mt-1 text-muted">Últimas 100 requisições</p>

      <div className="mt-8 overflow-x-auto rounded-xl border border-border">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="bg-card text-left text-muted">
            <tr>
              <th className="px-4 py-3">Data</th>
              <th className="px-4 py-3">Tipo</th>
              <th className="px-4 py-3">Query</th>
              <th className="px-4 py-3">Créditos</th>
              <th className="px-4 py-3">Cache</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log, i) => (
              <tr key={i} className="border-t border-border">
                <td className="px-4 py-3 text-muted">
                  {new Date(log.createdAt).toLocaleString('pt-BR')}
                </td>
                <td className="px-4 py-3">{log.searchType}</td>
                <td className="max-w-xs truncate px-4 py-3">{log.query}</td>
                <td className="px-4 py-3 font-mono text-accent">{log.creditsUsed}</td>
                <td className="px-4 py-3">{log.cached ? 'Sim' : 'Não'}</td>
              </tr>
            ))}
            {logs.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted">
                  Nenhum uso registrado ainda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

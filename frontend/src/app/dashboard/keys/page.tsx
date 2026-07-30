'use client';

import { FormEvent, useEffect, useState } from 'react';
import { api, ApiKey } from '@/lib/api';
import { useRequireAuth } from '@/lib/auth';

export default function ApiKeysPage() {
  useRequireAuth();
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [name, setName] = useState('');
  const [newKey, setNewKey] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function loadKeys() {
    api.listApiKeys().then(setKeys).catch(() => setKeys([]));
  }

  useEffect(() => {
    loadKeys();
  }, []);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.createApiKey(name || 'Default');
      setNewKey(res.key);
      setName('');
      loadKeys();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar key');
    } finally {
      setLoading(false);
    }
  }

  async function handleRevoke(id: string) {
    if (!confirm('Revogar esta API Key?')) return;
    await api.revokeApiKey(id);
    loadKeys();
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">API Keys</h1>
      <p className="mt-1 text-muted">Use no header <code className="text-accent">X-API-Key</code></p>

      {newKey && (
        <div className="mt-6 rounded-xl border border-accent/40 bg-accent/10 p-4">
          <p className="text-sm font-semibold text-accent">Nova chave — copie agora!</p>
          <code className="mt-2 block break-all text-xs">{newKey}</code>
          <button
            onClick={() => navigator.clipboard.writeText(newKey)}
            className="mt-3 text-sm text-accent hover:underline"
          >
            Copiar
          </button>
        </div>
      )}

      <form onSubmit={handleCreate} className="mt-8 flex flex-wrap gap-3">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nome da key (ex: Produção)"
          className="flex-1 rounded-lg border border-border bg-card px-4 py-2 outline-none focus:border-accent"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-accent px-6 py-2 font-semibold text-background disabled:opacity-50"
        >
          Criar API Key
        </button>
      </form>
      {error && <p className="mt-2 text-sm text-red-400">{error}</p>}

      <div className="mt-8 overflow-hidden rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead className="bg-card text-left text-muted">
            <tr>
              <th className="px-4 py-3">Nome</th>
              <th className="px-4 py-3">Prefixo</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {keys.map((k) => (
              <tr key={k.id} className="border-t border-border">
                <td className="px-4 py-3">{k.name}</td>
                <td className="px-4 py-3 font-mono text-muted">{k.keyPrefix}...</td>
                <td className="px-4 py-3">{k.status}</td>
                <td className="px-4 py-3 text-right">
                  {k.status === 'ACTIVE' && (
                    <button onClick={() => handleRevoke(k.id)} className="text-red-400 hover:underline">
                      Revogar
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {keys.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-muted">
                  Nenhuma API Key ainda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

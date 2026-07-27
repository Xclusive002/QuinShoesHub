'use client';

import { useEffect, useState } from 'react';
import { BellRing, Plus, Trash2 } from 'lucide-react';

interface NotificationRow {
  id: string;
  type: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationRow[]>([]);
  const [draft, setDraft] = useState('');
  const [type, setType] = useState('INFO');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const loadNotifications = async () => {
    try {
      const response = await fetch('/api/admin/notifications');
      const data = await response.json();
      setNotifications(data.notifications ?? []);
    } catch {
      setNotifications([]);
    }
  };

  useEffect(() => {
    void loadNotifications();
  }, []);

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!draft.trim()) {
      setError('Message cannot be empty');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, message: draft.trim() }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create notification');
      }

      setDraft('');
      setType('INFO');
      setError(null);
      await loadNotifications();
      window.dispatchEvent(new Event('quinn-notifications-updated'));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create notification');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, { method: 'DELETE' });
      if (!response.ok) {
        throw new Error('Failed to delete notification');
      }
      await loadNotifications();
      window.dispatchEvent(new Event('quinn-notifications-updated'));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to delete notification');
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-display font-bold mb-2">Notifications</h1>
        <p className="text-muted-foreground">Create and manage public storefront alerts from the admin dashboard.</p>
      </div>

      <form onSubmit={handleCreate} className="border border-border p-6 space-y-4">
        {error && (
          <div className="rounded border border-red-500 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}
        <div className="grid gap-4 md:grid-cols-[1fr_180px]">
          <input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Write a public announcement"
            disabled={loading}
            className="border border-border bg-secondary px-4 py-3 text-sm text-foreground placeholder-muted-foreground disabled:opacity-50"
          />
          <select
            value={type}
            onChange={(event) => setType(event.target.value)}
            disabled={loading}
            className="border border-border bg-secondary px-4 py-3 text-sm text-foreground disabled:opacity-50"
          >
            <option value="INFO">Info</option>
            <option value="SALE">Sale</option>
            <option value="NEW_ARRIVAL">New arrival</option>
          </select>
        </div>
        <button type="submit" disabled={loading} className="inline-flex items-center gap-2 bg-foreground px-5 py-2.5 text-sm font-medium text-background transition hover:opacity-80 disabled:opacity-50">
          <Plus className="h-4 w-4" />
          {loading ? 'Creating...' : 'Create notification'}
        </button>
      </form>

      <div className="space-y-4">
        {notifications.map((notification) => (
          <div key={notification.id} className="border border-border p-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 flex items-center justify-center bg-secondary border border-border">
                <BellRing className="w-4 h-4" />
              </div>
              <div>
                <p className="font-medium text-sm">{notification.type}</p>
                <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-sm text-muted-foreground">
                {new Date(notification.createdAt).toLocaleDateString()}
              </div>
              <button
                type="button"
                onClick={() => void handleDelete(notification.id)}
                className="inline-flex items-center gap-2 border border-border px-3 py-2 text-sm font-medium transition hover:bg-secondary"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

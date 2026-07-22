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
      return;
    }

    try {
      await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, message: draft.trim() }),
      });
      setDraft('');
      setType('INFO');
      await loadNotifications();
      window.dispatchEvent(new Event('quinn-notifications-updated'));
    } catch {
      // keep the UI stable
    }
  };

  const handleDelete = async (notificationId: string) => {
    try {
      await fetch(`/api/notifications/${notificationId}`, { method: 'DELETE' });
      await loadNotifications();
      window.dispatchEvent(new Event('quinn-notifications-updated'));
    } catch {
      // keep the UI stable
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-display font-bold mb-2">Notifications</h1>
        <p className="text-muted-foreground">Create and manage public storefront alerts from the admin dashboard.</p>
      </div>

      <form onSubmit={handleCreate} className="border border-border p-6 space-y-4">
        <div className="grid gap-4 md:grid-cols-[1fr_180px]">
          <input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Write a public announcement"
            className="border border-border bg-secondary px-4 py-3 text-sm text-foreground placeholder-muted-foreground"
          />
          <select
            value={type}
            onChange={(event) => setType(event.target.value)}
            className="border border-border bg-secondary px-4 py-3 text-sm text-foreground"
          >
            <option value="INFO">Info</option>
            <option value="SALE">Sale</option>
            <option value="NEW_ARRIVAL">New arrival</option>
          </select>
        </div>
        <button type="submit" className="inline-flex items-center gap-2 bg-foreground px-5 py-2.5 text-sm font-medium text-background transition hover:opacity-80">
          <Plus className="h-4 w-4" />
          Create notification
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

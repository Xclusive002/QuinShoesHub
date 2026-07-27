'use client';

import { useEffect, useState } from 'react';
import { Users } from 'lucide-react';

interface UserRow {
  id: string;
  name?: string | null;
  email?: string | null;
  role: string;
  status: string;
  createdAt: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [selectedUserOrders, setSelectedUserOrders] = useState<any[] | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const response = await fetch('/api/admin/users');
        const data = await response.json();
        setUsers(data.users ?? []);
      } catch {
        setUsers([]);
      }
    };

    void loadUsers();
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-display font-bold mb-2">Customers & Users</h1>
        <p className="text-muted-foreground">Inspect registered accounts and account status</p>
      </div>

      <div className="border border-border overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-secondary">
              <th className="text-left px-6 py-4 text-sm font-medium">User</th>
              <th className="text-left px-6 py-4 text-sm font-medium">Role</th>
              <th className="text-left px-6 py-4 text-sm font-medium">Status</th>
              <th className="text-left px-6 py-4 text-sm font-medium">Joined</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-border hover:bg-secondary transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 flex items-center justify-center bg-secondary border border-border">
                      <Users className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{user.name ?? 'Unnamed user'}</p>
                      <p className="text-xs text-muted-foreground">{user.email ?? 'No email'}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm">{user.role}</td>
                <td className="px-6 py-4 text-sm">
                  <span className="px-2 py-1 rounded text-xs bg-secondary border border-border">{user.status}</span>
                </td>
                <td className="px-6 py-4 text-sm text-muted-foreground">{new Date(user.createdAt).toLocaleDateString()}</td>
                <td className="px-6 py-4 text-sm">
                  <div className="flex gap-2">
                    <button
                      onClick={async () => {
                        setSelectedUserId(user.id);
                        setLoadingAction(`orders:${user.id}`);
                        try {
                          const res = await fetch(`/api/admin/users/${user.id}/orders`);
                          const payload = await res.json();
                          setSelectedUserOrders(payload.orders ?? []);
                        } catch {
                          setSelectedUserOrders([]);
                        } finally {
                          setLoadingAction(null);
                        }
                      }}
                      className="px-2 py-1 rounded border border-border text-sm"
                    >
                      {loadingAction === `orders:${user.id}` ? 'Loading...' : 'View orders'}
                    </button>

                    <button
                      onClick={async () => {
                        const shouldBlock = user.status !== 'BANNED';
                        setLoadingAction(`block:${user.id}`);
                        try {
                          await fetch(`/api/admin/users/${user.id}`, { method: 'PATCH', body: JSON.stringify({ action: shouldBlock ? 'block' : 'unblock' }), headers: { 'Content-Type': 'application/json' } });
                          setUsers((cur) => cur.map((u) => (u.id === user.id ? { ...u, status: shouldBlock ? 'BANNED' : 'ACTIVE' } : u)));
                        } catch {
                          // ignore
                        } finally {
                          setLoadingAction(null);
                        }
                      }}
                      className="px-2 py-1 rounded border border-border text-sm"
                    >
                      {loadingAction === `block:${user.id}` ? 'Updating...' : user.status === 'BANNED' ? 'Unblock' : 'Block'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedUserOrders ? (
        <div className="border border-border p-4">
          <h3 className="font-medium">Orders for user {selectedUserId}</h3>
          {selectedUserOrders.length === 0 ? <p className="text-sm text-muted-foreground">No orders found.</p> : (
            <ul className="mt-2 space-y-2">
              {selectedUserOrders.map((o: any) => (
                <li key={o.id} className="flex justify-between border p-2 rounded">
                  <div>
                    <div className="font-medium">{o.id}</div>
                    <div className="text-xs text-muted-foreground">{o.status} • {new Date(o.createdAt).toLocaleString()}</div>
                  </div>
                  <div className="text-sm">NGN {o.total}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}

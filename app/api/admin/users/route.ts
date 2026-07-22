import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { fallbackStore } from '@/lib/fallback-store';
import { supabaseAdmin } from '@/lib/supabase';

function formatAuthUser(authUser: any) {
  return {
    id: authUser.id,
    authUserId: authUser.id,
    name:
      authUser.user_metadata?.full_name ||
      authUser.user_metadata?.name ||
      authUser.raw_user_meta_data?.full_name ||
      authUser.raw_user_meta_data?.name ||
      authUser.email ||
      'Unnamed user',
    email: authUser.email ?? '',
    role: 'CUSTOMER',
    status: authUser.raw_user_meta_data?.status || authUser.user_metadata?.status || 'ACTIVE',
    createdAt: authUser.created_at ?? new Date().toISOString(),
  };
}

export async function GET() {
  try {
    const dbUsers = await prisma.user.findMany({ orderBy: { createdAt: 'desc' } });
    const mergedUsers: Record<string, any> = {};

    for (const user of dbUsers) {
      mergedUsers[user.id] = {
        id: user.id,
        authUserId: user.authUserId ?? undefined,
        name: user.fullName || user.name || 'Unnamed user',
        email: user.email ?? '',
        role: user.role,
        status: user.status,
        createdAt: user.createdAt.toISOString(),
      };
    }

    if (supabaseAdmin) {
      const { data: authUsers, error } = await supabaseAdmin.auth.admin.listUsers();
      if (!error && authUsers?.length) {
        for (const authUser of authUsers) {
          const formatted = formatAuthUser(authUser);
          const dbUser = dbUsers.find((user) => user.authUserId === authUser.id || user.email === authUser.email);
          if (dbUser) {
            mergedUsers[dbUser.id] = {
              ...mergedUsers[dbUser.id],
              authUserId: authUser.id,
              name: formatted.name,
              email: formatted.email,
              status: formatted.status,
              createdAt: formatted.createdAt,
            };
          } else {
            mergedUsers[authUser.id] = formatted;
          }
        }
      }
    }

    const users = Object.values(mergedUsers);
    if (users.length > 0) {
      return NextResponse.json({ users });
    }
  } catch (error) {
    console.error('Admin users fetch failed', error);
  }

  return NextResponse.json({ users: fallbackStore.getUsers() });
}

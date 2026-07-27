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
      let nextPageToken: string | undefined;
      const authUsers: any[] = [];

      do {
        const { data, error } = await supabaseAdmin.auth.admin.listUsers({ nextPageToken, perPage: 100 });
        if (error) {
          console.error('Supabase admin listUsers failed', error);
          break;
        }
        if (data?.users) {
          authUsers.push(...data.users);
        }
        nextPageToken = data?.nextPageToken ?? undefined;
      } while (nextPageToken);

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

    const users = Object.values(mergedUsers);
    return NextResponse.json({ users });
  } catch (error) {
    console.error('Admin users fetch failed', error);

    if (supabaseAdmin) {
      try {
        const { data, error: supabaseError } = await supabaseAdmin.auth.admin.listUsers();
        const authUsers = data?.users ?? [];
        if (!supabaseError && authUsers.length) {
          return NextResponse.json({ users: authUsers.map(formatAuthUser) });
        }
        if (supabaseError) {
          console.error('Supabase admin listUsers failed in fallback', supabaseError);
        }
      } catch (supabaseFetchError) {
        console.error('Supabase fallback fetch failed', supabaseFetchError);
      }
    }

    return NextResponse.json({ users: fallbackStore.getUsers() });
  }
}

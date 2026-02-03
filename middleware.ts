
/**
 * NOTE: This is a conceptual middleware file for a standard Next.js project.
 * It demonstrates the logic for protecting routes based on user roles.
 * In this single-page app environment, this logic is handled within App.tsx,
 * but this file serves as a blueprint for a server-rendered setup.
 */

import { createServerClient } from '@supabase/ssr';
// import { NextResponse, type NextRequest } from 'next/server';

// Define a placeholder request and response for demonstration
type NextRequest = Request & { cookies: { get: (name: string) => { value: string } | undefined } };
type NextResponse = { redirect: (url: URL) => void; next: () => void; };


export async function middleware(req: NextRequest) {
  // In a real Next.js app, you'd create a response object.
  // const res = NextResponse.next();
  const res = { redirect: (url: URL) => console.log(`Redirecting to ${url}`), next: () => console.log('Continuing to next middleware/page') };


  const supabase = createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value;
        },
      },
    }
  );

  const { data: { session } } = await supabase.auth.getSession();
  const { pathname } = new URL(req.url);

  // Define protected routes and their required roles
  const protectedRoutes: Record<string, string[]> = {
    '/admin': ['admin'],
    '/dashboard': ['admin', 'wholesale_buyer'],
    '/logistics': ['logistics'],
  };

  const requiredRoles = Object.entries(protectedRoutes).find(([route]) =>
    pathname.startsWith(route)
  )?.[1];
  
  // If the route is not protected, continue
  if (!requiredRoles) {
    return res.next();
  }

  // If user is not logged in, redirect to auth page
  if (!session) {
    const redirectUrl = new URL('/auth', req.url);
    redirectUrl.searchParams.set('next', pathname); // Optional: redirect back after login
    return res.redirect(redirectUrl);
  }

  // If user is logged in, check their role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, approval_status')
    .eq('id', session.user.id)
    .single();

  // If profile doesn't exist or role doesn't match, deny access
  if (!profile || !requiredRoles.includes(profile.role)) {
     const redirectUrl = new URL('/unauthorized', req.url); // Or redirect to home
     return res.redirect(redirectUrl);
  }

  // Special check for wholesale buyers
  if (profile.role === 'wholesale_buyer' && profile.approval_status !== 'approved') {
     const redirectUrl = new URL('/pending-approval', req.url);
     return res.redirect(redirectUrl);
  }

  // If all checks pass, allow access
  return res.next();
}

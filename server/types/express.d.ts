// Express Request augmentation — gives req.user a concrete type throughout
// the server, replacing scattered `req: any` casts.
// The User shape mirrors shared/models/auth.ts `users` table.
import "express";

declare global {
  namespace Express {
    interface User {
      id: string;
      email: string | null;
      firstName: string | null;
      lastName: string | null;
      displayName: string | null;
      profileImageUrl: string | null;
      bio: string | null;
      role: string | null;
      tier: string | null;
      isAnonymous: boolean;
      hasCompletedOnboarding: boolean;
      createdAt: Date | null;
      updatedAt: Date | null;
            // OIDC session fields (set by Replit Auth verify callback)
      claims?: Record<string, unknown>;
      access_token?: string;
      refresh_token?: string;
      expires_at?: number;
      passwordHash?: string | null;
    }
  }
}

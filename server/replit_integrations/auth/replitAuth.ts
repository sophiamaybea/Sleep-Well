import * as client from "openid-client";
import { Strategy, type VerifyFunction } from "openid-client/passport";
import passport from "passport";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import memoize from "memoizee";
import connectPg from "connect-pg-simple";
import bcrypt from "bcryptjs";
import { authStorage } from "./storage";

const isReplit = !!process.env.REPL_ID;

const getOidcConfig = memoize(
  async () => {
    return await client.discovery(
      new URL(process.env.ISSUER_URL ?? "https://replit.com/oidc"),
      process.env.REPL_ID!
    );
  },
  { maxAge: 3600 * 1000 }
);

export function getSession() {
  const sessionTtl = 30 * 24 * 60 * 60 * 1000; // 30 days
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: true,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  return session({
    secret: process.env.SESSION_SECRET!,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: sessionTtl,
      sameSite: "lax" as const,
    },
  });
}

function updateUserSession(
  user: any,
  tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers
) {
  user.claims = tokens.claims();
  user.access_token = tokens.access_token;
  user.refresh_token = tokens.refresh_token;
  user.expires_at = user.claims?.exp;
}

async function upsertUser(claims: any) {
  await authStorage.upsertUser({
    id: claims["sub"],
    email: claims["email"],
    firstName: claims["first_name"],
    lastName: claims["last_name"],
    profileImageUrl: claims["profile_image_url"],
  });
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());

  if (isReplit) {
    app.use(passport.initialize());
    app.use(passport.session());

    const config = await getOidcConfig();
    const verify: VerifyFunction = async (
      tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers,
      verified: passport.AuthenticateCallback
    ) => {
      const user = {};
      updateUserSession(user, tokens);
      await upsertUser(tokens.claims());
      verified(null, user);
    };

    const registeredStrategies = new Set<string>();
    const ensureStrategy = (domain: string) => {
      const strategyName = `replitauth:${domain}`;
      if (!registeredStrategies.has(strategyName)) {
        const strategy = new Strategy(
          {
            name: strategyName,
            config,
            scope: "openid email profile offline_access",
            callbackURL: `https://${domain}/api/callback`,
          },
          verify
        );
        passport.use(strategy);
        registeredStrategies.add(strategyName);
      }
    };

    passport.serializeUser((user: Express.User, cb) => cb(null, user));
    passport.deserializeUser((user: Express.User, cb) => cb(null, user));

    app.get("/api/login", (req, res, next) => {
      ensureStrategy(req.hostname);
      passport.authenticate(`replitauth:${req.hostname}`, {
        prompt: "login consent",
        scope: ["openid", "email", "profile", "offline_access"],
      })(req, res, next);
    });

    app.get("/api/callback", (req, res, next) => {
      ensureStrategy(req.hostname);
      passport.authenticate(`replitauth:${req.hostname}`, {
        successReturnToOrRedirect: "/",
        failureRedirect: "/api/login",
      })(req, res, next);
    });

    app.get("/api/logout", (req, res) => {
      req.logout(() => {
        res.redirect(
          client.buildEndSessionUrl(config, {
            client_id: process.env.REPL_ID!,
            post_logout_redirect_uri: `${req.protocol}://${req.hostname}`,
          }).href
        );
      });
    });
  } else {
    // Local session-based auth for Railway/production
    app.post("/api/login", async (req, res) => {
      try {
        const { email, password } = req.body;
        if (!email || !password) {
          return res.status(400).json({ message: "Email and password are required" });
        }
        const user = await authStorage.getUserByEmail(email);
        if (!user || !user.passwordHash) {
          return res.status(401).json({ message: "Invalid email or password" });
        }
        const isValid = await bcrypt.compare(password, user.passwordHash);
        if (!isValid) {
          return res.status(401).json({ message: "Invalid email or password" });
        }
        (req.session as any).userId = user.id;
        (req.session as any).user = {
          claims: { sub: user.id, email: user.email, first_name: user.firstName, last_name: user.lastName, profile_image_url: user.profileImageUrl },
          expires_at: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
        };
        return res.json({ message: "Login successful", user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: (user as any).role } });
      } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({ message: "Internal server error" });
      }
    });

    app.post("/api/register", async (req, res) => {
      try {
        const { email, password, firstName, lastName } = req.body;
        if (!email || !password) {
          return res.status(400).json({ message: "Email and password are required" });
        }
        const existing = await authStorage.getUserByEmail(email);
        if (existing) {
          return res.status(409).json({ message: "Email already registered" });
        }
        const passwordHash = await bcrypt.hash(password, 12);
        const userId = crypto.randomUUID();
        await authStorage.upsertUser({
          id: userId,
          email,
          firstName: firstName || "",
          lastName: lastName || "",
          profileImageUrl: "",
        });
        // Update the password hash separately
        await authStorage.setPasswordHash(userId, passwordHash);
        (req.session as any).userId = userId;
        (req.session as any).user = {
          claims: { sub: userId, email, first_name: firstName, last_name: lastName },
          expires_at: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
        };
        return res.json({ message: "Registration successful" });
      } catch (error) {
        console.error("Registration error:", error);
        return res.status(500).json({ message: "Internal server error" });
      }
    });

    app.get("/api/login", (_req, res) => {
      res.redirect("/");
    });

    app.get("/api/logout", (req, res) => {
      req.session.destroy((err) => {
        if (err) console.error("Logout error:", err);
        res.redirect("/");
      });
    });
  }
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  if (isReplit) {
    const user = req.user as any;
    if (!req.isAuthenticated() || !user.expires_at) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const now = Math.floor(Date.now() / 1000);
    if (now <= user.expires_at) {
      return next();
    }
    const refreshToken = user.refresh_token;
    if (!refreshToken) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    try {
      const config = await getOidcConfig();
      const tokenResponse = await client.refreshTokenGrant(config, refreshToken);
      updateUserSession(user, tokenResponse);
      return next();
    } catch (error) {
      return res.status(401).json({ message: "Unauthorized" });
    }
  } else {
    const sessionUser = (req.session as any).user;
    if (!sessionUser) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const now = Math.floor(Date.now() / 1000);
    if (sessionUser.expires_at && now > sessionUser.expires_at) {
      return res.status(401).json({ message: "Session expired" });
    }
    (req as any).user = sessionUser;
    return next();
  }
};

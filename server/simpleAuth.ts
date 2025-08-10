import type { Express, RequestHandler, Request } from "express";
import { storage } from "./storage";

declare module 'express-session' {
  interface SessionData {
    userId: string;
  }
}

// Simple authentication middleware for demo purposes
// In production, you would use proper OAuth/OpenID Connect

export async function setupSimpleAuth(app: Express) {
  // Login endpoint - for demo, we'll just create/login users based on email
  app.post('/api/login', async (req, res) => {
    try {
      const { email, firstName, lastName } = req.body;
      
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }

      // Create or get user
      const userData = {
        id: email, // Using email as ID for simplicity
        email,
        firstName: firstName || null,
        lastName: lastName || null,
        profileImageUrl: null,
      };

      const user = await storage.upsertUser(userData);
      
      // Set session
      req.session.userId = user.id;
      
      res.json({ user, message: "Logged in successfully" });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  // Logout endpoint
  app.post('/api/logout', (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  const userId = req.session?.userId;
  
  if (!userId) {
    return res.status(401).json({ message: "Authentication required" });
  }
  
  const user = await storage.getUser(userId);
  if (!user) {
    return res.status(401).json({ message: "User not found" });
  }
  
  (req as any).currentUser = user;
  next();
};

export const isAdmin: RequestHandler = async (req, res, next) => {
  const user = (req as any).currentUser;
  
  if (!user) {
    return res.status(401).json({ message: "Authentication required" });
  }
  
  if (!user.isAdmin) {
    return res.status(403).json({ message: "Admin access required" });
  }
  
  next();
};
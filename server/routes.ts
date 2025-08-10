import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupSimpleAuth, isAuthenticated, isAdmin } from "./simpleAuth";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupSimpleAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const user = req.currentUser;
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Check if user is admin
  app.get('/api/auth/admin', isAuthenticated, async (req: any, res) => {
    try {
      const user = req.currentUser;
      res.json({ isAdmin: user.isAdmin || false });
    } catch (error) {
      console.error("Error checking admin status:", error);
      res.status(500).json({ message: "Failed to check admin status" });
    }
  });

  // Admin-only routes (for future admin functionality)
  app.get("/api/admin/users", isAdmin, async (req, res) => {
    // Future: Get all users for admin management
    res.json({ message: "Admin access granted" });
  });

  // Protected route example
  app.get("/api/protected", isAuthenticated, async (req: any, res) => {
    const user = req.currentUser;
    res.json({ message: "Access granted", user: user.email });
  });

  const httpServer = createServer(app);
  return httpServer;
}
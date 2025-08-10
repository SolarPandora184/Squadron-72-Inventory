import express from 'express';
import session from 'express-session';
import path from 'path';
import { registerRoutes } from './routes';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET || 'cap-squadron-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 } // 24 hours
}));
app.use(express.static(path.join(__dirname, '..')));

// Register routes
registerRoutes(app).then((server) => {
  server.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`CAP Inventory Server running on http://0.0.0.0:${PORT}`);
  });
}).catch(console.error);
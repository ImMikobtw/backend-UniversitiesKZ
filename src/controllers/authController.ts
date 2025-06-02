import { Request, Response, RequestHandler } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { QueryResult } from 'pg';
import pool from '../config/db';
import { User, RefreshToken } from '../types';
import { body, validationResult } from 'express-validator';
import dotenv from 'dotenv';

dotenv.config();

export const login = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
  (async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ error: errors.array()[0].msg });
      return;
    }

    const { email, password } = req.body;

    try {
      const result: QueryResult<User> = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
      const user = result.rows[0];

      if (!user) {
        res.status(401).json({ error: 'Invalid credentials' });
        return;
      }

      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) {
        res.status(401).json({ error: 'Invalid credentials' });
        return;
      }

      const accessToken = jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_ACCESS_SECRET!,
        { expiresIn: '15m' }
      );
      const refreshToken = jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_REFRESH_SECRET!,
        { expiresIn: '7d' }
      );

      await pool.query(
        'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
        [user.id, refreshToken, new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)]
      );

      res.json({ success: true, token: accessToken, refreshToken });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }) as RequestHandler,
];

export const register = [
  body('firstName').notEmpty(),
  body('lastName').notEmpty(),
  body('email').isEmail().normalizeEmail(),
  body('university').notEmpty(),
  body('password').isLength({ min: 6 }),
  (async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ error: errors.array()[0].msg });
      return;
    }

    const { firstName, lastName, email, university, password } = req.body;

    try {
      const existingUsersResult: QueryResult<User> = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
      if (existingUsersResult.rows.length > 0) {
        res.status(400).json({ error: 'Email already exists' });
        return;
      }

      const universitiesResult: QueryResult<{ id: number }> = await pool.query('SELECT id FROM universities WHERE code = $1', [university]);
      if (universitiesResult.rows.length === 0) {
        res.status(400).json({ error: 'Invalid university' });
        return;
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const userResult: QueryResult<User> = await pool.query(
        'INSERT INTO users (first_name, last_name, email, password_hash, university_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [firstName, lastName, email, passwordHash, universitiesResult.rows[0].id]
      );

      const user = userResult.rows[0];

      const accessToken = jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_ACCESS_SECRET!,
        { expiresIn: '15m' }
      );
      const refreshToken = jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_REFRESH_SECRET!,
        { expiresIn: '7d' }
      );

      await pool.query(
        'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
        [user.id, refreshToken, new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)]
      );

      res.json({ success: true, token: accessToken, refreshToken });
    } catch (error) {
      console.error('Register error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }) as RequestHandler,
];

export const validateToken: RequestHandler = async (req: Request, res: Response) => {
  const { token } = req.body;

  try {
    const result: QueryResult<RefreshToken> = await pool.query(
      'SELECT * FROM refresh_tokens WHERE token = $1 AND expires_at > NOW()',
      [token]
    );

    if (result.rows.length === 0) {
      res.json({ valid: false });
      return;
    }

    res.json({ valid: true });
  } catch (error) {
    console.error('Validate token error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
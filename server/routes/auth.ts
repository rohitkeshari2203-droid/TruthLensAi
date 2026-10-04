import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { UserRepository, AuditLogRepository } from '../db/index.js';
import { generateToken, requireAuth, AuthenticatedRequest } from '../security/auth.js';

export const authRouter = Router();

const RegisterSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  preferred_language: z.string().default('en'),
});

const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

function setAuthCookie(res: Response, token: string) {
  res.cookie('auth_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/',
  });
}

authRouter.post('/register', async (req, res) => {
  try {
    const parseResult = RegisterSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: parseResult.error.issues[0]?.message || 'Invalid input data',
        },
      });
      return;
    }

    const { name, email, password, preferred_language } = parseResult.data;

    const existingUser = UserRepository.findByEmail(email);
    if (existingUser) {
      res.status(409).json({
        success: false,
        error: {
          code: 'EMAIL_ALREADY_EXISTS',
          message: 'An account with this email address already exists.',
        },
      });
      return;
    }

    const password_hash = await bcrypt.hash(password, 10);
    const newUser = UserRepository.create({
      id: `usr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name,
      email: email.toLowerCase(),
      password_hash,
      role: 'USER',
      preferred_language: preferred_language || 'en',
      is_verified: true,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    const token = generateToken({
      userId: newUser.id,
      email: newUser.email,
      role: newUser.role,
    });

    setAuthCookie(res, token);
    AuditLogRepository.log('USER_REGISTERED', newUser.id, { email: newUser.email }, req.ip, req.headers['user-agent']);

    res.status(201).json({
      success: true,
      data: {
        token,
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          preferred_language: newUser.preferred_language,
        },
      },
    });
  } catch (err: any) {
    console.error('Registration error:', err);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Registration failed due to a server error.' },
    });
  }
});

authRouter.post('/login', async (req, res) => {
  try {
    const parseResult = LoginSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: parseResult.error.issues[0]?.message || 'Invalid credentials format',
        },
      });
      return;
    }

    const { email, password } = parseResult.data;
    const user = UserRepository.findByEmail(email);

    if (!user || !user.is_active) {
      AuditLogRepository.log('FAILED_LOGIN_ATTEMPT', undefined, { email }, req.ip, req.headers['user-agent']);
      res.status(401).json({
        success: false,
        error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email address or password.' },
      });
      return;
    }

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      AuditLogRepository.log('FAILED_LOGIN_ATTEMPT', user.id, { email }, req.ip, req.headers['user-agent']);
      res.status(401).json({
        success: false,
        error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email address or password.' },
      });
      return;
    }

    UserRepository.update(user.id, { last_login: new Date().toISOString() });
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    setAuthCookie(res, token);
    AuditLogRepository.log('USER_LOGIN', user.id, { email: user.email }, req.ip, req.headers['user-agent']);

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          preferred_language: user.preferred_language,
        },
      },
    });
  } catch (err: any) {
    console.error('Login error:', err);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Login failed due to a server error.' },
    });
  }
});

authRouter.post('/logout', (req, res) => {
  res.clearCookie('auth_token', { path: '/' });
  res.json({
    success: true,
    data: { message: 'Logged out successfully.' },
  });
});

authRouter.get('/me', requireAuth, (req: AuthenticatedRequest, res) => {
  const user = UserRepository.findById(req.user!.id);
  if (!user) {
    res.status(404).json({
      success: false,
      error: { code: 'USER_NOT_FOUND', message: 'User record not found.' },
    });
    return;
  }

  res.json({
    success: true,
    data: {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        preferred_language: user.preferred_language,
        created_at: user.created_at,
        last_login: user.last_login,
      },
    },
  });
});

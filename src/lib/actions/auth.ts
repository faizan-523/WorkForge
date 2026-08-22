'use server';

import { RegisterSchema } from '@/lib/validators';
import {
  ForgotPasswordSchema,
  ResetPasswordSchema,
  type ForgotPasswordValues,
  type ResetPasswordValues,
} from '@/lib/validations/password-reset';
import { db } from '@/lib/db';
import * as bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';

export async function registerUser(formData: {
  email: string;
  name: string;
  role: 'CLIENT' | 'FREELANCER';
  password: string;
}) {
  const validated = RegisterSchema.safeParse(formData);
  if (!validated.success) {
    return {
      success: false,
      error: validated.error.issues[0].message,
    };
  }

  const { email, name, role, password } = validated.data;

  try {
    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return {
        success: false,
        error: 'A user with this email already exists.',
      };
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await db.user.create({
      data: {
        email,
        passwordHash,
        name,
        role,
        profile: {
          create: {},
        },
      },
    });

    return {
      success: true,
      message: 'Account created successfully! You can now log in.',
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'An unexpected error occurred.',
    };
  }
}

// ---------------------------------------------------------------------------
// Forgot Password — Generates password reset token
// ---------------------------------------------------------------------------
export async function requestPasswordReset(data: ForgotPasswordValues) {
  const parsed = ForgotPasswordSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const { email } = parsed.data;

  try {
    const user = await db.user.findUnique({ where: { email } });
    if (!user) {
      // Return true to avoid user enumeration security issues
      return {
        success: true,
        message: 'If an account exists with that email, a password reset token has been generated.',
      };
    }

    // Generate secure token valid for 1 hour
    const token = randomUUID();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    // Delete previous reset tokens for this email
    await db.passwordResetToken.deleteMany({ where: { email } });

    await db.passwordResetToken.create({
      data: {
        email,
        token,
        expiresAt,
      },
    });

    // Simulated email delivery — log link for development/testing
    const resetUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/reset-password?token=${token}`;
    console.log(`[PASSWORD_RESET_EMAIL] Token generated for ${email}: ${resetUrl}`);

    return {
      success: true,
      message: 'Password reset link generated successfully!',
      resetUrl, // Provided for easy dev environment testing
    };
  } catch (error: any) {
    console.error('[requestPasswordReset] Error:', error);
    return { success: false, error: 'Failed to request password reset.' };
  }
}

// ---------------------------------------------------------------------------
// Reset Password with Token — Updates user passwordHash
// ---------------------------------------------------------------------------
export async function resetPasswordWithToken(data: ResetPasswordValues) {
  const parsed = ResetPasswordSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const { token, password } = parsed.data;

  try {
    const resetTokenRecord = await db.passwordResetToken.findUnique({
      where: { token },
    });

    if (!resetTokenRecord || resetTokenRecord.expiresAt < new Date()) {
      return {
        success: false,
        error: 'Invalid or expired password reset token. Please request a new link.',
      };
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await db.$transaction([
      db.user.update({
        where: { email: resetTokenRecord.email },
        data: { passwordHash },
      }),
      db.passwordResetToken.delete({
        where: { id: resetTokenRecord.id },
      }),
    ]);

    return {
      success: true,
      message: 'Your password has been reset successfully! You can now log in.',
    };
  } catch (error: any) {
    console.error('[resetPasswordWithToken] Error:', error);
    return { success: false, error: 'Failed to reset password.' };
  }
}

import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

// Test ErrorBoundary
import ErrorBoundary from '../components/common/ErrorBoundary';

function ThrowError() {
  throw new Error('Test error');
}

describe('ErrorBoundary', () => {
  it('renders children when no error', () => {
    render(
      <ErrorBoundary>
        <div>Child content</div>
      </ErrorBoundary>
    );
    expect(screen.getByText('Child content')).toBeInTheDocument();
  });

  it('renders error UI when child throws', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );
    expect(screen.getByText('Đã xảy ra lỗi')).toBeInTheDocument();
    expect(screen.getByText('🔄 Thử lại')).toBeInTheDocument();
    expect(screen.getByText('🏠 Về trang chủ')).toBeInTheDocument();
    consoleSpy.mockRestore();
  });

  it('shows error details in collapsible', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );
    expect(screen.getByText('Chi tiết lỗi')).toBeInTheDocument();
    consoleSpy.mockRestore();
  });
});

// Test Toast
import ToastContainer from '../components/common/Toast';

describe('ToastContainer', () => {
  it('renders empty container', () => {
    render(<ToastContainer />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('has correct ARIA attributes', () => {
    render(<ToastContainer />);
    const container = screen.getByRole('status');
    expect(container).toHaveAttribute('aria-live', 'polite');
    expect(container).toHaveAttribute('aria-label', 'Thông báo');
  });
});

// Test validation utilities
import { validateEmail, validatePhone, validateRequired, sanitizeInput } from '../utils/validation';

describe('Validation utilities', () => {
  it('validateEmail accepts valid email', () => {
    expect(validateEmail('test@example.com')).toBeNull();
  });

  it('validateEmail rejects invalid email', () => {
    expect(validateEmail('invalid')).not.toBeNull();
  });

  it('validatePhone accepts valid Vietnamese phone', () => {
    expect(validatePhone('0912345678')).toBeNull();
  });

  it('validatePhone rejects invalid phone', () => {
    expect(validatePhone('123')).not.toBeNull();
  });

  it('validateRequired rejects empty value', () => {
    expect(validateRequired('', 'Tên')).not.toBeNull();
  });

  it('validateRequired accepts valid value', () => {
    expect(validateRequired('Hello', 'Tên')).toBeNull();
  });

  it('sanitizeInput escapes HTML special characters', () => {
    const result = sanitizeInput('<script>alert("xss")</script>');
    expect(result).toBe('<script>alert("xss")</script>');
  });

  it('sanitizeInput escapes ampersand', () => {
    expect(sanitizeInput('A & B')).toBe('A & B');
  });

  it('sanitizeInput returns non-string as-is', () => {
    expect(sanitizeInput(123)).toBe(123);
    expect(sanitizeInput(null)).toBe(null);
  });
});

// Test permissions
import { can, ROLES } from '../utils/permissions';

describe('Permission system', () => {
  it('admin has all permissions', () => {
    const admin = { role: ROLES.ADMIN };
    expect(can(admin, 'VIEW_CLUB_DASHBOARD')).toBe(true);
    expect(can(admin, 'DELETE_TASK')).toBe(true);
    expect(can(admin, 'VIEW_SETTINGS')).toBe(true);
  });

  it('member has limited permissions', () => {
    const member = { role: ROLES.MEMBER };
    expect(can(member, 'VIEW_CLUB_DASHBOARD')).toBe(false);
    expect(can(member, 'CREATE_TASK')).toBe(false);
    expect(can(member, 'VIEW_PERSONAL_DASHBOARD')).toBe(true);
  });

  it('null user has no permissions', () => {
    expect(can(null, 'VIEW_CLUB_DASHBOARD')).toBe(false);
  });
});

// Test constants integrity
import { STORAGE_KEYS, TASK_STATUS, PRIORITY, ROLES as ROLES_CONST } from '../constants';

describe('Constants integrity', () => {
  it('STORAGE_KEYS has no duplicates', () => {
    const values = Object.values(STORAGE_KEYS);
    expect(new Set(values).size).toBe(values.length);
  });

  it('all STORAGE_KEYS start with innohub_', () => {
    Object.values(STORAGE_KEYS).forEach(key => {
      expect(key).toMatch(/^innohub_/);
    });
  });

  it('TASK_STATUS defines all statuses', () => {
    expect(TASK_STATUS.TODO).toBe('todo');
    expect(TASK_STATUS.DONE).toBe('done');
    expect(TASK_STATUS.ARCHIVED_COMPLETED).toBe('archived_completed');
  });

  it('PRIORITY defines all levels', () => {
    expect(PRIORITY.LOW).toBe('low');
    expect(PRIORITY.URGENT).toBe('urgent');
  });

  it('ROLES defines all roles', () => {
    expect(ROLES_CONST.ADMIN).toBe('admin');
    expect(ROLES_CONST.MEMBER).toBe('member');
  });
});

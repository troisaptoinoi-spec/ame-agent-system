import { describe, it, expect } from 'vitest';
import {
  validateEmail,
  validatePhone,
  validateRequired,
  validateMemberForm,
  validateTaskForm,
  validateEventForm,
  sanitizeInput,
} from '../utils/validation';

describe('validateEmail', () => {
  it('returns null for empty/undefined (optional field)', () => {
    expect(validateEmail('')).toBeNull();
    expect(validateEmail(undefined)).toBeNull();
    expect(validateEmail(null)).toBeNull();
  });

  it('returns null for valid email', () => {
    expect(validateEmail('test@example.com')).toBeNull();
    expect(validateEmail('user.name@domain.co')).toBeNull();
  });

  it('returns error for invalid email', () => {
    expect(validateEmail('invalid')).not.toBeNull();
    expect(validateEmail('test@')).not.toBeNull();
    expect(validateEmail('@domain.com')).not.toBeNull();
    expect(validateEmail('test @domain.com')).not.toBeNull();
  });
});

describe('validatePhone', () => {
  it('returns null for empty/undefined (optional field)', () => {
    expect(validatePhone('')).toBeNull();
    expect(validatePhone(undefined)).toBeNull();
  });

  it('returns null for valid Vietnamese phone', () => {
    expect(validatePhone('0912345678')).toBeNull();
    expect(validatePhone('09123456789')).toBeNull();
    expect(validatePhone('+84912345678')).toBeNull();
  });

  it('returns error for invalid phone', () => {
    expect(validatePhone('123')).not.toBeNull();
    expect(validatePhone('abc')).not.toBeNull();
    expect(validatePhone('012345')).not.toBeNull();
  });
});

describe('validateRequired', () => {
  it('returns error for empty value', () => {
    expect(validateRequired('', 'Tên')).not.toBeNull();
    expect(validateRequired(null, 'Tên')).not.toBeNull();
    expect(validateRequired(undefined, 'Tên')).not.toBeNull();
    expect(validateRequired('   ', 'Tên')).not.toBeNull();
  });

  it('returns null for valid value', () => {
    expect(validateRequired('Hello', 'Tên')).toBeNull();
  });

  it('enforces minLength', () => {
    expect(validateRequired('ab', 'Tên', { minLength: 3 })).not.toBeNull();
    expect(validateRequired('abc', 'Tên', { minLength: 3 })).toBeNull();
  });

  it('enforces maxLength', () => {
    expect(validateRequired('abcd', 'Tên', { maxLength: 3 })).not.toBeNull();
    expect(validateRequired('abc', 'Tên', { maxLength: 3 })).toBeNull();
  });
});

describe('validateMemberForm', () => {
  const validMember = {
    name: 'Nguyễn Văn A',
    email: 'a@example.com',
    phone: '0912345678',
    studentId: 'SV2021001',
    departmentId: 'dept-1',
    role: 'member',
    bio: 'Thành viên mới',
  };

  it('returns isValid=true for valid member', () => {
    const result = validateMemberForm(validMember);
    expect(result.isValid).toBe(true);
    expect(Object.keys(result.errors)).toHaveLength(0);
  });

  it('returns error when name is missing', () => {
    const result = validateMemberForm({ ...validMember, name: '' });
    expect(result.isValid).toBe(false);
    expect(result.errors.name).toBeDefined();
  });

  it('returns error when name is too short', () => {
    const result = validateMemberForm({ ...validMember, name: 'A' });
    expect(result.isValid).toBe(false);
    expect(result.errors.name).toBeDefined();
  });

  it('returns error for invalid email', () => {
    const result = validateMemberForm({ ...validMember, email: 'bad-email' });
    expect(result.isValid).toBe(false);
    expect(result.errors.email).toBeDefined();
  });

  it('returns error for invalid phone', () => {
    const result = validateMemberForm({ ...validMember, phone: '123' });
    expect(result.isValid).toBe(false);
    expect(result.errors.phone).toBeDefined();
  });

  it('allows empty optional fields', () => {
    const result = validateMemberForm({ name: 'Nguyễn Văn A' });
    expect(result.isValid).toBe(true);
  });

  it('returns error for bio exceeding max length', () => {
    const longBio = 'a'.repeat(501);
    const result = validateMemberForm({ ...validMember, bio: longBio });
    expect(result.isValid).toBe(false);
    expect(result.errors.bio).toBeDefined();
  });
});

describe('validateTaskForm', () => {
  const validTask = {
    title: 'Hoàn thành báo cáo',
    description: 'Mô tả chi tiết',
    departmentId: 'dept-1',
    assigneeId: 'user-1',
    deadline: '2025-12-31',
    priority: 'high',
  };

  it('returns isValid=true for valid task', () => {
    const result = validateTaskForm(validTask);
    expect(result.isValid).toBe(true);
  });

  it('returns error when title is missing', () => {
    const result = validateTaskForm({ ...validTask, title: '' });
    expect(result.isValid).toBe(false);
    expect(result.errors.title).toBeDefined();
  });

  it('returns error when title is too short', () => {
    const result = validateTaskForm({ ...validTask, title: 'AB' });
    expect(result.isValid).toBe(false);
    expect(result.errors.title).toBeDefined();
  });

  it('returns error when departmentId is missing', () => {
    const result = validateTaskForm({ ...validTask, departmentId: '' });
    expect(result.isValid).toBe(false);
    expect(result.errors.departmentId).toBeDefined();
  });

  it('returns error for invalid deadline', () => {
    const result = validateTaskForm({ ...validTask, deadline: 'invalid-date' });
    expect(result.isValid).toBe(false);
    expect(result.errors.deadline).toBeDefined();
  });

  it('allows empty deadline', () => {
    const result = validateTaskForm({ ...validTask, deadline: '' });
    expect(result.isValid).toBe(true);
  });
});

describe('validateEventForm', () => {
  it('returns isValid=true for valid event', () => {
    const result = validateEventForm({
      title: 'Workshop React',
      date: '2025-06-15',
      type: 'workshop',
    });
    expect(result.isValid).toBe(true);
  });

  it('returns error when title is missing', () => {
    const result = validateEventForm({ title: '', date: '2025-06-15' });
    expect(result.isValid).toBe(false);
    expect(result.errors.title).toBeDefined();
  });

  it('returns error for invalid date', () => {
    const result = validateEventForm({ title: 'Event', date: 'not-a-date' });
    expect(result.isValid).toBe(false);
    expect(result.errors.date).toBeDefined();
  });
});

describe('sanitizeInput', () => {
  it('escapes HTML special characters', () => {
    expect(sanitizeInput('<script>alert("xss")</script>')).toBe(
      '<script>alert("xss")</script>'
    );
  });

  it('escapes ampersand', () => {
    expect(sanitizeInput('A & B')).toBe('A & B');
  });

  it('escapes quotes', () => {
    expect(sanitizeInput(`it's a "test"`)).toBe(`it&#x27;s a "test"`);
  });

  it('returns non-string values as-is', () => {
    expect(sanitizeInput(123)).toBe(123);
    expect(sanitizeInput(null)).toBe(null);
    expect(sanitizeInput(undefined)).toBe(undefined);
  });

  it('returns clean strings unchanged', () => {
    expect(sanitizeInput('Hello World')).toBe('Hello World');
  });
});

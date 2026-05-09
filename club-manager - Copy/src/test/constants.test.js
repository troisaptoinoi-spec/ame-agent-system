import { describe, it, expect } from 'vitest';
import {
  STORAGE_KEYS,
  TASK_STATUS,
  TASK_STATUSES,
  PRIORITY,
  PRIORITY_COLORS,
  PRIORITY_LABELS,
  ROLES,
  ROLE_LABELS,
  BADGE_THRESHOLDS,
  VALIDATION,
  MAX_ACTIVITIES,
} from '../constants';

describe('STORAGE_KEYS', () => {
  it('all keys start with innohub_ prefix', () => {
    Object.values(STORAGE_KEYS).forEach(key => {
      expect(key).toMatch(/^innohub_/);
    });
  });

  it('has all required keys', () => {
    expect(STORAGE_KEYS.CURRENT_USER).toBeDefined();
    expect(STORAGE_KEYS.TASKS).toBeDefined();
    expect(STORAGE_KEYS.MEMBERS).toBeDefined();
    expect(STORAGE_KEYS.DEPARTMENTS).toBeDefined();
    expect(STORAGE_KEYS.EVENTS).toBeDefined();
    expect(STORAGE_KEYS.ACTIVITIES).toBeDefined();
    expect(STORAGE_KEYS.THEME).toBeDefined();
    expect(STORAGE_KEYS.LANGUAGE).toBeDefined();
  });

  it('has no duplicate values', () => {
    const values = Object.values(STORAGE_KEYS);
    const unique = new Set(values);
    expect(unique.size).toBe(values.length);
  });
});

describe('TASK_STATUS', () => {
  it('defines all statuses', () => {
    expect(TASK_STATUS.TODO).toBe('todo');
    expect(TASK_STATUS.IN_PROGRESS).toBe('inprogress');
    expect(TASK_STATUS.DONE).toBe('done');
    expect(TASK_STATUS.ARCHIVED_COMPLETED).toBe('archived_completed');
    expect(TASK_STATUS.ARCHIVED_INCOMPLETE).toBe('archived_incomplete');
  });
});

describe('TASK_STATUSES', () => {
  it('has 3 board columns', () => {
    expect(TASK_STATUSES).toHaveLength(3);
  });

  it('each status has id, color, and emoji', () => {
    TASK_STATUSES.forEach(s => {
      expect(s.id).toBeDefined();
      expect(s.color).toBeDefined();
      expect(s.emoji).toBeDefined();
    });
  });
});

describe('PRIORITY', () => {
  it('defines all priority levels', () => {
    expect(PRIORITY.LOW).toBe('low');
    expect(PRIORITY.MEDIUM).toBe('medium');
    expect(PRIORITY.HIGH).toBe('high');
    expect(PRIORITY.URGENT).toBe('urgent');
  });

  it('has color for each priority', () => {
    Object.values(PRIORITY).forEach(p => {
      expect(PRIORITY_COLORS[p]).toBeDefined();
      expect(PRIORITY_LABELS[p]).toBeDefined();
    });
  });
});

describe('ROLES', () => {
  it('defines all 4 roles', () => {
    expect(Object.keys(ROLES)).toHaveLength(4);
    Object.values(ROLES).forEach(role => {
      expect(ROLE_LABELS[role]).toBeDefined();
    });
  });
});

describe('BADGE_THRESHOLDS', () => {
  it('is sorted by min descending', () => {
    for (let i = 1; i < BADGE_THRESHOLDS.length; i++) {
      expect(BADGE_THRESHOLDS[i].min).toBeLessThan(BADGE_THRESHOLDS[i - 1].min);
    }
  });

  it('last threshold starts at 0', () => {
    expect(BADGE_THRESHOLDS[BADGE_THRESHOLDS.length - 1].min).toBe(0);
  });

  it('each threshold has icon, label, and color', () => {
    BADGE_THRESHOLDS.forEach(b => {
      expect(b.icon).toBeDefined();
      expect(b.label).toBeDefined();
      expect(b.color).toBeDefined();
    });
  });
});

describe('VALIDATION', () => {
  it('has reasonable member name constraints', () => {
    expect(VALIDATION.MEMBER_NAME.minLength).toBeGreaterThanOrEqual(2);
    expect(VALIDATION.MEMBER_NAME.maxLength).toBeLessThanOrEqual(200);
  });

  it('has email regex that matches valid emails', () => {
    expect(VALIDATION.EMAIL_REGEX.test('test@example.com')).toBe(true);
    expect(VALIDATION.EMAIL_REGEX.test('invalid')).toBe(false);
  });

  it('has phone regex for Vietnamese numbers', () => {
    expect(VALIDATION.PHONE_REGEX.test('0912345678')).toBe(true);
    expect(VALIDATION.PHONE_REGEX.test('+84912345678')).toBe(true);
    expect(VALIDATION.PHONE_REGEX.test('123')).toBe(false);
  });
});

describe('Limits', () => {
  it('MAX_ACTIVITIES is a positive number', () => {
    expect(MAX_ACTIVITIES).toBeGreaterThan(0);
  });

});

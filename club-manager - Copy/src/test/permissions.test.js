import { describe, it, expect } from 'vitest';
import { can, ROLES, PERMISSIONS } from '../utils/permissions';

describe('permissions', () => {
  describe('ROLES', () => {
    it('defines all 4 roles', () => {
      expect(ROLES.SUPER_ADMIN).toBe('super_admin');
      expect(ROLES.ADMIN).toBe('admin');
      expect(ROLES.MANAGER).toBe('manager');
      expect(ROLES.MEMBER).toBe('member');
    });
  });

  describe('can()', () => {
    it('returns false for null/undefined user', () => {
      expect(can(null, 'VIEW_CLUB_DASHBOARD')).toBe(false);
      expect(can(undefined, 'VIEW_CLUB_DASHBOARD')).toBe(false);
    });

    it('returns false for unknown permission', () => {
      const user = { role: 'admin' };
      expect(can(user, 'UNKNOWN_PERMISSION')).toBe(false);
    });

    // Super Admin permissions
    it('super_admin can do everything', () => {
      const superAdmin = { role: 'super_admin' };
      Object.keys(PERMISSIONS).forEach(perm => {
        expect(can(superAdmin, perm)).toBe(true);
      });
    });

    // Admin permissions
    it('admin can do everything', () => {
      const admin = { role: 'admin' };
      Object.keys(PERMISSIONS).forEach(perm => {
        expect(can(admin, perm)).toBe(true);
      });
    });

    // Manager permissions
    it('manager can view club dashboard and manage tasks', () => {
      const manager = { role: 'manager' };
      expect(can(manager, 'VIEW_DEPT_DASHBOARD')).toBe(true);
      expect(can(manager, 'CREATE_TASK')).toBe(true);
      expect(can(manager, 'EDIT_DEPT_TASK')).toBe(true);
      expect(can(manager, 'APPROVE_TASK')).toBe(true);
      expect(can(manager, 'VIEW_ALL_TASKS')).toBe(true);
      expect(can(manager, 'DELETE_TASK')).toBe(true);
    });

    it('manager cannot view settings or manage departments', () => {
      const manager = { role: 'manager' };
      expect(can(manager, 'VIEW_SETTINGS')).toBe(false);
      expect(can(manager, 'MANAGE_DEPARTMENTS')).toBe(false);
    });

    // Member permissions
    it('member can only view personal dashboard', () => {
      const member = { role: 'member' };
      expect(can(member, 'VIEW_PERSONAL_DASHBOARD')).toBe(true);
      expect(can(member, 'VIEW_ALL_TASKS')).toBe(true);
    });

    it('member cannot create, edit, or delete tasks', () => {
      const member = { role: 'member' };
      expect(can(member, 'CREATE_TASK')).toBe(false);
      expect(can(member, 'EDIT_ANY_TASK')).toBe(false);
      expect(can(member, 'EDIT_DEPT_TASK')).toBe(false);
      expect(can(member, 'DELETE_TASK')).toBe(false);
      expect(can(member, 'APPROVE_TASK')).toBe(false);
    });

    it('member cannot manage members', () => {
      const member = { role: 'member' };
      expect(can(member, 'ADD_MEMBER')).toBe(false);
      expect(can(member, 'EDIT_MEMBER')).toBe(false);
      expect(can(member, 'DELETE_MEMBER')).toBe(false);
    });
  });
});

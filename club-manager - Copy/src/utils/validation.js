import { VALIDATION } from '../constants';

/**
 * Validate email format
 * @param {string} email
 * @returns {string|null} Error message or null if valid
 */
export const validateEmail = (email) => {
  if (!email) return null; // optional field
  if (!VALIDATION.EMAIL_REGEX.test(email)) return 'Email không hợp lệ';
  return null;
};

/**
 * Validate phone number format
 * @param {string} phone
 * @returns {string|null} Error message or null if valid
 */
export const validatePhone = (phone) => {
  if (!phone) return null; // optional field
  if (!VALIDATION.PHONE_REGEX.test(phone)) return 'Số điện thoại không hợp lệ (VD: 0912345678)';
  return null;
};

/**
 * Validate required string field
 * @param {string} value
 * @param {string} fieldName
 * @param {object} rules - { minLength, maxLength }
 * @returns {string|null} Error message or null if valid
 */
export const validateRequired = (value, fieldName, rules = {}) => {
  if (!value || !value.toString().trim()) return `${fieldName} là bắt buộc`;
  const trimmed = value.toString().trim();
  if (rules.minLength && trimmed.length < rules.minLength) {
    return `${fieldName} phải có ít nhất ${rules.minLength} ký tự`;
  }
  if (rules.maxLength && trimmed.length > rules.maxLength) {
    return `${fieldName} không được vượt quá ${rules.maxLength} ký tự`;
  }
  return null;
};

/**
 * Validate member form data
 * @param {object} data - { name, email, phone, studentId, departmentId, role }
 * @returns {object} { isValid: boolean, errors: { field: message } }
 */
export const validateMemberForm = (data) => {
  const errors = {};

  const nameError = validateRequired(data.name, 'Họ và tên', VALIDATION.MEMBER_NAME);
  if (nameError) errors.name = nameError;

  const emailError = validateEmail(data.email);
  if (emailError) errors.email = emailError;

  const phoneError = validatePhone(data.phone);
  if (phoneError) errors.phone = phoneError;

  if (data.bio && data.bio.length > VALIDATION.BIO_MAX_LENGTH) {
    errors.bio = `Giới thiệu không được vượt quá ${VALIDATION.BIO_MAX_LENGTH} ký tự`;
  }

  return { isValid: Object.keys(errors).length === 0, errors };
};

/**
 * Validate task form data
 * @param {object} data - { title, description, departmentId, assigneeId, deadline, priority }
 * @returns {object} { isValid: boolean, errors: { field: message } }
 */
export const validateTaskForm = (data) => {
  const errors = {};

  const titleError = validateRequired(data.title, 'Tiêu đề nhiệm vụ', VALIDATION.TASK_TITLE);
  if (titleError) errors.title = titleError;

  if (data.description && data.description.length > VALIDATION.TASK_DESCRIPTION.maxLength) {
    errors.description = `Mô tả không được vượt quá ${VALIDATION.TASK_DESCRIPTION.maxLength} ký tự`;
  }

  if (!data.departmentId) {
    errors.departmentId = 'Vui lòng chọn ban';
  }

  if (data.deadline) {
    const deadlineDate = new Date(data.deadline);
    if (isNaN(deadlineDate.getTime())) {
      errors.deadline = 'Hạn chót không hợp lệ';
    }
  }

  return { isValid: Object.keys(errors).length === 0, errors };
};

/**
 * Validate event form data
 * @param {object} data - { title, date, type }
 * @returns {object} { isValid: boolean, errors: { field: message } }
 */
export const validateEventForm = (data) => {
  const errors = {};

  const titleError = validateRequired(data.title, 'Tên sự kiện', { minLength: 2, maxLength: 200 });
  if (titleError) errors.title = titleError;

  if (data.date) {
    const eventDate = new Date(data.date);
    if (isNaN(eventDate.getTime())) {
      errors.date = 'Ngày không hợp lệ';
    }
  }

  return { isValid: Object.keys(errors).length === 0, errors };
};

/**
 * Sanitize string input to prevent XSS
 * @param {string} input
 * @returns {string} Sanitized string
 */
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  const map = { '&': '&', '<': '<', '>': '>', '"': '"', "'": '&#x27;' };
  return input.replace(/[&<>"']/g, (char) => map[char]);
};

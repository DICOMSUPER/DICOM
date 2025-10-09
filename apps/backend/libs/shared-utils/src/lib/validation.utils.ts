export class ValidationUtils {
  /**
   * Validates if a string is a valid UUID format
   * @param uuid - The string to validate
   * @returns true if valid UUID, false otherwise
   */
  static isValidUUID(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }

  /**
   * Validates if a string is not empty or only whitespace
   * @param value - The string to validate
   * @returns true if valid (not empty), false otherwise
   */
  static isNotEmpty(value: string): boolean {
    return Boolean(value && value.trim().length > 0);
  }

  /**
   * Validates if a number is within a specified range
   * @param value - The number to validate
   * @param min - Minimum value (inclusive)
   * @param max - Maximum value (inclusive)
   * @returns true if within range, false otherwise
   */
  static isInRange(value: number, min: number, max: number): boolean {
    return value >= min && value <= max;
  }

  /**
   * Validates if a string is a valid email format
   * @param email - The email string to validate
   * @returns true if valid email, false otherwise
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validates if a string is a valid phone number format
   * @param phone - The phone string to validate
   * @returns true if valid phone, false otherwise
   */
  static isValidPhone(phone: string): boolean {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
  }

  /**
   * Validates pagination parameters and returns sanitized values
   * @param page - Page number as string or number
   * @param limit - Limit as string or number
   * @returns Object with validated page and limit numbers
   */
  static validatePaginationParams(page?: string | number, limit?: string | number): { page?: number; limit?: number } {
    const result: { page?: number; limit?: number } = {};
    
    if (page !== undefined) {
      const pageNum = typeof page === 'string' ? parseInt(page, 10) : page;
      if (isNaN(pageNum) || pageNum < 1) {
        throw new Error('Page must be a positive integer');
      }
      result.page = pageNum;
    }
    
    if (limit !== undefined) {
      const limitNum = typeof limit === 'string' ? parseInt(limit, 10) : limit;
      if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
        throw new Error('Limit must be between 1 and 100');
      }
      result.limit = limitNum;
    }
    
    return result;
  }
}

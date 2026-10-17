import type {
  StringValidationRules,
  IntegerValidationRules,
  CustomIntegerValidationRules,
  BooleanValidationRules,
} from "@/types/input-validation";

/**
 * Validates a string value against defined string validation rules.
 * Returns an error message string if invalid, or null if valid.
 */
export function validateString(
  value: string,
  rules?: StringValidationRules
): string | null {
  const trimmed = value.trim();

  if (rules?.required && trimmed.length === 0) {
    return "This field is required.";
  }

  // If empty and not required, pass validation
  if (value.length === 0) {
    return null;
  }

  if (rules?.exactLength !== undefined && value.length !== rules.exactLength) {
    return `Must be exactly ${rules.exactLength} characters.`;
  }

  if (rules?.minLength !== undefined && value.length < rules.minLength) {
    return `Must be at least ${rules.minLength} characters.`;
  }

  if (rules?.maxLength !== undefined && value.length > rules.maxLength) {
    return `Must not exceed ${rules.maxLength} characters.`;
  }

  if (rules?.pattern && !rules.pattern.test(value)) {
    return rules.patternMessage ?? "Invalid format.";
  }

  if (rules?.custom) {
    const customError = rules.custom(value);
    if (customError) {
      return customError;
    }
  }

  return null;
}

/**
 * Validates an integer value against defined integer rules.
 * Supports checking positive/negative constraints, min, and max limits.
 */
export function validateInteger(
  value: string | number | undefined | null,
  rules?: IntegerValidationRules
): string | null {
  const strVal = value === undefined || value === null ? "" : String(value).trim();

  if (rules?.required && strVal.length === 0) {
    return "This field is required.";
  }

  if (strVal.length === 0) {
    return null;
  }

  const allowNegative = rules?.allowNegative ?? false;
  const regex = allowNegative ? /^-?\d+$/ : /^\d+$/;
  if (!regex.test(strVal)) {
    return allowNegative
      ? "Must be a valid integer."
      : "Must be a positive whole number.";
  }

  const num = Number(strVal);
  if (!Number.isSafeInteger(num)) {
    return "Number exceeds safe integer limits.";
  }

  const effectiveMin = rules?.min !== undefined ? rules.min : (allowNegative ? undefined : 0);
  if (effectiveMin !== undefined && num < effectiveMin) {
    return `Value must be at least ${effectiveMin}.`;
  }

  if (rules?.max !== undefined && num > rules.max) {
    return `Value must not exceed ${rules.max}.`;
  }

  if (rules?.custom) {
    const customError = rules.custom(num);
    if (customError) {
      return customError;
    }
  }

  return null;
}

/**
 * Validates a custom integer where the minimum is 0,
 * and the maximum is customizable from 1 upwards (e.g. 10, 99, 255, 65535, etc.).
 */
export function validateCustomInteger(
  value: string | number | undefined | null,
  rules?: CustomIntegerValidationRules
): string | null {
  const strVal = value === undefined || value === null ? "" : String(value).trim();

  if (rules?.required && strVal.length === 0) {
    return "This field is required.";
  }

  if (strVal.length === 0) {
    return null;
  }

  // Minimum is 0, so negative signs and non-digits are disallowed
  if (!/^\d+$/.test(strVal)) {
    return "Must be a whole number (0 or greater).";
  }

  const num = Number(strVal);
  if (!Number.isSafeInteger(num)) {
    return "Number exceeds safe integer limits.";
  }

  if (num < 0) {
    return "Value must be at least 0.";
  }

  const max = rules?.max;
  if (max !== undefined && max >= 1) {
    if (num > max) {
      return `Value must be between 0 and ${max}.`;
    }
  }

  if (rules?.custom) {
    const customError = rules.custom(num);
    if (customError) {
      return customError;
    }
  }

  return null;
}

/**
 * Validates a boolean value.
 */
export function validateBoolean(
  value: boolean | undefined | null,
  rules?: BooleanValidationRules
): string | null {
  if (rules?.required && (value === undefined || value === null)) {
    return "Selection is required.";
  }

  if (value !== undefined && value !== null && rules?.custom) {
    const customError = rules.custom(value);
    if (customError) {
      return customError;
    }
  }

  return null;
}

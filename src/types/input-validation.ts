import type { ChangeEvent, FocusEvent } from "react";

/**
 * Supported data types for validated input fields
 */
export type ValidatedInputType =
  | "string"
  | "boolean"
  | "integer"
  | "custom-integer";

/**
 * Validation rules for string inputs
 */
export interface StringValidationRules {
  /** Field cannot be empty */
  required?: boolean;
  /** Minimum character length */
  minLength?: number;
  /** Maximum character length */
  maxLength?: number;
  /** Regular expression pattern */
  pattern?: RegExp;
  /** Error message displayed when pattern does not match */
  patternMessage?: string;
  /** Custom validation function returning an error string or null if valid */
  custom?: (value: string) => string | null | undefined;
}

/**
 * Validation rules for general integer inputs
 */
export interface IntegerValidationRules {
  /** Field cannot be empty */
  required?: boolean;
  /** Minimum numeric value (defaults to 0 when allowNegative is false) */
  min?: number;
  /** Maximum numeric value (customizable from 1 and up) */
  max?: number;
  /** Allow negative integers (defaults to false) */
  allowNegative?: boolean;
  /** Custom validation function returning an error string or null if valid */
  custom?: (value: number) => string | null | undefined;
}

/**
 * Validation rules for custom integer inputs with minimum 0 and customizable max >= 1
 */
export interface CustomIntegerValidationRules {
  /** Field cannot be empty */
  required?: boolean;
  /** Maximum allowable integer value (customizable from 1 so on) */
  max?: number;
  /** Custom validation function returning an error string or null if valid */
  custom?: (value: number) => string | null | undefined;
}

/**
 * Validation rules for boolean inputs
 */
export interface BooleanValidationRules {
  /** Selection is mandatory (cannot be unselected) */
  required?: boolean;
  /** Custom validation function returning an error string or null if valid */
  custom?: (value: boolean) => string | null | undefined;
}

/**
 * Shared props across all validated inputs
 */
export interface BaseValidatedFieldProps {
  /** Unique element ID */
  id?: string;
  /** Label text displayed above the input */
  label?: string;
  /** Optional hint text displayed below the input when valid */
  helperText?: string;
  /** External error override string (forces invalid state) */
  error?: string;
  /** Additional CSS class names applied to the input element */
  className?: string;
  /** Additional CSS class names applied to the outer wrapper container */
  containerClassName?: string;
  /** Disable interaction */
  disabled?: boolean;
  /** Read-only mode */
  readOnly?: boolean;
  /** Whether to automatically validate on interaction (default: true) */
  autoValidate?: boolean;
  /** Validation timing: trigger on every change or on blur (default: "onChange") */
  validateTrigger?: "onChange" | "onBlur";
}

/**
 * String type input props
 */
export interface StringInputProps extends BaseValidatedFieldProps {
  type: "string";
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  rules?: StringValidationRules;
  onValueChange?: (value: string) => void;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: FocusEvent<HTMLInputElement>) => void;
}

/**
 * Integer type input props
 */
export interface IntegerInputProps extends BaseValidatedFieldProps {
  type: "integer";
  value?: number | string;
  defaultValue?: number | string;
  placeholder?: string;
  /** Minimum numeric value */
  min?: number;
  /** Maximum numeric value */
  max?: number;
  rules?: IntegerValidationRules;
  onValueChange?: (value: number | null) => void;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: FocusEvent<HTMLInputElement>) => void;
}

/**
 * Custom integer type input props (minimum is 0, maximum is customizable from 1 so on)
 */
export interface CustomIntegerInputProps extends BaseValidatedFieldProps {
  type: "custom-integer";
  value?: number | string;
  defaultValue?: number | string;
  placeholder?: string;
  /** Maximum allowable integer value (customizable from 1 so on) */
  max?: number;
  rules?: CustomIntegerValidationRules;
  onValueChange?: (value: number | null) => void;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: FocusEvent<HTMLInputElement>) => void;
}

/**
 * Boolean type input props
 */
export interface BooleanInputProps extends BaseValidatedFieldProps {
  type: "boolean";
  value?: boolean | number;
  defaultValue?: boolean | number;
  /** Label style: 'boolean' shows "True" / "False", 'numeric' shows "1 (True)" / "0 (False)" */
  format?: "boolean" | "numeric";
  /** Custom label for true value (e.g., "Left Foot") */
  trueLabel?: string;
  /** Custom label for false value (e.g., "Right Foot") */
  falseLabel?: string;
  rules?: BooleanValidationRules;
  onValueChange?: (value: boolean) => void;
  placeholder?: string;
}

/**
 * Discriminated union of all supported validated input variations
 */
export type ValidatedInputProps =
  | StringInputProps
  | IntegerInputProps
  | CustomIntegerInputProps
  | BooleanInputProps;

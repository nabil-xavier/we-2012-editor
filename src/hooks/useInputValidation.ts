import { useState, useCallback, useMemo } from "react";
import type {
  ValidatedInputType,
  StringValidationRules,
  IntegerValidationRules,
  CustomIntegerValidationRules,
  BooleanValidationRules,
} from "@/types/input-validation";
import {
  validateString,
  validateInteger,
  validateCustomInteger,
  validateBoolean,
} from "@/utils/validators";

export interface UseInputValidationOptions {
  type: ValidatedInputType;
  value: unknown;
  rules?:
    | StringValidationRules
    | IntegerValidationRules
    | CustomIntegerValidationRules
    | BooleanValidationRules;
  externalError?: string;
  autoValidate?: boolean;
  validateTrigger?: "onChange" | "onBlur";
}

export interface UseInputValidationReturn {
  error: string | null;
  isInvalid: boolean;
  isTouched: boolean;
  setTouched: (touched: boolean) => void;
  resetTouched: () => void;
  customError: string | null;
  setCustomError: (error: string | null) => void;
}

export function useInputValidation({
  type,
  value,
  rules,
  externalError,
  autoValidate = true,
  validateTrigger = "onChange",
}: UseInputValidationOptions): UseInputValidationReturn {
  const [isTouched, setIsTouched] = useState<boolean>(false);
  const [customError, setCustomError] = useState<string | null>(null);

  // Pure validation calculation based on current value and rules
  const derivedError = useMemo((): string | null => {
    switch (type) {
      case "string":
        return validateString(
          typeof value === "string" ? value : String(value ?? ""),
          rules as StringValidationRules | undefined
        );
      case "integer":
        return validateInteger(
          value as string | number | undefined | null,
          rules as IntegerValidationRules | undefined
        );
      case "custom-integer":
        return validateCustomInteger(
          value as string | number | undefined | null,
          rules as CustomIntegerValidationRules | undefined
        );
      case "boolean":
        return validateBoolean(
          typeof value === "boolean" ? value : null,
          rules as BooleanValidationRules | undefined
        );
      default:
        return null;
    }
  }, [type, value, rules]);

  // Determine active error with precedence: external error > manual custom error > derived rule error
  const activeError = externalError !== undefined
    ? (externalError || null)
    : customError ?? derivedError;

  // Follow shadcn validation pattern: if autoValidate & onChange, show immediately if error exists
  const isInvalid = autoValidate
    ? (validateTrigger === "onChange" ? Boolean(activeError) : isTouched && Boolean(activeError))
    : isTouched && Boolean(activeError);

  const resetTouched = useCallback(() => {
    setIsTouched(false);
    setCustomError(null);
  }, []);

  return {
    error: activeError,
    isInvalid,
    isTouched,
    setTouched: setIsTouched,
    resetTouched,
    customError,
    setCustomError,
  };
}

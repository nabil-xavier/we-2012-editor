import {
  useId,
  useState,
  useMemo,
  type ChangeEvent,
  type FocusEvent,
} from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type {
  ValidatedInputProps,
  IntegerValidationRules,
  CustomIntegerValidationRules,
} from "@/types/input-validation";
import { useInputValidation } from "@/hooks/useInputValidation";

/**
 * ValidatedInput renders an accessible form control with strict type validation,
 * automatic aria-invalid attribute handling, and error message presentation.
 * Supports string, boolean, integer, and custom-integer (min: 0, customizable max) types.
 */
export function ValidatedInput(props: ValidatedInputProps) {
  const {
    id: externalId,
    type,
    label,
    helperText,
    error: externalError,
    className,
    containerClassName,
    disabled = false,
    readOnly = false,
    autoValidate = true,
    validateTrigger = "onChange",
  } = props;

  const generatedId = useId();
  const inputId = externalId ?? generatedId;
  const errorId = `${inputId}-error`;
  const helperId = `${inputId}-helper`;

  // ---------------------------------------------------------------------------
  // Controlled vs Uncontrolled state management
  // ---------------------------------------------------------------------------
  const isControlledText = "value" in props && props.value !== undefined;
  const [internalText, setInternalText] = useState<string>(() => {
    if ("defaultValue" in props && props.defaultValue !== undefined) {
      return String(props.defaultValue);
    }
    return "";
  });
  const currentTextValue = isControlledText ? String(props.value) : internalText;

  const isControlledBool = type === "boolean" && props.value !== undefined;
  const [internalBool, setInternalBool] = useState<string>(() => {
    if (type === "boolean" && props.defaultValue !== undefined) {
      const boolVal =
        typeof props.defaultValue === "number"
          ? props.defaultValue === 1
          : Boolean(props.defaultValue);
      return boolVal ? "true" : "false";
    }
    return "";
  });

  const currentBoolString = isControlledBool
    ? ((typeof props.value === "number"
        ? props.value === 1
        : Boolean(props.value))
        ? "true"
        : "false")
    : internalBool;

  // Active value passed to validation
  const valueForValidation =
    type === "boolean"
      ? (currentBoolString ? currentBoolString === "true" : null)
      : currentTextValue;

  // Compute resolved rules, supporting direct props (min/max) alongside rules object
  const activeRules = useMemo(() => {
    if (type === "custom-integer") {
      const directMax = "max" in props ? props.max : undefined;
      const baseRules = ("rules" in props ? props.rules : undefined) as
        | CustomIntegerValidationRules
        | undefined;
      return {
        ...baseRules,
        max: directMax ?? baseRules?.max,
      };
    }

    if (type === "integer") {
      const directMin = "min" in props ? props.min : undefined;
      const directMax = "max" in props ? props.max : undefined;
      const baseRules = ("rules" in props ? props.rules : undefined) as
        | IntegerValidationRules
        | undefined;
      return {
        ...baseRules,
        min: directMin ?? baseRules?.min,
        max: directMax ?? baseRules?.max,
      };
    }

    return "rules" in props ? props.rules : undefined;
  }, [type, props]);

  const {
    error: internalError,
    isInvalid,
    setTouched,
  } = useInputValidation({
    type,
    value: valueForValidation,
    rules: activeRules,
    externalError,
    autoValidate,
    validateTrigger,
  });

  // ---------------------------------------------------------------------------
  // Handlers for String, Integer, and Custom Integer inputs
  // ---------------------------------------------------------------------------
  const handleTextChange = (e: ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;

    if (!isControlledText) {
      setInternalText(rawValue);
    }

    if (type === "string") {
      props.onValueChange?.(rawValue);
      props.onChange?.(e);
    } else if (type === "integer" || type === "custom-integer") {
      const trimmed = rawValue.trim();
      if (trimmed === "") {
        props.onValueChange?.(null);
      } else {
        const num = Number(trimmed);
        props.onValueChange?.(Number.isNaN(num) ? null : num);
      }
      props.onChange?.(e);
    }
  };

  const handleTextBlur = (e: FocusEvent<HTMLInputElement>) => {
    setTouched(true);
    if (type !== "boolean") {
      props.onBlur?.(e);
    }
  };

  // ---------------------------------------------------------------------------
  // Handlers for Boolean select
  // ---------------------------------------------------------------------------
  const handleBooleanSelect = (val: string | null) => {
    if (!val) return;
    if (!isControlledBool) {
      setInternalBool(val);
    }
    setTouched(true);

    const booleanValue = val === "true";
    if (type === "boolean") {
      props.onValueChange?.(booleanValue);
    }
  };

  const format = type === "boolean" ? props.format ?? "boolean" : "boolean";
  const placeholder = "placeholder" in props ? props.placeholder : undefined;

  const trueLabelText =
    type === "boolean" && props.trueLabel
      ? props.trueLabel
      : format === "numeric"
      ? "1 (True)"
      : "True";

  const falseLabelText =
    type === "boolean" && props.falseLabel
      ? props.falseLabel
      : format === "numeric"
      ? "0 (False)"
      : "False";

  return (
    <div className={cn("flex flex-col gap-1.5 w-full", containerClassName)}>
      {label && (
        <label
          htmlFor={inputId}
          className="text-xs font-medium text-foreground select-none"
        >
          {label}
          {activeRules?.required && (
            <span className="text-destructive ml-0.5">*</span>
          )}
        </label>
      )}

      {type === "boolean" ? (
        <Select
          value={currentBoolString || undefined}
          onValueChange={handleBooleanSelect}
          disabled={disabled || readOnly}
        >
          <SelectTrigger
            id={inputId}
            aria-invalid={isInvalid ? true : undefined}
            aria-describedby={
              isInvalid && internalError
                ? errorId
                : helperText
                ? helperId
                : undefined
            }
            className={cn("w-full", className)}
          >
            <SelectValue placeholder={placeholder ?? "Select boolean value..."} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="false">{falseLabelText}</SelectItem>
            <SelectItem value="true">{trueLabelText}</SelectItem>
          </SelectContent>
        </Select>
      ) : (
        <Input
          id={inputId}
          type="text"
          inputMode={type === "string" ? "text" : "numeric"}
          value={currentTextValue}
          placeholder={placeholder}
          disabled={disabled}
          readOnly={readOnly}
          aria-invalid={isInvalid ? true : undefined}
          aria-describedby={
            isInvalid && internalError
              ? errorId
              : helperText
              ? helperId
              : undefined
          }
          className={className}
          onChange={handleTextChange}
          onBlur={handleTextBlur}
        />
      )}

      {/* Error / Helper text following shadcn base invalid specification */}
      {isInvalid && internalError ? (
        <p
          id={errorId}
          role="alert"
          className="text-xs font-medium text-destructive transition-colors"
        >
          {internalError}
        </p>
      ) : helperText ? (
        <p id={helperId} className="text-xs text-muted-foreground">
          {helperText}
        </p>
      ) : null}
    </div>
  );
}

export default ValidatedInput;

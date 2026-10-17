// src/types/select.ts

/**
 * Generic option shape shared by plain and searchable select controls.
 */
export interface SelectOption {
  /** Underlying value submitted to the data record (stringified) */
  value: string;
  /** Visible option text */
  label: string;
  /** Optional secondary text shown under the label and matched when searching */
  description?: string;
}

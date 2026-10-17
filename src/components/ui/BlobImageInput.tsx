import { useId, useRef, useState, type ChangeEvent, type DragEvent } from "react";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface BlobImageInputProps {
  id?: string;
  label?: string;
  helperText?: string;
  value?: string | null;
  defaultValue?: string | null;
  suggestedDimensions?: string; // e.g. "32 × 32"
  onValueChange?: (dataUrl: string | null) => void;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  className?: string;
  containerClassName?: string;
}

export function BlobImageInput({
  id: externalId,
  label,
  helperText,
  value: controlledValue,
  defaultValue,
  suggestedDimensions,
  onValueChange,
  disabled = false,
  readOnly = false,
  required = false,
  className,
  containerClassName,
}: BlobImageInputProps) {
  const generatedId = useId();
  const inputId = externalId ?? generatedId;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isControlled = controlledValue !== undefined;
  const [internalValue, setInternalValue] = useState<string | null>(defaultValue ?? null);
  const currentValue = isControlled ? controlledValue : internalValue;

  const [isDragging, setIsDragging] = useState(false);
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null);

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (!isControlled) {
        setInternalValue(dataUrl);
      }
      onValueChange?.(dataUrl);

      // Read image dimensions
      const img = new Image();
      img.onload = () => {
        setImageDimensions({ width: img.naturalWidth, height: img.naturalHeight });
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!disabled && !readOnly) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled || readOnly) return;
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleRemove = () => {
    if (disabled || readOnly) return;
    if (!isControlled) {
      setInternalValue(null);
    }
    setImageDimensions(null);
    onValueChange?.(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const triggerUpload = () => {
    if (!disabled && !readOnly) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className={cn("flex flex-col gap-1.5 w-full", containerClassName)}>
      <div className="flex items-center justify-between">
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-medium text-foreground select-none flex items-center gap-1"
          >
            <span>{label}</span>
            {required && <span className="text-destructive">*</span>}
          </label>
        )}
        {suggestedDimensions && (
          <span className="text-[10px] font-mono text-muted-foreground uppercase">
            {suggestedDimensions}
          </span>
        )}
      </div>

      <input
        ref={fileInputRef}
        id={inputId}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/bmp"
        className="hidden"
        disabled={disabled || readOnly}
        onChange={handleInputChange}
      />

      {currentValue ? (
        <div
          className={cn(
            "relative flex items-center justify-between p-2.5 rounded-none border border-input bg-card/60 transition-colors",
            className
          )}
        >
          <div className="flex items-center gap-3 min-w-0">
            {/* Checkerboard container for alpha channel display */}
            <div className="relative size-12 shrink-0 border border-border overflow-hidden bg-[repeating-conic-gradient(#80808020_0%_25%,transparent_0%_50%)] bg-[length:8px_8px] flex items-center justify-center">
              <img
                src={currentValue}
                alt="Blob preview"
                className="max-h-full max-w-full object-contain"
                onLoad={(e) => {
                  const target = e.currentTarget;
                  setImageDimensions({ width: target.naturalWidth, height: target.naturalHeight });
                }}
              />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-medium text-foreground truncate">
                Image Blob
              </span>
              <span className="text-[10px] text-muted-foreground font-mono">
                {imageDimensions
                  ? `${imageDimensions.width} × ${imageDimensions.height} px`
                  : suggestedDimensions || "Loaded"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {!readOnly && !disabled && (
              <>
                <Button
                  type="button"
                  variant="ghost"
                  size="xs"
                  onClick={triggerUpload}
                  className="h-6 text-[11px] px-2 text-muted-foreground hover:text-foreground"
                >
                  Change
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  onClick={handleRemove}
                  className="size-6 text-muted-foreground hover:text-destructive"
                  aria-label="Remove image"
                >
                  <X className="size-3.5" />
                </Button>
              </>
            )}
          </div>
        </div>
      ) : (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={triggerUpload}
          className={cn(
            "group flex flex-col items-center justify-center p-3 rounded-none border border-dashed border-input bg-card/20 transition-all cursor-pointer hover:bg-card/60 hover:border-muted-foreground/50",
            isDragging && "border-primary bg-primary/5",
            (disabled || readOnly) && "pointer-events-none opacity-50",
            className
          )}
        >
          <div className="flex items-center gap-2 text-muted-foreground group-hover:text-foreground transition-colors">
            {isDragging ? (
              <Upload className="size-4 animate-bounce text-primary" />
            ) : (
              <ImageIcon className="size-4" />
            )}
            <span className="text-xs font-medium">
              {isDragging ? "Drop image file here" : "Choose or drag image blob"}
            </span>
          </div>
          {suggestedDimensions && (
            <span className="text-[10px] text-muted-foreground/70 font-mono mt-0.5">
              Target: {suggestedDimensions}
            </span>
          )}
        </div>
      )}

      {helperText && (
        <p className="text-xs text-muted-foreground">{helperText}</p>
      )}
    </div>
  );
}

export default BlobImageInput;

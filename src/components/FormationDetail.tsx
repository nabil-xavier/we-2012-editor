// src/components/FormationDetail.tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ValidatedInput } from "@/components/ui/ValidatedInput";
import { BlobImageInput } from "@/components/ui/BlobImageInput";
import { cn } from "@/lib/utils";
import type { FormationDetail, FormationData, FormationPositionData } from "@/types/formation";
import { ChevronLeft } from "lucide-react";

export interface FormationDetailProps {
  /** Optional initial formation detail */
  formationDetail?: FormationDetail;
  /** Callback when data changes */
  onSave?: (detail: FormationDetail) => void;
  /** Called when the user clicks Back */
  onBack?: () => void;
  /** Optional header title */
  title?: string;
  /** Optional CSS class for root element */
  className?: string;
}

// Default empty objects for a new formation
const emptyFormation: FormationData = {
  identifier: 0,
  name: "",
  data: null,
};

const emptyPosition: FormationPositionData = {
  identifier: 0,
  formation: 0,
  position: 2,
  x: 0,
  y: 0,
  x_display: 0,
  y_display: 0,
};

export function FormationDetail({
  formationDetail,
  onSave,
  onBack,
  title,
  className,
}: FormationDetailProps) {
  const [detail, setDetail] = useState<FormationDetail>(() => {
    return {
      formation: { ...emptyFormation, ...(formationDetail?.formation ?? {}) },
      positions: (formationDetail?.positions ?? [emptyPosition]).map((p) => ({
        ...emptyPosition,
        ...p,
      })),
    };
  });

  const updateFormationField = <K extends keyof FormationData>(
    field: K,
    value: FormationData[K]
  ) => {
    setDetail((prev) => {
      const updated = { ...prev, formation: { ...prev.formation, [field]: value } };
      onSave?.(updated);
      return updated;
    });
  };

  const updatePositionField = <K extends keyof FormationPositionData>(
    index: number,
    field: K,
    value: FormationPositionData[K]
  ) => {
    setDetail((prev) => {
      const newPositions = prev.positions.map((pos, i) =>
        i === index ? { ...pos, [field]: value } : pos
      );
      const updated = { ...prev, positions: newPositions };
      onSave?.(updated);
      return updated;
    });
  };

  const displayTitle = title ?? (detail.formation.name || "Formation Detail");

  return (
    <div className={cn("flex flex-col gap-6 pb-12 w-full max-w-4xl", className)}>
      {/* Top Navigation Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-border sticky top-0 bg-background/95 backdrop-blur-sm z-20">
        <div className="flex items-center gap-2 min-w-0">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onBack}
            aria-label="Go back"
            className="text-muted-foreground hover:text-foreground shrink-0"
          >
            <ChevronLeft className="size-4" />
          </Button>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold text-foreground truncate">
                {displayTitle}
              </h3>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION: Formation */}
      <section className="border border-border bg-card/40 p-4 sm:p-5">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground mb-2">Formation</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <ValidatedInput
            type="integer"
            label="Identifier"
            value={detail.formation.identifier}
            placeholder="e.g. 1"
            min={0}
            rules={{ required: true }}
            onValueChange={(val) => updateFormationField("identifier", val ?? 0)}
          />
          <ValidatedInput
            type="string"
            label="Name"
            value={detail.formation.name}
            placeholder="Formation name"
            rules={{ required: true, minLength: 2, maxLength: 50 }}
            onValueChange={(val) => updateFormationField("name", val)}
          />
          <BlobImageInput
            label="Image"
            value={detail.formation.data ?? undefined}
            onValueChange={(data) => updateFormationField("data", data)}
            suggestedDimensions="32 × 32"
          />
        </div>
      </section>

      {/* SECTION: Formation Positions */}
      <section className="border border-border bg-card/40 p-4 sm:p-5">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground mb-2">
          Formation Positions
        </h4>
        {detail.positions.map((pos, idx) => (
          <div key={pos.identifier || idx} className="border border-dashed border-muted rounded p-3 mb-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <ValidatedInput
                type="integer"
                label="Identifier"
                value={pos.identifier}
                placeholder="e.g. 101"
                min={0}
                rules={{ required: true }}
                onValueChange={(val) => updatePositionField(idx, "identifier", val ?? 0)}
              />
              <ValidatedInput
                type="integer"
                label="Formation ID"
                value={pos.formation}
                placeholder="Formation ID"
                min={0}
                rules={{ required: true }}
                onValueChange={(val) => updatePositionField(idx, "formation", val ?? 0)}
              />
              <ValidatedInput
                type="integer"
                label="Position (2‑11)"
                value={pos.position}
                placeholder="2‑11"
                min={2}
                max={11}
                rules={{ required: true }}
                onValueChange={(val) => updatePositionField(idx, "position", val ?? 2)}
              />
              <ValidatedInput
                type="custom-integer"
                label="X (0‑255)"
                value={pos.x}
                placeholder="0‑255"
                max={255}
                rules={{ required: true }}
                onValueChange={(val) => updatePositionField(idx, "x", val ?? 0)}
              />
              <ValidatedInput
                type="custom-integer"
                label="Y (0‑255)"
                value={pos.y}
                placeholder="0‑255"
                max={255}
                rules={{ required: true }}
                onValueChange={(val) => updatePositionField(idx, "y", val ?? 0)}
              />
              <ValidatedInput
                type="custom-integer"
                label="X Display (0‑255)"
                value={pos.x_display}
                placeholder="0‑255"
                max={255}
                rules={{ required: true }}
                onValueChange={(val) => updatePositionField(idx, "x_display", val ?? 0)}
              />
              <ValidatedInput
                type="custom-integer"
                label="Y Display (0‑255)"
                value={pos.y_display}
                placeholder="0‑255"
                max={255}
                rules={{ required: true }}
                onValueChange={(val) => updatePositionField(idx, "y_display", val ?? 0)}
              />
            </div>
          </div>
        ))}
        {/* Future: Add button to insert new positions */}
      </section>
    </div>
  );
}

export default FormationDetail;

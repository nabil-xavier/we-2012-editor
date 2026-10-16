// src/components/BallDetail.tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ValidatedInput } from "@/components/ui/ValidatedInput";
import { BlobImageInput } from "@/components/ui/BlobImageInput";
import { cn } from "@/lib/utils";
import type { BallData } from "@/types/ball";
import { ChevronLeft } from "lucide-react";

export interface BallDetailProps {
  /** Optional initial ball data */
  ball?: BallData;
  /** Callback when data changes */
  onSave?: (ball: BallData) => void;
  /** Called when the user clicks Back */
  onBack?: () => void;
  /** Optional header title */
  title?: string;
  /** Optional CSS class for root element */
  className?: string;
}

const emptyBall: BallData = {
  identifier: 0,
  name: "",
  type: 0,
  icon: null,
  texture: null,
};

export function BallDetail({
  ball,
  onSave,
  onBack,
  title,
  className,
}: BallDetailProps) {
  const [data, setData] = useState<BallData>(() => ({
    ...emptyBall,
    ...(ball ?? {}),
  }));

  const updateField = <K extends keyof BallData>(field: K, value: BallData[K]) => {
    setData((prev) => {
      const updated = { ...prev, [field]: value };
      onSave?.(updated);
      return updated;
    });
  };

  const displayTitle = title ?? (data.name || "Ball Detail");

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

      {/* SECTION: Ball */}
      <section className="border border-border bg-card/40 p-4 sm:p-5">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground mb-4">
          Ball
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <ValidatedInput
            type="integer"
            label="Identifier"
            value={data.identifier}
            placeholder="e.g. 1"
            min={0}
            rules={{ required: true }}
            onValueChange={(val) => updateField("identifier", val ?? 0)}
          />
          <ValidatedInput
            type="string"
            label="Name"
            value={data.name}
            placeholder="e.g. Classic Ball"
            rules={{ required: true }}
            onValueChange={(val) => updateField("name", val ?? "")}
          />
          <ValidatedInput
            type="integer"
            label="Type"
            value={data.type}
            placeholder="e.g. 0"
            min={0}
            rules={{ required: true }}
            onValueChange={(val) => updateField("type", val ?? 0)}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          <BlobImageInput
            label="Icon"
            value={data.icon}
            onChange={(val) => updateField("icon", val)}
          />
          <BlobImageInput
            label="Texture"
            value={data.texture}
            onChange={(val) => updateField("texture", val)}
          />
        </div>
      </section>
    </div>
  );
}

export default BallDetail;

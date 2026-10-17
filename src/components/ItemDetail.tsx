import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Save } from "lucide-react";
import { ValidatedInput } from "@/components/ui/ValidatedInput";

export interface ItemDetailProps {
  /** Called when the user clicks the back button */
  onBack: () => void;
  /** The title to show in the detail header */
  title?: string;
  /** Optional selected row data */
  item?: Record<string, unknown>;
}

export function ItemDetail({
  onBack,
  title = "Item Details",
  item,
}: ItemDetailProps) {
  const [name, setName] = useState<string>(String(item?.["name"] ?? ""));
  const [idNum, setIdNum] = useState<number | null>(
    typeof item?.["id"] === "number" ? (item["id"] as number) : 1
  );
  const [statRating, setStatRating] = useState<number | null>(85);
  const [isActive, setIsActive] = useState<boolean>(
    item?.["status"] === "Active"
  );
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  const handleSave = () => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  return (
    <div className="flex flex-col gap-0 max-w-2xl">
      {/* Detail Page Header with back navigation */}
      <div className="flex items-center justify-between py-3 border-b border-border mb-6">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onBack}
            aria-label="Go back"
            className="text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="size-4" />
          </Button>
          <span className="text-sm font-semibold text-foreground">{title}</span>
        </div>

        <Button size="sm" onClick={handleSave} className="gap-1.5">
          <Save className="size-3.5" />
          Save Changes
        </Button>
      </div>

      {saveSuccess && (
        <div className="mb-4 p-2.5 text-xs rounded-none bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400">
          Changes saved successfully.
        </div>
      )}

      {/* Form with validated inputs */}
      <div className="flex flex-col gap-5 p-5 border border-border bg-card/40">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Record Attributes (Validated Inputs)
        </h3>

        {/* 1. String Type Input */}
        <ValidatedInput
          type="string"
          label="Item Name (String Type)"
          value={name}
          placeholder="Enter item name..."
          helperText="String type with min 3, max 30 characters."
          rules={{
            required: true,
            minLength: 3,
            maxLength: 30,
          }}
          onValueChange={setName}
        />

        {/* 2. Integer Type Input */}
        <ValidatedInput
          type="integer"
          label="Item ID (Integer Type)"
          value={idNum ?? ""}
          placeholder="e.g. 10"
          min={1}
          max={99999}
          helperText="General integer type (min: 1, max: 99999)."
          rules={{
            required: true,
          }}
          onValueChange={setIdNum}
        />

        {/* 3. Custom Integer Type Input (Minimum is 0, maximum is customizable from 1 so on) */}
        <ValidatedInput
          type="custom-integer"
          label="Player Ability Stat (Custom Integer Type, 0 - 99)"
          value={statRating ?? ""}
          placeholder="0 - 99"
          max={99}
          helperText="Custom integer: minimum is fixed to 0, maximum is customizable (e.g., 99, 255, etc.)."
          rules={{
            required: true,
          }}
          onValueChange={setStatRating}
        />

        {/* 4. Boolean Type Input */}
        <ValidatedInput
          type="boolean"
          label="Active Status (Boolean Type)"
          value={isActive}
          format="boolean"
          placeholder="Select status..."
          helperText="Boolean state represented via Dropdown / Select control."
          rules={{
            required: true,
          }}
          onValueChange={setIsActive}
        />
      </div>
    </div>
  );
}

export default ItemDetail;

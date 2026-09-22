import { Button } from "./ui/button";
import { ChevronLeft } from "lucide-react";

export interface ItemDetailProps {
  /** Called when the user clicks the back button */
  onBack: () => void;
  /** The title to show in the detail header */
  title?: string;
}

export function ItemDetail({ onBack, title = "Item Details" }: ItemDetailProps) {
  return (
    <div className="flex flex-col gap-0">
      {/* Detail Page Header with back navigation */}
      <div className="flex items-center gap-2 py-3 border-b border-border mb-4">
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

      {/* Blank content area — placeholder for future detail content */}
      <div className="min-h-[360px] rounded-xl border border-dashed border-border bg-card/30" />
    </div>
  );
}

export default ItemDetail;

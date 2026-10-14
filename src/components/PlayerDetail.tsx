import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ValidatedInput } from "@/components/ui/ValidatedInput";
import { cn } from "@/lib/utils";
import type { PlayerData } from "@/types/player";
import {
  ChevronLeft,
  User,
  Sparkles,
  Compass,
  MapPin,
  Swords,
  Shield,
  Zap,
  Activity,
  Send,
  Crosshair,
  ChevronsUp,
  Hand,
  RotateCcw,
  Brain,
} from "lucide-react";

export interface PlayerDetailProps {
  /** Optional initial player data to edit */
  player?: PlayerData;
  /** Navigation callback to return to previous list or page */
  onBack: () => void;
  /** Save callback called with updated player data */
  onSave?: (player: PlayerData) => void;
  /** Optional header title */
  title?: string;
  /** Optional CSS class name */
  className?: string;
}

const DEFAULT_PLAYER_DATA: PlayerData = {
  identifier: 1001,
  name: "Lionel Messi",
  name_shorter: "L. MESSI",
  age: 24,
  height: 169,
  price: 50000000,
  hair_color: 1,
  hair_model: 12,
  skin: 1,
  shoe: 5,
  foot: 1, // 1 = Left Foot
  side: 2, // Both
  position: 10,
  position_flag: 1,
  attack: 97,
  defense: 45,
  teamwork: 88,
  aggression: 92,
  speed: 90,
  acceleration: 96,
  agility: 95,
  balance: 86,
  stamina: 84,
  response: 95,
  jump: 76,
  technique: 96,
  dribble_accuracy: 97,
  dribble_speed: 92,
  swerve: 89,
  pass_short_accuracy: 90,
  pass_short_speed: 85,
  pass_long_accuracy: 86,
  pass_long_speed: 82,
  shot_accuracy: 94,
  shot_power: 84,
  shot_technique: 95,
  freekick_accuracy: 91,
  header: 72,
  keeper: 50,
  foot_weak_accuracy: 6,
  foot_weak_frequency: 5,
  form: 7,
  tenacity: 85,
};

export function PlayerDetail({
  player,
  onBack,
  onSave,
  title,
  className,
}: PlayerDetailProps) {
  const [formData, setFormData] = useState<PlayerData>(() => ({
    ...DEFAULT_PLAYER_DATA,
    ...(player ?? {}),
  }));

  const [activeCategory, setActiveCategory] = useState<
    "all" | "general" | "abilities" | "special"
  >("all");

  const updateField = <K extends keyof PlayerData>(
    field: K,
    value: PlayerData[K]
  ) => {
    setFormData((prev) => {
      const updated = {
        ...prev,
        [field]: value,
      };
      onSave?.(updated);
      return updated;
    });
  };

  const displayTitle =
    title ?? (formData.name ? `${formData.name}` : "Player Details");

  return (
    <div className={cn("flex flex-col gap-6 pb-12 w-full max-w-6xl", className)}>
      {/* Top Navigation Bar */}
      <div className="flex items-center gap-3 pb-4 border-b border-border sticky top-0 bg-background/95 backdrop-blur-sm z-20">
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
          <h3 className="text-base font-semibold text-foreground truncate">
            {displayTitle}
          </h3>
          <span className="text-[11px] text-muted-foreground">
            ID: {formData.identifier ?? "—"} · {formData.name_shorter || "Player Record"}
          </span>
        </div>
      </div>

      {/* Filter / Category Navigation Pills */}
      <div className="flex flex-wrap items-center gap-1.5 border-b border-border pb-3">
        <button
          type="button"
          onClick={() => setActiveCategory("all")}
          className={cn(
            "px-2.5 py-1 text-xs font-medium rounded-none border transition-colors",
            activeCategory === "all"
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-muted/40 text-muted-foreground border-border hover:text-foreground hover:bg-muted"
          )}
        >
          All Sections
        </button>
        <button
          type="button"
          onClick={() => setActiveCategory("general")}
          className={cn(
            "px-2.5 py-1 text-xs font-medium rounded-none border transition-colors",
            activeCategory === "general"
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-muted/40 text-muted-foreground border-border hover:text-foreground hover:bg-muted"
          )}
        >
          Identity & Profile
        </button>
        <button
          type="button"
          onClick={() => setActiveCategory("abilities")}
          className={cn(
            "px-2.5 py-1 text-xs font-medium rounded-none border transition-colors",
            activeCategory === "abilities"
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-muted/40 text-muted-foreground border-border hover:text-foreground hover:bg-muted"
          )}
        >
          Abilities & Movement
        </button>
        <button
          type="button"
          onClick={() => setActiveCategory("special")}
          className={cn(
            "px-2.5 py-1 text-xs font-medium rounded-none border transition-colors",
            activeCategory === "special"
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-muted/40 text-muted-foreground border-border hover:text-foreground hover:bg-muted"
          )}
        >
          Mental & Weak Foot
        </button>
      </div>

      {/* Main Sections Grid */}
      <div className="flex flex-col gap-6">
        {/* =================================================================== */}
        {/* SECTION: Identity */}
        {/* =================================================================== */}
        {(activeCategory === "all" || activeCategory === "general") && (
          <section className="border border-border bg-card/40 p-4 sm:p-5">
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-border/70">
              <User className="size-4 text-primary" />
              <h2 className="text-xs font-semibold uppercase tracking-wider text-foreground">
                Identity
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <ValidatedInput
                type="integer"
                label="Identifier"
                value={formData.identifier ?? ""}
                placeholder="e.g. 1001"
                min={0}
                rules={{ required: true }}
                helperText="Integer player ID"
                onValueChange={(val) => updateField("identifier", val ?? undefined)}
              />
              <ValidatedInput
                type="string"
                label="Name"
                value={formData.name ?? ""}
                placeholder="e.g. Lionel Messi"
                rules={{ required: true, minLength: 2, maxLength: 50 }}
                helperText="Full player name"
                onValueChange={(val) => updateField("name", val)}
              />
              <ValidatedInput
                type="string"
                label="Name Shorter"
                value={formData.name_shorter ?? ""}
                placeholder="e.g. L. MESSI"
                rules={{ required: true, minLength: 2, maxLength: 20 }}
                helperText="Short commentary / shirt name"
                onValueChange={(val) => updateField("name_shorter", val)}
              />
              <ValidatedInput
                type="custom-integer"
                label="Age"
                value={formData.age ?? ""}
                placeholder="e.g. 24"
                max={50}
                rules={{ required: true }}
                helperText="Age (15-50)"
                onValueChange={(val) => updateField("age", val ?? undefined)}
              />
              <ValidatedInput
                type="custom-integer"
                label="Height (cm)"
                value={formData.height ?? ""}
                placeholder="e.g. 170"
                max={230}
                rules={{ required: true }}
                helperText="Height in centimeters (0-230)"
                onValueChange={(val) => updateField("height", val ?? undefined)}
              />
              <ValidatedInput
                type="integer"
                label="Price"
                value={formData.price ?? ""}
                placeholder="e.g. 50000000"
                min={0}
                helperText="Market value integer"
                onValueChange={(val) => updateField("price", val ?? undefined)}
              />
            </div>
          </section>
        )}

        {/* =================================================================== */}
        {/* SECTION: Appearance */}
        {/* =================================================================== */}
        {(activeCategory === "all" || activeCategory === "general") && (
          <section className="border border-border bg-card/40 p-4 sm:p-5">
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-border/70">
              <Sparkles className="size-4 text-primary" />
              <h2 className="text-xs font-semibold uppercase tracking-wider text-foreground">
                Appearance
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <ValidatedInput
                type="custom-integer"
                label="Hair Color"
                value={formData.hair_color ?? ""}
                placeholder="0 - 999"
                max={999}
                rules={{ required: true }}
                helperText="Hair color ID"
                onValueChange={(val) => updateField("hair_color", val ?? undefined)}
              />
              <ValidatedInput
                type="custom-integer"
                label="Hair Model"
                value={formData.hair_model ?? ""}
                placeholder="0 - 9999"
                max={9999}
                rules={{ required: true }}
                helperText="Hair model model ID"
                onValueChange={(val) => updateField("hair_model", val ?? undefined)}
              />
              <ValidatedInput
                type="custom-integer"
                label="Skin"
                value={formData.skin ?? ""}
                placeholder="0 - 99"
                max={99}
                rules={{ required: true }}
                helperText="Skin tone index"
                onValueChange={(val) => updateField("skin", val ?? undefined)}
              />
              <ValidatedInput
                type="custom-integer"
                label="Shoe"
                value={formData.shoe ?? ""}
                placeholder="0 - 999"
                max={999}
                rules={{ required: true }}
                helperText="Shoe / boot model ID"
                onValueChange={(val) => updateField("shoe", val ?? undefined)}
              />
            </div>
          </section>
        )}

        {/* =================================================================== */}
        {/* SECTION: Preferred Foot & Position */}
        {/* =================================================================== */}
        {(activeCategory === "all" || activeCategory === "general") && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Preferred Foot */}
            <section className="border border-border bg-card/40 p-4 sm:p-5">
              <div className="flex items-center gap-2 mb-4 pb-2 border-b border-border/70">
                <Compass className="size-4 text-primary" />
                <h2 className="text-xs font-semibold uppercase tracking-wider text-foreground">
                  Preferred Foot
                </h2>
              </div>
              <ValidatedInput
                type="boolean"
                label="Foot"
                value={formData.foot ?? 0}
                falseLabel="Right Foot (0)"
                trueLabel="Left Foot (1)"
                placeholder="Select preferred foot..."
                rules={{ required: true }}
                helperText="0 = Right Foot, 1 = Left Foot"
                onValueChange={(val) => updateField("foot", val ? 1 : 0)}
              />
            </section>

            {/* Position */}
            <section className="border border-border bg-card/40 p-4 sm:p-5">
              <div className="flex items-center gap-2 mb-4 pb-2 border-b border-border/70">
                <MapPin className="size-4 text-primary" />
                <h2 className="text-xs font-semibold uppercase tracking-wider text-foreground">
                  Position
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <ValidatedInput
                  type="custom-integer"
                  label="Side"
                  value={formData.side ?? ""}
                  placeholder="0 - 2"
                  max={2}
                  rules={{ required: true }}
                  helperText="0: Right, 1: Left, 2: Both"
                  onValueChange={(val) => updateField("side", val ?? undefined)}
                />
                <ValidatedInput
                  type="custom-integer"
                  label="Position"
                  value={formData.position ?? ""}
                  placeholder="0 - 11"
                  max={11}
                  rules={{ required: true }}
                  helperText="0: GK to 11: CF"
                  onValueChange={(val) => updateField("position", val ?? undefined)}
                />
                <ValidatedInput
                  type="integer"
                  label="Position Flag"
                  value={formData.position_flag ?? ""}
                  placeholder="Integer flag"
                  min={0}
                  rules={{ required: true }}
                  helperText="Bitmask flag"
                  onValueChange={(val) => updateField("position_flag", val ?? undefined)}
                />
              </div>
            </section>
          </div>
        )}

        {/* =================================================================== */}
        {/* SECTION: Offensive & Defensive */}
        {/* =================================================================== */}
        {(activeCategory === "all" || activeCategory === "abilities") && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Offensive */}
            <section className="border border-border bg-card/40 p-4 sm:p-5">
              <div className="flex items-center gap-2 mb-4 pb-2 border-b border-border/70">
                <Swords className="size-4 text-red-500" />
                <h2 className="text-xs font-semibold uppercase tracking-wider text-foreground">
                  Offensive
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <ValidatedInput
                  type="custom-integer"
                  label="Attack"
                  value={formData.attack ?? ""}
                  placeholder="0 - 99"
                  max={99}
                  rules={{ required: true }}
                  onValueChange={(val) => updateField("attack", val ?? undefined)}
                />
                <ValidatedInput
                  type="custom-integer"
                  label="Teamwork"
                  value={formData.teamwork ?? ""}
                  placeholder="0 - 99"
                  max={99}
                  rules={{ required: true }}
                  onValueChange={(val) => updateField("teamwork", val ?? undefined)}
                />
                <ValidatedInput
                  type="custom-integer"
                  label="Aggression"
                  value={formData.aggression ?? ""}
                  placeholder="0 - 99"
                  max={99}
                  rules={{ required: true }}
                  onValueChange={(val) => updateField("aggression", val ?? undefined)}
                />
              </div>
            </section>

            {/* Defensive */}
            <section className="border border-border bg-card/40 p-4 sm:p-5">
              <div className="flex items-center gap-2 mb-4 pb-2 border-b border-border/70">
                <Shield className="size-4 text-blue-500" />
                <h2 className="text-xs font-semibold uppercase tracking-wider text-foreground">
                  Defensive
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <ValidatedInput
                  type="custom-integer"
                  label="Defense"
                  value={formData.defense ?? ""}
                  placeholder="0 - 99"
                  max={99}
                  rules={{ required: true }}
                  onValueChange={(val) => updateField("defense", val ?? undefined)}
                />
                <ValidatedInput
                  type="custom-integer"
                  label="Aggression"
                  value={formData.aggression ?? ""}
                  placeholder="0 - 99"
                  max={99}
                  rules={{ required: true }}
                  onValueChange={(val) => updateField("aggression", val ?? undefined)}
                />
                <ValidatedInput
                  type="custom-integer"
                  label="Teamwork"
                  value={formData.teamwork ?? ""}
                  placeholder="0 - 99"
                  max={99}
                  rules={{ required: true }}
                  onValueChange={(val) => updateField("teamwork", val ?? undefined)}
                />
              </div>
            </section>
          </div>
        )}

        {/* =================================================================== */}
        {/* SECTION: Speed & Movement */}
        {/* =================================================================== */}
        {(activeCategory === "all" || activeCategory === "abilities") && (
          <section className="border border-border bg-card/40 p-4 sm:p-5">
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-border/70">
              <Zap className="size-4 text-amber-500" />
              <h2 className="text-xs font-semibold uppercase tracking-wider text-foreground">
                Speed & Movement
              </h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
              <ValidatedInput
                type="custom-integer"
                label="Speed"
                value={formData.speed ?? ""}
                placeholder="0 - 99"
                max={99}
                rules={{ required: true }}
                onValueChange={(val) => updateField("speed", val ?? undefined)}
              />
              <ValidatedInput
                type="custom-integer"
                label="Acceleration"
                value={formData.acceleration ?? ""}
                placeholder="0 - 99"
                max={99}
                rules={{ required: true }}
                onValueChange={(val) => updateField("acceleration", val ?? undefined)}
              />
              <ValidatedInput
                type="custom-integer"
                label="Agility"
                value={formData.agility ?? ""}
                placeholder="0 - 99"
                max={99}
                rules={{ required: true }}
                onValueChange={(val) => updateField("agility", val ?? undefined)}
              />
              <ValidatedInput
                type="custom-integer"
                label="Balance"
                value={formData.balance ?? ""}
                placeholder="0 - 99"
                max={99}
                rules={{ required: true }}
                onValueChange={(val) => updateField("balance", val ?? undefined)}
              />
              <ValidatedInput
                type="custom-integer"
                label="Stamina"
                value={formData.stamina ?? ""}
                placeholder="0 - 99"
                max={99}
                rules={{ required: true }}
                onValueChange={(val) => updateField("stamina", val ?? undefined)}
              />
              <ValidatedInput
                type="custom-integer"
                label="Response"
                value={formData.response ?? ""}
                placeholder="0 - 99"
                max={99}
                rules={{ required: true }}
                onValueChange={(val) => updateField("response", val ?? undefined)}
              />
              <ValidatedInput
                type="custom-integer"
                label="Jump"
                value={formData.jump ?? ""}
                placeholder="0 - 99"
                max={99}
                rules={{ required: true }}
                onValueChange={(val) => updateField("jump", val ?? undefined)}
              />
            </div>
          </section>
        )}

        {/* =================================================================== */}
        {/* SECTION: Dribbling & Technique */}
        {/* =================================================================== */}
        {(activeCategory === "all" || activeCategory === "abilities") && (
          <section className="border border-border bg-card/40 p-4 sm:p-5">
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-border/70">
              <Activity className="size-4 text-emerald-500" />
              <h2 className="text-xs font-semibold uppercase tracking-wider text-foreground">
                Dribbling & Technique
              </h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <ValidatedInput
                type="custom-integer"
                label="Technique"
                value={formData.technique ?? ""}
                placeholder="0 - 99"
                max={99}
                rules={{ required: true }}
                onValueChange={(val) => updateField("technique", val ?? undefined)}
              />
              <ValidatedInput
                type="custom-integer"
                label="Dribble Accuracy"
                value={formData.dribble_accuracy ?? ""}
                placeholder="0 - 99"
                max={99}
                rules={{ required: true }}
                onValueChange={(val) =>
                  updateField("dribble_accuracy", val ?? undefined)
                }
              />
              <ValidatedInput
                type="custom-integer"
                label="Dribble Speed"
                value={formData.dribble_speed ?? ""}
                placeholder="0 - 99"
                max={99}
                rules={{ required: true }}
                onValueChange={(val) => updateField("dribble_speed", val ?? undefined)}
              />
              <ValidatedInput
                type="custom-integer"
                label="Swerve"
                value={formData.swerve ?? ""}
                placeholder="0 - 99"
                max={99}
                rules={{ required: true }}
                onValueChange={(val) => updateField("swerve", val ?? undefined)}
              />
            </div>
          </section>
        )}

        {/* =================================================================== */}
        {/* SECTION: Passing & Shooting */}
        {/* =================================================================== */}
        {(activeCategory === "all" || activeCategory === "abilities") && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Passing */}
            <section className="border border-border bg-card/40 p-4 sm:p-5">
              <div className="flex items-center gap-2 mb-4 pb-2 border-b border-border/70">
                <Send className="size-4 text-cyan-500" />
                <h2 className="text-xs font-semibold uppercase tracking-wider text-foreground">
                  Passing
                </h2>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <ValidatedInput
                  type="custom-integer"
                  label="Pass Short Accuracy"
                  value={formData.pass_short_accuracy ?? ""}
                  placeholder="0 - 99"
                  max={99}
                  rules={{ required: true }}
                  onValueChange={(val) =>
                    updateField("pass_short_accuracy", val ?? undefined)
                  }
                />
                <ValidatedInput
                  type="custom-integer"
                  label="Pass Short Speed"
                  value={formData.pass_short_speed ?? ""}
                  placeholder="0 - 99"
                  max={99}
                  rules={{ required: true }}
                  onValueChange={(val) =>
                    updateField("pass_short_speed", val ?? undefined)
                  }
                />
                <ValidatedInput
                  type="custom-integer"
                  label="Pass Long Accuracy"
                  value={formData.pass_long_accuracy ?? ""}
                  placeholder="0 - 99"
                  max={99}
                  rules={{ required: true }}
                  onValueChange={(val) =>
                    updateField("pass_long_accuracy", val ?? undefined)
                  }
                />
                <ValidatedInput
                  type="custom-integer"
                  label="Pass Long Speed"
                  value={formData.pass_long_speed ?? ""}
                  placeholder="0 - 99"
                  max={99}
                  rules={{ required: true }}
                  onValueChange={(val) =>
                    updateField("pass_long_speed", val ?? undefined)
                  }
                />
              </div>
            </section>

            {/* Shooting */}
            <section className="border border-border bg-card/40 p-4 sm:p-5">
              <div className="flex items-center gap-2 mb-4 pb-2 border-b border-border/70">
                <Crosshair className="size-4 text-orange-500" />
                <h2 className="text-xs font-semibold uppercase tracking-wider text-foreground">
                  Shooting
                </h2>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <ValidatedInput
                  type="custom-integer"
                  label="Shot Accuracy"
                  value={formData.shot_accuracy ?? ""}
                  placeholder="0 - 99"
                  max={99}
                  rules={{ required: true }}
                  onValueChange={(val) =>
                    updateField("shot_accuracy", val ?? undefined)
                  }
                />
                <ValidatedInput
                  type="custom-integer"
                  label="Shot Power"
                  value={formData.shot_power ?? ""}
                  placeholder="0 - 99"
                  max={99}
                  rules={{ required: true }}
                  onValueChange={(val) =>
                    updateField("shot_power", val ?? undefined)
                  }
                />
                <ValidatedInput
                  type="custom-integer"
                  label="Shot Technique"
                  value={formData.shot_technique ?? ""}
                  placeholder="0 - 99"
                  max={99}
                  rules={{ required: true }}
                  onValueChange={(val) =>
                    updateField("shot_technique", val ?? undefined)
                  }
                />
                <ValidatedInput
                  type="custom-integer"
                  label="Freekick Accuracy"
                  value={formData.freekick_accuracy ?? ""}
                  placeholder="0 - 99"
                  max={99}
                  rules={{ required: true }}
                  onValueChange={(val) =>
                    updateField("freekick_accuracy", val ?? undefined)
                  }
                />
              </div>
            </section>
          </div>
        )}

        {/* =================================================================== */}
        {/* SECTION: Aerial & Goalkeeper */}
        {/* =================================================================== */}
        {(activeCategory === "all" || activeCategory === "abilities") && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Aerial */}
            <section className="border border-border bg-card/40 p-4 sm:p-5">
              <div className="flex items-center gap-2 mb-4 pb-2 border-b border-border/70">
                <ChevronsUp className="size-4 text-violet-500" />
                <h2 className="text-xs font-semibold uppercase tracking-wider text-foreground">
                  Aerial
                </h2>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <ValidatedInput
                  type="custom-integer"
                  label="Header"
                  value={formData.header ?? ""}
                  placeholder="0 - 99"
                  max={99}
                  rules={{ required: true }}
                  onValueChange={(val) => updateField("header", val ?? undefined)}
                />
                <ValidatedInput
                  type="custom-integer"
                  label="Jump"
                  value={formData.jump ?? ""}
                  placeholder="0 - 99"
                  max={99}
                  rules={{ required: true }}
                  onValueChange={(val) => updateField("jump", val ?? undefined)}
                />
              </div>
            </section>

            {/* Goalkeeper */}
            <section className="border border-border bg-card/40 p-4 sm:p-5">
              <div className="flex items-center gap-2 mb-4 pb-2 border-b border-border/70">
                <Hand className="size-4 text-amber-600" />
                <h2 className="text-xs font-semibold uppercase tracking-wider text-foreground">
                  Goalkeeper
                </h2>
              </div>
              <ValidatedInput
                type="custom-integer"
                label="Keeper"
                value={formData.keeper ?? ""}
                placeholder="0 - 99"
                max={99}
                rules={{ required: true }}
                helperText="Goalkeeping ability (0-99)"
                onValueChange={(val) => updateField("keeper", val ?? undefined)}
              />
            </section>
          </div>
        )}

        {/* =================================================================== */}
        {/* SECTION: Weak Foot & Mental */}
        {/* =================================================================== */}
        {(activeCategory === "all" || activeCategory === "special") && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Weak Foot */}
            <section className="border border-border bg-card/40 p-4 sm:p-5">
              <div className="flex items-center gap-2 mb-4 pb-2 border-b border-border/70">
                <RotateCcw className="size-4 text-emerald-600" />
                <h2 className="text-xs font-semibold uppercase tracking-wider text-foreground">
                  Weak Foot
                </h2>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <ValidatedInput
                  type="custom-integer"
                  label="Weak Foot Accuracy"
                  value={formData.foot_weak_accuracy ?? ""}
                  placeholder="0 - 8"
                  max={8}
                  rules={{ required: true }}
                  helperText="Rating from 0 to 8"
                  onValueChange={(val) =>
                    updateField("foot_weak_accuracy", val ?? undefined)
                  }
                />
                <ValidatedInput
                  type="custom-integer"
                  label="Weak Foot Frequency"
                  value={formData.foot_weak_frequency ?? ""}
                  placeholder="0 - 8"
                  max={8}
                  rules={{ required: true }}
                  helperText="Rating from 0 to 8"
                  onValueChange={(val) =>
                    updateField("foot_weak_frequency", val ?? undefined)
                  }
                />
              </div>
            </section>

            {/* Mental */}
            <section className="border border-border bg-card/40 p-4 sm:p-5">
              <div className="flex items-center gap-2 mb-4 pb-2 border-b border-border/70">
                <Brain className="size-4 text-purple-500" />
                <h2 className="text-xs font-semibold uppercase tracking-wider text-foreground">
                  Mental
                </h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <ValidatedInput
                  type="custom-integer"
                  label="Teamwork"
                  value={formData.teamwork ?? ""}
                  placeholder="0 - 99"
                  max={99}
                  rules={{ required: true }}
                  onValueChange={(val) => updateField("teamwork", val ?? undefined)}
                />
                <ValidatedInput
                  type="custom-integer"
                  label="Form"
                  value={formData.form ?? ""}
                  placeholder="0 - 8"
                  max={8}
                  rules={{ required: true }}
                  helperText="Rating 0 - 8"
                  onValueChange={(val) => updateField("form", val ?? undefined)}
                />
                <ValidatedInput
                  type="custom-integer"
                  label="Tenacity"
                  value={formData.tenacity ?? ""}
                  placeholder="0 - 99"
                  max={99}
                  rules={{ required: true }}
                  onValueChange={(val) => updateField("tenacity", val ?? undefined)}
                />
                <ValidatedInput
                  type="custom-integer"
                  label="Aggression"
                  value={formData.aggression ?? ""}
                  placeholder="0 - 99"
                  max={99}
                  rules={{ required: true }}
                  onValueChange={(val) => updateField("aggression", val ?? undefined)}
                />
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}

export default PlayerDetail;

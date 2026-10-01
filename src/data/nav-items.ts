import { Trophy, Users, Shield, Volleyball, ClipboardList, Globe } from "lucide-react";
import type { NavItem } from "@/types/nav";

export const DEFAULT_NAV_ITEMS: NavItem[] = [
  { id: "players", label: "Players", icon: Users, badge: "24" },
  { id: "teams", label: "Teams & Clubs", icon: Shield, badge: "24" },
  { id: "competitions", label: "Competitions", icon: Trophy },
  { id: "group", label: "Group", icon: Globe },
  { id: "formations", label: "Formations", icon: ClipboardList },
  { id: "balls", label: "Balls", icon: Volleyball },
];

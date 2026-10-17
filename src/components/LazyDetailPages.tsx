// src/components/LazyDetailPages.tsx
import { lazy } from "react";

/**
 * Full detail pages behind `React.lazy`: every page gets its own chunk, which
 * is downloaded the first time that page is shown (see `DatabaseRecordDetail`).
 *
 * Declared here and not inline in a render function: a component created inside
 * a render is a new component type on every pass, which would remount — and
 * therefore reset — the open page.
 *
 * The pages are imported through their named export and mapped onto the
 * `default` slot `lazy` expects. `CompetitionDetail`, `GroupDetail` and
 * `FormationDetail` cannot be used through `export default` anyway: their local
 * component shares its name with an imported type, so the default export
 * resolves to that type.
 */
export const LazyPlayerDetail = lazy(() =>
  import("@/components/PlayerDetail").then((module) => ({
    default: module.PlayerDetail,
  }))
);

export const LazyTeamDetail = lazy(() =>
  import("@/components/TeamDetail").then((module) => ({
    default: module.TeamDetail,
  }))
);

export const LazyCompetitionDetail = lazy(() =>
  import("@/components/CompetitionDetail").then((module) => ({
    default: module.CompetitionDetail,
  }))
);

export const LazyGroupDetail = lazy(() =>
  import("@/components/GroupDetail").then((module) => ({
    default: module.GroupDetail,
  }))
);

export const LazyFormationDetail = lazy(() =>
  import("@/components/FormationDetail").then((module) => ({
    default: module.FormationDetail,
  }))
);

export const LazyBallDetail = lazy(() =>
  import("@/components/BallDetail").then((module) => ({
    default: module.BallDetail,
  }))
);

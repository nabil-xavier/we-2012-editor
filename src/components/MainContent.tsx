// src/components/MainContent.tsx
import { Suspense, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { DatabaseBrowser } from "@/components/DatabaseBrowser";
import { DatabaseRecordDetail } from "@/components/DatabaseRecordDetail";
import { DetailLoading } from "@/components/DetailLoading";
import { getBrowserTableConfig } from "@/data/table-browsers";
import { useDatabaseStore } from "@/store/useDatabaseStore";
import { Database } from "lucide-react";

export interface MainContentProps {
  children?: ReactNode;
  activeNavId?: string;
  className?: string;
}

export function MainContent({
  children,
  activeNavId = "teams",
  className,
}: MainContentProps) {
  /** Record opened in its full detail page, `null` while its table is browsed */
  const [openRecord, setOpenRecord] = useState<{
    tableName: string;
    identifier: number;
  } | null>(null);

  const browserConfig = getBrowserTableConfig(activeNavId);
  const browserHasTable = useDatabaseStore((state) =>
    browserConfig ? state.database[browserConfig.tableName] !== undefined : false
  );

  return (
    <main
      className={cn(
        "flex-1 flex flex-col min-w-0 h-full overflow-y-auto bg-background",
        className
      )}
    >
      <div className="flex flex-1 min-h-0 flex-col p-4 sm:p-6 lg:p-8">
        <Suspense fallback={<DetailLoading />}>
          {children ? (
            children
          ) : browserConfig && browserHasTable ? (
            openRecord !== null &&
            openRecord.tableName === browserConfig.tableName ? (
              <DatabaseRecordDetail
                config={browserConfig}
                identifier={openRecord.identifier}
                onBack={() => setOpenRecord(null)}
              />
            ) : (
              <DatabaseBrowser
                config={browserConfig}
                onOpenRecord={(identifier) =>
                  setOpenRecord({
                    tableName: browserConfig.tableName,
                    identifier,
                  })
                }
              />
            )
          ) : (
            <div className="flex h-full min-h-[320px] flex-1 flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border p-8 text-center">
              <Database className="size-10 text-muted-foreground/60" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">
                  No database loaded
                </p>
                <p className="text-xs text-muted-foreground max-w-sm">
                  {browserConfig
                    ? `Open a WE-2012 .bin file from the sidebar to browse and edit ${browserConfig.label.toLowerCase()}.`
                    : "Open a WE-2012 .bin file from the sidebar to start editing."}
                </p>
              </div>
            </div>
          )}
        </Suspense>
      </div>
    </main>
  );
}

export default MainContent;

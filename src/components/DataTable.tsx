import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "./ui/table";
import { cn } from "#lib/utils";

export interface DataTableColumn {
  /** The key in each data row object to read from */
  key: string;
  /** The text shown in the column header */
  title: string;
}

export interface DataTableProps {
  /** Column definitions. Each entry has a `key` (data field) and a `title` (header label). */
  columns: DataTableColumn[];
  /** Array of data row objects. Keys must match the `key` values in `columns`. */
  data: Record<string, unknown>[];
  /** Called with the full row object when the user clicks any row. */
  onRowClick?: (row: Record<string, unknown>) => void;
  className?: string;
}

export function DataTable({
  columns,
  data,
  onRowClick,
  className,
}: DataTableProps) {
  return (
    <div className={cn("rounded-lg border border-border overflow-hidden", className)}>
      <Table>
        {/* Table Header — renders one <th> per column using the column's `title` */}
        <TableHeader>
          <TableRow className="bg-muted/40 hover:bg-muted/40">
            {columns.map((col) => (
              <TableHead key={col.key} className="font-semibold text-foreground">
                {col.title}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>

        {/* Table Body — renders one <tr> per data item */}
        <TableBody>
          {data.map((row, rowIndex) => (
            <TableRow
              key={rowIndex}
              onClick={() => onRowClick?.(row)}
              className={cn(
                "transition-colors",
                onRowClick && "cursor-pointer hover:bg-muted/60"
              )}
            >
              {/* Renders one <td> per column, reading `row[col.key]` */}
              {columns.map((col) => (
                <TableCell key={col.key}>
                  {String(row[col.key] ?? "")}
                </TableCell>
              ))}
            </TableRow>
          ))}

          {/* Empty state row when data is empty */}
          {data.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="h-24 text-center text-muted-foreground"
              >
                No data available.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

export default DataTable;

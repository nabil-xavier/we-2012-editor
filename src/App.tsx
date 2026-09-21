import React, { useState, useEffect, useRef } from "react";
import initSqlJs, { type Database, type SqlJsStatic } from "sql.js";
import {
  Database as DbIcon,
  Upload,
  Download,
  Plus,
  Trash2,
  Save,
  Table as TableIcon,
  AlertCircle,
  CheckCircle2,
  FileCode,
  Sparkles,
  RefreshCw,
} from "lucide-react";

interface TableData {
  columns: string[];
  values: (string | number | null | Uint8Array)[][];
}

export default function App() {
  const [SQL, setSQL] = useState<SqlJsStatic | null>(null);
  const [db, setDb] = useState<Database | null>(null);
  const [tables, setTables] = useState<string[]>([]);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [tableData, setTableData] = useState<TableData | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<{
    text: string;
    type: "success" | "error" | "info";
  } | null>(null);
  const [isLoadingWasm, setIsLoadingWasm] = useState<boolean>(true);
  const [searchFilter, setSearchFilter] = useState<string>("");

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Helper to show temporary status messages
  const notify = (text: string, type: "success" | "error" | "info" = "info") => {
    setStatusMessage({ text, type });
    setTimeout(() => {
      setStatusMessage((prev) => (prev?.text === text ? null : prev));
    }, 4000);
  };

  // 1. Setup and State Management: Initialize sql.js WebAssembly 
  useEffect(() => {
    async function loadSqlJs() {
      try {
        setIsLoadingWasm(true);

        const wasmPath = "/public/sql-wasm.wasm";
        const sqlInstance = await initSqlJs({
          locateFile: () => wasmPath,
        });

        setSQL(sqlInstance);
        setIsLoadingWasm(false);
      } catch (err) {
        console.error("Failed to load sql.js WebAssembly:", err);
        notify("Failed to load SQLite WebAssembly engine.", "error");
        setIsLoadingWasm(false); 
      }
    }
    loadSqlJs();
  }, []);

  // Helper to refresh table list from database
  const refreshTables = (activeDb: Database) => {
    try {
      const res = activeDb.exec(
        "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name ASC;"
      );
      if (res.length > 0 && res[0].values) {
        const tableList = res[0].values.map((row) => String(row[0]));
        setTables(tableList);
        return tableList;
      } else {
        setTables([]);
        return [];
      }
    } catch (err: any) {
      console.error("Error reading tables:", err);
      notify("Failed to read database tables: " + err.message, "error");
      setTables([]);
      return [];
    }
  };

  // Helper to query table data
  const loadTableData = (activeDb: Database, tableName: string) => {
    try {
      const escapedName = `"${tableName.replace(/"/g, '""')}"`;
      const res = activeDb.exec(`SELECT * FROM ${escapedName};`);
      if (res.length > 0) {
        setTableData({
          columns: res[0].columns,
          values: res[0].values,
        });
      } else {
        // Table exists but is completely empty: query PRAGMA table_info to get column definitions
        const info = activeDb.exec(`PRAGMA table_info(${escapedName});`);
        const columns =
          info.length > 0 && info[0].values
            ? info[0].values.map((colRow) => String(colRow[1]))
            : [];
        setTableData({
          columns,
          values: [],
        });
      }
    } catch (err: any) {
      console.error("Error fetching table data:", err);
      notify("Failed to load table content: " + err.message, "error");
      setTableData(null);
    }
  };

  // 2. DB File Import Component: Validate .bin and load into sql.js
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".bin")) {
      notify("Invalid file format! Strictly only .bin database files are allowed.", "error");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    if (!SQL) {
      notify("SQLite WebAssembly engine is still loading. Please wait.", "error");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const arrayBuffer = reader.result as ArrayBuffer;
        const uint8Array = new Uint8Array(arrayBuffer);

        // Initialize new Database instance
        const newDb = new SQL.Database(uint8Array);
        setDb(newDb);
        setFileName(file.name);

        const loadedTables = refreshTables(newDb);
        if (loadedTables.length > 0) {
          setSelectedTable(loadedTables[0]);
          loadTableData(newDb, loadedTables[0]);
        } else {
          setSelectedTable(null);
          setTableData(null);
        }

        notify(`Loaded "${file.name}" successfully! (${loadedTables.length} tables found)`, "success");
      } catch (err: any) {
        console.error("Error parsing SQLite file:", err);
        notify("Failed to parse .bin SQLite database: " + err.message, "error");
      }
    };
    reader.onerror = () => {
      notify("Error reading uploaded file.", "error");
    };

    reader.readAsArrayBuffer(file);
  };

  // 4. Left Sidebar: Selection handler
  const handleSelectTable = (tblName: string) => {
    setSelectedTable(tblName);
    if (db) {
      loadTableData(db, tblName);
    }
  };

  // 6. Data Modification Functions
  // Add Row
  const handleAddRow = () => {
    if (!tableData) return;
    const newEmptyRow = new Array(tableData.columns.length).fill("");
    setTableData({
      columns: tableData.columns,
      values: [...tableData.values, newEmptyRow],
    });
    notify("New empty row added to view. Click 'Apply Changes' to save to DB.", "info");
  };

  // Delete Row
  const handleDeleteRow = (rowIndex: number) => {
    if (!tableData) return;
    const updatedValues = tableData.values.filter((_, idx) => idx !== rowIndex);
    setTableData({
      columns: tableData.columns,
      values: updatedValues,
    });
    notify("Row removed from view. Click 'Apply Changes' to sync to DB.", "info");
  };

  // Cell Value Edit
  const handleCellChange = (rowIndex: number, colIndex: number, newVal: string) => {
    if (!tableData) return;
    const updatedValues = tableData.values.map((row, rIdx) => {
      if (rIdx !== rowIndex) return row;
      const updatedRow = [...row];
      updatedRow[colIndex] = newVal;
      return updatedRow;
    });
    setTableData({
      columns: tableData.columns,
      values: updatedValues,
    });
  };

  // Apply Changes to DB Object
  const handleApplyChanges = () => {
    if (!db || !selectedTable || !tableData) {
      notify("No active database or table selected.", "error");
      return;
    }

    try {
      const escapedTable = `"${selectedTable.replace(/"/g, '""')}"`;
      db.run("BEGIN TRANSACTION;");

      // Clear existing records in this table
      db.run(`DELETE FROM ${escapedTable};`);

      if (tableData.columns.length > 0 && tableData.values.length > 0) {
        const colList = tableData.columns.map((c) => `"${c.replace(/"/g, '""')}"`).join(", ");
        const placeholders = tableData.columns.map(() => "?").join(", ");
        const insertSql = `INSERT INTO ${escapedTable} (${colList}) VALUES (${placeholders});`;
        const stmt = db.prepare(insertSql);

        for (const row of tableData.values) {
          const sanitizedRow = row.map((cell) => (cell === "" ? null : cell));
          stmt.run(sanitizedRow);
        }
        stmt.free();
      }

      db.run("COMMIT;");
      notify(`Changes successfully saved to table "${selectedTable}"!`, "success");

      // Reload fresh data from DB to reflect verified state
      loadTableData(db, selectedTable);
    } catch (err: any) {
      console.error("Failed to apply changes:", err);
      try {
        db.run("ROLLBACK;");
      } catch (_) {}
      notify("Failed to apply changes: " + err.message, "error");
    }
  };

  // 7. Export Function
  const handleExportDb = () => {
    if (!db) {
      notify("No database loaded to export!", "error");
      return;
    }

    try {
      const data = db.export();
      const blob = new Blob([new Uint8Array(data)], { type: "application/octet-stream" });
      const exportName = fileName
        ? fileName.endsWith(".bin")
          ? fileName
          : `${fileName}.bin`
        : "exported_database.bin";

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = exportName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      notify(`Database successfully exported as "${exportName}"!`, "success");
    } catch (err: any) {
      console.error("Export failed:", err);
      notify("Failed to export database: " + err.message, "error");
    }
  };

  // Bonus feature: Demo .bin creator so user can test right away without needing an external file
  const handleCreateDemoDb = () => {
    if (!SQL) {
      notify("SQLite WebAssembly engine is still loading. Please wait.", "error");
      return;
    }

    try {
      const demoDb = new SQL.Database();
      demoDb.run(`
        CREATE TABLE players (
          id INTEGER PRIMARY KEY,
          name TEXT NOT NULL,
          club TEXT NOT NULL,
          rating INTEGER,
          position TEXT
        );
        INSERT INTO players VALUES (1, 'Lionel Messi', 'Barcelona', 94, 'RW');
        INSERT INTO players VALUES (2, 'Cristiano Ronaldo', 'Real Madrid', 92, 'LW');
        INSERT INTO players VALUES (3, 'Xavi Hernandez', 'Barcelona', 89, 'CM');
        INSERT INTO players VALUES (4, 'Wayne Rooney', 'Manchester United', 88, 'ST');
        INSERT INTO players VALUES (5, 'Iker Casillas', 'Real Madrid', 89, 'GK');

        CREATE TABLE teams (
          id INTEGER PRIMARY KEY,
          team_name TEXT NOT NULL,
          league TEXT NOT NULL,
          overall_rating INTEGER
        );
        INSERT INTO teams VALUES (1, 'FC Barcelona', 'La Liga', 88);
        INSERT INTO teams VALUES (2, 'Real Madrid CF', 'La Liga', 88);
        INSERT INTO teams VALUES (3, 'Manchester United', 'Premier League', 85);
        INSERT INTO teams VALUES (4, 'AC Milan', 'Serie A', 83);
      `);

      setDb(demoDb);
      setFileName("we2012_demo.bin");
      const loadedTables = refreshTables(demoDb);
      if (loadedTables.length > 0) {
        setSelectedTable(loadedTables[0]);
        loadTableData(demoDb, loadedTables[0]);
      }
      notify("Demo SQLite database created! Ready for testing & export as .bin.", "success");
    } catch (err: any) {
      console.error("Error creating demo DB:", err);
      notify("Error creating demo DB: " + err.message, "error");
    }
  };

  // Filtered rows for fast browsing
  const filteredRows = React.useMemo(() => {
    if (!tableData) return [];
    if (!searchFilter.trim()) return tableData.values;
    const q = searchFilter.toLowerCase();
    return tableData.values.filter((row) =>
      row.some((cell) => (cell !== null && cell !== undefined ? String(cell).toLowerCase().includes(q) : false))
    );
  }, [tableData, searchFilter]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans antialiased selection:bg-indigo-500 selection:text-white">
      {/* Top Navigation Bar */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur px-6 py-3.5 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-20 shadow-md">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-tr from-indigo-600 to-violet-500 rounded-xl shadow-lg shadow-indigo-500/20 text-white">
            <DbIcon className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
              WE 2012 SQLite Tester
              <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 font-mono font-medium border border-indigo-500/20">
                .bin only
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              WebAssembly SQL.js Database Inspector &amp; Editor
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Hidden File Input */}
          <input
            type="file"
            accept=".bin"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
            id="bin-file-input"
          />

          <label
            htmlFor="bin-file-input"
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-slate-600 text-sm font-medium transition cursor-pointer shadow-sm active:scale-95"
            title="Import a .bin SQLite database"
          >
            <Upload className="w-4 h-4 text-indigo-400" />
            <span>Import .bin</span>
          </label>

          <button
            onClick={handleExportDb}
            disabled={!db}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition shadow-sm active:scale-95 ${
              db
                ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/30 cursor-pointer"
                : "bg-slate-800/60 text-slate-500 border border-slate-800 cursor-not-allowed"
            }`}
            title="Export database as .bin"
          >
            <Download className="w-4 h-4" />
            <span>Export DB</span>
          </button>

          <button
            onClick={handleCreateDemoDb}
            disabled={isLoadingWasm}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 hover:border-indigo-500/50 text-sm font-medium transition cursor-pointer active:scale-95"
            title="Generate sample WE2012 SQLite DB for testing"
          >
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>Demo DB</span>
          </button>
        </div>
      </header>

      {/* Status & Notification Toast */}
      {statusMessage && (
        <div className="px-6 py-2">
          <div
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-lg text-sm font-medium border transition-all animate-fadeIn ${
              statusMessage.type === "success"
                ? "bg-emerald-950/70 border-emerald-500/40 text-emerald-300"
                : statusMessage.type === "error"
                ? "bg-rose-950/70 border-rose-500/40 text-rose-300"
                : "bg-indigo-950/70 border-indigo-500/40 text-indigo-300"
            }`}
          >
            {statusMessage.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : statusMessage.type === "error" ? (
              <AlertCircle className="w-4 h-4 shrink-0" />
            ) : (
              <RefreshCw className="w-4 h-4 shrink-0 animate-spin" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        </div>
      )}

      {/* Main Two-Column Layout */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* 3. Left Sidebar: 25% width */}
        <aside className="w-full md:w-1/4 min-w-[240px] max-w-sm border-r border-slate-800 bg-slate-900/50 flex flex-col">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TableIcon className="w-4 h-4 text-indigo-400" />
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                DB Objects / Tables
              </span>
            </div>
            {tables.length > 0 && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                {tables.length}
              </span>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-1">
            {isLoadingWasm ? (
              <div className="p-6 text-center text-slate-500 text-sm flex flex-col items-center gap-2">
                <RefreshCw className="w-5 h-5 animate-spin text-indigo-400" />
                <span>Loading SQLite WASM...</span>
              </div>
            ) : !db ? (
              <div className="p-6 text-center text-slate-500 text-sm flex flex-col items-center gap-3">
                <FileCode className="w-8 h-8 text-slate-600" />
                <p>No database loaded.</p>
                <p className="text-xs text-slate-600">
                  Import a <code className="text-slate-400 bg-slate-800 px-1 py-0.5 rounded">.bin</code> file or click <span className="text-indigo-400">Demo DB</span> to start.
                </p>
              </div>
            ) : tables.length === 0 ? (
              <div className="p-6 text-center text-slate-500 text-sm">
                No tables found in this database.
              </div>
            ) : (
              tables.map((tbl) => {
                const isSelected = tbl === selectedTable;
                return (
                  <button
                    key={tbl}
                    onClick={() => handleSelectTable(tbl)}
                    className={`w-full text-left px-3.5 py-2.5 rounded-lg text-sm font-medium transition flex items-center justify-between group ${
                      isSelected
                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                        : "text-slate-300 hover:bg-slate-800/80 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <TableIcon
                        className={`w-4 h-4 shrink-0 ${
                          isSelected ? "text-white" : "text-slate-500 group-hover:text-slate-400"
                        }`}
                      />
                      <span className="truncate">{tbl}</span>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Database Info Footer */}
          {fileName && (
            <div className="p-3 border-t border-slate-800 bg-slate-900/80 text-xs text-slate-400 truncate">
              Active: <span className="text-slate-200 font-mono">{fileName}</span>
            </div>
          )}
        </aside>

        {/* 3. Right Main Content: 75% width */}
        <main className="w-full md:w-3/4 flex-1 flex flex-col bg-slate-950 overflow-hidden">
          {!selectedTable || !tableData ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-500">
              <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mb-4 text-slate-600">
                <DbIcon className="w-8 h-8" />
              </div>
              <h2 className="text-lg font-semibold text-slate-300 mb-1">
                Please select a DB object from the left
              </h2>
              <p className="text-sm text-slate-500 max-w-md">
                Load a <code className="text-indigo-400 font-mono">.bin</code> SQLite database and select a table from the sidebar to inspect and edit its rows.
              </p>
            </div>
          ) : (
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Table Action Controls Header */}
              <div className="p-4 border-b border-slate-800 bg-slate-900/40 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div>
                    <h2 className="text-base font-bold text-white flex items-center gap-2">
                      <span className="font-mono text-indigo-400">{selectedTable}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-normal">
                        {tableData.values.length} rows &bull; {tableData.columns.length} columns
                      </span>
                    </h2>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <input
                    type="text"
                    placeholder="Search in table..."
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500 transition w-36 sm:w-48"
                  />

                  {/* 6. Add Row Function */}
                  <button
                    onClick={handleAddRow}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition cursor-pointer active:scale-95"
                    title="Add a new row to current table"
                  >
                    <Plus className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Add Row</span>
                  </button>

                  {/* 6. Apply Changes Function */}
                  <button
                    onClick={handleApplyChanges}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm shadow-indigo-600/30 text-xs font-semibold transition cursor-pointer active:scale-95"
                    title="Save all changes back to SQLite database instance"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Apply Changes</span>
                  </button>
                </div>
              </div>

              {/* 5. Right Main Content: Editable HTML Table */}
              <div className="flex-1 overflow-auto p-4">
                {tableData.columns.length === 0 ? (
                  <div className="text-center py-12 text-slate-500 text-sm">
                    This table has no defined columns.
                  </div>
                ) : (
                  <div className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-inner">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-slate-800 bg-slate-900 text-slate-300 font-semibold tracking-wide">
                          <th className="py-2.5 px-3 w-12 text-center text-slate-500 font-mono">
                            #
                          </th>
                          {tableData.columns.map((colName) => (
                            <th key={colName} className="py-2.5 px-3 border-l border-slate-800 font-mono">
                              {colName}
                            </th>
                          ))}
                          <th className="py-2.5 px-3 border-l border-slate-800 text-center w-16">
                            Action
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/80 font-sans">
                        {filteredRows.length === 0 ? (
                          <tr>
                            <td
                              colSpan={tableData.columns.length + 2}
                              className="text-center py-8 text-slate-500"
                            >
                              {tableData.values.length === 0
                                ? "Table is empty. Click 'Add Row' to insert data."
                                : "No rows match your search filter."}
                            </td>
                          </tr>
                        ) : (
                          filteredRows.map((row, rIdx) => {
                            // Find original index in tableData.values for proper mutation
                            const originalIdx = tableData.values.indexOf(row);
                            const actualIdx = originalIdx !== -1 ? originalIdx : rIdx;

                            return (
                              <tr
                                key={actualIdx}
                                className="hover:bg-slate-800/40 transition-colors group"
                              >
                                <td className="py-1.5 px-3 text-center text-slate-500 font-mono text-[11px]">
                                  {actualIdx + 1}
                                </td>
                                {tableData.columns.map((col, cIdx) => {
                                  const cellValue = row[cIdx];
                                  const displayValue =
                                    cellValue === null || cellValue === undefined
                                      ? ""
                                      : cellValue instanceof Uint8Array
                                      ? `[BLOB ${cellValue.byteLength}B]`
                                      : String(cellValue);

                                  return (
                                    <td
                                      key={col}
                                      className="py-1 px-2 border-l border-slate-800/80"
                                    >
                                      <input
                                        type="text"
                                        value={displayValue}
                                        onChange={(e) =>
                                          handleCellChange(actualIdx, cIdx, e.target.value)
                                        }
                                        className="w-full bg-transparent hover:bg-slate-800/60 focus:bg-slate-900 border border-transparent focus:border-indigo-500/80 rounded px-2 py-1 text-slate-200 focus:outline-none transition font-mono text-xs"
                                      />
                                    </td>
                                  );
                                })}
                                {/* 6. Delete Row Function */}
                                <td className="py-1 px-2 border-l border-slate-800/80 text-center">
                                  <button
                                    onClick={() => handleDeleteRow(actualIdx)}
                                    className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 transition cursor-pointer"
                                    title="Delete this row"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

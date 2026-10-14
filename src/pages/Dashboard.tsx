import { Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState,
} from "@tanstack/react-table";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useAcademyStore } from "@/store/useAcademyStore";
import { streakCount, useAcademy } from "@/lib/academy/store";

type Student = { name: string; grade: string; attendance: number; status: "Active" | "At Risk" };

// Sample data: replace with your real students.
const STUDENTS: Student[] = [
  { name: "Omar Hassan", grade: "B2", attendance: 96, status: "Active" },
  { name: "Mariam Adel", grade: "B1", attendance: 91, status: "Active" },
  { name: "Youssef Samir", grade: "A2", attendance: 68, status: "At Risk" },
  { name: "Nour Ahmed", grade: "B1", attendance: 88, status: "Active" },
  { name: "Karim Fathy", grade: "A2", attendance: 72, status: "At Risk" },
  { name: "Salma Ibrahim", grade: "C1", attendance: 98, status: "Active" },
  { name: "Ali Mostafa", grade: "B2", attendance: 84, status: "Active" },
  { name: "Hana Tarek", grade: "B1", attendance: 64, status: "At Risk" },
];
const PERFORMANCE = [
  { month: "May", score: 61 },
  { month: "Jun", score: 64 },
  { month: "Jul", score: 68 },
  { month: "Aug", score: 71 },
  { month: "Sep", score: 75 },
  { month: "Oct", score: 79 },
];
const ATTENDANCE = [
  { day: "Sat", present: 18 },
  { day: "Sun", present: 22 },
  { day: "Mon", present: 21 },
  { day: "Tue", present: 24 },
  { day: "Wed", present: 20 },
  { day: "Thu", present: 17 },
];

const col = createColumnHelper<Student>();

export default function Dashboard() {
  const { theme, toggleTheme, user, setUser } = useAcademyStore();
  const dark = theme === "dark";
  const hydrate = useAcademy((s) => s.hydrate);
  const xp = useAcademy((s) => s.xp);
  const lv = useAcademy((s) => s.lv);
  const days = useAcademy((s) => s.days);
  useEffect(() => {
    hydrate();
  }, [hydrate]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const c = dark
    ? { page: "bg-slate-950 text-slate-100", card: "bg-slate-900 border-slate-800", muted: "text-slate-400", head: "bg-slate-800/70", line: "border-slate-800", grid: "#334155", accent: "#2dd4bf" }
    : { page: "bg-stone-100 text-slate-900", card: "bg-white border-stone-200", muted: "text-slate-500", head: "bg-stone-50", line: "border-stone-200", grid: "#e7e5e4", accent: "#0e6b68" };

  const columns = useMemo(
    () => [
      col.accessor("name", { header: "Name" }),
      col.accessor("grade", { header: "Grade" }),
      col.accessor("attendance", { header: "Attendance", cell: (i) => `${i.getValue()}%` }),
      col.accessor("status", {
        header: "Status",
        cell: (i) => (
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
              i.getValue() === "Active"
                ? "bg-emerald-100 text-emerald-800"
                : "bg-rose-100 text-rose-800"
            }`}
          >
            {i.getValue()}
          </span>
        ),
      }),
    ],
    [],
  );
  const table = useReactTable({
    data: STUDENTS,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const tip = { background: dark ? "#0f172a" : "#fff", border: `1px solid ${c.grid}`, borderRadius: 8 };

  return (
    <div className={`min-h-screen p-4 sm:p-8 ${c.page}`}>
      <div className="mx-auto max-w-5xl space-y-6">
        <Link to="/" className={`text-sm font-semibold underline ${c.muted}`}>
          ← Back to the academy
        </Link>
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">Academy Dashboard</h1>
            <p className={`text-sm ${c.muted}`}>
              {user ? `${user.name} · ${user.role}` : "Not signed in"} · sample data
            </p>
          </div>
          <div className="flex gap-2">
            {!user && (
              <button
                className={`rounded-lg border px-3 py-2 text-sm font-semibold ${c.card}`}
                onClick={() => setUser({ id: "demo-1", name: "Demo Teacher", role: "teacher" })}
              >
                Use demo user
              </button>
            )}
            <button className={`rounded-lg border px-3 py-2 text-sm font-semibold ${c.card}`} onClick={toggleTheme}>
              {dark ? "Light mode" : "Dark mode"}
            </button>
          </div>
        </header>

        <section className={`grid grid-cols-3 gap-3 rounded-xl border p-4 text-center ${c.card}`}>
          {[
            ["Your streak", String(streakCount(days))],
            ["Your level", String(lv)],
            ["Your XP", String(xp)],
          ].map(([label, value]) => (
            <div key={label}>
              <p className="text-2xl font-extrabold">{value}</p>
              <p className={`text-xs ${c.muted}`}>{label}</p>
            </div>
          ))}
        </section>

        <div className="grid gap-6 md:grid-cols-2">
          <section className={`rounded-xl border p-4 ${c.card}`}>
            <h2 className="mb-3 font-semibold">Average Student Performance</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={PERFORMANCE}>
                  <CartesianGrid stroke={c.grid} strokeDasharray="3 3" />
                  <XAxis dataKey="month" stroke={dark ? "#94a3b8" : "#78716c"} />
                  <YAxis domain={[50, 100]} stroke={dark ? "#94a3b8" : "#78716c"} />
                  <Tooltip contentStyle={tip} />
                  <Line type="monotone" dataKey="score" stroke={c.accent} strokeWidth={3} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </section>
          <section className={`rounded-xl border p-4 ${c.card}`}>
            <h2 className="mb-3 font-semibold">Weekly Attendance</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ATTENDANCE}>
                  <CartesianGrid stroke={c.grid} strokeDasharray="3 3" />
                  <XAxis dataKey="day" stroke={dark ? "#94a3b8" : "#78716c"} />
                  <YAxis stroke={dark ? "#94a3b8" : "#78716c"} />
                  <Tooltip contentStyle={tip} />
                  <Bar dataKey="present" fill={c.accent} radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>
        </div>

        <section className={`overflow-x-auto rounded-xl border ${c.card}`}>
          <h2 className="p-4 font-semibold">Student Roster</h2>
          <table className="w-full text-left text-sm">
            <thead className={c.head}>
              {table.getHeaderGroups().map((g) => (
                <tr key={g.id}>
                  {g.headers.map((h) => (
                    <th
                      key={h.id}
                      className="cursor-pointer select-none px-4 py-2 font-semibold"
                      onClick={h.column.getToggleSortingHandler()}
                    >
                      {flexRender(h.column.columnDef.header, h.getContext())}
                      {{ asc: " ↑", desc: " ↓" }[h.column.getIsSorted() as string] ?? ""}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((r) => (
                <tr key={r.id} className={`border-t ${c.line}`}>
                  {r.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-2">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  );
}

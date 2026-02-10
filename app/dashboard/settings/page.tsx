"use client";

import { useEffect, useState } from "react";
import { authFetch } from "@/utils/api";
import { formatCurrency } from "@/utils/currency";

interface ExpenseRule {
  id: string;
  type: "GATEWAY_FEE" | "COD_FEE" | "PACKAGING_FEE" | string;
  name: string;
  value: number;
  valueType: "PERCENT" | "FIXED";
  effectiveFrom: string;
  effectiveTo?: string | null;
}

export default function SettingsPage() {
  const [rules, setRules] = useState<ExpenseRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [editing, setEditing] = useState<Partial<ExpenseRule> | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await authFetch("/finance/expense-rules").catch(() => ({ rules: [] }));
      setRules(Array.isArray((res as { rules?: ExpenseRule[] }).rules) ? (res as { rules: ExpenseRule[] }).rules : []);
    } catch {
      setRules([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleSave = async () => {
    if (!editing?.id && !editing?.type) return;
    setSaving(true);
    setMessage(null);
    try {
      if (editing.id) {
        await authFetch(`/finance/expense-rules/${editing.id}`, {
          method: "PATCH",
          body: JSON.stringify({
            value: editing.value,
            valueType: editing.valueType,
            effectiveFrom: editing.effectiveFrom,
            effectiveTo: editing.effectiveTo || null,
          }),
        });
        setMessage({ type: "success", text: "Rule updated." });
      } else {
        await authFetch("/finance/expense-rules", {
          method: "POST",
          body: JSON.stringify({
            type: editing.type,
            name: editing.name,
            value: editing.value,
            valueType: editing.valueType ?? "FIXED",
            effectiveFrom: editing.effectiveFrom,
            effectiveTo: editing.effectiveTo || null,
          }),
        });
        setMessage({ type: "success", text: "Rule created." });
      }
      setEditing(null);
      await load();
    } catch (err: unknown) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Failed to save." });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="text-slate-500">Loading expense rules…</div>
      </div>
    );
  }

  const typeLabels: Record<string, string> = {
    GATEWAY_FEE: "Gateway fee",
    COD_FEE: "COD fee",
    PACKAGING_FEE: "Packaging fee",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="mt-1 text-sm text-slate-600">Expense rules: gateway, COD, packaging (date-based)</p>
      </div>

      {message && (
        <div className={`rounded-lg p-4 text-sm ${message.type === "success" ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"}`}>
          {message.text}
        </div>
      )}

      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Expense rules</h2>
          <button
            type="button"
            onClick={() => setEditing({ type: "GATEWAY_FEE", name: "Gateway fee", value: 0, valueType: "PERCENT", effectiveFrom: new Date().toISOString().slice(0, 10) })}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            + Add rule
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left py-3 px-6 font-semibold text-slate-700">Type</th>
                <th className="text-left py-3 px-6 font-semibold text-slate-700">Name</th>
                <th className="text-right py-3 px-6 font-semibold text-slate-700">Value</th>
                <th className="text-left py-3 px-6 font-semibold text-slate-700">From</th>
                <th className="text-left py-3 px-6 font-semibold text-slate-700">To</th>
                <th className="text-center py-3 px-6 font-semibold text-slate-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rules.map((r) => (
                <tr key={r.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-3 px-6 text-slate-900">{typeLabels[r.type] ?? r.type}</td>
                  <td className="py-3 px-6 text-slate-900">{r.name}</td>
                  <td className="py-3 px-6 text-right font-medium text-slate-900">
                    {r.valueType === "PERCENT" ? `${r.value}%` : formatCurrency(r.value)}
                  </td>
                  <td className="py-3 px-6 text-slate-600">{r.effectiveFrom ? new Date(r.effectiveFrom).toLocaleDateString() : "—"}</td>
                  <td className="py-3 px-6 text-slate-600">{r.effectiveTo ? new Date(r.effectiveTo).toLocaleDateString() : "—"}</td>
                  <td className="py-3 px-6 text-center">
                    <button
                      type="button"
                      onClick={() => setEditing({ ...r })}
                      className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
              {rules.length === 0 && !editing && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">No rules. Add a rule to get started.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit / Create modal */}
      {editing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-slate-900">{editing.id ? "Edit rule" : "New rule"}</h3>
            <div className="mt-4 space-y-4">
              {!editing.id && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Type</label>
                    <select
                      value={editing.type ?? ""}
                      onChange={(e) => setEditing((prev) => ({ ...prev, type: e.target.value }))}
                      className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    >
                      {Object.entries(typeLabels).map(([k, v]) => (
                        <option key={k} value={k}>{v}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Name</label>
                    <input
                      type="text"
                      value={editing.name ?? ""}
                      onChange={(e) => setEditing((prev) => ({ ...prev, name: e.target.value }))}
                      className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    />
                  </div>
                </>
              )}
              <div>
                <label className="block text-sm font-medium text-slate-700">Value type</label>
                <select
                  value={editing.valueType ?? "FIXED"}
                  onChange={(e) => setEditing((prev) => ({ ...prev, valueType: e.target.value as "PERCENT" | "FIXED" }))}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                >
                  <option value="FIXED">Fixed amount</option>
                  <option value="PERCENT">Percent</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Value</label>
                <input
                  type="number"
                  step={editing.valueType === "PERCENT" ? 0.01 : 1}
                  value={editing.value ?? 0}
                  onChange={(e) => setEditing((prev) => ({ ...prev, value: Number(e.target.value) }))}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Effective from (date)</label>
                <input
                  type="date"
                  value={editing.effectiveFrom?.slice(0, 10) ?? ""}
                  onChange={(e) => setEditing((prev) => ({ ...prev, effectiveFrom: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Effective to (optional)</label>
                <input
                  type="date"
                  value={editing.effectiveTo?.slice(0, 10) ?? ""}
                  onChange={(e) => setEditing((prev) => ({ ...prev, effectiveTo: e.target.value || null }))}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
            </div>
            <div className="mt-6 flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

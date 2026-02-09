"use client";

import { useEffect, useState } from "react";
import { authFetch } from "@/utils/api";
import { formatCurrency } from "@/utils/currency";

interface Expense {
  id: string;
  orderId: string;
  category: string;
  description: string;
  amount: number;
  createdAt: string;
  updatedAt: string;
}

interface ExpenseEditorProps {
  expense: Expense;
  onSave: (updatedExpense: Partial<Expense>) => void;
  onCancel: () => void;
  onDelete?: () => void;
}

export default function ExpenseEditor({ expense, onSave, onCancel, onDelete }: ExpenseEditorProps) {
  const [editingExpense, setEditingExpense] = useState<Expense>(expense);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const categories = [
    "Shipping",
    "Packaging", 
    "Marketing",
    "Platform Fees",
    "Payment Processing",
    "Returns",
    "Customer Service",
    "Other"
  ];

  const handleSave = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await authFetch(`/api/finance/expense/${editingExpense.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          category: editingExpense.category,
          description: editingExpense.description,
          amount: editingExpense.amount,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update expense");
      }

      onSave(editingExpense);
    } catch (err: any) {
      setError(err.message || "Failed to save expense");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    
    if (!confirm("Are you sure you want to delete this expense?")) return;

    setLoading(true);
    setError(null);

    try {
      const response = await authFetch(`/api/finance/expense/${editingExpense.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete expense");
      }

      onDelete();
    } catch (err: any) {
      setError(err.message || "Failed to delete expense");
    } finally {
      setLoading(false);
    }
  };

  const handleAmountChange = (value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 0) {
      setEditingExpense({ ...editingExpense, amount: numValue });
    }
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900">Edit Expense</h3>
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors"
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Category
          </label>
          <select
            value={editingExpense.category}
            onChange={(e) => setEditingExpense({ ...editingExpense, category: e.target.value })}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Amount
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500">
              $
            </span>
            <input
              type="text"
              value={editingExpense.amount}
              onChange={(e) => handleAmountChange(e.target.value)}
              className="w-full rounded-lg border border-slate-300 pl-8 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0.00"
              step="0.01"
              min="0"
            />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Description
        </label>
        <textarea
          value={editingExpense.description}
          onChange={(e) => setEditingExpense({ ...editingExpense, description: e.target.value })}
          rows={3}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          placeholder="Enter expense description..."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-500">
        <div>
          <span className="font-medium">Order ID:</span> {editingExpense.orderId.slice(0, 8)}
        </div>
        <div>
          <span className="font-medium">Created:</span> {new Date(editingExpense.createdAt).toLocaleDateString()}
        </div>
      </div>

      {onDelete && (
        <div className="pt-4 border-t border-slate-200">
          <button
            onClick={handleDelete}
            disabled={loading}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors"
          >
            {loading ? "Deleting..." : "Delete Expense"}
          </button>
        </div>
      )}
    </div>
  );
}

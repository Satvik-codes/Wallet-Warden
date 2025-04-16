import { useState } from "react";
import { PlusCircle } from "lucide-react";
import { toast } from "sonner";

import { useFinance } from "@/contexts/finance-context";
import BudgetForm from "@/components/budgets/budget-form";
import BudgetComparison, { BudgetItem } from "@/components/budgets/budget-comparison";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2 } from "lucide-react";

// Sample budget data
const sampleBudgets: BudgetItem[] = [
  {
    id: "1",
    category: "food",
    amount: 500,
    spent: 420.75,
  },
  {
    id: "2",
    category: "rent",
    amount: 1500,
    spent: 1500,
  },
  {
    id: "3",
    category: "utilities",
    amount: 200,
    spent: 185.50,
  },
  {
    id: "4",
    category: "entertainment",
    amount: 150,
    spent: 210.25,
  },
  {
    id: "5",
    category: "transportation",
    amount: 300,
    spent: 275.40,
  },
];

// Map for category colors
const categoryColors: Record<string, string> = {
  food: "bg-yellow-500",
  rent: "bg-blue-500",
  utilities: "bg-green-500",
  entertainment: "bg-purple-500",
  transportation: "bg-red-500",
  health: "bg-emerald-500",
  shopping: "bg-pink-500",
  other: "bg-gray-500",
};

const getCategoryColor = (category: string = "other") => {
  return categoryColors[category] || "bg-gray-500";
};

const BudgetsPage = () => {
  const { budgets, addBudget, updateBudget, deleteBudget, resetAll } = useFinance();
  const [editingBudget, setEditingBudget] = useState<BudgetItem | null>(null);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleAddBudget = (data: any) => {
    // Check if budget for this category already exists
    const existingBudget = budgets.find(b => b.category === data.category);
    
    if (existingBudget) {
      toast.error("Budget for this category already exists");
      return;
    }

    const newBudget: BudgetItem = {
      id: Date.now().toString(),
      category: data.category,
      amount: Number(data.amount),
      spent: 0, // New budget starts with 0 spent
    };

    addBudget(newBudget);
    setIsFormVisible(false);
    toast.success("Budget added successfully");
  };

  const handleEditBudget = (budget: BudgetItem) => {
    setEditingBudget(budget);
    setIsFormVisible(true);
  };

  const handleUpdateBudget = (data: any) => {
    if (!editingBudget) return;

    const updatedBudget: BudgetItem = {
      ...editingBudget,
      amount: Number(data.amount),
      category: data.category,
    };

    updateBudget(updatedBudget);
    setEditingBudget(null);
    setIsFormVisible(false);
    toast.success("Budget updated successfully");
  };

  const handleDeleteBudget = () => {
    if (deleteId) {
      deleteBudget(deleteId);
      setDeleteId(null);
      toast.success("Budget deleted successfully");
    }
  };

  const handleCancelEdit = () => {
    setEditingBudget(null);
    setIsFormVisible(false);
  };

  const handleResetAll = () => {
    resetAll();
    toast.success("All data has been reset");
  };

  // Calculate total budget and spending
  const totalBudget = budgets.reduce((sum, item) => sum + item.amount, 0);
  const totalSpent = budgets.reduce((sum, item) => sum + item.spent, 0);
  const percentUsed = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Budgets</h2>
        <Button onClick={() => setIsFormVisible(!isFormVisible)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Budget
        </Button>
      </div>

      {/* Budget Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle>Budget Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Total Budget</p>
              <p className="text-2xl font-bold">₹{totalBudget.toFixed(2)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Total Spent</p>
              <p className="text-2xl font-bold">₹{totalSpent.toFixed(2)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Budget Used</p>
              <p className="text-2xl font-bold">{percentUsed.toFixed(1)}%</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Budget Form (conditional) */}
      {isFormVisible && (
        <div className="mb-6">
          <BudgetForm
            onSubmit={editingBudget ? handleUpdateBudget : handleAddBudget}
            defaultValues={
              editingBudget
                ? {
                    category: editingBudget.category,
                    amount: editingBudget.amount.toString(),
                  }
                : undefined
            }
            isEditing={!!editingBudget}
            onCancel={handleCancelEdit}
          />
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Budget Allocation Table */}
        <Card>
          <CardHeader>
            <CardTitle>Budget Allocations</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Budget</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {budgets.map((budget) => (
                  <TableRow key={budget.id}>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`text-white ${getCategoryColor(budget.category)}`}
                      >
                        {budget.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      ₹{budget.amount.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditBudget(budget)}
                        >
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setDeleteId(budget.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Delete</span>
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Budget</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this budget? This
                                action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel onClick={() => setDeleteId(null)}>
                                Cancel
                              </AlertDialogCancel>
                              <AlertDialogAction onClick={handleDeleteBudget}>
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Budget vs. Actual Comparison */}
        <BudgetComparison budgets={budgets} />
      </div>
    </div>
  );
};

export default BudgetsPage;

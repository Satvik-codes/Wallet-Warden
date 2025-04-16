
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface BudgetItem {
  id: string;
  category: string;
  amount: number;
  spent: number;
}

interface BudgetComparisonProps {
  budgets: BudgetItem[];
}

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

// Function to determine budget status and color
const getBudgetStatus = (spent: number, budget: number) => {
  const percentage = (spent / budget) * 100;
  
  if (percentage >= 100) {
    return {
      status: "Over Budget",
      color: "bg-red-500",
      icon: AlertTriangle,
      progressColor: "bg-red-500",
    };
  } else if (percentage >= 80) {
    return {
      status: "Warning",
      color: "bg-yellow-500",
      icon: AlertTriangle,
      progressColor: "bg-yellow-500",
    };
  } else {
    return {
      status: "On Track",
      color: "bg-green-500",
      icon: CheckCircle2,
      progressColor: "bg-green-500",
    };
  }
};

const BudgetComparison = ({ budgets }: BudgetComparisonProps) => {
  if (budgets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <div className="rounded-full bg-primary/10 p-3 mb-4">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <h3 className="text-lg font-medium">No budgets yet</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Start by adding a budget for each spending category.
        </p>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Budget vs. Actual</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {budgets.map((budget) => {
            const percentage = Math.min(
              Math.round((budget.spent / budget.amount) * 100),
              100
            );
            const { status, color, icon: Icon, progressColor } = getBudgetStatus(
              budget.spent,
              budget.amount
            );

            return (
              <div key={budget.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-white",
                        getCategoryColor(budget.category)
                      )}
                    >
                      {budget.category}
                    </Badge>
                    <span className="text-sm font-medium">
                      ₹{budget.spent.toFixed(2)} of ₹{budget.amount.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Icon className={`h-4 w-4 text-${color}`} />
                    <span
                      className={`text-xs font-medium text-${color}`}
                    >
                      {status}
                    </span>
                  </div>
                </div>
                <Progress
                  value={percentage}
                  className={`h-2 ${progressColor}`}
                />
                {budget.spent > budget.amount && (
                  <p className="text-xs text-red-500">
                    You've exceeded your {budget.category} budget by ₹
                    {(budget.spent - budget.amount).toFixed(2)}
                  </p>
                )}
                {budget.spent <= budget.amount && budget.spent >= budget.amount * 0.8 && (
                  <p className="text-xs text-yellow-500">
                    You're close to your {budget.category} budget limit
                  </p>
                )}
                {budget.spent < budget.amount * 0.8 && (
                  <p className="text-xs text-green-500">
                    You're on track with your {budget.category} budget
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default BudgetComparison;

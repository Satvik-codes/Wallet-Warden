import { useState, useEffect } from "react";
import { DollarSign, TrendingUp, Receipt, CalendarClock, RefreshCw } from "lucide-react";
import { toast } from "sonner";

import { useFinance } from "@/contexts/finance-context";
import SummaryCard from "@/components/dashboard/summary-card";
import BarChart, { BarChartData } from "@/components/charts/bar-chart";
import PieChart from "@/components/charts/pie-chart";
import TransactionForm from "@/components/transactions/transaction-form";
import { Transaction } from "@/components/transactions/transaction-list";
import { Button } from "@/components/ui/button";

const Dashboard = () => {
  const { 
    transactions, 
    addTransaction, 
    resetAll,
    calculateTotalExpenses,
    findTopSpendingCategory,
    calculateDailyAverage,
    getRecentTransaction
  } = useFinance();
  const [monthlyData, setMonthlyData] = useState<BarChartData[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);

  // Generate category data from transactions
  const generateCategoryData = (transactions: Transaction[]): any[] => {
    // Group by category and sum amounts
    const categoryMap = transactions.reduce((acc, transaction) => {
      const category = transaction.category || "other";
      if (!acc[category]) {
        acc[category] = 0;
      }
      acc[category] += transaction.amount;
      return acc;
    }, {} as Record<string, number>);

    // Convert to array of objects with name and value
    return Object.entries(categoryMap).map(([name, value]) => ({
      name,
      value,
    }));
  };

  // Generate monthly data from transactions
  const generateMonthlyData = (transactions: Transaction[]): BarChartData[] => {
    if (transactions.length === 0) {
      // Return empty months with zero values if no transactions
      return [
        { name: "Jan", value: 0 },
        { name: "Feb", value: 0 },
        { name: "Mar", value: 0 },
        { name: "Apr", value: 0 },
        { name: "May", value: 0 },
        { name: "Jun", value: 0 },
      ];
    }

    // Create a map to store monthly totals
    const monthlyTotals: Record<string, number> = {
      "Jan": 0, "Feb": 0, "Mar": 0, "Apr": 0, "May": 0, "Jun": 0,
      "Jul": 0, "Aug": 0, "Sep": 0, "Oct": 0, "Nov": 0, "Dec": 0
    };

    // Accumulate transactions by month
    transactions.forEach((transaction) => {
      const date = new Date(transaction.date);
      const month = date.toLocaleString('default', { month: 'short' });
      monthlyTotals[month] += transaction.amount;
    });

    // Convert to array format needed for chart
    return Object.entries(monthlyTotals).map(([name, value]) => ({
      name,
      value,
    }));
  };

  useEffect(() => {
    // Update charts whenever transactions change
    setMonthlyData(generateMonthlyData(transactions));
    setCategoryData(generateCategoryData(transactions));
  }, [transactions]);

  const handleAddTransaction = (data: any) => {
    const newTransaction: Transaction = {
      id: Date.now().toString(), // Simple ID generation
      amount: Number(data.amount),
      description: data.description,
      date: data.date,
      category: data.category,
    };

    addTransaction(newTransaction);
    toast.success("Transaction added successfully");
  };

  const handleResetAll = () => {
    resetAll();
    toast.success("All data has been reset");
  };

  const totalExpenses = calculateTotalExpenses();
  const topCategory = findTopSpendingCategory();
  const dailyAverage = calculateDailyAverage();
  const recentTransaction = getRecentTransaction();

  return (
    <div className="space-y-6">
      {/* Reset Button */}
      <div className="flex justify-end">
        
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          title="Total Expenses"
          value={totalExpenses}
          icon={DollarSign}
          iconClassName="bg-cyan/10 text-[hsl(var(--cyan))]"
          trend="up"
          trendValue="12% from last month"
        />
        
        <SummaryCard
          title="Top Spending"
          value={topCategory}
          icon={TrendingUp}
          iconClassName="bg-magenta/10 text-[hsl(var(--magenta))]"
          description="Highest expense category"
        />
        
        <SummaryCard
          title="Recent Transaction"
          value={recentTransaction ? recentTransaction.amount : 0}
          icon={Receipt}
          iconClassName="bg-info/10 text-[hsl(var(--info))]"
          description={recentTransaction ? recentTransaction.description : "No transactions"}
        />
        
        <SummaryCard
          title="Daily Average"
          value={dailyAverage}
          icon={CalendarClock}
          iconClassName="bg-success/10 text-[hsl(var(--success))]"
          description="Average daily spending"
        />
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 md:grid-cols-2">
        <BarChart
          title="Monthly Expenses"
          data={monthlyData}
          xAxisLabel="Month"
          yAxisLabel="Amount (₹)"
          color="hsl(var(--cyan))"
        />
        
        <PieChart
          title="Spending by Category"
          data={categoryData}
          colors={[
            "hsl(var(--cyan))",
            "hsl(var(--magenta))",
            "hsl(var(--success))",
            "hsl(var(--warning))",
            "hsl(var(--info))",
            "hsl(var(--accent))",
          ]}
        />
      </div>

      {/* Transaction Form */}
      <div className="mt-6">
        <TransactionForm onSubmit={handleAddTransaction} />
      </div>
    </div>
  );
};

export default Dashboard;

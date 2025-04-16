
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calendar, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import BarChart, { BarChartData } from "@/components/charts/bar-chart";
import PieChart from "@/components/charts/pie-chart";
import { cn } from "@/lib/utils";
import { useFinance } from "@/contexts/finance-context";
import { Transaction } from "@/components/transactions/transaction-list";

// Time period options
const timePeriods = [
  { value: "week", label: "This Week" },
  { value: "month", label: "This Month" },
  { value: "quarter", label: "This Quarter" },
  { value: "year", label: "This Year" },
  { value: "custom", label: "Custom Range" },
];

const ReportsPage = () => {
  const [timePeriod, setTimePeriod] = useState("month");
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined,
  });

  // Financial data
  const [monthlyExpenses, setMonthlyExpenses] = useState<BarChartData[]>([]);
  const [categoryExpenses, setCategoryExpenses] = useState<BarChartData[]>([]);
  const [weeklyExpenses, setWeeklyExpenses] = useState<BarChartData[]>([]);
  const [insights, setInsights] = useState<string[]>([]);
  
  const { transactions, budgets, calculateDailyAverage } = useFinance();

  useEffect(() => {
    if (transactions.length === 0) {
      // No transactions, set empty data
      setMonthlyExpenses([]);
      setCategoryExpenses([]);
      setWeeklyExpenses([]);
      setInsights([
        "No transaction data available. Add some transactions to see insights.",
        "Set up budgets to track your spending against targets.",
      ]);
      return;
    }

    // Process transactions to generate reports
    processTransactions();
  }, [transactions, budgets, timePeriod, dateRange]);

  const processTransactions = () => {
    // Filter transactions based on selected time period
    let filteredTransactions: Transaction[] = [];
    const now = new Date();
    
    if (timePeriod === "custom" && dateRange.from) {
      // Custom date range
      filteredTransactions = transactions.filter(t => {
        const transactionDate = new Date(t.date);
        if (dateRange.from && dateRange.to) {
          return transactionDate >= dateRange.from && transactionDate <= dateRange.to;
        } else if (dateRange.from) {
          return transactionDate >= dateRange.from;
        }
        return true;
      });
    } else if (timePeriod === "week") {
      // Current week
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      filteredTransactions = transactions.filter(t => new Date(t.date) >= startOfWeek);
    } else if (timePeriod === "month") {
      // Current month
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      filteredTransactions = transactions.filter(t => new Date(t.date) >= startOfMonth);
    } else if (timePeriod === "quarter") {
      // Current quarter
      const quarterMonth = Math.floor(now.getMonth() / 3) * 3;
      const startOfQuarter = new Date(now.getFullYear(), quarterMonth, 1);
      filteredTransactions = transactions.filter(t => new Date(t.date) >= startOfQuarter);
    } else if (timePeriod === "year") {
      // Current year
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      filteredTransactions = transactions.filter(t => new Date(t.date) >= startOfYear);
    }

    // Process monthly expenses
    const monthData: Record<string, number> = {};
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    filteredTransactions.forEach(t => {
      const date = new Date(t.date);
      const monthKey = months[date.getMonth()];
      if (!monthData[monthKey]) {
        monthData[monthKey] = 0;
      }
      monthData[monthKey] += t.amount;
    });

    const monthlyData: BarChartData[] = Object.keys(monthData).map(month => ({
      name: month,
      value: monthData[month]
    }));
    
    setMonthlyExpenses(monthlyData.length ? monthlyData : []);

    // Process category expenses
    const categoryData: Record<string, number> = {};
    
    filteredTransactions.forEach(t => {
      const category = t.category || "Other";
      if (!categoryData[category]) {
        categoryData[category] = 0;
      }
      categoryData[category] += t.amount;
    });

    const categoryData2: BarChartData[] = Object.keys(categoryData).map(category => ({
      name: category,
      value: categoryData[category]
    }));
    
    setCategoryExpenses(categoryData2.length ? categoryData2 : []);

    // Process weekly expenses if in week view
    if (timePeriod === "week") {
      const weekData: Record<string, number> = {
        "Mon": 0, "Tue": 0, "Wed": 0, "Thu": 0, "Fri": 0, "Sat": 0, "Sun": 0
      };
      
      const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      
      filteredTransactions.forEach(t => {
        const date = new Date(t.date);
        const dayKey = dayNames[date.getDay()];
        weekData[dayKey] += t.amount;
      });

      const weeklyData: BarChartData[] = Object.keys(weekData)
        .filter(day => ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].includes(day))
        .map(day => ({
          name: day,
          value: weekData[day]
        }));
      
      setWeeklyExpenses(weeklyData);
    }

    // Generate insights based on data
    generateInsights(filteredTransactions, categoryData);
  };

  const generateInsights = (filteredTransactions: Transaction[], categoryData: Record<string, number>) => {
    const newInsights: string[] = [];
    
    // Check if we have data to generate insights
    if (filteredTransactions.length === 0) {
      newInsights.push("No transaction data available for the selected period.");
      setInsights(newInsights);
      return;
    }

    // Top spending category
    let topCategory = "";
    let topAmount = 0;
    
    Object.entries(categoryData).forEach(([category, amount]) => {
      if (amount > topAmount) {
        topAmount = amount;
        topCategory = category;
      }
    });
    
    if (topCategory) {
      const percentage = Math.round((topAmount / filteredTransactions.reduce((sum, t) => sum + t.amount, 0)) * 100);
      newInsights.push(`Your highest spending category is ${topCategory} at ${percentage}% of total expenses.`);
    }

    // Daily average
    const dailyAvg = calculateDailyAverage();
    if (dailyAvg > 0) {
      newInsights.push(`Your daily average spending is ₹${dailyAvg.toFixed(2)}.`);
    }

    // Budget insights
    if (budgets.length > 0) {
      budgets.forEach(budget => {
        const categorySpent = categoryData[budget.category] || 0;
        const budgetAmount = budget.amount;
        
        if (categorySpent > budgetAmount) {
          const overAmount = categorySpent - budgetAmount;
          newInsights.push(`You've exceeded your ${budget.category} budget by ₹${overAmount.toFixed(2)}.`);
        } else if (categorySpent > 0) {
          const remainingPercentage = Math.round(((budgetAmount - categorySpent) / budgetAmount) * 100);
          newInsights.push(`You're on track with your ${budget.category} budget with ${remainingPercentage}% remaining.`);
        }
      });
    }

    // Set insights or default message
    setInsights(newInsights.length > 0 ? newInsights : ["Start adding transactions and budgets to see financial insights."]);
  };

  const renderNoDataMessage = () => (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <AlertTriangle className="h-12 w-12 text-yellow-500 mb-4" />
      <h3 className="text-lg font-medium mb-2">No data available</h3>
      <p className="text-muted-foreground max-w-md">
        There are no transactions recorded for the selected time period. Add some transactions to see reports and insights.
      </p>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Reports</h2>
        
        <div className="flex items-center gap-3">
          <Select
            value={timePeriod}
            onValueChange={setTimePeriod}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time period" />
            </SelectTrigger>
            <SelectContent>
              {timePeriods.map((period) => (
                <SelectItem key={period.value} value={period.value}>
                  {period.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {timePeriod === "custom" && (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {dateRange.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "LLL dd")} -{" "}
                          {format(dateRange.to, "LLL dd")}
                        </>
                      ) : (
                        format(dateRange.from, "LLL dd")
                      )
                    ) : (
                      "Pick a date"
                    )}
                  </span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <CalendarComponent
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange.from}
                  selected={dateRange}
                  onSelect={setDateRange as any}
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          )}
        </div>
      </div>

      <Tabs defaultValue="expense-trends" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="expense-trends">Expense Trends</TabsTrigger>
          <TabsTrigger value="category-breakdown">Category Breakdown</TabsTrigger>
          <TabsTrigger value="budget-performance">Budget Performance</TabsTrigger>
        </TabsList>
        
        <TabsContent value="expense-trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Expense Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              {(timePeriod === "week" ? weeklyExpenses : monthlyExpenses).length > 0 ? (
                <BarChart
                  title=""
                  data={timePeriod === "week" ? weeklyExpenses : monthlyExpenses}
                  xAxisLabel={timePeriod === "week" ? "Day" : "Month"}
                  yAxisLabel="Amount (₹)"
                  color="hsl(var(--cyan))"
                />
              ) : renderNoDataMessage()}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Spending Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {insights.slice(0, 3).map((insight, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <div className="rounded-full h-2 w-2 mt-2 bg-cyan" />
                    <p>{insight}</p>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="category-breakdown" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Spending by Category</CardTitle>
              </CardHeader>
              <CardContent>
                {categoryExpenses.length > 0 ? (
                  <PieChart
                    title=""
                    data={categoryExpenses}
                    colors={[
                      "hsl(var(--cyan))",
                      "hsl(var(--magenta))",
                      "hsl(var(--success))",
                      "hsl(var(--warning))",
                      "hsl(var(--info))",
                      "hsl(var(--accent))",
                      "#8B5CF6",
                      "#A3A3A3",
                    ]}
                  />
                ) : renderNoDataMessage()}
              </CardContent>
            </Card>
            
            {categoryExpenses.length > 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle>Category Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {categoryExpenses.slice(0, 4).map((category) => (
                      <div key={category.name} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{category.name}</span>
                          <span className="text-sm">₹{category.value.toFixed(2)}</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                          <div 
                            className={cn(
                              "h-full rounded-full",
                              category.name === "Food" ? "bg-yellow-500" :
                              category.name === "Rent" ? "bg-blue-500" :
                              category.name === "Utilities" ? "bg-green-500" :
                              "bg-purple-500"
                            )}
                            style={{ 
                              width: `${(category.value / Math.max(...categoryExpenses.map(c => c.value), 1)) * 100}%` 
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : null}
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Category Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {insights.filter(insight => insight.includes("category") || insight.includes("Category")).slice(0, 2).map((insight, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <div className="rounded-full h-2 w-2 mt-2 bg-magenta" />
                    <p>{insight}</p>
                  </li>
                ))}
                {insights.filter(insight => insight.includes("category") || insight.includes("Category")).length === 0 && (
                  <li className="flex items-start gap-2">
                    <div className="rounded-full h-2 w-2 mt-2 bg-magenta" />
                    <p>Add transactions to different categories to see insights here.</p>
                  </li>
                )}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="budget-performance" className="space-y-6">
          {budgets.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Budget vs. Actual</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {budgets.map((budget) => {
                    const spent = budget.spent || 0;
                    const percentUsed = (spent / budget.amount) * 100;
                    const isOverBudget = percentUsed > 100;
                    
                    return (
                      <div key={budget.id} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{budget.category}</span>
                          <span className="text-sm">₹{spent.toFixed(2)} / ₹{budget.amount.toFixed(2)}</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                          <div 
                            className={cn(
                              "h-full rounded-full",
                              isOverBudget ? "bg-red-500" :
                              percentUsed > 80 ? "bg-yellow-500" : "bg-green-500"
                            )}
                            style={{ width: `${Math.min(percentUsed, 100)}%` }}
                          />
                        </div>
                        <p className={cn(
                          "text-xs",
                          isOverBudget ? "text-red-500" :
                          percentUsed > 80 ? "text-yellow-500" : "text-green-500"
                        )}>
                          {isOverBudget 
                            ? `Over budget by ₹${(spent - budget.amount).toFixed(2)}` 
                            : `${(100 - percentUsed).toFixed(0)}% remaining`}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Budget Performance</CardTitle>
              </CardHeader>
              <CardContent>
                {renderNoDataMessage()}
              </CardContent>
            </Card>
          )}
          
          <Card>
            <CardHeader>
              <CardTitle>Budget Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {insights.filter(insight => insight.includes("budget") || insight.includes("Budget")).map((insight, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <div className={cn(
                      "rounded-full h-2 w-2 mt-2",
                      insight.includes("exceeded") ? "bg-red-500" : "bg-green-500"
                    )} />
                    <p>{insight}</p>
                  </li>
                ))}
                {insights.filter(insight => insight.includes("budget") || insight.includes("Budget")).length === 0 && (
                  <li className="flex items-start gap-2">
                    <div className="rounded-full h-2 w-2 mt-2 bg-yellow-500" />
                    <p>Create budgets to see budget performance alerts here.</p>
                  </li>
                )}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReportsPage;


import { createContext, useContext, useEffect, useState } from "react";
import { Transaction } from "@/components/transactions/transaction-list";
import { BudgetItem } from "@/components/budgets/budget-comparison";

interface FinanceContextType {
  transactions: Transaction[];
  budgets: BudgetItem[];
  addTransaction: (transaction: Transaction) => void;
  updateTransaction: (transaction: Transaction) => void;
  deleteTransaction: (id: string) => void;
  addBudget: (budget: BudgetItem) => void;
  updateBudget: (budget: BudgetItem) => void;
  deleteBudget: (id: string) => void;
  resetAll: () => void;
  calculateTotalExpenses: () => number;
  findTopSpendingCategory: () => string;
  calculateDailyAverage: () => number;
  getRecentTransaction: () => Transaction | null;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

// Initial empty state
const initialTransactions: Transaction[] = [];
const initialBudgets: BudgetItem[] = [];

export const FinanceProvider = ({ children }: { children: React.ReactNode }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<BudgetItem[]>([]);

  // Load data from localStorage on init
  useEffect(() => {
    const storedTransactions = localStorage.getItem("transactions");
    const storedBudgets = localStorage.getItem("budgets");
    
    if (storedTransactions) {
      try {
        const parsedTransactions = JSON.parse(storedTransactions);
        // Convert string dates back to Date objects
        const formattedTransactions = parsedTransactions.map((t: any) => ({
          ...t,
          date: new Date(t.date)
        }));
        setTransactions(formattedTransactions);
      } catch (e) {
        console.error("Error parsing transactions:", e);
        setTransactions(initialTransactions);
      }
    }
    
    if (storedBudgets) {
      try {
        setBudgets(JSON.parse(storedBudgets));
      } catch (e) {
        console.error("Error parsing budgets:", e);
        setBudgets(initialBudgets);
      }
    }
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem("transactions", JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem("budgets", JSON.stringify(budgets));
  }, [budgets]);

  const addTransaction = (transaction: Transaction) => {
    setTransactions(prev => [...prev, transaction]);
  };

  const updateTransaction = (transaction: Transaction) => {
    setTransactions(prev => 
      prev.map(t => t.id === transaction.id ? transaction : t)
    );
  };

  const deleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const addBudget = (budget: BudgetItem) => {
    setBudgets(prev => [...prev, budget]);
  };

  const updateBudget = (budget: BudgetItem) => {
    setBudgets(prev => 
      prev.map(b => b.id === budget.id ? budget : b)
    );
  };

  const deleteBudget = (id: string) => {
    setBudgets(prev => prev.filter(b => b.id !== id));
  };

  const resetAll = () => {
    setTransactions([]);
    setBudgets([]);
    localStorage.removeItem("transactions");
    localStorage.removeItem("budgets");
  };

  // Calculate functions for dashboard
  const calculateTotalExpenses = () => {
    return transactions.reduce((total, transaction) => total + transaction.amount, 0);
  };

  const findTopSpendingCategory = () => {
    const categoryMap = transactions.reduce((acc, transaction) => {
      const category = transaction.category || "other";
      if (!acc[category]) {
        acc[category] = 0;
      }
      acc[category] += transaction.amount;
      return acc;
    }, {} as Record<string, number>);

    let topCategory = "none";
    let maxAmount = 0;

    Object.entries(categoryMap).forEach(([category, amount]) => {
      if (amount > maxAmount) {
        maxAmount = amount;
        topCategory = category;
      }
    });

    return topCategory;
  };

  const calculateDailyAverage = () => {
    const total = calculateTotalExpenses();
    // If no transactions, return 0
    if (transactions.length === 0) return 0;
    
    // Calculate based on actual date range
    if (transactions.length <= 1) return total;
    
    // Sort transactions by date
    const sortedTransactions = [...transactions].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    const firstDate = new Date(sortedTransactions[0].date).getTime();
    const lastDate = new Date(sortedTransactions[sortedTransactions.length - 1].date).getTime();
    
    // Calculate days difference
    const daysDiff = Math.max(1, Math.ceil((lastDate - firstDate) / (1000 * 60 * 60 * 24)));
    
    return total / daysDiff;
  };

  const getRecentTransaction = () => {
    if (transactions.length === 0) return null;
    
    // Find most recent transaction
    return transactions.reduce((latest, current) => {
      return new Date(current.date) > new Date(latest.date) ? current : latest;
    }, transactions[0]);
  };

  // Update spent amount in budgets based on transactions
  useEffect(() => {
    // Only run if we have both transactions and budgets
    if (transactions.length > 0 && budgets.length > 0) {
      const updatedBudgets = budgets.map(budget => {
        // Calculate spent amount for this category
        const spent = transactions
          .filter(t => t.category === budget.category)
          .reduce((sum, t) => sum + t.amount, 0);
        
        return { ...budget, spent };
      });
      
      setBudgets(updatedBudgets);
    }
  }, [transactions]);

  const value = {
    transactions,
    budgets,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    addBudget,
    updateBudget,
    deleteBudget,
    resetAll,
    calculateTotalExpenses,
    findTopSpendingCategory,
    calculateDailyAverage,
    getRecentTransaction,
  };

  return (
    <FinanceContext.Provider value={value}>
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  
  if (context === undefined) {
    throw new Error("useFinance must be used within a FinanceProvider");
  }
  
  return context;
};

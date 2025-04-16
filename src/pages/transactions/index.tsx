import { useState } from "react"
import { PlusCircle } from "lucide-react"
import { toast } from "sonner"

import { useFinance } from "@/contexts/finance-context"
import TransactionForm from "@/components/transactions/transaction-form"
import TransactionList, { Transaction } from "@/components/transactions/transaction-list"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const TransactionsPage = () => {
  const { 
    transactions, 
    addTransaction, 
    updateTransaction, 
    deleteTransaction
  } = useFinance()
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [isFormVisible, setIsFormVisible] = useState(false)

  const handleAddTransaction = (data: any) => {
    const newTransaction: Transaction = {
      id: Date.now().toString(), // Simple ID generation
      amount: Number(data.amount),
      description: data.description,
      date: data.date,
      category: data.category,
    };

    addTransaction(newTransaction);
    setIsFormVisible(false);
    toast.success("Transaction added successfully");
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setIsFormVisible(true);
  };

  const handleUpdateTransaction = (data: any) => {
    if (!editingTransaction) return;

    const updatedTransaction: Transaction = {
      ...editingTransaction,
      amount: Number(data.amount),
      description: data.description,
      date: data.date,
      category: data.category,
    };

    updateTransaction(updatedTransaction);
    setEditingTransaction(null);
    setIsFormVisible(false);
    toast.success("Transaction updated successfully");
  };

  const handleDeleteTransaction = (id: string) => {
    deleteTransaction(id);
    toast.success("Transaction deleted successfully");
  };

  const handleCancelEdit = () => {
    setEditingTransaction(null);
    setIsFormVisible(false);
  };

  const handleResetAll = () => {
    resetAll();
    toast.success("All data has been reset");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Transactions</h2>
        <Button onClick={() => setIsFormVisible(!isFormVisible)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Transaction
        </Button>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">All Transactions</TabsTrigger>
          <TabsTrigger value="recent">Recent</TabsTrigger>
          <TabsTrigger value="category">By Category</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="space-y-6">
          {isFormVisible && (
            <div className="mb-6">
              <TransactionForm
                onSubmit={editingTransaction ? handleUpdateTransaction : handleAddTransaction}
                defaultValues={editingTransaction 
                  ? { 
                      ...editingTransaction, 
                      amount: editingTransaction.amount.toString() 
                    } 
                  : undefined}
                isEditing={!!editingTransaction}
                onCancel={handleCancelEdit}
              />
            </div>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
            </CardHeader>
            <CardContent>
              <TransactionList
                transactions={transactions}
                onEdit={handleEditTransaction}
                onDelete={handleDeleteTransaction}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="recent" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <TransactionList
                transactions={[...transactions].sort((a, b) => 
                  new Date(b.date).getTime() - new Date(a.date).getTime()
                ).slice(0, 5)}
                onEdit={handleEditTransaction}
                onDelete={handleDeleteTransaction}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="category" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Transactions by Category</CardTitle>
            </CardHeader>
            <CardContent>
              {/* This would be a more complex categorized view */}
              <p className="text-sm text-muted-foreground mb-4">
                Group and filter transactions by category
              </p>
              <TransactionList
                transactions={transactions}
                onEdit={handleEditTransaction}
                onDelete={handleDeleteTransaction}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TransactionsPage;

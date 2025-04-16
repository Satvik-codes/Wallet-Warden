
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, IndianRupee, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/hooks/use-theme";

const SettingsPage = () => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const { theme, setTheme } = useTheme();
  const [currency, setCurrency] = useState("₹");
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [resetConfirm, setResetConfirm] = useState(false);
  const { toast } = useToast();

  const isDarkMode = theme === "dark";

  const handleSavePreferences = () => {
    // Simulating a save
    setShowSaveSuccess(true);
    setTimeout(() => setShowSaveSuccess(false), 3000);
  };

  const handleThemeToggle = () => {
    setTheme(isDarkMode ? "light" : "dark");
  };

  const handleExportData = () => {
    // Simulating data export
    toast({
      title: "Export Started",
      description: "Your data export has been initiated.",
      duration: 3000,
    });
  };

  const handleResetData = () => {
    if (!resetConfirm) {
      setResetConfirm(true);
      return;
    }

    // This would connect to actual data reset logic in a real app
    localStorage.clear();
    
    toast({
      title: "Data Reset Complete",
      description: "All your financial data has been reset to zero.",
      duration: 5000,
    });
    
    setResetConfirm(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">
          Manage your account settings and preferences.
        </p>
      </div>

      <Tabs defaultValue="preferences" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="data">Data Management</TabsTrigger>
        </TabsList>
        
        <TabsContent value="preferences" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Display Settings</CardTitle>
              <CardDescription>
                Customize how the application appears
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="dark-mode">Dark Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Toggle between light and dark themes
                  </p>
                </div>
                <Switch
                  id="dark-mode"
                  checked={isDarkMode}
                  onCheckedChange={handleThemeToggle}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="notifications">Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive alerts for budget limits and spending activity
                  </p>
                </div>
                <Switch
                  id="notifications"
                  checked={notificationsEnabled}
                  onCheckedChange={setNotificationsEnabled}
                />
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <IndianRupee className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <Input
                    id="currency"
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    placeholder="₹"
                    className="pl-10"
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Default currency is Indian Rupee (₹)
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => {
                setTheme("dark");
                setNotificationsEnabled(true);
                setCurrency("₹");
              }}>
                Reset
              </Button>
              <div className="flex items-center gap-4">
                {showSaveSuccess && (
                  <div className="flex items-center text-green-500">
                    <CheckCircle2 className="mr-1 h-4 w-4" />
                    <span className="text-sm">Saved successfully</span>
                  </div>
                )}
                <Button onClick={handleSavePreferences}>Save Changes</Button>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="account" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>
                Update your account details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  defaultValue="John Doe"
                  placeholder="Enter your name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  defaultValue="john.doe@example.com"
                  placeholder="Enter your email"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value="••••••••"
                  placeholder="Enter your password"
                  readOnly
                />
                <Button variant="link" className="p-0 h-auto text-sm">
                  Change password
                </Button>
              </div>
            </CardContent>
            <CardFooter>
              <Button>Save Account Information</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="data" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Data Management</CardTitle>
              <CardDescription>
                Export or reset your financial data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Export Data</h3>
                <p className="text-sm text-muted-foreground">
                  Download all your transaction and budget data in CSV format
                </p>
                <Button onClick={handleExportData} className="mt-2">
                  Export to CSV
                </Button>
              </div>
              
              <Card className="border-warning/20 bg-warning/5">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-warning" />
                    Start New
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">
                    This will reset all your financial data, including transactions, budgets, and reports to zero.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button 
                    variant={resetConfirm ? "destructive" : "outline"} 
                    onClick={handleResetData}
                    className="w-full"
                  >
                    {resetConfirm ? "Confirm Reset" : "Reset All Data"}
                  </Button>
                </CardFooter>
              </Card>
              
              <Separator />
              
              <div className="space-y-2">
                <h3 className="text-lg font-medium text-destructive">Danger Zone</h3>
                <p className="text-sm text-muted-foreground">
                  These actions are irreversible
                </p>
                
                <div className="flex flex-col gap-2 mt-4">
                  <Button variant="outline" className="border-destructive text-destructive hover:bg-destructive/10">
                    Clear All Transactions
                  </Button>
                  <Button variant="outline" className="border-destructive text-destructive hover:bg-destructive/10">
                    Reset All Budgets
                  </Button>
                  <Button variant="destructive">
                    Delete Account
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsPage;

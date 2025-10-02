import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Smartphone, Zap, Trash2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface UssdCode {
  id: string;
  name: string;
  code: string;
  description?: string;
  status: string;
  last_executed_at?: string;
  last_result?: string;
}

const Index = () => {
  const [ussdCodes, setUssdCodes] = useState<UssdCode[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUssdCodes();
    
    // Subscribe to realtime changes
    const channel = supabase
      .channel('ussd_codes_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'ussd_codes'
        },
        () => {
          fetchUssdCodes();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Auto-execute pending codes
  useEffect(() => {
    const executePendingCodes = async () => {
      const pendingCodes = ussdCodes.filter(
        (code) => code.status === "pending" || code.status === "success" || code.status === "error"
      );

      for (const code of pendingCodes) {
        if (code.status !== "running") {
          await executeUssdCode(code.id);
          // Wait 3 seconds between executions
          await new Promise((resolve) => setTimeout(resolve, 3000));
        }
      }
    };

    if (ussdCodes.length > 0) {
      executePendingCodes();
    }
  }, [ussdCodes.length]);

  const fetchUssdCodes = async () => {
    const { data, error } = await supabase
      .from("ussd_codes")
      .select("*")
      .order("id", { ascending: true });

    if (error) {
      toast.error("Failed to fetch USSD codes");
      console.error(error);
    } else {
      setUssdCodes(data || []);
    }
    setLoading(false);
  };

  const executeUssdCode = async (id: string) => {
    const code = ussdCodes.find((c) => c.id === id);
    if (!code) return;

    // Update status to running
    await supabase
      .from("ussd_codes")
      .update({ status: "running" })
      .eq("id", id);

    toast.loading(`Executing ${code.code}...`, { id: `exec-${id}` });

    // Simulate USSD execution (in real app, this would call actual USSD API)
    setTimeout(async () => {
      const mockResults = [
        "Balance: $50.00\nExpiry: 30 days",
        "Transaction successful\nRef: TXN123456",
        "Data Bundle: 2GB\nValid until: 15 Jan 2025",
        "SMS Bundle: 100 SMS\nRemaining: 75 SMS",
        "Your number: +1234567890\nPlan: Premium",
      ];
      
      const result = mockResults[Math.floor(Math.random() * mockResults.length)];
      const isSuccess = Math.random() > 0.1; // 90% success rate

      await supabase
        .from("ussd_codes")
        .update({
          status: isSuccess ? "success" : "error",
          last_executed_at: new Date().toISOString(),
          last_result: isSuccess ? result : "Execution failed: Network timeout",
        })
        .eq("id", id);

      toast.dismiss(`exec-${id}`);
      
      if (isSuccess) {
        toast.success(`${code.name} executed successfully`);
      } else {
        toast.error(`${code.name} execution failed`);
      }
    }, 2000);
  };

  const deleteUssdCode = async (id: string) => {
    const { error } = await supabase
      .from("ussd_codes")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Failed to delete USSD code");
      console.error(error);
    } else {
      toast.success("USSD code deleted");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8 space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 rounded-xl bg-gradient-primary">
              <Smartphone className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                USSD Executor
              </h1>
              <p className="text-muted-foreground">
                Automate and manage your USSD codes
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Zap className="h-4 w-4 text-accent" />
            <span>{ussdCodes.length} codes configured • Auto-executing</span>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : ussdCodes.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-flex p-6 rounded-full bg-muted/50 mb-4">
              <Smartphone className="h-12 w-12 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-semibold mb-2">No USSD codes in database</h2>
            <p className="text-muted-foreground">
              USSD codes will be loaded from the database and executed automatically
            </p>
          </div>
        ) : (
          <div className="rounded-lg border border-border/50 bg-card shadow-sm overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Executed</TableHead>
                  <TableHead>Last Result</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ussdCodes.map((code) => (
                  <TableRow key={code.id}>
                    <TableCell className="font-medium">{code.name}</TableCell>
                    <TableCell>
                      <code className="text-sm font-mono text-accent">{code.code}</code>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {code.description || "-"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={`${
                          code.status === "success"
                            ? "bg-gradient-success"
                            : code.status === "running"
                            ? "bg-gradient-primary"
                            : code.status === "error"
                            ? "bg-destructive"
                            : "bg-muted"
                        } text-white border-0`}
                      >
                        {code.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {code.last_executed_at
                        ? format(new Date(code.last_executed_at), "PPp")
                        : "-"}
                    </TableCell>
                    <TableCell className="max-w-xs truncate text-sm text-muted-foreground">
                      {code.last_result || "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        onClick={() => deleteUssdCode(code.id)}
                        variant="outline"
                        size="icon"
                        className="hover:bg-destructive hover:text-destructive-foreground transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;

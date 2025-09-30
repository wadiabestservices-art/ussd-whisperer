import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { UssdCodeCard } from "@/components/UssdCodeCard";
import { AddUssdCodeDialog } from "@/components/AddUssdCodeDialog";
import { toast } from "sonner";
import { Smartphone, Zap } from "lucide-react";

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

  const fetchUssdCodes = async () => {
    const { data, error } = await supabase
      .from("ussd_codes")
      .select("*")
      .order("created_at", { ascending: false });

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
          
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Zap className="h-4 w-4 text-accent" />
              <span>{ussdCodes.length} codes configured</span>
            </div>
            <AddUssdCodeDialog />
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
            <h2 className="text-2xl font-semibold mb-2">No USSD codes yet</h2>
            <p className="text-muted-foreground mb-6">
              Get started by adding your first USSD code
            </p>
            <AddUssdCodeDialog />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ussdCodes.map((code) => (
              <UssdCodeCard
                key={code.id}
                id={code.id}
                name={code.name}
                code={code.code}
                description={code.description}
                status={code.status}
                lastExecutedAt={code.last_executed_at}
                lastResult={code.last_result}
                onExecute={executeUssdCode}
                onDelete={deleteUssdCode}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;

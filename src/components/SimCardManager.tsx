import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface SimCard {
  id: string;
  name: string;
  operator: "inwi" | "iam" | "orange";
  enabled: boolean;
  daily_activation_count: number;
}

export const SimCardManager = () => {
  const [simCards, setSimCards] = useState<SimCard[]>([]);
  const [name, setName] = useState("");
  const [operator, setOperator] = useState<"inwi" | "iam" | "orange">("inwi");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchSimCards();
  }, []);

  const fetchSimCards = async () => {
    const { data, error } = await supabase
      .from("sim_cards")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch SIM cards",
        variant: "destructive",
      });
    } else {
      setSimCards(data || []);
    }
  };

  const addSimCard = async () => {
    if (!name) {
      toast({
        title: "Error",
        description: "Please enter a SIM card name",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    const { error } = await supabase
      .from("sim_cards")
      .insert([{ name, operator, enabled: true }]);

    setLoading(false);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to add SIM card",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "SIM card added successfully",
      });
      setName("");
      fetchSimCards();
    }
  };

  const toggleEnabled = async (id: string, currentEnabled: boolean) => {
    const { error } = await supabase
      .from("sim_cards")
      .update({ enabled: !currentEnabled })
      .eq("id", id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update SIM card",
        variant: "destructive",
      });
    } else {
      fetchSimCards();
    }
  };

  const deleteSimCard = async (id: string) => {
    const { error } = await supabase
      .from("sim_cards")
      .delete()
      .eq("id", id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete SIM card",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "SIM card deleted",
      });
      fetchSimCards();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>SIM Card Management</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <div className="flex-1">
            <Label htmlFor="sim-name">SIM Card Name</Label>
            <Input
              id="sim-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., SIM 1"
            />
          </div>
          <div className="flex-1">
            <Label htmlFor="sim-operator">Operator</Label>
            <Select value={operator} onValueChange={(value: any) => setOperator(value)}>
              <SelectTrigger id="sim-operator">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="inwi">INWI</SelectItem>
                <SelectItem value="iam">IAM</SelectItem>
                <SelectItem value="orange">Orange</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={addSimCard} disabled={loading} className="self-end">
            <Plus className="h-4 w-4 mr-2" />
            Add SIM
          </Button>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Operator</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Daily Activations</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {simCards.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  No SIM cards added yet
                </TableCell>
              </TableRow>
            ) : (
              simCards.map((sim) => (
                <TableRow key={sim.id}>
                  <TableCell>{sim.name}</TableCell>
                  <TableCell className="uppercase">{sim.operator}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={sim.enabled}
                        onCheckedChange={() => toggleEnabled(sim.id, sim.enabled)}
                      />
                      <Badge variant={sim.enabled ? "default" : "secondary"}>
                        {sim.enabled ? "Enabled" : "Disabled"}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={sim.daily_activation_count >= 20 ? "destructive" : "outline"}>
                      {sim.daily_activation_count}/20
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteSimCard(sim.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

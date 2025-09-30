import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const AddUssdCodeDialog = () => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !code) {
      toast.error("Name and code are required");
      return;
    }

    setLoading(true);
    
    const { error } = await supabase
      .from("ussd_codes")
      .insert({
        name,
        code,
        description: description || null,
      });

    setLoading(false);

    if (error) {
      toast.error("Failed to add USSD code");
      console.error(error);
      return;
    }

    toast.success("USSD code added successfully");
    setOpen(false);
    setName("");
    setCode("");
    setDescription("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-accent hover:opacity-90 transition-opacity">
          <Plus className="h-4 w-4 mr-2" />
          Add USSD Code
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New USSD Code</DialogTitle>
          <DialogDescription>
            Add a new USSD code to execute automatically
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              placeholder="e.g., Check Balance"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="code">USSD Code</Label>
            <Input
              id="code"
              placeholder="e.g., *123#"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="What does this USSD code do?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-gradient-primary hover:opacity-90 transition-opacity"
            disabled={loading}
          >
            {loading ? "Adding..." : "Add USSD Code"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

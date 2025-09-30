import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Clock, Trash2 } from "lucide-react";
import { format } from "date-fns";

interface UssdCodeCardProps {
  id: string;
  name: string;
  code: string;
  description?: string;
  status: string;
  lastExecutedAt?: string;
  lastResult?: string;
  onExecute: (id: string) => void;
  onDelete: (id: string) => void;
}

export const UssdCodeCard = ({
  id,
  name,
  code,
  description,
  status,
  lastExecutedAt,
  lastResult,
  onExecute,
  onDelete,
}: UssdCodeCardProps) => {
  const getStatusColor = () => {
    switch (status) {
      case "success":
        return "bg-gradient-success";
      case "running":
        return "bg-gradient-primary";
      case "error":
        return "bg-destructive";
      default:
        return "bg-muted";
    }
  };

  return (
    <Card className="hover:shadow-elevated transition-all duration-300 border-border/50">
      <CardHeader className="space-y-2">
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <CardTitle className="text-xl font-semibold">{name}</CardTitle>
            <code className="text-sm font-mono text-accent">{code}</code>
          </div>
          <Badge className={`${getStatusColor()} text-white border-0`}>
            {status}
          </Badge>
        </div>
        {description && (
          <CardDescription className="text-muted-foreground">
            {description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {lastExecutedAt && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>Last executed: {format(new Date(lastExecutedAt), "PPp")}</span>
          </div>
        )}
        
        {lastResult && (
          <div className="rounded-lg bg-muted/50 p-3 border border-border/50">
            <p className="text-sm font-medium mb-1">Last Result:</p>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{lastResult}</p>
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <Button
            onClick={() => onExecute(id)}
            disabled={status === "running"}
            className="flex-1 bg-gradient-primary hover:opacity-90 transition-opacity"
          >
            <Play className="h-4 w-4 mr-2" />
            {status === "running" ? "Executing..." : "Execute"}
          </Button>
          <Button
            onClick={() => onDelete(id)}
            variant="outline"
            size="icon"
            className="hover:bg-destructive hover:text-destructive-foreground transition-colors"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

"use client";

import * as React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./alert-dialog";
import { Input } from "./input";

interface RunQueryAlertDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (query: string) => void;
}

export function RunQueryAlertDialog({
  open,
  onOpenChange,
  onSubmit,
}: RunQueryAlertDialogProps) {
  const [query, setQuery] = React.useState("");

  const handleSubmit = () => {
    if (query.trim()) {
      onSubmit(query.trim());
      setQuery("");
      onOpenChange(false);
    }
  };

  const handleCancel = () => {
    setQuery("");
    onOpenChange(false);
  };

  React.useEffect(() => {
    if (open) {
      setQuery("");
    }
  }, [open]);

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>Run Workflow</AlertDialogTitle>
          <AlertDialogDescription>
            Enter a query to run with this workflow:
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="grid gap-4 py-4">
          <Input
            id="query"
            placeholder="Enter your query..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter" && query.trim()) {
                handleSubmit();
              }
            }}
          />
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleSubmit}
            disabled={!query.trim()}
            className={!query.trim() ? "opacity-50 cursor-not-allowed" : ""}
          >
            Run
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

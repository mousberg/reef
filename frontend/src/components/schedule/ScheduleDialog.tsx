"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon, Clock } from "lucide-react";
import { format } from "date-fns";
import { CRON_PRESETS, cronToText } from "@/types/schedule";

interface ScheduleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSchedule: (scheduleData: ScheduleFormData) => Promise<void>;
  projectId: string;
  workflowName: string;
  builtWorkflow: any;
  defaultQuery?: string;
}

export interface ScheduleFormData {
  workflowName: string;
  query: string;
  scheduleType: "once" | "recurring";
  runAt?: Date;
  cronExpression?: string;
  enabled: boolean;
}

export function ScheduleDialog({
  open,
  onOpenChange,
  onSchedule,
  projectId,
  workflowName,
  builtWorkflow,
  defaultQuery = "",
}: ScheduleDialogProps) {
  const [formData, setFormData] = useState<ScheduleFormData>({
    workflowName,
    query: defaultQuery,
    scheduleType: "recurring",
    cronExpression: "0 9 * * *", // Daily at 9 AM default
    enabled: true,
  });

  const [customCron, setCustomCron] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState("09:00");

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setFormData({
        workflowName,
        query: defaultQuery,
        scheduleType: "recurring",
        cronExpression: "0 9 * * *",
        enabled: true,
      });
      setCustomCron(false);
      setSelectedDate(undefined);
      setSelectedTime("09:00");
    }
  }, [open, workflowName, defaultQuery]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Prepare schedule data
      let scheduleData = { ...formData };

      // For one-time schedules, combine date and time
      if (formData.scheduleType === "once" && selectedDate) {
        const [hours, minutes] = selectedTime.split(":");
        const runAt = new Date(selectedDate);
        runAt.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        scheduleData.runAt = runAt;
      }

      await onSchedule(scheduleData);
      onOpenChange(false);
    } catch (error) {
      console.error("Error creating schedule:", error);
    } finally {
      setLoading(false);
    }
  };

  const cronPresetOptions = Object.entries(CRON_PRESETS);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Schedule Workflow</DialogTitle>
          <DialogDescription>
            Set up automatic execution for your workflow
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Workflow Name */}
          <div className="space-y-2">
            <Label htmlFor="workflowName">Workflow Name</Label>
            <Input
              id="workflowName"
              value={formData.workflowName}
              onChange={(e) =>
                setFormData({ ...formData, workflowName: e.target.value })
              }
              placeholder="My Workflow"
              required
            />
          </div>

          {/* Query/Task */}
          <div className="space-y-2">
            <Label htmlFor="query">Task/Question</Label>
            <Textarea
              id="query"
              value={formData.query}
              onChange={(e) =>
                setFormData({ ...formData, query: e.target.value })
              }
              placeholder="What should this workflow do when it runs?"
              rows={3}
              required
            />
            <p className="text-xs text-muted-foreground">
              This is the task or question that will be executed each time the
              workflow runs
            </p>
          </div>

          {/* Schedule Type */}
          <div className="space-y-2">
            <Label htmlFor="scheduleType">Schedule Type</Label>
            <Select
              value={formData.scheduleType}
              onValueChange={(value: "once" | "recurring") =>
                setFormData({ ...formData, scheduleType: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="once">One-time</SelectItem>
                <SelectItem value="recurring">Recurring</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* One-time Schedule */}
          {formData.scheduleType === "once" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Date and Time</Label>
                <div className="flex gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "flex-1 justify-start text-left font-normal",
                          !selectedDate && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedDate ? (
                          format(selectedDate, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        disabled={(date) => date < new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>

                  <div className="relative flex-1">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="time"
                      value={selectedTime}
                      onChange={(e) => setSelectedTime(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Recurring Schedule */}
          {formData.scheduleType === "recurring" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Frequency</Label>
                <div className="flex items-center gap-2">
                  <Label
                    htmlFor="customCron"
                    className="text-sm text-muted-foreground cursor-pointer"
                  >
                    Custom cron
                  </Label>
                  <Switch
                    id="customCron"
                    checked={customCron}
                    onCheckedChange={setCustomCron}
                  />
                </div>
              </div>

              {!customCron ? (
                <Select
                  value={formData.cronExpression}
                  onValueChange={(value) =>
                    setFormData({ ...formData, cronExpression: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {cronPresetOptions.map(([label, cron]) => (
                      <SelectItem key={cron} value={cron}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="space-y-2">
                  <Input
                    value={formData.cronExpression}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        cronExpression: e.target.value,
                      })
                    }
                    placeholder="0 9 * * *"
                    pattern="^(\*|([0-9]|1[0-9]|2[0-9]|3[0-9]|4[0-9]|5[0-9])|\*\/([0-9]|1[0-9]|2[0-9]|3[0-9]|4[0-9]|5[0-9])) (\*|([0-9]|1[0-9]|2[0-3])|\*\/([0-9]|1[0-9]|2[0-3])) (\*|([1-9]|1[0-9]|2[0-9]|3[0-1])) (\*|([1-9]|1[0-2])) (\*|([0-6]))$"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Format: minute hour day month dayOfWeek (e.g., "0 9 * * *"
                    for daily at 9 AM)
                  </p>
                  {formData.cronExpression && (
                    <p className="text-xs text-primary">
                      {cronToText(formData.cronExpression)}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Enabled Toggle */}
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label htmlFor="enabled">Enable Schedule</Label>
              <p className="text-sm text-muted-foreground">
                Start running this schedule immediately after creation
              </p>
            </div>
            <Switch
              id="enabled"
              checked={formData.enabled}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, enabled: checked })
              }
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Schedule"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

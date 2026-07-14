import { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Stack,
  Switch,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import { Device } from "../types/devices.types";

const DAYS = [
  { value: "mon", label: "Mon" },
  { value: "tue", label: "Tue" },
  { value: "wed", label: "Wed" },
  { value: "thu", label: "Thu" },
  { value: "fri", label: "Fri" },
  { value: "sat", label: "Sat" },
  { value: "sun", label: "Sun" },
];

interface ScheduleFormProps {
  open: boolean;
  device: Device | null;
  onClose: () => void;
  onSuccess?: () => void;
}

const ScheduleForm = ({
  open,
  device,
  onClose,
  onSuccess,
}: ScheduleFormProps) => {
  const [enabled, setEnabled] = useState(false);
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("18:00");
  const [days, setDays] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load the device's current schedule (or sensible defaults) whenever the dialog opens
  useEffect(() => {
    if (!open || !device) return;
    setError("");
    setEnabled(Boolean(device.scheduleEnabled));
    setStartTime(device.powerOnTime || "08:00");
    setEndTime(device.powerOffTime || "18:00");
    setDays(device.scheduleDays || []);
  }, [open, device]);

  const handleDaysChange = (
    _event: React.MouseEvent<HTMLElement>,
    newDays: string[],
  ) => {
    setDays(newDays);
  };

  const handleClose = () => {
    if (isSubmitting) return;
    onClose();
  };

  const handleSubmit = async () => {
    if (!device) return;
    setError("");

    if (enabled) {
      if (!startTime || !endTime) {
        setError("Please set both an on time and an off time.");
        return;
      }
      if (days.length === 0) {
        setError("Please select at least one day.");
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/device/${device._id.$oid}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scheduleEnabled: enabled,
          powerOnTime: startTime,
          powerOffTime: endTime,
          scheduleDays: enabled ? days : [],
        }),
      });

      if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`);
      }

      onSuccess?.();
      onClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to save schedule.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle>
        Schedule{device ? ` — ${device.deviceName}` : ""}
      </DialogTitle>
      <DialogContent dividers>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <Stack spacing={2} sx={{ mt: 1 }}>
          <FormControlLabel
            control={
              <Switch
                checked={enabled}
                onChange={(e) => setEnabled(e.target.checked)}
              />
            }
            label={enabled ? "Schedule enabled" : "No schedule (always on)"}
          />

          <Stack direction="row" spacing={2}>
            <TextField
              label="On time"
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              disabled={!enabled}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Off time"
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              disabled={!enabled}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </Stack>

          <div>
            <Typography variant="body2" sx={{ mb: 1 }}>
              Active days
            </Typography>
            <ToggleButtonGroup
              value={days}
              onChange={handleDaysChange}
              disabled={!enabled}
              size="small"
            >
              {DAYS.map((day) => (
                <ToggleButton key={day.value} value={day.value}>
                  {day.label}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </div>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Saving..." : "Save Schedule"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ScheduleForm;
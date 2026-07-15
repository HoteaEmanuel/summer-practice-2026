import { useEffect, useState } from "react";
import {
  Alert,
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
} from "@mui/material";
import DockedDialog from "./DockedDialog";
import { Device, DeviceInput } from "../types/devices.types";

const initialFormData: DeviceInput = {
  deviceName: "",
  deviceSlNo: "",
  deviceType: "",
  hwType: "",
  site: "",
  group: "",
  owner: "",
  connectivityType: "",
  ip: "",
  port: "",
  loginUser: "",
  password: "",
  readCommunity: "",
  writeCommunity: "",
};

const deviceToFormData = (device: Device): DeviceInput => ({
  deviceName: device.deviceName ?? "",
  deviceSlNo: device.deviceSlNo ?? "",
  deviceType: device.deviceType ?? "",
  hwType: device.hwType ?? "",
  site: device.site ?? "",
  group: device.group ?? "",
  owner: device.owner ?? "",
  connectivityType: device.connectivityType,
  ip: device.ip ?? "",
  port: device.port ?? "",
  loginUser: device.loginUser ?? "",
  password: device.password ?? "",
  readCommunity: device.readCommunity ?? "",
  writeCommunity: device.writeCommunity ?? "",
});

interface AddDeviceFormProps {
  open?: boolean;
  device?: Device | null;
  onClose?: () => void;
  onSuccess?: (device: unknown) => void;
}

const DeviceForm = ({
  open = false,
  device = null,
  onClose,
  onSuccess,
}: AddDeviceFormProps) => {
  const [formData, setFormData] = useState({
    ...initialFormData,
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditMode = Boolean(device);

  useEffect(() => {
    if (!open) return;
    setError("");
    setFormData(device ? deviceToFormData(device) : { ...initialFormData });
  }, [open, device]);

  const handleChange = (e: { target: { name: string; value: string } }) => {
    const { name, value } = e.target;
    if (error) setError("");
    setFormData({ ...formData, [name]: value });
  };

  const handleDialogClose = () => {
    if (isSubmitting) return;
    setError("");
    setFormData({ ...initialFormData });
    onClose?.();
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const url = isEditMode
        ? `/api/device/${device!._id.$oid}`
        : "/api/device";
      const method = isEditMode ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`);
      }

      let resultDevice = null;
      try {
        resultDevice = await response.json();
      } catch {
        resultDevice = null;
      }

      setFormData({ ...initialFormData });
      if (onSuccess) {
        onSuccess(resultDevice);
      }
      onClose?.();
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message || "Failed to save device.");
      } else {
        setError("Failed to save device.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DockedDialog open={open} onClose={handleDialogClose}>
      <DialogTitle>{isEditMode ? "Edit Device" : "Add Device"}</DialogTitle>
      <DialogContent dividers>
        {error && <Alert severity="error">{error}</Alert>}
        <Stack
          component="form"
          id="add-device-form"
          onSubmit={handleSubmit}
          direction="row"
          spacing={2}
        >
          <Stack spacing={2} sx={{ mt: 1, width: 300 }}>
            <TextField
              name="deviceName"
              label="Device Name"
              value={formData.deviceName}
              onChange={handleChange}
              fullWidth
              required
            />

            <TextField
              name="deviceSlNo"
              label="Device Serial Number"
              value={formData.deviceSlNo}
              onChange={handleChange}
              fullWidth
              required
            />

            <TextField
              name="deviceType"
              label="Device Type"
              value={formData.deviceType}
              onChange={handleChange}
              fullWidth
              required
            />

            <TextField
              name="hwType"
              label="Hardware Type"
              value={formData.hwType}
              onChange={handleChange}
              fullWidth
              required
            />

            <TextField
              name="site"
              label="Site"
              value={formData.site}
              onChange={handleChange}
              fullWidth
              required
            />

            <TextField
              name="group"
              label="Group"
              value={formData.group}
              onChange={handleChange}
              fullWidth
              required
            />

            <TextField
              name="owner"
              label="Owner"
              value={formData.owner}
              onChange={handleChange}
              fullWidth
              required
            />
          </Stack>

          <Stack spacing={2} sx={{ mt: 1, width: 300 }}>
            <TextField
              name="ip"
              label="IP Address"
              value={formData.ip}
              onChange={handleChange}
              fullWidth
              required
            />

            <TextField
              name="port"
              label="Port"
              value={formData.port}
              onChange={handleChange}
              fullWidth
              required
            />

            <FormControl fullWidth required>
              <InputLabel id="connectivity-type-label">
                Connectivity Type
              </InputLabel>
              <Select
                labelId="connectivity-type-label"
                label="Connectivity Type"
                name="connectivityType"
                value={formData.connectivityType}
                onChange={handleChange}
              >
                <MenuItem value="ssh">SSH</MenuItem>
                <MenuItem value="snmp">SNMP</MenuItem>
              </Select>
            </FormControl>

            {formData.connectivityType === "ssh" && (
              <>
                <TextField
                  name="loginUser"
                  label="Login User"
                  value={formData.loginUser}
                  onChange={handleChange}
                  fullWidth
                  required
                />

                <TextField
                  name="password"
                  label="Password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  fullWidth
                  required
                />
              </>
            )}

            {formData.connectivityType === "snmp" && (
              <>
                <TextField
                  name="readCommunity"
                  label="Read Community"
                  value={formData.readCommunity}
                  onChange={handleChange}
                  fullWidth
                  required
                />

                <TextField
                  name="writeCommunity"
                  label="Write Community"
                  value={formData.writeCommunity}
                  onChange={handleChange}
                  fullWidth
                  required
                />
              </>
            )}
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleDialogClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button
          type="submit"
          form="add-device-form"
          variant="contained"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Submitting..." : isEditMode ? "Save" : "Submit"}
        </Button>
      </DialogActions>
    </DockedDialog>
  );
};

export default DeviceForm;

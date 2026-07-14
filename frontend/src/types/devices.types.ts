export type ObjectId = {
  $oid: string;
};

export type ConnectivityType = "ssh" | "snmp" | "";

export type Device = {
  _id: ObjectId;
  deviceName: string;
  group: string;
  deviceSlNo?: string;
  deviceType?: string;
  hwType?: string;
  site?: string;
  owner?: string;
  connectivityType?: ConnectivityType;
  ip?: string;
  port?: string;
  loginUser?: string;
  password?: string;
  readCommunity?: string;
  writeCommunity?: string;
  powerOnTime?: string;
  powerOffTime?: string;
  count?: number;
  consumptionPerHour?: number;
};

export type DeviceInput = Omit<Device, "_id">;

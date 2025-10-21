// types/room.ts

export interface RoomType {
  id: string;
  name: string;
}

export const ROOM_FACILITIES: string[] = [
  "TV",
  "Air Conditioner",
  "WiFi",
  "Refrigerator",
  "Telephone",
  "Wheelchair Accessible",
  "Private Bathroom",
  "Emergency Call Button",
];

export const ROOM_STATUSES: { value: string; label: string }[] = [
  { value: "available", label: "Available" },
  { value: "occupied", label: "Occupied" },
  { value: "maintenance", label: "Maintenance" },
  { value: "reserved", label: "Reserved" },
];

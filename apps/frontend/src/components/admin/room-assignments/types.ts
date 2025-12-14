import { EmployeeRoomAssignment } from "@/common/interfaces/user/employee-room-assignment.interface";

export type AssignmentWithMeta = EmployeeRoomAssignment & {
  __optimistic?: boolean;
};


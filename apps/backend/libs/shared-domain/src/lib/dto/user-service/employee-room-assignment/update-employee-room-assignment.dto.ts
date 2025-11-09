import { PartialType } from "@nestjs/swagger";
import { CreateEmployeeRoomAssignmentDto } from "./create-employee-room-assignment.dto";

export class UpdateEmployeeRoomAssignmentDto extends PartialType(CreateEmployeeRoomAssignmentDto) {}
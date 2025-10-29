import { PartialType } from "@nestjs/mapped-types";
import { CreateRequestProcedureDto } from "./create-request-procedure.dto";

export class UpdateRequestProcedureDto extends PartialType(
  CreateRequestProcedureDto
) {}

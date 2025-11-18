import { IsNotEmpty, IsString, IsUUID } from "class-validator";


export class SignStudyDto {
  @IsUUID()
  @IsNotEmpty()
  studyId!: string;

  @IsString()
  @IsNotEmpty()
  pin!: string;
}
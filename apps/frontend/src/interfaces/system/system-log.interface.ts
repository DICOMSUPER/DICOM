import { LogLevel } from "@/enums/system.enum";

export interface SystemLog {
  log_id: string;
  log_level: LogLevel;
  component: string;
  message: string;
  context_data?: Record<string, any>;
  timestamp?: Date;
}
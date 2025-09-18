export enum ShiftType {
  MORNING = "morning",      
  AFTERNOON = "afternoon",
  NIGHT = "night",
  FULL_DAY = "full_day",
  CUSTOM = "custom",
}

export enum ScheduleStatus {
  SCHEDULED = "scheduled",   
  CONFIRMED = "confirmed",   
  COMPLETED = "completed",   
  CANCELLED = "cancelled",   
  NO_SHOW = "no_show",       
}
export enum LeaveType {
  ANNUAL_LEAVE = "annual_leave",  
  SICK_LEAVE = "sick_leave",          
  PERSONAL_LEAVE = "personal_leave",  
  EMERGENCY = "emergency",            
  MATERNITY = "maternity",           
}

export enum LeaveStatus {
  PENDING = "pending",     
  APPROVED = "approved",
  REJECTED = "rejected",
  CANCELLED = "cancelled",
}

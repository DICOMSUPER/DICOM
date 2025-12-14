export interface Otp {
  id: string;
  email?: string;
  code?: number;
  used_at?: Date;
  expired_at?: Date;
  created_at?: Date;
}
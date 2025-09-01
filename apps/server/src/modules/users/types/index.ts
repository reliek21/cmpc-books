export interface IUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
  created_at: Date;
  updated_at?: Date;
  deleted_at?: Date | null;
}

export interface ContactMessage {
  id: number;
  name: string | null;
  email: string | null;
  phone: string | null;
  message: string | null;
  createdAt: string;
}

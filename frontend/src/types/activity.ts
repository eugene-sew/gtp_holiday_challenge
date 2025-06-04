export interface Activity {
  id: string;
  user: string;
  description: string;
  date: string; // ISO date string
  icon: React.ReactNode;
  iconBackground: string;
}
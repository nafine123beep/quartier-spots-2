export interface Spot {
  id: string;
  address: string;
  description: string;
  lat: number;
  lng: number;
  name: string;
  contact: string;
  consent: boolean;
}

export interface FlohmarktEvent {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  link: string;
}

export type ViewType = 'frontpage' | 'login' | 'register' | 'dashboard' | 'app';
export type AppTabType = 'list' | 'map' | 'form' | 'delete';

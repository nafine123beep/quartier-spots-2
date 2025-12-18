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

export interface User {
  email: string;
  name: string;
}

export type ViewType = 'frontpage' | 'dashboard' | 'app';
export type AppTabType = 'list' | 'map' | 'form' | 'delete';

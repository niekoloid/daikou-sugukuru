export type UserType = 'customer' | 'driver' | 'restaurant';

export type RideStatus = 'waiting' | 'accepted' | 'en_route' | 'arrived' | 'in_progress' | 'completed';

export interface Position {
  lat: number;
  lng: number;
}

export interface User {
  id: string;
  name: string;
  type: UserType;
  phone?: string;
}

export interface Customer extends User {
  type: 'customer';
  currentPosition?: Position;
  destinationPosition?: Position;
}

export interface Driver extends User {
  type: 'driver';
  currentPosition?: Position;
  isOnline: boolean;
  dailyEarnings: number;
}

export interface Restaurant extends User {
  type: 'restaurant';
  position: Position;
  address: string;
  qrCode?: string;
}

export interface Ride {
  id: string;
  customerId: string;
  driverId?: string;
  restaurantId: string;
  status: RideStatus;
  customerPosition: Position;
  destinationPosition: Position;
  restaurantPosition: Position;
  estimatedPrice: number;
  createdAt: Date;
  completedAt?: Date;
  rating?: number;
}
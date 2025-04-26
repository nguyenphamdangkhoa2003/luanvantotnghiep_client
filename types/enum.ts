export enum RoleEnum {
    ADMIN = 'ADMIN',
    PASSENGER = 'PASSENGER',
    DRIVER = 'DRIVER',
}
export enum AvatarProviderEnum {
    GOOGLE = 'google',
    CLOUDINARY = 'cloudinary',
    DEFAULT = 'default',
}
export interface Trip {
  id: string;
  startLocation: {
    coordinates: {
      lat: number;
      lng: number;
    };
    address: string;
    placeid: string;
  };
  endLocation: {
    coordinates: {
      lat: number;
      lng: number;
    };
    address: string;
    placeid: string;
  };
  schedule: {
    recurring: {
      daysOfWeek: string[];
    };
    startTime: string;
    endTime: string;
  };
  userId: {
    _id: string;
    name: string;
    avatar: {
      url: string;
      provider: string;
      _id: string;
    };
  };
  tripCode: string;
  availableSeats: number;
  status: string;
  isDeleted: boolean;
  waypoints: any[];
  createdAt: string;
  updatedAt: string;
}

import { IUserLocation } from '@/types/user-location';
import { createContext, Dispatch, SetStateAction } from 'react';
export interface UserLocationContextType {
    userLocation: IUserLocation | undefined;
    setUserLocation: Dispatch<SetStateAction<IUserLocation | undefined>>;
}
export const UserLocationContext = createContext<
    UserLocationContextType | undefined
>(undefined);

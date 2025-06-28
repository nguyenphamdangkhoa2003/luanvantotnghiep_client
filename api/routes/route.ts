import API from '../api';



export type SearchRouteType = {
    startCoords?: { lng: number; lat: number };
    endCoords?: { lng: number; lat: number };
    maxDistance?: number;
    date?: string;
    name?: string;
    frequency?: string;
    seatsAvailable?: number;
    priceRange?: {
        min?: number;
        max?: number;
    };
    status?: string;
};

type RequestRouteType = {
    routeId: string;
    message?: string;
    seats: number;
};

type HandleRequestType = {
    requestId: string;
    action: 'accept' | 'reject';
    reason?: string;
};

type GetPassengersType = {
    routeId: string;
};

type CancelRequestType = {
    requestId: string;
};

type CompleteTripType = {
  tripRequestId: string
}

export const cancelBookingMutationFn = async (data: CancelRequestType) => {
  return await API.post('/routes/cancel', data)
}

// Get detail route
export const getRouteByIdQueryFn = async (routeId: string) => {
    return await API.get(`/routes/${routeId}`);
};

// Create a new route (DRIVER only)
export const createRouteMutationFn = async (data: any) => {
    return await API.post('/routes', data);
};

// Search routes
export const searchRoutesQueryFn = async (data: SearchRouteType) => {
    return await API.post('/routes/search', data);
};

// Request to join a route
export const requestRouteMutationFn = async (data: RequestRouteType) => {
    return await API.post('/routes/request', data);
};

// Handle route join request
export const handleRequestMutationFn = async (data: HandleRequestType) => {
    return await API.post('/routes/handle-request', data);
};

// Get passengers for a route (DRIVER only)
export const getPassengersQueryFn = async (data: GetPassengersType) => {
    return await API.post('/routes/passengers', data);
};

export const getRequestsByDriverIdQueryFn = async (driverId: string) => {
  return await API.get(`/routes/requests/driver/${driverId}`)
}

export const completeTripMutationFn = async (data: CompleteTripType) => {
  return await API.patch(`/routes/${data.tripRequestId}/complete`, {})
}

export const getRoutesByDriverQueryFn = async (userId: string) => {
  return await API.get(`/routes/driver/${userId}`)
}

export const getRoutesByPassengerQueryFn = async (userId: string) => {
  return await API.get(`/routes/passenger/${userId}`)
}

export const getRequestsByUserIdQueryFn = async (userId: string) => {
  return await API.get(`/routes/requests/user/${userId}`)
}

export const getBookingHistoryQueryFn = async () => {
  return await API.get(`/routes/history/booking`)
}
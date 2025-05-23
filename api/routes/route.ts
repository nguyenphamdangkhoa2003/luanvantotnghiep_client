import API from '../api'



type CreateRouteType = {
  startAddress: string
  endAddress: string
  startCoords: { lng: number; lat: number }
  endCoords: { lng: number; lat: number }
  waypoints?: { type: string; coordinates: [number, number] }[]
  path?: { type: string; coordinates: [number, number][] }
  distance?: number
  duration?: number
  routeIndex?: number
  name: string
  startTime: string
  price: number
  seatsAvailable: number
  frequency?: string
}

export type SearchRouteType = {
  startCoords?: { lng: number; lat: number }
  endCoords?: { lng: number; lat: number }
  maxDistance?: number
  date?: string
  name?: string
  frequency?: string
  seatsAvailable?: number
  priceRange?: {
    min?: number
    max?: number
  }
  status?: string
}

type RequestRouteType = {
  routeId: string
  message?: string
  seats: number
}

type HandleRequestType = {
  requestId: string
  action: 'accept' | 'reject'
  reason?: string
}

type GetPassengersType = {
  routeId: string
}

type CancelRequestType = {
  requestId: string
}

// Cancel route by driver
export const cancelBookingMutationFn = async (data: CancelRequestType) => {
  return await API.post('/routes/cancel', data)
}

// Get detail route 
export const getRouteByIdQueryFn = async (routeId: string) => {
  return await API.get(`/routes/${routeId}`);
};

// Create a new route (DRIVER only)
export const createRouteMutationFn = async (data: CreateRouteType) => {
  return await API.post('/routes', data)
}

// Search routes
export const searchRoutesQueryFn = async (data: SearchRouteType) => {
  return await API.post('/routes/search', data)
}

// Request to join a route
export const requestRouteMutationFn = async (data: RequestRouteType) => {
  return await API.post('/routes/request', data)
}

// Handle route join request
export const handleRequestMutationFn = async (data: HandleRequestType) => {
  return await API.post('/routes/handle-request', data)
}

// Get passengers for a route (DRIVER only)
export const getPassengersQueryFn = async (data: GetPassengersType) => {
  return await API.post('/routes/passengers', data)
}

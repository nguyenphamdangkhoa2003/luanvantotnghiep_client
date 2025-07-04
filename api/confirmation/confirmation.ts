import API from '../api'




// Get trip confirmation by trip request ID
export const getTripConfirmationByRequestQueryFn = async (
  tripRequestId: string
) => {
  return await API.get(`/trip-confirmations/by-request/${tripRequestId}`)
}

// Update a trip confirmation
export const updateTripConfirmationMutationFn = async (
  id: string,
  data: any
) => {
  return await API.patch(`/trip-confirmations/${id}`, data)
}

// Delete a trip confirmation
export const deleteTripConfirmationMutationFn = async (id: string) => {
  return await API.delete(`/trip-confirmations/${id}`)
}

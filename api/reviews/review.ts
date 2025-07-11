import API from '../api'

export type CreateReviewType = {
  revieweeId: string
  tripRequestId: string
  rating: number
  reviewType: 'customer' | 'driver'
  comment?: string
}
interface ReviewCheckResponse {
  hasReviewed: boolean
}

// Create a review
export const createReviewMutationFn = async (data: CreateReviewType) => {
  return await API.post('/reviews', data)
}

// Get reviews given by a user
export const getReviewsGivenByUserQueryFn = async (userId: string) => {
  return await API.get(`/reviews/given/${userId}`)
}

// Get reviews received by a user
export const getReviewsReceivedByUserQueryFn = async (userId: string) => {
  return await API.get(`/reviews/received/${userId}`)
}

export const checkReviewStatusQueryFn = async (
  tripRequestId: string,
  reviewerId: string
): Promise<ReviewCheckResponse> => {
  return await API.get(
    `/reviews/check/${tripRequestId}?reviewerId=${reviewerId}`
  ).then((res) => res.data)
}

export const getAllReviewsQueryFn = async () => {
  return await API.get('/reviews').then((res) => res.data)
}
import API from '../api'

type PurchaseMembershipType = {
  packageType: string
}

type CreatePackageType = {
  name: string
  acceptRequests: number
  price: number
  durationDays: number
}

type UpdatePackageType = {
  name?: string
  acceptRequests?: number
  price?: number
  durationDays?: number
}

// Purchase membership
export const purchaseMembershipMutationFn = async (
  data: PurchaseMembershipType
) => {
  return await API.post('/membership/purchase', data)
}

// Handle VNPay callback
export const handleVnpayCallbackQueryFn = async (vnpayData: any) => {
  return await API.get('/membership/vnpay-callback', { params: vnpayData })
}

// Get membership info
export const getMembershipInfoQueryFn = async (userId: string) => {
  return await API.get(`/membership/info/${userId}`)
}

export const getAllPackagesQueryFn = async () => {
  return await API.get('/membership/packages')
}

// Admin: Create package
export const createPackageMutationFn = async (data: CreatePackageType) => {
  return await API.post('/membership/packages', data)
}

// Admin: Update package
export const updatePackageMutationFn = async (
  packageName: string,
  data: UpdatePackageType
) => {
  return await API.post(`/membership/packages/${packageName}`, data)
}

// Admin: Delete package
export const deletePackageMutationFn = async (packageName: string) => {
  return await API.delete(`/membership/packages/${packageName}`)
}

// Get all memberships
export const getAllMembershipsQueryFn = async () => {
  return await API.get('/membership')
}

// Get active membership for authenticated user
export const getActiveMembershipQueryFn = async () => {
  try {
    return await API.get('/membership/me')
  } catch (error: any) {
    if (error.response?.status === 404) {
      return { data: null }
    }
    throw error
  }
}

import API from '../api'

type UpdateUserType = {
  name?: string
  phoneNumber?: string
  dateOfBirth?: string
  bio?: string
}

type UpdateRoleType = {
  role: string
}

type UploadDocumentType = {
  type: 'driverLicense' | 'identityDocument'
  documentNumber: string
  frontFile: File
  backFile: File
}

type VerifyDocumentType = {
  action: 'approve' | 'reject'
  reason?: string
}

type CreateVehicleType = {
  licensePlate: string
  model: string
  seats: number // Added seats
  registrationDocument: File
  insuranceDocument?: File
}

type UpdateVehicleType = {
  licensePlate?: string
  model?: string
  seats?: number // Added seats for consistency
  registrationDocument?: File
  insuranceDocument?: File
}

type ApproveVehicleType = {
  verificationStatus: 'approved' | 'rejected'
  rejectionReason?: string
}

// Get detail users (ADMIN only)
export const getUserByIdQueryFn = async (userId: string) => {
  return await API.get(`/users/${userId}`)
}

// Get all users (ADMIN only)
export const getUsersQueryFn = async () => {
  return await API.get('/users')
}

// Update user avatar
export const updateUserAvatarMutationFn = async (avatar: File) => {
  const formData = new FormData()
  formData.append('avatar', avatar)

  return await API.post('/users/me/avatar', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}

export const updateUserProfileMutationFn = async (data: UpdateUserType) => {
  return await API.patch('/users/me', data)
}

// Update user role
export const updateUserRoleMutationFn = async (data: UpdateRoleType) => {
  return await API.patch('/users/me/role', data)
}

// Upload document
export const uploadDocumentMutationFn = async (data: UploadDocumentType) => {
  const formData = new FormData()
  formData.append('frontFile', data.frontFile)
  formData.append('backFile', data.backFile)
  formData.append('type', data.type)
  formData.append('documentNumber', data.documentNumber)

  return await API.post('/users/me/documents', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}

// Verify document (ADMIN only)
export const verifyDocumentMutationFn = async (
  userId: string,
  type: 'driverLicense' | 'identityDocument',
  data: VerifyDocumentType
) => {
  return await API.patch(`/users/${userId}/${type}`, data)
}

// Add vehicle (DRIVER only)
export const addVehicleMutationFn = async (data: CreateVehicleType) => {
  const formData = new FormData()
  formData.append('licensePlate', data.licensePlate)
  formData.append('model', data.model)
  formData.append('seats', String(data.seats)) // Added seats
  formData.append('registrationDocument', data.registrationDocument)
  if (data.insuranceDocument) {
    formData.append('insuranceDocument', data.insuranceDocument)
  }

  return await API.post('/users/me/vehicles', formData) // Removed Content-Type
}

// Get user vehicles (DRIVER only)
export const getUserVehiclesQueryFn = async () => {
  return await API.get('/users/me/vehicles')
}

// Update vehicle (DRIVER only)
export const updateVehicleMutationFn = async (
  vehicleId: string,
  data: UpdateVehicleType
) => {
  const formData = new FormData()
  if (data.licensePlate) formData.append('licensePlate', data.licensePlate)
  if (data.model) formData.append('model', data.model)
  if (data.registrationDocument) {
    formData.append('registrationDocument', data.registrationDocument)
  }
  if (data.insuranceDocument) {
    formData.append('insuranceDocument', data.insuranceDocument)
  }

  return await API.patch(`/users/me/vehicles/${vehicleId}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}

// Delete vehicle (DRIVER only)
export const deleteVehicleMutationFn = async (vehicleId: string) => {
  return await API.delete(`/users/me/vehicles/${vehicleId}`)
}

// Get user vehicles by ID (ADMIN only)
export const getUserVehiclesByIdQueryFn = async (userId: string) => {
  return await API.get(`/users/${userId}/vehicles`)
}

// Approve vehicle (ADMIN only)
export const approveVehicleMutationFn = async (
  userId: string,
  vehicleId: string,
  data: ApproveVehicleType
) => {
  return await API.patch(`/users/${userId}/vehicles/${vehicleId}`, data)
}

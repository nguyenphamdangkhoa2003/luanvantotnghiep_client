export interface Vehicle {
  _id: string
  licensePlate: string
  model: string
  seats: number
  registrationDocument: string
  insuranceDocument?: string
  verificationStatus: 'pending' | 'approved' | 'rejected'
}

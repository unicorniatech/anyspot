export type Role = 'user' | 'reception' | 'management' | 'admin' | 'superadmin'

export type ClassStatus = 'scheduled' | 'checked-in' | 'completed'
export type PartnerStatus = 'pending' | 'active' | 'paused'
export type PayoutStatus = 'scheduled' | 'processing' | 'paid'

export type User = {
  id: string
  name: string
  email: string
  role: Role
  creditsBalance: number
}

export type Gym = {
  id: string
  name: string
  city: string
  status: PartnerStatus
  monthlyBookings: number
  payoutDueCzk: number
}

export type FitnessClass = {
  id: string
  gymId: string
  title: string
  trainer: string
  startsAt: string
  capacity: number
  bookedCount: number
  creditsRequired: number
  status: ClassStatus
}

export type Booking = {
  id: string
  userId: string
  classId: string
  customerName: string
  checkedIn: boolean
  status: 'confirmed' | 'completed' | 'cancelled'
}

export type Payout = {
  id: string
  gymId: string
  amountCzk: number
  period: string
  status: PayoutStatus
}

export type AuditEvent = {
  id: string
  actor: string
  action: string
  createdAt: string
}

export type AnySpotMockState = {
  users: User[]
  gyms: Gym[]
  classes: FitnessClass[]
  bookings: Booking[]
  payouts: Payout[]
  auditEvents: AuditEvent[]
  platformSettings: {
    commissionPercent: number
    firstTenGymsFreeMonths: number
    payoutCadenceDays: number
    redisCachePlanned: boolean
  }
}

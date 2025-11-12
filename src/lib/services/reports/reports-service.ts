import { db } from '@/lib/db'

export interface ReportData {
  clients: any[]
  registrations: any[]
  returns: any[]
  payments: any[]
  notices: any[]
  invoices: any[]
}

export interface ClientSummary {
  total: number
  active: number
  inactive: number
  newThisMonth: number
}

export interface RegistrationSummary {
  total: number
  draft: number
  submitted: number
  approved: number
  rejected: number
  pendingApproval: number
}

export interface ReturnSummary {
  total: number
  filed: number
  pending: number
  overdue: number
  lateFiled: number
}

export interface FinancialSummary {
  totalRevenue: number
  pendingPayments: number
  overduePayments: number
  thisMonthRevenue: number
  lastMonthRevenue: number
}

export interface NoticeSummary {
  total: number
  pending: number
  inProgress: number
  replied: number
  resolved: number
  overdue: number
}

export interface ComplianceMetric {
  month: string
  returnsFiled: number
  returnsDue: number
  complianceRate: number
  lateFilings: number
}

export interface RevenueData {
  month: string
  revenue: number
  invoices: number
  clients: number
}

export interface TopClient {
  id: string
  businessName: string
  pan: string
  revenue: number
  returns: number
  registrations: number
}

class ReportsService {
  async getReportData(): Promise<ReportData> {
    try {
      const [clients, registrations, returns, payments, notices, invoices] = await Promise.all([
        db.client.findMany({
          include: {
            user: {
              select: { id: true, name: true, email: true }
            }
          }
        }),
        db.gSTRegistration.findMany({
          include: {
            client: {
              select: { id: true, businessName: true, pan: true }
            }
          }
        }),
        db.gSTReturn.findMany({
          include: {
            client: {
              select: { id: true, businessName: true, pan: true }
            }
          }
        }),
        db.gSTPayment.findMany({
          include: {
            client: {
              select: { id: true, businessName: true, pan: true }
            }
          }
        }),
        db.notice.findMany({
          include: {
            client: {
              select: { id: true, businessName: true, pan: true }
            }
          }
        }),
        db.invoice.findMany({
          include: {
            client: {
              select: { id: true, businessName: true, pan: true }
            },
            user: {
              select: { id: true, name: true, email: true }
            }
          }
        })
      ])

      return {
        clients,
        registrations,
        returns,
        payments,
        notices,
        invoices
      }
    } catch (error) {
      console.error('Error fetching report data:', error)
      throw error
    }
  }

  async getClientSummary(): Promise<ClientSummary> {
    const data = await this.getReportData()
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    return {
      total: data.clients.length,
      active: data.clients.filter(c => c.gstStatus === 'ACTIVE').length,
      inactive: data.clients.filter(c => c.gstStatus !== 'ACTIVE').length,
      newThisMonth: data.clients.filter(c => new Date(c.createdAt) >= startOfMonth).length
    }
  }

  async getRegistrationSummary(): Promise<RegistrationSummary> {
    const data = await this.getReportData()

    return {
      total: data.registrations.length,
      draft: data.registrations.filter(r => r.status === 'Draft').length,
      submitted: data.registrations.filter(r => r.status === 'Submitted').length,
      approved: data.registrations.filter(r => r.status === 'Approved').length,
      rejected: data.registrations.filter(r => r.status === 'Rejected').length,
      pendingApproval: data.registrations.filter(r => r.status === 'Submitted' && !r.approvedAt).length
    }
  }

  async getReturnSummary(): Promise<ReturnSummary> {
    const data = await this.getReportData()
    const now = new Date()

    return {
      total: data.returns.length,
      filed: data.returns.filter(r => r.status === 'FILED' || r.status === 'PROCESSED').length,
      pending: data.returns.filter(r => r.status === 'DRAFT').length,
      overdue: data.returns.filter(r => {
        const dueDate = new Date(r.dueDate)
        return r.status === 'DRAFT' && dueDate < now
      }).length,
      lateFiled: data.returns.filter(r => {
        const dueDate = new Date(r.dueDate)
        const filedDate = r.filedAt ? new Date(r.filedAt) : null
        return filedDate && filedDate > dueDate
      }).length
    }
  }

  async getFinancialSummary(): Promise<FinancialSummary> {
    const data = await this.getReportData()
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    const thisMonthInvoices = data.invoices.filter(i => new Date(i.issuedAt) >= startOfMonth)
    const lastMonthInvoices = data.invoices.filter(i => {
      const issuedAt = new Date(i.issuedAt)
      return issuedAt >= startOfLastMonth && issuedAt < endOfLastMonth
    })

    return {
      totalRevenue: data.invoices.reduce((sum, inv) => sum + inv.amount, 0),
      pendingPayments: data.invoices.filter(i => i.status === 'Draft' || i.status === 'Sent').reduce((sum, inv) => sum + inv.amount, 0),
      overduePayments: data.invoices.filter(i => {
        const dueDate = new Date(i.dueDate)
        return (i.status === 'Draft' || i.status === 'Sent') && dueDate < now
      }).reduce((sum, inv) => sum + inv.amount, 0),
      thisMonthRevenue: thisMonthInvoices.reduce((sum, inv) => sum + inv.amount, 0),
      lastMonthRevenue: lastMonthInvoices.reduce((sum, inv) => sum + inv.amount, 0)
    }
  }

  async getNoticeSummary(): Promise<NoticeSummary> {
    const data = await this.getReportData()
    const now = new Date()

    return {
      total: data.notices.length,
      pending: data.notices.filter(n => n.status === 'RECEIVED').length,
      inProgress: data.notices.filter(n => n.status === 'IN_PROGRESS').length,
      replied: data.notices.filter(n => n.status === 'REPLIED').length,
      resolved: data.notices.filter(n => n.status === 'RESOLVED').length,
      overdue: data.notices.filter(n => {
        const dueDate = new Date(n.dueDate)
        return n.status !== 'RESOLVED' && dueDate < now
      }).length
    }
  }

  async getComplianceMetrics(months: number = 12): Promise<ComplianceMetric[]> {
    const data = await this.getReportData()
    const metrics: ComplianceMetric[] = []
    const now = new Date()

    for (let i = months - 1; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthStr = monthDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
      
      const monthReturns = data.returns.filter(r => {
        const returnPeriod = new Date(r.dueDate)
        return returnPeriod.getMonth() === monthDate.getMonth() && 
               returnPeriod.getFullYear() === monthDate.getFullYear()
      })

      const returnsFiled = monthReturns.filter(r => r.status === 'FILED' || r.status === 'PROCESSED').length
      const returnsDue = monthReturns.length
      const lateFilings = monthReturns.filter(r => {
        const dueDate = new Date(r.dueDate)
        const filedDate = r.filedAt ? new Date(r.filedAt) : null
        return filedDate && filedDate > dueDate
      }).length

      metrics.push({
        month: monthStr,
        returnsFiled,
        returnsDue,
        complianceRate: returnsDue > 0 ? Math.round((returnsFiled / returnsDue) * 100) : 0,
        lateFilings
      })
    }

    return metrics
  }

  async getRevenueData(months: number = 12): Promise<RevenueData[]> {
    const data = await this.getReportData()
    const revenueData: RevenueData[] = []
    const now = new Date()

    for (let i = months - 1; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const nextMonthDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 1)
      const monthStr = monthDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
      
      const monthInvoices = data.invoices.filter(i => {
        const issuedAt = new Date(i.issuedAt)
        return issuedAt >= monthDate && issuedAt < nextMonthDate
      })

      const monthClients = new Set(monthInvoices.map(i => i.clientId)).size

      revenueData.push({
        month: monthStr,
        revenue: monthInvoices.reduce((sum, inv) => sum + inv.amount, 0),
        invoices: monthInvoices.length,
        clients: monthClients
      })
    }

    return revenueData
  }

  async getTopClients(limit: number = 10): Promise<TopClient[]> {
    const data = await this.getReportData()
    
    // Calculate revenue per client
    const clientRevenue = new Map<string, number>()
    const clientReturns = new Map<string, number>()
    const clientRegistrations = new Map<string, number>()

    data.invoices.forEach(inv => {
      const current = clientRevenue.get(inv.clientId) || 0
      clientRevenue.set(inv.clientId, current + inv.amount)
    })

    data.returns.forEach(ret => {
      const current = clientReturns.get(ret.clientId) || 0
      clientReturns.set(ret.clientId, current + 1)
    })

    data.registrations.forEach(reg => {
      const current = clientRegistrations.get(reg.clientId) || 0
      clientRegistrations.set(reg.clientId, current + 1)
    })

    // Create top clients array
    const topClients: TopClient[] = data.clients.map(client => ({
      id: client.id,
      businessName: client.businessName,
      pan: client.pan,
      revenue: clientRevenue.get(client.id) || 0,
      returns: clientReturns.get(client.id) || 0,
      registrations: clientRegistrations.get(client.id) || 0
    }))

    // Sort by revenue and return top N
    return topClients
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, limit)
  }

  async generateClientReport(clientId: string) {
    const data = await this.getReportData()
    const client = data.clients.find(c => c.id === clientId)
    
    if (!client) {
      throw new Error('Client not found')
    }

    const clientRegistrations = data.registrations.filter(r => r.clientId === clientId)
    const clientReturns = data.returns.filter(r => r.clientId === clientId)
    const clientPayments = data.payments.filter(p => p.clientId === clientId)
    const clientNotices = data.notices.filter(n => n.clientId === clientId)
    const clientInvoices = data.invoices.filter(i => i.clientId === clientId)

    return {
      client,
      registrations: clientRegistrations,
      returns: clientReturns,
      payments: clientPayments,
      notices: clientNotices,
      invoices: clientInvoices,
      summary: {
        totalRegistrations: clientRegistrations.length,
        approvedRegistrations: clientRegistrations.filter(r => r.status === 'Approved').length,
        totalReturns: clientReturns.length,
        filedReturns: clientReturns.filter(r => r.status === 'FILED' || r.status === 'PROCESSED').length,
        totalPayments: clientPayments.length,
        paidPayments: clientPayments.filter(p => p.status === 'PAID').length,
        totalNotices: clientNotices.length,
        resolvedNotices: clientNotices.filter(n => n.status === 'RESOLVED').length,
        totalInvoices: clientInvoices.length,
        paidInvoices: clientInvoices.filter(i => i.status === 'Paid').reduce((sum, inv) => sum + inv.amount, 0),
        outstandingInvoices: clientInvoices.filter(i => i.status !== 'Paid').reduce((sum, inv) => sum + inv.amount, 0)
      }
    }
  }
}

export const reportsService = new ReportsService()
export default ReportsService
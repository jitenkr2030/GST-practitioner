import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const reportType = searchParams.get('type')
    const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString())
    const month = searchParams.get('month')

    if (!reportType) {
      return NextResponse.json({ error: 'Report type is required' }, { status: 400 })
    }

    switch (reportType) {
      case 'client-summary':
        return await generateClientSummaryReport(year, month)
      case 'returns-filing':
        return await generateReturnsFilingReport(year, month)
      case 'payment-analysis':
        return await generatePaymentAnalysisReport(year, month)
      case 'compliance-status':
        return await generateComplianceStatusReport(year, month)
      case 'revenue-trend':
        return await generateRevenueTrendReport(year)
      case 'notice-management':
        return await generateNoticeManagementReport(year, month)
      default:
        return NextResponse.json({ error: 'Invalid report type' }, { status: 400 })
    }
  } catch (error) {
    console.error('Error generating report:', error)
    return NextResponse.json(
      { error: 'Failed to generate report' },
      { status: 500 }
    )
  }
}

async function generateClientSummaryReport(year: number, month?: string) {
  const whereClause: any = {
    createdAt: {
      gte: new Date(year, 0, 1),
      lt: new Date(year + 1, 0, 1)
    }
  }

  if (month) {
    const monthIndex = parseInt(month) - 1
    whereClause.createdAt = {
      gte: new Date(year, monthIndex, 1),
      lt: new Date(year, monthIndex + 1, 1)
    }
  }

  const [clients, registrations, returns] = await Promise.all([
    db.client.findMany({
      where: whereClause,
      select: {
        id: true,
        businessName: true,
        gstin: true,
        pan: true,
        email: true,
        phone: true,
        gstStatus: true,
        createdAt: true,
        _count: {
          select: {
            gstReturns: true,
            gstRegistrations: true,
            notices: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    }),
    db.gSTRegistration.findMany({
      where: {
        createdAt: whereClause.createdAt
      },
      select: {
        id: true,
        status: true,
        createdAt: true,
        clientId: true
      }
    }),
    db.gSTReturn.findMany({
      where: {
        createdAt: whereClause.createdAt
      },
      select: {
        id: true,
        status: true,
        returnType: true,
        createdAt: true,
        clientId: true
      }
    })
  ])

  const summary = {
    totalClients: clients.length,
    activeGST: clients.filter(c => c.gstStatus === 'ACTIVE').length,
    inactiveGST: clients.filter(c => c.gstStatus === 'INACTIVE').length,
    newRegistrations: registrations.filter(r => r.status === 'Approved').length,
    totalReturnsFiled: returns.filter(r => r.status === 'FILED').length,
    overdueReturns: returns.filter(r => r.status === 'OVERDUE').length,
    clients,
    period: month ? `${month}-${year}` : year.toString()
  }

  return NextResponse.json(summary)
}

async function generateReturnsFilingReport(year: number, month?: string) {
  const whereClause: any = {
    dueDate: {
      gte: new Date(year, 0, 1),
      lt: new Date(year + 1, 0, 1)
    }
  }

  if (month) {
    const monthIndex = parseInt(month) - 1
    whereClause.dueDate = {
      gte: new Date(year, monthIndex, 1),
      lt: new Date(year, monthIndex + 1, 1)
    }
  }

  const returns = await db.gSTReturn.findMany({
    where: whereClause,
    include: {
      client: {
        select: {
          id: true,
          businessName: true,
          gstin: true
        }
      },
      payments: {
        select: {
          id: true,
          amount: true,
          status: true
        }
      }
    },
    orderBy: { dueDate: 'desc' }
  })

  const summary = {
    totalReturns: returns.length,
    filed: returns.filter(r => r.status === 'FILED').length,
    overdue: returns.filter(r => r.status === 'OVERDUE').length,
    draft: returns.filter(r => r.status === 'DRAFT').length,
    processed: returns.filter(r => r.status === 'PROCESSED').length,
    rejected: returns.filter(r => r.status === 'REJECTED').length,
    returnTypeBreakdown: returns.reduce((acc, ret) => {
      acc[ret.returnType] = (acc[ret.returnType] || 0) + 1
      return acc
    }, {} as Record<string, number>),
    totalTaxAmount: returns.reduce((sum, ret) => {
      return sum + ret.payments.reduce((paymentSum, payment) => paymentSum + payment.amount, 0)
    }, 0),
    returns,
    period: month ? `${month}-${year}` : year.toString()
  }

  return NextResponse.json(summary)
}

async function generatePaymentAnalysisReport(year: number, month?: string) {
  const whereClause: any = {
    createdAt: {
      gte: new Date(year, 0, 1),
      lt: new Date(year + 1, 0, 1)
    }
  }

  if (month) {
    const monthIndex = parseInt(month) - 1
    whereClause.createdAt = {
      gte: new Date(year, monthIndex, 1),
      lt: new Date(year, monthIndex + 1, 1)
    }
  }

  const payments = await db.gSTPayment.findMany({
    where: whereClause,
    include: {
      client: {
        select: {
          id: true,
          businessName: true,
          gstin: true
        }
      },
      gstReturn: {
        select: {
          id: true,
          returnType: true,
          period: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  const summary = {
    totalPayments: payments.length,
    paid: payments.filter(p => p.status === 'PAID').length,
    pending: payments.filter(p => p.status === 'PENDING').length,
    failed: payments.filter(p => p.status === 'FAILED').length,
    refunded: payments.filter(p => p.status === 'REFUNDED').length,
    totalAmount: payments.reduce((sum, p) => sum + p.amount, 0),
    paidAmount: payments.filter(p => p.status === 'PAID').reduce((sum, p) => sum + p.amount, 0),
    pendingAmount: payments.filter(p => p.status === 'PENDING').reduce((sum, p) => sum + p.amount, 0),
    paymentTypeBreakdown: payments.reduce((acc, payment) => {
      acc[payment.paymentType] = (acc[payment.paymentType] || 0) + 1
      return acc
    }, {} as Record<string, number>),
    payments,
    period: month ? `${month}-${year}` : year.toString()
  }

  return NextResponse.json(summary)
}

async function generateComplianceStatusReport(year: number, month?: string) {
  const whereClause: any = {
    createdAt: {
      gte: new Date(year, 0, 1),
      lt: new Date(year + 1, 0, 1)
    }
  }

  if (month) {
    const monthIndex = parseInt(month) - 1
    whereClause.createdAt = {
      gte: new Date(year, monthIndex, 1),
      lt: new Date(year, monthIndex + 1, 1)
    }
  }

  const [clients, returns, notices] = await Promise.all([
    db.client.findMany({
      select: {
        id: true,
        businessName: true,
        gstin: true,
        gstStatus: true
      }
    }),
    db.gSTReturn.findMany({
      where: whereClause,
      select: {
        id: true,
        status: true,
        dueDate: true,
        clientId: true
      }
    }),
    db.notice.findMany({
      where: whereClause,
      select: {
        id: true,
        status: true,
        dueDate: true,
        clientId: true
      }
    })
  ])

  const clientCompliance = clients.map(client => {
    const clientReturns = returns.filter(r => r.clientId === client.id)
    const clientNotices = notices.filter(n => n.clientId === client.id)
    
    const overdueReturns = clientReturns.filter(r => 
      r.status !== 'FILED' && new Date(r.dueDate) < new Date()
    ).length
    
    const pendingNotices = clientNotices.filter(n => 
      n.status !== 'RESOLVED' && new Date(n.dueDate) < new Date()
    ).length

    return {
      client,
      totalReturns: clientReturns.length,
      filedReturns: clientReturns.filter(r => r.status === 'FILED').length,
      overdueReturns,
      totalNotices: clientNotices.length,
      pendingNotices,
      complianceScore: Math.max(0, 100 - (overdueReturns * 10) - (pendingNotices * 20))
    }
  })

  const summary = {
    totalClients: clients.length,
    fullyCompliant: clientCompliance.filter(c => c.complianceScore === 100).length,
    partiallyCompliant: clientCompliance.filter(c => c.complianceScore >= 70 && c.complianceScore < 100).length,
    nonCompliant: clientCompliance.filter(c => c.complianceScore < 70).length,
    averageComplianceScore: clientCompliance.reduce((sum, c) => sum + c.complianceScore, 0) / clients.length,
    totalOverdueReturns: clientCompliance.reduce((sum, c) => sum + c.overdueReturns, 0),
    totalPendingNotices: clientCompliance.reduce((sum, c) => sum + c.pendingNotices, 0),
    clientCompliance,
    period: month ? `${month}-${year}` : year.toString()
  }

  return NextResponse.json(summary)
}

async function generateRevenueTrendReport(year: number) {
  const invoices = await db.invoice.findMany({
    where: {
      issuedAt: {
        gte: new Date(year, 0, 1),
        lt: new Date(year + 1, 0, 1)
      }
    },
    include: {
      client: {
        select: {
          id: true,
          businessName: true
        }
      }
    },
    orderBy: { issuedAt: 'asc' }
  })

  const monthlyData = Array.from({ length: 12 }, (_, i) => {
    const monthInvoices = invoices.filter(inv => 
      new Date(inv.issuedAt).getMonth() === i
    )
    
    return {
      month: new Date(year, i).toLocaleString('default', { month: 'short' }),
      invoices: monthInvoices.length,
      totalAmount: monthInvoices.reduce((sum, inv) => sum + inv.amount, 0),
      paidAmount: monthInvoices.filter(inv => inv.status === 'PAID').reduce((sum, inv) => sum + inv.amount, 0),
      pendingAmount: monthInvoices.filter(inv => inv.status !== 'PAID').reduce((sum, inv) => sum + inv.amount, 0)
    }
  })

  const summary = {
    yearlyTotal: invoices.reduce((sum, inv) => sum + inv.amount, 0),
    yearlyPaid: invoices.filter(inv => inv.status === 'PAID').reduce((sum, inv) => sum + inv.amount, 0),
    yearlyPending: invoices.filter(inv => inv.status !== 'PAID').reduce((sum, inv) => sum + inv.amount, 0),
    totalInvoices: invoices.length,
    paidInvoices: invoices.filter(inv => inv.status === 'PAID').length,
    pendingInvoices: invoices.filter(inv => inv.status !== 'PAID').length,
    monthlyData,
    year: year.toString()
  }

  return NextResponse.json(summary)
}

async function generateNoticeManagementReport(year: number, month?: string) {
  const whereClause: any = {
    receivedAt: {
      gte: new Date(year, 0, 1),
      lt: new Date(year + 1, 0, 1)
    }
  }

  if (month) {
    const monthIndex = parseInt(month) - 1
    whereClause.receivedAt = {
      gte: new Date(year, monthIndex, 1),
      lt: new Date(year, monthIndex + 1, 1)
    }
  }

  const notices = await db.notice.findMany({
    where: whereClause,
    include: {
      client: {
        select: {
          id: true,
          businessName: true,
          gstin: true
        }
      },
      documents: {
        select: {
          id: true,
          name: true,
          type: true
        }
      }
    },
    orderBy: { receivedAt: 'desc' }
  })

  const summary = {
    totalNotices: notices.length,
    received: notices.filter(n => n.status === 'RECEIVED').length,
    inProgress: notices.filter(n => n.status === 'IN_PROGRESS').length,
    replied: notices.filter(n => n.status === 'REPLIED').length,
    resolved: notices.filter(n => n.status === 'RESOLVED').length,
    overdue: notices.filter(n => 
      n.status !== 'RESOLVED' && new Date(n.dueDate) < new Date()
    ).length,
    noticeTypeBreakdown: notices.reduce((acc, notice) => {
      acc[notice.noticeType] = (acc[notice.noticeType] || 0) + 1
      return acc
    }, {} as Record<string, number>),
    notices,
    period: month ? `${month}-${year}` : year.toString()
  }

  return NextResponse.json(summary)
}
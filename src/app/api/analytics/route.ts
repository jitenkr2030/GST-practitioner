import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '6months'

    // Calculate date range based on period
    const now = new Date()
    let startDate = new Date()
    
    switch (period) {
      case '1month':
        startDate.setMonth(now.getMonth() - 1)
        break
      case '3months':
        startDate.setMonth(now.getMonth() - 3)
        break
      case '6months':
        startDate.setMonth(now.getMonth() - 6)
        break
      case '1year':
        startDate.setFullYear(now.getFullYear() - 1)
        break
      default:
        startDate.setMonth(now.getMonth() - 6)
    }

    // Get basic counts
    const [totalClients, activeGSTClients] = await Promise.all([
      db.client.count({
        where: {
          userId: session.user.id
        }
      }),
      db.client.count({
        where: {
          userId: session.user.id,
          gstStatus: 'ACTIVE'
        }
      })
    ])

    // Get monthly returns data
    const monthlyReturns = await db.gSTReturn.groupBy({
      by: ['period'],
      where: {
        client: {
          userId: session.user.id
        },
        createdAt: {
          gte: startDate
        }
      },
      _count: {
        id: true
      },
      orderBy: {
        period: 'asc'
      }
    })

    // Get monthly revenue (from invoices)
    const monthlyRevenue = await db.invoice.groupBy({
      by: ['issuedAt'],
      where: {
        user: {
          id: session.user.id
        },
        issuedAt: {
          gte: startDate
        }
      },
      _sum: {
        amount: true
      },
      orderBy: {
        issuedAt: 'asc'
      }
    })

    // Get services count by type
    const servicesByType = await db.service.groupBy({
      by: ['type'],
      where: {
        client: {
          userId: session.user.id
        },
        createdAt: {
          gte: startDate
        }
      },
      _count: {
        id: true
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      }
    })

    // Get client acquisition data
    const clientAcquisition = await db.client.groupBy({
      by: ['createdAt'],
      where: {
        userId: session.user.id,
        createdAt: {
          gte: startDate
        }
      },
      _count: {
        id: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    })

    // Calculate compliance rate
    const totalReturns = await db.gSTReturn.count({
      where: {
        client: {
          userId: session.user.id
        },
        createdAt: {
          gte: startDate
        }
      }
    })

    const filedReturns = await db.gSTReturn.count({
      where: {
        client: {
          userId: session.user.id
        },
        status: 'FILED',
        createdAt: {
          gte: startDate
        }
      }
    })

    const complianceRate = totalReturns > 0 ? (filedReturns / totalReturns) * 100 : 0

    // Get outstanding payments
    const outstandingPayments = await db.invoice.aggregate({
      where: {
        user: {
          id: session.user.id
        },
        status: {
          in: ['Draft', 'Sent']
        }
      },
      _sum: {
        amount: true
      }
    })

    // Get pending tasks (overdue returns + pending notices)
    const [overdueReturns, pendingNotices] = await Promise.all([
      db.gSTReturn.count({
        where: {
          client: {
            userId: session.user.id
          },
          status: 'OVERDUE'
        }
      }),
      db.notice.count({
        where: {
          client: {
            userId: session.user.id
          },
          status: {
            in: ['RECEIVED', 'IN_PROGRESS']
          }
        }
      })
    ])

    // Format data for response
    const analytics = {
      totalClients,
      activeGST: activeGSTClients,
      monthlyReturns: monthlyReturns.map(item => ({
        month: new Date(item.period).toLocaleDateString('en-US', { month: 'short' }),
        filed: item._count.id,
        overdue: 0 // This would need additional calculation
      })),
      revenue: monthlyRevenue.map(item => ({
        month: new Date(item.issuedAt).toLocaleDateString('en-US', { month: 'short' }),
        amount: item._sum.amount || 0
      })),
      topServices: servicesByType.map(item => ({
        name: item.type.replace(/_/g, ' '),
        count: item._count.id,
        revenue: 0 // This would need calculation from service fees
      })),
      clientAcquisition: clientAcquisition.map(item => ({
        month: new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short' }),
        count: item._count.id
      })),
      complianceRate: Math.round(complianceRate * 10) / 10,
      outstandingPayments: outstandingPayments._sum.amount || 0,
      pendingTasks: overdueReturns + pendingNotices
    }

    return NextResponse.json(analytics)
  } catch (error) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
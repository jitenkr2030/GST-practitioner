import { db } from '@/lib/db'
import { addDays, format, isAfter, isBefore, isToday, parseISO } from 'date-fns'

export interface NotificationData {
  title: string
  message: string
  type: 'INFO' | 'WARNING' | 'ERROR' | 'SUCCESS'
  userId: string
}

export class NotificationService {
  /**
   * Create a new notification
   */
  static async createNotification(data: NotificationData) {
    try {
      const notification = await db.notification.create({
        data: {
          title: data.title,
          message: data.message,
          type: data.type,
          userId: data.userId
        }
      })
      return notification
    } catch (error) {
      console.error('Error creating notification:', error)
      throw error
    }
  }

  /**
   * Check for upcoming GST return due dates and create notifications
   */
  static async checkUpcomingReturnDeadlines() {
    try {
      const today = new Date()
      const warningDays = 7 // Notify 7 days before due date
      const criticalDays = 3 // Critical notification 3 days before due date

      // Get all upcoming GST returns
      const upcomingReturns = await db.gSTReturn.findMany({
        where: {
          status: {
            in: ['DRAFT', 'OVERDUE']
          },
          dueDate: {
            gte: today
          }
        },
        include: {
          client: {
            include: {
              user: true
            }
          }
        }
      })

      for (const returnItem of upcomingReturns) {
        const dueDate = new Date(returnItem.dueDate)
        const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

        // Skip if already processed for today
        const existingNotification = await db.notification.findFirst({
          where: {
            userId: returnItem.client.user.id,
            title: {
              contains: `${returnItem.returnType} - ${returnItem.period}`
            },
            createdAt: {
              gte: new Date(today.setHours(0, 0, 0, 0))
            }
          }
        })

        if (existingNotification) {
          continue
        }

        let notification: NotificationData

        if (daysUntilDue <= criticalDays) {
          // Critical notification
          notification = {
            title: `Critical: ${returnItem.returnType} Due Soon`,
            message: `${returnItem.client.businessName} - ${returnItem.returnType} for ${returnItem.period} is due in ${daysUntilDue} day${daysUntilDue > 1 ? 's' : ''} (${format(dueDate, 'MMM dd, yyyy')}). Immediate action required!`,
            type: 'ERROR',
            userId: returnItem.client.user.id
          }
        } else if (daysUntilDue <= warningDays) {
          // Warning notification
          notification = {
            title: `Reminder: ${returnItem.returnType} Due Soon`,
            message: `${returnItem.client.businessName} - ${returnItem.returnType} for ${returnItem.period} is due in ${daysUntilDue} days (${format(dueDate, 'MMM dd, yyyy')}). Please file soon.`,
            type: 'WARNING',
            userId: returnItem.client.user.id
          }
        } else {
          // Info notification for upcoming returns
          notification = {
            title: `Upcoming: ${returnItem.returnType} Due`,
            message: `${returnItem.client.businessName} - ${returnItem.returnType} for ${returnItem.period} is due on ${format(dueDate, 'MMM dd, yyyy')}.`,
            type: 'INFO',
            userId: returnItem.client.user.id
          }
        }

        await this.createNotification(notification)
      }
    } catch (error) {
      console.error('Error checking upcoming return deadlines:', error)
    }
  }

  /**
   * Check for overdue notices and create notifications
   */
  static async checkOverdueNotices() {
    try {
      const today = new Date()
      const warningDays = 5 // Notify 5 days before notice due date

      // Get all active notices
      const activeNotices = await db.notice.findMany({
        where: {
          status: {
            in: ['RECEIVED', 'IN_PROGRESS']
          },
          dueDate: {
            gte: today
          }
        },
        include: {
          client: {
            include: {
              user: true
            }
          }
        }
      })

      for (const notice of activeNotices) {
        const dueDate = new Date(notice.dueDate)
        const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

        // Skip if already processed for today
        const existingNotification = await db.notification.findFirst({
          where: {
            userId: notice.client.user.id,
            title: {
              contains: notice.noticeType
            },
            createdAt: {
              gte: new Date(today.setHours(0, 0, 0, 0))
            }
          }
        })

        if (existingNotification) {
          continue
        }

        let notification: NotificationData

        if (daysUntilDue <= 0) {
          // Overdue notice
          notification = {
            title: `Overdue: ${notice.noticeType} Reply`,
            message: `${notice.client.businessName} - Reply for ${notice.noticeType} is overdue! Due date was ${format(dueDate, 'MMM dd, yyyy')}.`,
            type: 'ERROR',
            userId: notice.client.user.id
          }
        } else if (daysUntilDue <= warningDays) {
          // Warning notification
          notification = {
            title: `Reminder: ${notice.noticeType} Reply Due`,
            message: `${notice.client.businessName} - Reply for ${notice.noticeType} is due in ${daysUntilDue} day${daysUntilDue > 1 ? 's' : ''} (${format(dueDate, 'MMM dd, yyyy')}).`,
            type: 'WARNING',
            userId: notice.client.user.id
          }
        }

        if (notification) {
          await this.createNotification(notification)
        }
      }
    } catch (error) {
      console.error('Error checking overdue notices:', error)
    }
  }

  /**
   * Check for pending payments and create notifications
   */
  static async checkPendingPayments() {
    try {
      const today = new Date()
      const warningDays = 3 // Notify 3 days before payment due date

      // Get all pending invoices
      const pendingInvoices = await db.invoice.findMany({
        where: {
          status: {
            in: ['Draft', 'Sent']
          },
          dueDate: {
            gte: today
          }
        },
        include: {
          client: {
            include: {
              user: true
            }
          }
        }
      })

      for (const invoice of pendingInvoices) {
        const dueDate = new Date(invoice.dueDate)
        const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

        // Skip if already processed for today
        const existingNotification = await db.notification.findFirst({
          where: {
            userId: invoice.client.user.id,
            title: {
              contains: invoice.invoiceNo
            },
            createdAt: {
              gte: new Date(today.setHours(0, 0, 0, 0))
            }
          }
        })

        if (existingNotification) {
          continue
        }

        let notification: NotificationData

        if (daysUntilDue <= 0) {
          // Overdue payment
          notification = {
            title: `Overdue: Invoice ${invoice.invoiceNo}`,
            message: `${invoice.client.businessName} - Invoice ${invoice.invoiceNo} for ₹${invoice.amount} is overdue! Due date was ${format(dueDate, 'MMM dd, yyyy')}.`,
            type: 'ERROR',
            userId: invoice.client.user.id
          }
        } else if (daysUntilDue <= warningDays) {
          // Warning notification
          notification = {
            title: `Reminder: Invoice ${invoice.invoiceNo} Due`,
            message: `${invoice.client.businessName} - Invoice ${invoice.invoiceNo} for ₹${invoice.amount} is due in ${daysUntilDue} day${daysUntilDue > 1 ? 's' : ''} (${format(dueDate, 'MMM dd, yyyy')}).`,
            type: 'WARNING',
            userId: invoice.client.user.id
          }
        }

        if (notification) {
          await this.createNotification(notification)
        }
      }
    } catch (error) {
      console.error('Error checking pending payments:', error)
    }
  }

  /**
   * Run all notification checks
   */
  static async runAllChecks() {
    try {
      await Promise.all([
        this.checkUpcomingReturnDeadlines(),
        this.checkOverdueNotices(),
        this.checkPendingPayments()
      ])
      console.log('Notification checks completed successfully')
    } catch (error) {
      console.error('Error running notification checks:', error)
    }
  }

  /**
   * Create notification for successful return filing
   */
  static async createReturnFilingNotification(returnId: string) {
    try {
      const returnItem = await db.gSTReturn.findUnique({
        where: { id: returnId },
        include: {
          client: {
            include: {
              user: true
            }
          }
        }
      })

      if (!returnItem) {
        throw new Error('Return not found')
      }

      const notification: NotificationData = {
        title: `Success: ${returnItem.returnType} Filed`,
        message: `${returnItem.client.businessName} - ${returnItem.returnType} for ${returnItem.period} has been successfully filed.`,
        type: 'SUCCESS',
        userId: returnItem.client.user.id
      }

      await this.createNotification(notification)
    } catch (error) {
      console.error('Error creating return filing notification:', error)
    }
  }

  /**
   * Create notification for new notice received
   */
  static async createNewNoticeNotification(noticeId: string) {
    try {
      const notice = await db.notice.findUnique({
        where: { id: noticeId },
        include: {
          client: {
            include: {
              user: true
            }
          }
        }
      })

      if (!notice) {
        throw new Error('Notice not found')
      }

      const notification: NotificationData = {
        title: `New Notice Received: ${notice.noticeType}`,
        message: `${notice.client.businessName} - New ${notice.noticeType} received: ${notice.subject}. Due date: ${format(new Date(notice.dueDate), 'MMM dd, yyyy')}.`,
        type: 'WARNING',
        userId: notice.client.user.id
      }

      await this.createNotification(notification)
    } catch (error) {
      console.error('Error creating new notice notification:', error)
    }
  }
}
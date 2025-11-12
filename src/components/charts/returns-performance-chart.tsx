'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

interface ReturnsData {
  month: string
  filed: number
  overdue: number
}

interface ReturnsPerformanceChartProps {
  data: ReturnsData[]
  height?: number
}

export default function ReturnsPerformanceChart({ data, height = 300 }: ReturnsPerformanceChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
        <XAxis 
          dataKey="month" 
          tick={{ fontSize: 12 }}
          tickLine={false}
        />
        <YAxis 
          tick={{ fontSize: 12 }}
          tickLine={false}
        />
        <Tooltip 
          contentStyle={{
            backgroundColor: '#ffffff',
            border: '1px solid #e5e7eb',
            borderRadius: '0.5rem',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
          }}
        />
        <Legend />
        <Bar 
          dataKey="filed" 
          fill="#10b981" 
          name="Filed Returns"
          radius={[4, 4, 0, 0]}
        />
        <Bar 
          dataKey="overdue" 
          fill="#ef4444" 
          name="Overdue Returns"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  )
}
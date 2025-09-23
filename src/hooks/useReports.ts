import { useState, useEffect } from 'react'

export interface Report {
  id: string
  reporter_id: string
  story_id: string | null
  reason: string
  description: string | null
  status: 'pending' | 'reviewed' | 'resolved'
  created_at: string
  reviewed_at: string | null
  reviewed_by: string | null
}

// Mock reports data since reports table doesn't exist
const mockReports: Report[] = [
  {
    id: '1',
    reporter_id: '1',
    story_id: '1',
    reason: 'Inappropriate content',
    description: 'Story contains offensive language',
    status: 'pending',
    created_at: new Date().toISOString(),
    reviewed_at: null,
    reviewed_by: null
  },
  {
    id: '2',
    reporter_id: '2',
    story_id: '2',
    reason: 'Copyright violation',
    description: 'Story appears to be copied from another source',
    status: 'reviewed',
    created_at: new Date().toISOString(),
    reviewed_at: new Date().toISOString(),
    reviewed_by: 'admin'
  }
]

export function useReports() {
  const [reports, setReports] = useState<Report[]>(mockReports)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchReports = async () => {
    try {
      setLoading(true)
      // Mock fetch with delay
      setTimeout(() => {
        setReports(mockReports)
        setLoading(false)
      }, 300)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch reports')
      setLoading(false)
    }
  }

  const updateReportStatus = async (id: string, status: 'pending' | 'reviewed' | 'resolved') => {
    try {
      setReports(prev => prev.map(report => 
        report.id === id 
          ? { 
              ...report, 
              status, 
              reviewed_at: status !== 'pending' ? new Date().toISOString() : null,
              reviewed_by: status !== 'pending' ? 'admin' : null
            } 
          : report
      ))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update report')
      throw err
    }
  }

  useEffect(() => {
    // No need to fetch on mount since we have mock data
  }, [])

  return {
    reports,
    loading,
    error,
    fetchReports,
    updateReportStatus
  }
}
import { useState, useEffect } from 'react'

export interface SystemSetting {
  id: string
  setting_key: string
  value: string
  description: string | null
  updated_at: string
}

// Mock system settings data since system_settings table doesn't exist
const mockSettings: SystemSetting[] = [
  {
    id: '1',
    setting_key: 'app_name',
    value: 'VineNovel',
    description: 'Application name',
    updated_at: new Date().toISOString()
  },
  {
    id: '2',
    setting_key: 'maintenance_mode',
    value: 'false',
    description: 'Enable maintenance mode',
    updated_at: new Date().toISOString()
  },
  {
    id: '3',
    setting_key: 'max_story_length',
    value: '50000',
    description: 'Maximum story length in words',
    updated_at: new Date().toISOString()
  },
  {
    id: '4',
    setting_key: 'upload_limit',
    value: '10',
    description: 'File upload limit in MB',
    updated_at: new Date().toISOString()
  }
]

export function useSystemSettings() {
  const [settings, setSettings] = useState<SystemSetting[]>(mockSettings)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchSettings = async () => {
    try {
      setLoading(true)
      // Mock fetch with delay
      setTimeout(() => {
        setSettings(mockSettings)
        setLoading(false)
      }, 300)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch settings')
      setLoading(false)
    }
  }

  const getSetting = (key: string) => {
    return settings.find(setting => setting.setting_key === key)?.value
  }

  const updateSetting = async (key: string, value: string) => {
    try {
      setSettings(prev => prev.map(setting => 
        setting.setting_key === key 
          ? { ...setting, value, updated_at: new Date().toISOString() }
          : setting
      ))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update setting')
      throw err
    }
  }

  useEffect(() => {
    // No need to fetch on mount since we have mock data
  }, [])

  return {
    settings,
    loading,
    error,
    fetchSettings,
    getSetting,
    updateSetting
  }
}
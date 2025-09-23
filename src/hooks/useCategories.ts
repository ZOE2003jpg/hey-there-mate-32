import { useState, useEffect } from 'react'

export interface Category {
  id: string
  name: string
  description?: string
  created_at: string
}

export interface Tag {
  id: string
  name: string
  count: number
  created_at: string
}

// Mock data since categories and tags tables don't exist
const mockCategories: Category[] = [
  { id: '1', name: 'Romance', description: 'Love stories and romantic fiction', created_at: new Date().toISOString() },
  { id: '2', name: 'Fantasy', description: 'Magical worlds and supernatural stories', created_at: new Date().toISOString() },
  { id: '3', name: 'Mystery', description: 'Suspenseful stories with puzzles to solve', created_at: new Date().toISOString() },
  { id: '4', name: 'Sci-Fi', description: 'Science fiction and futuristic tales', created_at: new Date().toISOString() },
  { id: '5', name: 'Thriller', description: 'Heart-pounding action and suspense', created_at: new Date().toISOString() }
]

const mockTags: Tag[] = [
  { id: '1', name: 'enemies-to-lovers', count: 45, created_at: new Date().toISOString() },
  { id: '2', name: 'magic', count: 38, created_at: new Date().toISOString() },
  { id: '3', name: 'slow-burn', count: 32, created_at: new Date().toISOString() },
  { id: '4', name: 'mystery', count: 28, created_at: new Date().toISOString() },
  { id: '5', name: 'adventure', count: 25, created_at: new Date().toISOString() }
]

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>(mockCategories)
  const [tags, setTags] = useState<Tag[]>(mockTags)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchCategories = async () => {
    try {
      // Mock fetch
      setLoading(true)
      setTimeout(() => {
        setCategories(mockCategories)
        setLoading(false)
      }, 300)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch categories')
    }
  }

  const fetchTags = async () => {
    try {
      // Mock fetch
      setLoading(true)
      setTimeout(() => {
        setTags(mockTags)
        setLoading(false)
      }, 300)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tags')
    }
  }

  const fetchAll = async () => {
    setLoading(true)
    await Promise.all([fetchCategories(), fetchTags()])
    setLoading(false)
  }

  const createCategory = async (categoryData: { name: string; description?: string }) => {
    try {
      const newCategory: Category = {
        id: Date.now().toString(),
        name: categoryData.name,
        description: categoryData.description,
        created_at: new Date().toISOString()
      }
      setCategories(prev => [...prev, newCategory])
      return newCategory
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create category')
      throw err
    }
  }

  const updateCategory = async (id: string, updates: Partial<Category>) => {
    try {
      setCategories(prev => prev.map(cat => 
        cat.id === id ? { ...cat, ...updates } : cat
      ))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update category')
      throw err
    }
  }

  const deleteCategory = async (id: string) => {
    try {
      setCategories(prev => prev.filter(cat => cat.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete category')
      throw err
    }
  }

  const createTag = async (tagData: { name: string }) => {
    try {
      const newTag: Tag = {
        id: Date.now().toString(),
        name: tagData.name,
        count: 0,
        created_at: new Date().toISOString()
      }
      setTags(prev => [...prev, newTag])
      return newTag
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create tag')
      throw err
    }
  }

  const updateTag = async (id: string, updates: Partial<Tag>) => {
    try {
      setTags(prev => prev.map(tag => 
        tag.id === id ? { ...tag, ...updates } : tag
      ))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update tag')
      throw err
    }
  }

  const deleteTag = async (id: string) => {
    try {
      setTags(prev => prev.filter(tag => tag.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete tag')
      throw err
    }
  }

  useEffect(() => {
    // No need to fetch on mount since we have mock data
  }, [])

  return {
    categories,
    tags,
    loading,
    error,
    fetchCategories,
    fetchTags,
    createCategory,
    updateCategory,
    deleteCategory,
    createTag,
    updateTag,
    deleteTag
  }
}
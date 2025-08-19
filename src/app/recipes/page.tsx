'use client'

import { useState, useEffect } from 'react'
import { Plus, ChefHat, Search, WifiOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { RecipeGrid } from '@/components/features/recipes/recipe-grid'
import { RecipeForm } from '@/components/features/recipes/recipe-form'
import { RecipeFilters } from '@/components/features/recipes/recipe-filters'
import { 
  createDocument, 
  updateDocument, 
  deleteDocument,
  subscribeToUserDocuments,
  isOnline,
  onNetworkChange 
} from '@/lib/firebase-data'
import { useAuthStore } from '@/store/auth-store'
import { useAdaptiveStore } from '@/store/adaptive-store'

interface Recipe {
  id: string
  title: string
  description?: string
  ingredients: Array<{
    name: string
    amount?: string
    unit?: string
  }>
  instructions: string[]
  prepTime?: number
  cookTime?: number
  servings?: number
  tags: string[]
  imageUrl?: string
  difficulty?: 'easy' | 'medium' | 'hard'
  familyId: string
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

export default function RecipesPage() {
  const { user } = useAuthStore()
  const { trackFeatureUsage } = useAdaptiveStore()
  
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null)
  const [online, setOnline] = useState(isOnline())
  const [filters, setFilters] = useState({
    search: '',
    tags: [] as string[],
    prepTime: 'all', // all, quick (under 30min), medium (30-60min), long (over 60min)
    servings: 'all' // all, small (1-2), medium (3-4), large (5+)
  })

  // Track feature usage
  useEffect(() => {
    trackFeatureUsage('recipes', 'view')
  }, [trackFeatureUsage])

  // Subscribe to network changes
  useEffect(() => {
    const unsubscribe = onNetworkChange(setOnline)
    return unsubscribe
  }, [])

  // Subscribe to recipes
  useEffect(() => {
    if (!user) return
    
    const unsubscribe = subscribeToUserDocuments<Recipe>('recipes', (newRecipes) => {
      setRecipes(newRecipes)
    }, 'updatedAt')
    
    return unsubscribe
  }, [user])

  const generateId = () => Math.random().toString(36).substring(2) + Date.now().toString(36)

  const handleCreateRecipe = async (recipeData: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt' | 'familyId' | 'createdBy'>) => {
    if (!user || !online) return

    const recipeId = generateId()
    const now = new Date()
    
    const recipe: Recipe = {
      id: recipeId,
      ...recipeData,
      familyId: user.familyId || '',
      createdBy: user.id,
      createdAt: now,
      updatedAt: now
    }

    try {
      await createDocument<Recipe>('recipes', recipeId, recipe)
      
      setShowForm(false)
      trackFeatureUsage('recipes', 'create')
    } catch (error) {
      console.error('Failed to create recipe:', error)
    }
  }

  const handleUpdateRecipe = async (id: string, updates: Partial<Recipe>) => {
    if (!online) return
    
    try {
      await updateDocument('recipes', id, updates)
      trackFeatureUsage('recipes', 'update')
    } catch (error) {
      console.error('Failed to update recipe:', error)
    }
  }

  const handleDeleteRecipe = async (id: string) => {
    if (!online) return
    
    try {
      await deleteDocument('recipes', id)
      trackFeatureUsage('recipes', 'delete')
    } catch (error) {
      console.error('Failed to delete recipe:', error)
    }
  }

  const handleEditRecipe = (recipe: Recipe) => {
    setEditingRecipe(recipe)
    setShowForm(true)
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditingRecipe(null)
  }

  // Filter recipes based on current filters
  const filteredRecipes = recipes.filter(recipe => {
    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      const titleMatch = recipe.title.toLowerCase().includes(searchLower)
      const tagMatch = recipe.tags?.some((tag: string) => tag.toLowerCase().includes(searchLower))
      const ingredientMatch = recipe.ingredients?.some((ing: any) => 
        ing.name.toLowerCase().includes(searchLower)
      )
      
      if (!titleMatch && !tagMatch && !ingredientMatch) {
        return false
      }
    }
    
    // Tags filter
    if (filters.tags.length > 0) {
      const hasMatchingTag = filters.tags.some(tag => 
        recipe.tags?.includes(tag)
      )
      if (!hasMatchingTag) return false
    }
    
    // Prep time filter
    if (filters.prepTime !== 'all' && recipe.prepTime) {
      const prepTime = recipe.prepTime
      if (filters.prepTime === 'quick' && prepTime > 30) return false
      if (filters.prepTime === 'medium' && (prepTime <= 30 || prepTime > 60)) return false
      if (filters.prepTime === 'long' && prepTime <= 60) return false
    }
    
    // Servings filter
    if (filters.servings !== 'all' && recipe.servings) {
      const servings = recipe.servings
      if (filters.servings === 'small' && servings > 2) return false
      if (filters.servings === 'medium' && (servings < 3 || servings > 4)) return false
      if (filters.servings === 'large' && servings < 5) return false
    }
    
    return true
  })

  const recipeStats = {
    total: recipes.length,
    quick: recipes.filter(r => r.prepTime && r.prepTime <= 30).length,
    favorites: recipes.filter(r => r.tags?.includes('favorite')).length,
    recentlyAdded: recipes.filter(r => {
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      return new Date(r.createdAt) > weekAgo
    }).length
  }

  // Get all unique tags from recipes
  const allTags = [...new Set(recipes.flatMap(r => r.tags || []))]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Recipes</h1>
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            {recipes.length} recipes in your collection
            {!online && (
              <span className="flex items-center gap-1 text-amber-600">
                <WifiOff className="h-3 w-3" />
                Offline
              </span>
            )}
          </p>
        </div>
        
        <Button onClick={() => setShowForm(true)} disabled={!online}>
          <Plus className="h-4 w-4 mr-2" />
          Add Recipe
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="glass rounded-2xl p-4 text-center">
          <div className="text-2xl font-bold text-primary">{recipeStats.total}</div>
          <div className="text-xs text-muted-foreground">Total Recipes</div>
        </div>
        <div className="glass rounded-2xl p-4 text-center">
          <div className="text-2xl font-bold text-green-500">{recipeStats.quick}</div>
          <div className="text-xs text-muted-foreground">Quick (≤30min)</div>
        </div>
        <div className="glass rounded-2xl p-4 text-center">
          <div className="text-2xl font-bold text-red-500">{recipeStats.favorites}</div>
          <div className="text-xs text-muted-foreground">Favorites</div>
        </div>
        <div className="glass rounded-2xl p-4 text-center">
          <div className="text-2xl font-bold text-blue-500">{recipeStats.recentlyAdded}</div>
          <div className="text-xs text-muted-foreground">This Week</div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        {/* Quick Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search recipes, ingredients, or tags..."
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            className="pl-10 glass border-glass"
          />
        </div>

        {/* Advanced Filters */}
        <RecipeFilters 
          filters={filters} 
          onFiltersChange={setFilters}
          availableTags={allTags}
        />
      </div>

      {/* Recipe Grid */}
      <RecipeGrid
        recipes={filteredRecipes}
        onRecipeEdit={handleEditRecipe}
        onRecipeDelete={handleDeleteRecipe}
      />

      {/* Recipe Form Modal */}
      {showForm && (
        <RecipeForm
          recipe={editingRecipe}
          onSubmit={editingRecipe ? 
            (data) => handleUpdateRecipe(editingRecipe.id, data) : 
            handleCreateRecipe
          }
          onClose={handleCloseForm}
        />
      )}

      {/* Empty State */}
      {recipes.length === 0 && (
        <div className="text-center py-12">
          <div className="h-16 w-16 mx-auto mb-4 rounded-2xl glass flex items-center justify-center">
            <ChefHat className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No recipes yet</h3>
          <p className="text-muted-foreground mb-4">
            Start building your recipe collection by adding your favorite dishes
          </p>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add First Recipe
          </Button>
        </div>
      )}

      {/* No Results State */}
      {recipes.length > 0 && filteredRecipes.length === 0 && (
        <div className="text-center py-12">
          <div className="h-16 w-16 mx-auto mb-4 rounded-2xl glass flex items-center justify-center">
            <Search className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No recipes found</h3>
          <p className="text-muted-foreground mb-4">
            Try adjusting your search or filters to find recipes
          </p>
          <Button 
            variant="outline" 
            onClick={() => setFilters({ search: '', tags: [], prepTime: 'all', servings: 'all' })}
            className="glass border-glass hover:bg-white/5"
          >
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  )
}
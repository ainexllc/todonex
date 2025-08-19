'use client'

import { useState, useEffect } from 'react'
import { ChefHat, Plus, Clock, Users, Heart } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { subscribeToUserDocuments } from '@/lib/firebase-data'
import { useAuthStore } from '@/store/auth-store'
import { useAdaptiveStore } from '@/store/adaptive-store'
import { cn } from '@/lib/utils'

interface Recipe {
  id: string
  title: string
  description?: string
  prepTime?: number
  cookTime?: number
  servings?: number
  tags: string[]
  imageUrl?: string
  familyId: string
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

export function RecipesWidget() {
  const { user } = useAuthStore()
  const { trackFeatureUsage } = useAdaptiveStore()
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    
    const unsubscribe = subscribeToUserDocuments<Recipe>('recipes', (allRecipes) => {
      // Show most recent recipes, limit to 4
      const recentRecipes = allRecipes.slice(0, 4)
      
      setRecipes(recentRecipes)
      setLoading(false)
    }, 'updatedAt')
    
    return unsubscribe
  }, [user])

  const formatTime = (minutes?: number) => {
    if (!minutes) return null
    
    if (minutes < 60) {
      return `${minutes}m`
    } else {
      const hours = Math.floor(minutes / 60)
      const remainingMinutes = minutes % 60
      return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`
    }
  }

  const getTotalTime = (recipe: Recipe) => {
    const prep = recipe.prepTime || 0
    const cook = recipe.cookTime || 0
    return prep + cook
  }

  if (loading) {
    return (
      <Card className="glass">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-base font-medium flex items-center">
            <ChefHat className="h-4 w-4 mr-2" />
            Recipes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-white/5 rounded-lg animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (recipes.length === 0) {
    return (
      <Card className="glass">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-base font-medium flex items-center">
            <ChefHat className="h-4 w-4 mr-2" />
            Recipes
          </CardTitle>
          <Link href="/recipes">
            <Button 
              variant="ghost" 
              size="sm"
              className="h-8 w-8 p-0 hover:bg-white/10"
              onClick={() => trackFeatureUsage('recipes', 'navigate')}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <div className="h-10 w-10 mx-auto mb-2 rounded-lg glass flex items-center justify-center">
              <ChefHat className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground mb-3">No recipes yet</p>
            <Link href="/recipes">
              <Button 
                size="sm" 
                variant="outline" 
                className="glass border-glass hover:bg-white/5"
                onClick={() => trackFeatureUsage('recipes', 'navigate')}
              >
                Add Recipe
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="glass">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-base font-medium flex items-center">
          <ChefHat className="h-4 w-4 mr-2" />
          Recipes
          <span className="ml-2 text-xs text-muted-foreground">
            ({recipes.length} recipes)
          </span>
        </CardTitle>
        <Link href="/recipes">
          <Button 
            variant="ghost" 
            size="sm"
            className="h-8 w-8 p-0 hover:bg-white/10"
            onClick={() => trackFeatureUsage('recipes', 'navigate')}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {recipes.map((recipe) => {
            const totalTime = getTotalTime(recipe)
            const isFavorite = recipe.tags?.includes('favorite')
            
            return (
              <div
                key={recipe.id}
                className="flex items-start gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
              >
                {/* Recipe Image or Placeholder */}
                <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                  {recipe.imageUrl ? (
                    <img
                      src={recipe.imageUrl}
                      alt={recipe.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full glass flex items-center justify-center">
                      <ChefHat className="h-5 w-5 text-muted-foreground" />
                    </div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium truncate flex items-center gap-1">
                        {recipe.title}
                        {isFavorite && (
                          <Heart className="h-3 w-3 text-red-500 fill-current" />
                        )}
                      </h4>
                      
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        {totalTime > 0 && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{formatTime(totalTime)}</span>
                          </div>
                        )}
                        
                        {recipe.servings && (
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            <span>{recipe.servings}</span>
                          </div>
                        )}
                      </div>

                      {/* Show first few tags */}
                      {recipe.tags && recipe.tags.length > 0 && (
                        <div className="flex gap-1 mt-2">
                          {recipe.tags.slice(0, 2).map((tag) => (
                            <Badge 
                              key={tag} 
                              variant="secondary" 
                              className="text-xs bg-white/10 text-muted-foreground"
                            >
                              {tag}
                            </Badge>
                          ))}
                          {recipe.tags.length > 2 && (
                            <Badge 
                              variant="secondary" 
                              className="text-xs bg-white/10 text-muted-foreground"
                            >
                              +{recipe.tags.length - 2}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
        
        <div className="mt-3 pt-3 border-t border-glass/50">
          <Link href="/recipes">
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full hover:bg-white/10"
              onClick={() => trackFeatureUsage('recipes', 'navigate')}
            >
              View All Recipes
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
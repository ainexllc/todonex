'use client'

import { useState } from 'react'
import { Clock, Users, Edit2, Trash2, MoreVertical, Heart, ChefHat } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface Recipe {
  id: string
  title: string
  description?: string
  ingredients: Array<{ name: string; amount: string; unit: string }>
  instructions: string[]
  prepTime?: number
  cookTime?: number
  servings?: number
  tags: string[]
  imageUrl?: string
  createdAt: Date
  updatedAt: Date
}

interface RecipeGridProps {
  recipes: Recipe[]
  onRecipeEdit: (recipe: Recipe) => void
  onRecipeDelete: (id: string) => void
}

export function RecipeGrid({ recipes, onRecipeEdit, onRecipeDelete }: RecipeGridProps) {
  const [expandedRecipes, setExpandedRecipes] = useState<Set<string>>(new Set())

  const toggleExpanded = (recipeId: string) => {
    const newExpanded = new Set(expandedRecipes)
    if (newExpanded.has(recipeId)) {
      newExpanded.delete(recipeId)
    } else {
      newExpanded.add(recipeId)
    }
    setExpandedRecipes(newExpanded)
  }

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

  const getTagColor = (tag: string) => {
    const colorMap: Record<string, string> = {
      'favorite': 'bg-red-500/20 text-red-400 border-red-500/30',
      'quick': 'bg-green-500/20 text-green-400 border-green-500/30',
      'healthy': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      'vegetarian': 'bg-green-600/20 text-green-300 border-green-600/30',
      'vegan': 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      'gluten-free': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      'dessert': 'bg-pink-500/20 text-pink-400 border-pink-500/30',
      'breakfast': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      'lunch': 'bg-blue-600/20 text-blue-300 border-blue-600/30',
      'dinner': 'bg-purple-500/20 text-purple-400 border-purple-500/30'
    }
    return colorMap[tag.toLowerCase()] || 'bg-gray-500/20 text-gray-400 border-gray-500/30'
  }

  if (recipes.length === 0) {
    return null
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {recipes.map((recipe) => {
        const isExpanded = expandedRecipes.has(recipe.id)
        const totalTime = getTotalTime(recipe)

        return (
          <Card key={recipe.id} className="glass border-glass hover:bg-white/5 transition-all duration-200">
            {/* Recipe Image */}
            {recipe.imageUrl && (
              <div className="h-48 rounded-t-xl overflow-hidden">
                <img
                  src={recipe.imageUrl}
                  alt={recipe.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-1">{recipe.title}</h3>
                  {recipe.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {recipe.description}
                    </p>
                  )}
                </div>

                {/* Actions Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-1 h-8 w-8 hover:bg-white/10"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={() => onRecipeEdit(recipe)}>
                      <Edit2 className="h-4 w-4 mr-2" />
                      Edit Recipe
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => onRecipeDelete(recipe.id)}
                      className="text-red-600"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Recipe
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Recipe Meta */}
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                {totalTime > 0 && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{formatTime(totalTime)}</span>
                  </div>
                )}
                
                {recipe.servings && (
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{recipe.servings} servings</span>
                  </div>
                )}
              </div>

              {/* Tags */}
              {recipe.tags && recipe.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {recipe.tags.slice(0, 3).map((tag) => (
                    <Badge 
                      key={tag} 
                      variant="secondary" 
                      className={cn("text-xs", getTagColor(tag))}
                    >
                      {tag === 'favorite' && <Heart className="h-3 w-3 mr-1" />}
                      {tag}
                    </Badge>
                  ))}
                  {recipe.tags.length > 3 && (
                    <Badge variant="secondary" className="text-xs bg-white/10 text-muted-foreground">
                      +{recipe.tags.length - 3}
                    </Badge>
                  )}
                </div>
              )}
            </CardHeader>

            <CardContent className="pt-0">
              {/* Expand/Collapse Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleExpanded(recipe.id)}
                className="w-full hover:bg-white/10 mb-3"
              >
                <ChefHat className="h-4 w-4 mr-2" />
                {isExpanded ? 'Hide Details' : 'View Recipe'}
              </Button>

              {/* Expanded Recipe Details */}
              {isExpanded && (
                <div className="space-y-4">
                  {/* Time Breakdown */}
                  {(recipe.prepTime || recipe.cookTime) && (
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      {recipe.prepTime && (
                        <div>
                          <span className="text-muted-foreground">Prep:</span>
                          <span className="ml-1">{formatTime(recipe.prepTime)}</span>
                        </div>
                      )}
                      {recipe.cookTime && (
                        <div>
                          <span className="text-muted-foreground">Cook:</span>
                          <span className="ml-1">{formatTime(recipe.cookTime)}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Ingredients */}
                  <div>
                    <h4 className="font-medium text-sm mb-2">Ingredients:</h4>
                    <ul className="text-sm space-y-1">
                      {recipe.ingredients.slice(0, 5).map((ingredient, index) => (
                        <li key={index} className="text-muted-foreground">
                          • {ingredient.amount} {ingredient.unit} {ingredient.name}
                        </li>
                      ))}
                      {recipe.ingredients.length > 5 && (
                        <li className="text-muted-foreground italic">
                          ... and {recipe.ingredients.length - 5} more
                        </li>
                      )}
                    </ul>
                  </div>

                  {/* Instructions Preview */}
                  {recipe.instructions && recipe.instructions.length > 0 && (
                    <div>
                      <h4 className="font-medium text-sm mb-2">Instructions:</h4>
                      <ol className="text-sm space-y-1">
                        {recipe.instructions.slice(0, 2).map((instruction, index) => (
                          <li key={index} className="text-muted-foreground">
                            {index + 1}. {instruction.length > 100 ? 
                              `${instruction.substring(0, 100)}...` : 
                              instruction
                            }
                          </li>
                        ))}
                        {recipe.instructions.length > 2 && (
                          <li className="text-muted-foreground italic">
                            ... {recipe.instructions.length - 2} more steps
                          </li>
                        )}
                      </ol>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
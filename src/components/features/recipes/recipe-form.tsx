'use client'

import { useState, useEffect } from 'react'
import { X, Plus, Trash2, Clock, Users, Image, ChefHat } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'

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
}

interface RecipeFormProps {
  recipe?: Recipe | null
  onSubmit: (recipeData: any) => void
  onClose: () => void
}

const commonTags = [
  'favorite', 'quick', 'healthy', 'vegetarian', 'vegan', 'gluten-free',
  'breakfast', 'lunch', 'dinner', 'dessert', 'snack', 'appetizer',
  'main-course', 'side-dish', 'comfort-food', 'low-carb', 'keto'
]

const commonUnits = [
  'cup', 'cups', 'tbsp', 'tsp', 'oz', 'lb', 'g', 'kg', 'ml', 'l',
  'piece', 'pieces', 'slice', 'slices', 'clove', 'cloves', 'whole', 'pinch'
]

export function RecipeForm({ recipe, onSubmit, onClose }: RecipeFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    prepTime: '',
    cookTime: '',
    servings: '',
    imageUrl: '',
    ingredients: [{ name: '', amount: '', unit: '' }],
    instructions: [''],
    tags: [] as string[]
  })
  const [newTag, setNewTag] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Populate form when editing
  useEffect(() => {
    if (recipe) {
      setFormData({
        title: recipe.title || '',
        description: recipe.description || '',
        prepTime: recipe.prepTime?.toString() || '',
        cookTime: recipe.cookTime?.toString() || '',
        servings: recipe.servings?.toString() || '',
        imageUrl: recipe.imageUrl || '',
        ingredients: recipe.ingredients.length > 0 ? recipe.ingredients : [{ name: '', amount: '', unit: '' }],
        instructions: recipe.instructions.length > 0 ? recipe.instructions : [''],
        tags: recipe.tags || []
      })
    }
  }, [recipe])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.title.trim()) {
      newErrors.title = 'Recipe title is required'
    }
    
    const validIngredients = formData.ingredients.filter(ing => ing.name.trim())
    if (validIngredients.length === 0) {
      newErrors.ingredients = 'At least one ingredient is required'
    }
    
    const validInstructions = formData.instructions.filter(inst => inst.trim())
    if (validInstructions.length === 0) {
      newErrors.instructions = 'At least one instruction is required'
    }
    
    if (formData.prepTime && (isNaN(Number(formData.prepTime)) || Number(formData.prepTime) < 0)) {
      newErrors.prepTime = 'Prep time must be a valid number'
    }
    
    if (formData.cookTime && (isNaN(Number(formData.cookTime)) || Number(formData.cookTime) < 0)) {
      newErrors.cookTime = 'Cook time must be a valid number'
    }
    
    if (formData.servings && (isNaN(Number(formData.servings)) || Number(formData.servings) < 1)) {
      newErrors.servings = 'Servings must be a valid number greater than 0'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    const recipeData = {
      title: formData.title.trim(),
      description: formData.description.trim() || undefined,
      prepTime: formData.prepTime ? Number(formData.prepTime) : undefined,
      cookTime: formData.cookTime ? Number(formData.cookTime) : undefined,
      servings: formData.servings ? Number(formData.servings) : undefined,
      imageUrl: formData.imageUrl.trim() || undefined,
      ingredients: formData.ingredients.filter(ing => ing.name.trim()),
      instructions: formData.instructions.filter(inst => inst.trim()),
      tags: formData.tags
    }
    
    onSubmit(recipeData)
  }

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const addIngredient = () => {
    setFormData(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, { name: '', amount: '', unit: '' }]
    }))
  }

  const removeIngredient = (index: number) => {
    setFormData(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index)
    }))
  }

  const updateIngredient = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      ingredients: prev.ingredients.map((ing, i) => 
        i === index ? { ...ing, [field]: value } : ing
      )
    }))
  }

  const addInstruction = () => {
    setFormData(prev => ({
      ...prev,
      instructions: [...prev.instructions, '']
    }))
  }

  const removeInstruction = (index: number) => {
    setFormData(prev => ({
      ...prev,
      instructions: prev.instructions.filter((_, i) => i !== index)
    }))
  }

  const updateInstruction = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      instructions: prev.instructions.map((inst, i) => 
        i === index ? value : inst
      )
    }))
  }

  const addTag = (tag: string) => {
    if (!formData.tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }))
    }
    setNewTag('')
  }

  const removeTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }))
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto glass border-glass">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            {recipe ? 'Edit Recipe' : 'Add New Recipe'}
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-6 w-6 p-0 hover:bg-white/10"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-medium flex items-center gap-2">
                <ChefHat className="h-4 w-4" />
                Recipe Title *
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => updateField('title', e.target.value)}
                placeholder="Enter recipe title..."
                className={`glass border-glass ${errors.title ? 'border-red-500' : ''}`}
              />
              {errors.title && (
                <p className="text-xs text-red-500">{errors.title}</p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium">
                Description
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => updateField('description', e.target.value)}
                placeholder="Brief description of the recipe..."
                rows={2}
                className="glass border-glass resize-none"
              />
            </div>

            {/* Times and Servings */}
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label htmlFor="prepTime" className="text-sm font-medium flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Prep (min)
                </Label>
                <Input
                  id="prepTime"
                  type="number"
                  value={formData.prepTime}
                  onChange={(e) => updateField('prepTime', e.target.value)}
                  placeholder="30"
                  className={`glass border-glass ${errors.prepTime ? 'border-red-500' : ''}`}
                  min="0"
                />
                {errors.prepTime && (
                  <p className="text-xs text-red-500">{errors.prepTime}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="cookTime" className="text-sm font-medium flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Cook (min)
                </Label>
                <Input
                  id="cookTime"
                  type="number"
                  value={formData.cookTime}
                  onChange={(e) => updateField('cookTime', e.target.value)}
                  placeholder="20"
                  className={`glass border-glass ${errors.cookTime ? 'border-red-500' : ''}`}
                  min="0"
                />
                {errors.cookTime && (
                  <p className="text-xs text-red-500">{errors.cookTime}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="servings" className="text-sm font-medium flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Servings
                </Label>
                <Input
                  id="servings"
                  type="number"
                  value={formData.servings}
                  onChange={(e) => updateField('servings', e.target.value)}
                  placeholder="4"
                  className={`glass border-glass ${errors.servings ? 'border-red-500' : ''}`}
                  min="1"
                />
                {errors.servings && (
                  <p className="text-xs text-red-500">{errors.servings}</p>
                )}
              </div>
            </div>

            {/* Image URL */}
            <div className="space-y-2">
              <Label htmlFor="imageUrl" className="text-sm font-medium flex items-center gap-2">
                <Image className="h-4 w-4" />
                Image URL (optional)
              </Label>
              <Input
                id="imageUrl"
                value={formData.imageUrl}
                onChange={(e) => updateField('imageUrl', e.target.value)}
                placeholder="https://example.com/recipe-image.jpg"
                className="glass border-glass"
              />
            </div>
          </div>

          {/* Ingredients */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Ingredients *</Label>
            {formData.ingredients.map((ingredient, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={ingredient.amount}
                  onChange={(e) => updateIngredient(index, 'amount', e.target.value)}
                  placeholder="1"
                  className="w-20 glass border-glass"
                />
                <Input
                  value={ingredient.unit}
                  onChange={(e) => updateIngredient(index, 'unit', e.target.value)}
                  placeholder="cup"
                  list="units"
                  className="w-24 glass border-glass"
                />
                <Input
                  value={ingredient.name}
                  onChange={(e) => updateIngredient(index, 'name', e.target.value)}
                  placeholder="flour"
                  className="flex-1 glass border-glass"
                />
                {formData.ingredients.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeIngredient(index)}
                    className="p-2 hover:bg-red-500/20"
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                )}
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addIngredient}
              className="glass border-glass hover:bg-white/5"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Ingredient
            </Button>
            {errors.ingredients && (
              <p className="text-xs text-red-500">{errors.ingredients}</p>
            )}

            <datalist id="units">
              {commonUnits.map(unit => (
                <option key={unit} value={unit} />
              ))}
            </datalist>
          </div>

          {/* Instructions */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Instructions *</Label>
            {formData.instructions.map((instruction, index) => (
              <div key={index} className="flex gap-2">
                <div className="w-8 h-11 glass rounded-lg flex items-center justify-center text-sm font-medium">
                  {index + 1}
                </div>
                <Textarea
                  value={instruction}
                  onChange={(e) => updateInstruction(index, e.target.value)}
                  placeholder="Describe this step..."
                  rows={2}
                  className="flex-1 glass border-glass resize-none"
                />
                {formData.instructions.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeInstruction(index)}
                    className="p-2 hover:bg-red-500/20"
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                )}
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addInstruction}
              className="glass border-glass hover:bg-white/5"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Step
            </Button>
            {errors.instructions && (
              <p className="text-xs text-red-500">{errors.instructions}</p>
            )}
          </div>

          {/* Tags */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Tags</Label>
            
            {/* Current Tags */}
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag) => (
                  <Badge 
                    key={tag} 
                    variant="secondary" 
                    className="glass border-glass"
                  >
                    {tag}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeTag(tag)}
                      className="h-4 w-4 p-0 ml-1 hover:bg-white/10"
                    >
                      <X className="h-2 w-2" />
                    </Button>
                  </Badge>
                ))}
              </div>
            )}

            {/* Add Custom Tag */}
            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add custom tag..."
                className="flex-1 glass border-glass"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    if (newTag.trim()) {
                      addTag(newTag.trim())
                    }
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => newTag.trim() && addTag(newTag.trim())}
                disabled={!newTag.trim() || formData.tags.includes(newTag.trim())}
                className="glass border-glass hover:bg-white/5"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* Common Tags */}
            <div className="flex flex-wrap gap-2">
              {commonTags
                .filter(tag => !formData.tags.includes(tag))
                .slice(0, 8)
                .map((tag) => (
                  <Button
                    key={tag}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addTag(tag)}
                    className="text-xs glass border-glass hover:bg-white/5"
                  >
                    {tag}
                  </Button>
                ))}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 glass border-glass hover:bg-white/5"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={!formData.title.trim()}
            >
              {recipe ? 'Update Recipe' : 'Save Recipe'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
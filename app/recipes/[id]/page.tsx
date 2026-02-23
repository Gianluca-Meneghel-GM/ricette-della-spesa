'use client'

import { useEffect, useState } from "react"
import { supabase } from "../../lib/supabase"
import { useParams } from "next/navigation"

type Ingredient = {
  id: string
  name: string
  unit: string
}

type RecipeIngredient = {
  id: string
  quantity: number
  ingredients: Ingredient
}

export default function RecipeDetailPage() {
  const params = useParams()
  const recipeId = params.id as string

  const [ingredients, setIngredients] = useState<Ingredient[]>([])
  const [recipeIngredients, setRecipeIngredients] = useState<RecipeIngredient[]>([])
  const [selectedIngredient, setSelectedIngredient] = useState("")
  const [quantity, setQuantity] = useState(0)

  async function fetchIngredients() {
    const { data } = await supabase.from("ingredients").select("*").order("name")
    if (data) setIngredients(data)
  }

  async function fetchRecipeIngredients() {
    const { data } = await supabase
      .from("recipe_ingredients")
      .select("id, quantity, ingredients(*)")
      .eq("recipe_id", recipeId)

    if (data) setRecipeIngredients(data as any)
  }

  async function addIngredientToRecipe() {
    if (!selectedIngredient || !quantity) return

    await supabase.from("recipe_ingredients").insert([
      {
        recipe_id: recipeId,
        ingredient_id: selectedIngredient,
        quantity
      }
    ])

    setQuantity(0)
    fetchRecipeIngredients()
  }

  useEffect(() => {
    fetchIngredients()
    fetchRecipeIngredients()
  }, [])

  return (
    <div style={{ padding: 24 }}>
      <h1>Ingredienti della ricetta</h1>

      <div style={{ marginBottom: 24 }}>
        <select
          value={selectedIngredient}
          onChange={(e) => setSelectedIngredient(e.target.value)}
        >
          <option value="">Seleziona ingrediente</option>
          {ingredients.map((ing) => (
            <option key={ing.id} value={ing.id}>
              {ing.name} ({ing.unit})
            </option>
          ))}
        </select>

        <input
          type="number"
          placeholder="Quantità"
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
          style={{ marginLeft: 8 }}
        />

        <button onClick={addIngredientToRecipe} style={{ marginLeft: 8 }}>
          Aggiungi
        </button>
      </div>

      <ul>
        {recipeIngredients.map((ri) => (
          <li key={ri.id}>
            {ri.ingredients.name} — {ri.quantity} {ri.ingredients.unit}
          </li>
        ))}
      </ul>
    </div>
  )
}
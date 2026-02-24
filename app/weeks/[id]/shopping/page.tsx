'use client'

import { useEffect, useState } from "react"
import { supabase } from "../../../lib/supabase"
import { useParams } from "next/navigation"

type ShoppingItem = {
  name: string
  total_quantity: number
  unit: string | null
  checked: boolean
}

type MealRow = {
  id: string
  recipe_id: string
  people_count: number
}

type RecipeIngredientRow = {
  recipe_id: string
  quantity: number
  unit: string | null
  ingredient: { name: string } | null
}

export default function ShoppingPage() {
  const params = useParams()
  const weekId = params.id as string

  const [items, setItems] = useState<ShoppingItem[]>([])

  async function generateShoppingList() {
    // 1️⃣ Prendiamo tutti i meals con recipe_id
    const { data: meals, error: mealsError } = await supabase
      .from("meals")
      .select("id, people_count, recipe_id")
      .eq("weekly_menu_id", weekId)
      .not("recipe_id", "is", null)

    if (mealsError) {
      console.error("Errore meals:", mealsError)
      return
    }

    if (!meals || meals.length === 0) {
      setItems([{ name: "DEBUG: Nessun meal con ricetta", total_quantity: 0, unit: "", checked: false }])
      return
    }

    const mealsTyped: MealRow[] = meals as MealRow[]
    const recipeIds = mealsTyped.map(m => m.recipe_id).filter(Boolean)

    // 2️⃣ Prendiamo ingredienti delle ricette
    const { data: recipeIngredients, error: riError } = await supabase
      .from("recipe_ingredients")
      .select(`
        recipe_id,
        quantity,
        unit,
        ingredient:ingredients(name)
      `)
      .in("recipe_id", recipeIds)

    if (riError) {
      console.error("Errore recipeIngredients:", riError)
      return
    }

    if (!recipeIngredients || recipeIngredients.length === 0) {
      setItems([{ name: "DEBUG: Nessun recipe_ingredient trovato", total_quantity: 0, unit: "", checked: false }])
      return
    }

    const riTyped: RecipeIngredientRow[] = recipeIngredients as RecipeIngredientRow[]
    const aggregated: Record<string, ShoppingItem> = {}

    for (const meal of mealsTyped) {
      const ingredientsForRecipe = riTyped.filter(ri => ri.recipe_id === meal.recipe_id)

      for (const ri of ingredientsForRecipe) {
        const ingredientName = ri.ingredient?.name
        if (!ingredientName) continue

        const key = ingredientName
        const quantity = ri.quantity * meal.people_count

        if (!aggregated[key]) {
          aggregated[key] = { name: key, total_quantity: 0, unit: ri.unit, checked: false }
        }

        aggregated[key].total_quantity += quantity
      }
    }

    setItems(Object.values(aggregated))
  }

  function toggleItem(index: number) {
    const updated = [...items]
    updated[index].checked = !updated[index].checked
    setItems(updated)
  }

  useEffect(() => {
    generateShoppingList()
  }, [])

  return (
    <div style={{ padding: 24 }}>
      <h1>Lista della Spesa</h1>

      {items.length === 0 && <p>Nessun elemento</p>}

      <div style={{ display: "grid", gap: 12 }}>
        {items.map((item, index) => (
          <div
            key={index}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: 16,
              borderRadius: 12,
              border: "1px solid #ddd"
            }}
          >
            <div>
              <strong>{item.name}</strong>
              <div>
                {item.total_quantity} {item.unit || ""}
              </div>
            </div>

            <input
              type="checkbox"
              checked={item.checked}
              onChange={() => toggleItem(index)}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
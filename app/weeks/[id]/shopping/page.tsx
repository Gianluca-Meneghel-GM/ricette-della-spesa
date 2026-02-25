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
  ingredient: { name: string }[]
}

export default function ShoppingPage() {
  const params = useParams()
  const weekId = params.id as string

  const [items, setItems] = useState<ShoppingItem[]>([])

async function generateShoppingList() {

  // 1️⃣ Meals della week
  const { data: meals } = await supabase
    .from("meals")
    .select("people_count, recipe_id")
    .eq("weekly_menu_id", weekId)
    .not("recipe_id", "is", null)

  if (!meals || meals.length === 0) {
    setItems([])
    return
  }



  const recipeIds = meals.map(m => m.recipe_id)

  // 2️⃣ Ingredienti collegati alle ricette della week
  const { data: recipeIngredients } = await supabase
    .from("recipe_ingredients")
    .select("*")

  if (!recipeIngredients || recipeIngredients.length === 0) {
    setItems([])

    return
  }


  const aggregated: Record<string, ShoppingItem> = {}

  for (const meal of meals) {

    const ingredientsForRecipe = recipeIngredients.filter(
      ri => ri.recipe_id === meal.recipe_id
    )


    for (const ri of ingredientsForRecipe) {

setItems([
        { name: JSON.stringify(ri), total_quantity: 0, unit: "", checked: false }
      ])

      const ingredientName = ri.ingredients?.[0]?.name
      if (!ingredientName) continue

      const quantity = ri.quantity * meal.people_count

      if (!aggregated[ingredientName]) {
        aggregated[ingredientName] = {
          name: ingredientName,
          total_quantity: 0,
          unit: ri.unit,
          checked: false
        }
      }

      aggregated[ingredientName].total_quantity += quantity
    }
  }

  //setItems(Object.values(aggregated))
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
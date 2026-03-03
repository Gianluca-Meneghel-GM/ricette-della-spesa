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

  // 1️⃣ Prendiamo tutti i meals della week
  const { data: meals } = await supabase
    .from("meals")
    .select("recipe_id, people_count")
    .eq("weekly_menu_id", weekId)
    .not("recipe_id", "is", null)

  if (!meals || meals.length === 0) {
    setItems([])
    return
  }

  // 2️⃣ Aggrego persone totali per ricetta
  const recipePeopleMap: Record<string, number> = {}

  for (const meal of meals) {
    if (!recipePeopleMap[meal.recipe_id]) {
      recipePeopleMap[meal.recipe_id] = 0
    }

    recipePeopleMap[meal.recipe_id] += meal.people_count
  }

  const recipeIds = Object.keys(recipePeopleMap)

  if (recipeIds.length === 0) {
    setItems([])
    return
  }

  // 3️⃣ Prendiamo base_servings delle ricette coinvolte
  const { data: recipes } = await supabase
    .from("recipes")
    .select("id, base_servings")
    .in("id", recipeIds)

  if (!recipes || recipes.length === 0) {
    setItems([])
    return
  }

  const recipeMap: Record<string, { base_servings: number }> = {}

  for (const r of recipes) {
    recipeMap[r.id] = {
      base_servings: r.base_servings
    }
  }

  // 4️⃣ Prendiamo recipe ingredients SOLO delle ricette coinvolte
  const { data: recipeIngredients } = await supabase
    .from("recipe_ingredients")
    .select("recipe_id, ingredient_id, quantity")
    .in("recipe_id", recipeIds)

  if (!recipeIngredients || recipeIngredients.length === 0) {
    setItems([])
    return
  }

  // 5️⃣ Prendiamo ingredienti (nome + unit)
  const { data: ingredients } = await supabase
    .from("ingredients")
    .select("id, name, unit")

  if (!ingredients) {
    setItems([])
    return
  }

  const ingredientMap: Record<
    string,
    { name: string; unit: string | null }
  > = {}

  for (const ing of ingredients) {
    ingredientMap[ing.id] = {
      name: ing.name,
      unit: ing.unit
    }
  }

  // 6️⃣ Aggregazione finale
  const aggregated: Record<string, ShoppingItem> = {}

  for (const ri of recipeIngredients) {

    const totalPeople = recipePeopleMap[ri.recipe_id]
    if (!totalPeople) continue

    const recipe = recipeMap[ri.recipe_id]
    if (!recipe || !recipe.base_servings) continue

    const ingredient = ingredientMap[ri.ingredient_id]
    if (!ingredient) continue

    // 🔥 Formula corretta
    const scaledQuantity =
      (ri.quantity / recipe.base_servings) * totalPeople

    if (!aggregated[ingredient.name]) {
      aggregated[ingredient.name] = {
        name: ingredient.name,
        total_quantity: 0,
        unit: ingredient.unit,
        checked: false
      }
    }

    aggregated[ingredient.name].total_quantity += scaledQuantity
  }

  const finalItems = Object.values(aggregated).map(item => ({
    ...item,
    total_quantity: Number(item.total_quantity.toFixed(2))
  }))
  
  setItems(finalItems)
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
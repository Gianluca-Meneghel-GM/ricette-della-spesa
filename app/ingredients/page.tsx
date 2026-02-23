'use client'

import { useEffect, useState } from "react"
import { supabase } from "../lib/supabase"

type Ingredient = {
  id: string
  name: string
  unit: string
}

export default function IngredientsPage() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([])
  const [name, setName] = useState("")
  const [unit, setUnit] = useState("g")

  async function fetchIngredients() {
    const { data } = await supabase
      .from("ingredients")
      .select("*")
      .order("name")

    if (data) setIngredients(data)
  }

  async function addIngredient() {
    if (!name) return

    await supabase.from("ingredients").insert([
      { name, unit }
    ])

    setName("")
    setUnit("g")
    fetchIngredients()
  }

  useEffect(() => {
    fetchIngredients()
  }, [])

  return (
    <div style={{ padding: 24 }}>
      <h1>Ingredienti</h1>

      <div style={{ marginBottom: 24 }}>
        <input
          placeholder="Nome ingrediente"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          placeholder="Unità (g, ml, pz)"
          value={unit}
          onChange={(e) => setUnit(e.target.value)}
          style={{ marginLeft: 8 }}
        />
        <button onClick={addIngredient} style={{ marginLeft: 8 }}>
          Aggiungi
        </button>
      </div>

      <ul>
        {ingredients.map((ingredient) => (
          <li key={ingredient.id}>
            {ingredient.name} ({ingredient.unit})
          </li>
        ))}
      </ul>
    </div>
  )
}
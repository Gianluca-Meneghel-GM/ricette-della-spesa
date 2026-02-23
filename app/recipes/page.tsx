'use client'

import { useEffect, useState } from "react"
import { supabase } from "../lib/supabase"

type Recipe = {
  id: string
  name: string
  base_servings: number
}

export default function RecipesPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [name, setName] = useState("")
  const [baseServings, setBaseServings] = useState(2)

  async function fetchRecipes() {
    const { data } = await supabase
      .from("recipes")
      .select("*")
      .order("created_at", { ascending: false })

    if (data) setRecipes(data)
  }

  async function addRecipe() {
    if (!name) return

    await supabase.from("recipes").insert([
      {
        name,
        base_servings: baseServings
      }
    ])

    setName("")
    setBaseServings(2)
    fetchRecipes()
  }

  useEffect(() => {
    fetchRecipes()
  }, [])

  return (
    <div style={{ padding: 24 }}>
      <h1>Ricette</h1>

      <div style={{ marginBottom: 24 }}>
        <input
          placeholder="Nome ricetta"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="number"
          value={baseServings}
          onChange={(e) => setBaseServings(Number(e.target.value))}
          style={{ marginLeft: 8 }}
        />
        <button onClick={addRecipe} style={{ marginLeft: 8 }}>
          Aggiungi
        </button>
      </div>

      <ul>
        {recipes.map((recipe) => (
          <li key={recipe.id}>
            {recipe.name} — {recipe.base_servings} persone
          </li>
        ))}
      </ul>
    </div>
  )
}
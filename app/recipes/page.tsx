'use client'

import { useEffect, useState } from "react"
import Link from "next/link"
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
    <h1 style={{ fontSize: 28, marginBottom: 24 }}>Ricette</h1>

    <div style={{ marginBottom: 32 }}>
      <input
        placeholder="Nome ricetta"
        value={name}
        onChange={(e) => setName(e.target.value)}
        style={{
          padding: 12,
          fontSize: 16,
          borderRadius: 8,
          border: "1px solid #ccc",
          marginRight: 8
        }}
      />
      <input
        type="number"
        value={baseServings}
        onChange={(e) => setBaseServings(Number(e.target.value))}
        style={{
          padding: 12,
          fontSize: 16,
          borderRadius: 8,
          border: "1px solid #ccc",
          width: 80,
          marginRight: 8
        }}
      />
      <button
        onClick={addRecipe}
        style={{
          padding: "12px 20px",
          fontSize: 16,
          borderRadius: 8,
          border: "none",
          background: "black",
          color: "white",
          cursor: "pointer"
        }}
      >
        Aggiungi
      </button>
    </div>

    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {recipes.map((recipe) => (
        <Link key={recipe.id} href={`/recipes/${recipe.id}`} style={{ textDecoration: "none" }}>
          <div
            style={{
              padding: 20,
              borderRadius: 12,
              border: "1px solid #eee",
              fontSize: 18,
              background: "#fafafa"
            }}
          >
            <strong>{recipe.name}</strong>
            <div style={{ fontSize: 14, opacity: 0.7 }}>
              {recipe.base_servings} persone
            </div>
          </div>
        </Link>
      ))}
    </div>
  </div>
)
}
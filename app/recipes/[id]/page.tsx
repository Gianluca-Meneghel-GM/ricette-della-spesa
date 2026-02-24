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

  const [showModal, setShowModal] = useState(false)
  const [newIngredientName, setNewIngredientName] = useState("")
  const [newIngredientUnit, setNewIngredientUnit] = useState("g")

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

  async function createIngredient() {
    if (!newIngredientName) return

    await supabase.from("ingredients").insert([
      { name: newIngredientName, unit: newIngredientUnit }
    ])

    setNewIngredientName("")
    setNewIngredientUnit("g")
    setShowModal(false)
    fetchIngredients()
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
        <button
          onClick={() => setShowModal(true)}
          style={{
            padding: "8px 12px",
            marginBottom: 12,
            borderRadius: 8,
            border: "1px solid #ccc",
            background: "#f5f5f5"
          }}
        >
          + Nuovo ingrediente
        </button>
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
      {showModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          <div
            style={{
              background: "white",
              padding: 24,
              borderRadius: 12,
              width: 300
            }}
          >
            <h3>Nuovo ingrediente</h3>
      
            <input
              placeholder="Nome"
              value={newIngredientName}
              onChange={(e) => setNewIngredientName(e.target.value)}
              style={{
                width: "100%",
                padding: 10,
                marginBottom: 12,
                borderRadius: 8,
                border: "1px solid #ccc"
              }}
            />
      
            <input
              placeholder="Unità (g, ml, pz)"
              value={newIngredientUnit}
              onChange={(e) => setNewIngredientUnit(e.target.value)}
              style={{
                width: "100%",
                padding: 10,
                marginBottom: 16,
                borderRadius: 8,
                border: "1px solid #ccc"
              }}
            />
      
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <button onClick={() => setShowModal(false)}>Annulla</button>
              <button onClick={createIngredient}>Salva</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
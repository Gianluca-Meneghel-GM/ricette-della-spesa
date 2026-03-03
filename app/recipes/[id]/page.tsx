'use client'

import { useEffect, useState } from "react"
import { supabase } from "../../lib/supabase"
import { useParams, useRouter } from "next/navigation"

export default function RecipePage() {
  const { id } = useParams()
  const router = useRouter()

  const [name, setName] = useState("")
  const [baseServings, setBaseServings] = useState(1)
  const [loading, setLoading] = useState(true)
  const [recipeIngredients, setRecipeIngredients] = useState<any[]>([])
  const [allIngredients, setAllIngredients] = useState<any[]>([])
  
  const [selectedIngredientId, setSelectedIngredientId] = useState("")
  const [newIngredientName, setNewIngredientName] = useState("")
  const [newIngredientUnit, setNewIngredientUnit] = useState("")
  const [quantity, setQuantity] = useState(0)

  useEffect(() => {
    fetchRecipe()
  }, [])

  async function fetchRecipe() {
    const { data } = await supabase
      .from("recipes")
      .select(`
        id,
        name,
        base_servings,
        recipe_ingredients (
          id,
          quantity,
          ingredient_id,
          ingredients (
            id,
            name,
            unit
          )
        )
      `)
      .eq("id", id)
      .single()
  
    const { data: ingredientsData } = await supabase
      .from("ingredients")
      .select("id, name, unit")
      .order("name")
    
    if (ingredientsData) {
      setAllIngredients(ingredientsData)
    }

    if (data) {
      setName(data.name)
      setBaseServings(data.base_servings)
  
      setRecipeIngredients(data.recipe_ingredients || [])
    }
  
    setLoading(false)
  }

  async function addIngredientToRecipe() {
    let ingredientId = selectedIngredientId
  
    // 1️⃣ Se l'utente ha scritto un nuovo ingrediente → creiamolo
    if (!ingredientId && newIngredientName) {
      const { data: newIngredient, error } = await supabase
        .from("ingredients")
        .insert({
          name: newIngredientName,
          unit: newIngredientUnit || null
        })
        .select()
        .single()
  
      if (error || !newIngredient) {
        alert("Errore creazione ingrediente")
        return
      }
  
      ingredientId = newIngredient.id
  
      // aggiorniamo lista ingredienti disponibili
      setAllIngredients(prev => [...prev, newIngredient])
    }
  
    if (!ingredientId || !quantity) {
      alert("Seleziona ingrediente e quantità")
      return
    }
  
    // 2️⃣ Inseriamo collegamento nella recipe
    const { data, error } = await supabase
      .from("recipe_ingredients")
      .insert({
        recipe_id: id,
        ingredient_id: ingredientId,
        quantity
      })
      .select(`
        id,
        quantity,
        ingredient_id,
        ingredients (
          id,
          name,
          unit
        )
      `)
      .single()
  
    if (error || !data) {
      alert("Errore inserimento ingrediente")
      return
    }
  
    // 3️⃣ Aggiorniamo UI
    setRecipeIngredients(prev => [...prev, data])
  
    // reset campi
    setSelectedIngredientId("")
    setNewIngredientName("")
    setNewIngredientUnit("")
    setQuantity(0)
  }

  async function updateRecipe() {
    await supabase
      .from("recipes")
      .update({
        name,
        base_servings: baseServings
      })
      .eq("id", id)

    alert("Ricetta aggiornata")
  }

  async function deleteRecipe() {
    const confirmed = confirm("Sei sicuro di voler eliminare questa ricetta?")

    if (!confirmed) return

    // ⚠ Prima cancella collegamenti
    await supabase
      .from("recipe_ingredients")
      .delete()
      .eq("recipe_id", id)

    await supabase
      .from("recipes")
      .delete()
      .eq("id", id)

    router.push("/recipes")
  }

  async function removeIngredient(recipeIngredientId: string) {
    const confirmed = confirm("Rimuovere questo ingrediente dalla ricetta?")
    if (!confirmed) return
  
    await supabase
      .from("recipe_ingredients")
      .delete()
      .eq("id", recipeIngredientId)
  
    // aggiorniamo stato locale senza refetch
    setRecipeIngredients(prev =>
      prev.filter(ri => ri.id !== recipeIngredientId)
    )
  }

  if (loading) return <p>Loading...</p>

  return (
    <div style={{ padding: 24, display: "grid", gap: 16 }}>
      <h1>Modifica Ricetta</h1>

      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Nome ricetta"
      />

      <input
        type="number"
        value={baseServings}
        onChange={(e) => setBaseServings(Number(e.target.value))}
        placeholder="Base servings"
      />

      <h2>Ingredienti</h2>

      <div style={{ display: "grid", gap: 8 }}>
        {recipeIngredients.map((ri) => (
          <div
            key={ri.id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              border: "1px solid #ddd",
              padding: 8,
              borderRadius: 8
            }}
          >
            <div>
              <strong>{ri.ingredients?.name}</strong>
              <div>
                {ri.quantity} {ri.ingredients?.unit}
              </div>
            </div>
      
            <button
              onClick={() => removeIngredient(ri.id)}
              style={{
                background: "red",
                color: "white",
                border: "none",
                padding: "6px 10px",
                borderRadius: 6,
                cursor: "pointer"
              }}
            >
              🗑
            </button>
          </div>
        ))}
      </div>

      <h3>Aggiungi ingrediente</h3>

      <div style={{ display: "grid", gap: 8, maxWidth: 400 }}>
      
        {/* Select ingredienti esistenti */}
        <select
          value={selectedIngredientId}
          onChange={(e) => setSelectedIngredientId(e.target.value)}
        >
          <option value="">-- Seleziona ingrediente --</option>
          {allIngredients.map(ing => (
            <option key={ing.id} value={ing.id}>
              {ing.name} ({ing.unit || "-"})
            </option>
          ))}
        </select>
      
        <div style={{ textAlign: "center" }}>oppure crea nuovo</div>
      
        {/* Nuovo ingrediente */}
        <input
          placeholder="Nuovo ingrediente"
          value={newIngredientName}
          onChange={(e) => setNewIngredientName(e.target.value)}
        />
      
        <input
          placeholder="Unità (g, ml, pcs...)"
          value={newIngredientUnit}
          onChange={(e) => setNewIngredientUnit(e.target.value)}
        />
      
        <input
          type="number"
          placeholder="Quantità"
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
        />
      
        <button onClick={addIngredientToRecipe}>
          Aggiungi
        </button>
      
      </div>

      <button onClick={updateRecipe}>
        Salva modifiche
      </button>

      <button
        onClick={deleteRecipe}
        style={{ background: "red", color: "white" }}
      >
        Elimina ricetta
      </button>
    </div>
  )
}
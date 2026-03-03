'use client'

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { useParams, useRouter } from "next/navigation"

export default function RecipePage() {
  const { id } = useParams()
  const router = useRouter()

  const [name, setName] = useState("")
  const [baseServings, setBaseServings] = useState(1)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRecipe()
  }, [])

  async function fetchRecipe() {
    const { data } = await supabase
      .from("recipes")
      .select("*")
      .eq("id", id)
      .single()

    if (data) {
      setName(data.name)
      setBaseServings(data.base_servings)
    }

    setLoading(false)
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
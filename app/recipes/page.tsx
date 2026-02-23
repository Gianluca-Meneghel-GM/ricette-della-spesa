import { supabase } from "@/app/lib/supabase"

export default async function RecipesPage() {
  const { data: recipes, error } = await supabase
    .from("recipes")
    .select("*")
    .order("created_at", { ascending: false })

  console.log(recipes, error)

  if (error) {
    return <div>Errore: {error.message}</div>
  }

  return (
    <div style={{ padding: 24 }}>
      <h1>Ricette</h1>

      {!recipes?.length && <p>Nessuna ricetta ancora</p>}

      <ul>
        {recipes?.map((recipe) => (
          <li key={recipe.id}>
            {recipe.name} — {recipe.base_servings} persone
          </li>
        ))}
      </ul>
    </div>
  )
}
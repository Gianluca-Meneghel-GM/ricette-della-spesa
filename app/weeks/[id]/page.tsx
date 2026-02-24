'use client'

import { useEffect, useState } from "react"
import { supabase } from "../../lib/supabase"
import { useParams } from "next/navigation"

type Recipe = {
  id: string
  name: string
}

type Meal = {
  id: string
  date: string
  type: "lunch" | "dinner"
  recipe_id: string | null
  people_count: number
}

export default function WeekDetailPage() {
  const params = useParams()
  const weekId = params.id as string

  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [meals, setMeals] = useState<Meal[]>([])
  const [weekStart, setWeekStart] = useState<string>("")

  async function fetchWeek() {
    const { data } = await supabase
      .from("weekly_menus")
      .select("*")
      .eq("id", weekId)
      .single()

    if (data) setWeekStart(data.week_start)
  }

  async function fetchRecipes() {
    const { data } = await supabase
      .from("recipes")
      .select("id, name")
      .order("name")

    if (data) setRecipes(data)
  }

  async function fetchMeals() {
    const { data } = await supabase
      .from("meals")
      .select("*")
      .eq("weekly_menu_id", weekId)

    if (data) setMeals(data)
  }

  async function createInitialMeals(startDate: string) {
    const days = 7
    const newMeals = []

    for (let i = 0; i < days; i++) {
      const date = new Date(startDate)
      date.setDate(date.getDate() + i)

      const isoDate = date.toISOString().split("T")[0]

      newMeals.push({
        weekly_menu_id: weekId,
        date: isoDate,
        type: "lunch",
        people_count: 2
      })

      newMeals.push({
        weekly_menu_id: weekId,
        date: isoDate,
        type: "dinner",
        people_count: 4
      })
    }

    await supabase.from("meals").insert(newMeals)
  }

  async function updateMeal(mealId: string, field: string, value: any) {
    await supabase
      .from("meals")
      .update({ [field]: value })
      .eq("id", mealId)

    fetchMeals()
  }

  useEffect(() => {
    fetchWeek()
    fetchRecipes()
    fetchMeals()
  }, [])

  useEffect(() => {
  if (!weekStart) return

  async function ensureMealsExist() {
    const { count } = await supabase
      .from("meals")
      .select("*", { count: "exact", head: true })
      .eq("weekly_menu_id", weekId)

    	if (count === 0) {
      	await createInitialMeals(weekStart)
    	} else {
      	fetchMeals()
    	}
  	}

  	ensureMealsExist()
	}, [weekStart])

  const grouped = meals.reduce((acc: any, meal) => {
    if (!acc[meal.date]) acc[meal.date] = []
    acc[meal.date].push(meal)
    return acc
  }, {})

  return (
    <div style={{ padding: 24 }}>
      <h1>Settimana {weekStart}</h1>

      {Object.keys(grouped)
        .sort()
        .map((date) => (
          <div
            key={date}
            style={{
              border: "1px solid #ddd",
              padding: 16,
              borderRadius: 12,
              marginBottom: 16
            }}
          >
           <h3>
  				{new Date(date).toLocaleDateString("it-IT", {
    				weekday: "long",
  				})} – {date}
					</h3>

          {grouped[date]
  				.sort((a: Meal, b: Meal) => {
    				if (a.type === b.type) return 0
    				return a.type === "lunch" ? -1 : 1
  				})
  				.map((meal: Meal) => (
              <div
                key={meal.id}
                style={{
                  display: "flex",
                  gap: 12,
                  alignItems: "center",
                  marginBottom: 8
                }}
              >
                <strong style={{ width: 80 }}>
                  {meal.type === "lunch" ? "Pranzo" : "Cena"}
                </strong>

                <select
                  value={meal.recipe_id || ""}
                  onChange={(e) =>
                    updateMeal(meal.id, "recipe_id", e.target.value)
                  }
                >
                  <option value="">Seleziona ricetta</option>
                  {recipes.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>

                <input
                  type="number"
                  value={meal.people_count}
                  onChange={(e) =>
                    updateMeal(meal.id, "people_count", Number(e.target.value))
                  }
                  style={{ width: 60 }}
                />
              </div>
            ))}
          </div>
        ))}
    </div>
  )
}
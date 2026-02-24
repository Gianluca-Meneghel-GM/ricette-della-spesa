'use client'

import { useEffect, useState } from "react"
import { supabase } from "../lib/supabase"
import Link from "next/link"

type Week = {
  id: string
  week_start: string
}

export default function WeeksPage() {
  const [weeks, setWeeks] = useState<Week[]>([])
  const [weekStart, setWeekStart] = useState("")

  async function fetchWeeks() {
    const { data } = await supabase
      .from("weekly_menus")
      .select("*")
      .order("week_start", { ascending: false })

    if (data) setWeeks(data)
  }

  async function createWeek() {
    if (!weekStart) return

    await supabase.from("weekly_menus").insert([
      { week_start: weekStart }
    ])

    setWeekStart("")
    fetchWeeks()
  }

  async function deleteWeek(id: string) {
    const confirmDelete = confirm("Sei sicuro di voler eliminare questa settimana?")
    if (!confirmDelete) return

    await supabase
      .from("weekly_menus")
      .delete()
      .eq("id", id)

    fetchWeeks()
  }

  useEffect(() => {
    fetchWeeks()
  }, [])

  return (
    <div style={{ padding: 24 }}>
      <h1>Settimane</h1>

      <div style={{ marginBottom: 32 }}>
        <input
          type="date"
          value={weekStart}
          onChange={(e) => setWeekStart(e.target.value)}
          style={{
            padding: 12,
            marginRight: 8,
            borderRadius: 8,
            border: "1px solid #ccc"
          }}
        />
        <button
          onClick={createWeek}
          style={{
            padding: "12px 16px",
            borderRadius: 8,
            border: "none",
            cursor: "pointer"
          }}
        >
          Crea settimana
        </button>
      </div>

      <div style={{ display: "grid", gap: 16 }}>
        {weeks.map((week) => (
          <div
            key={week.id}
            style={{
              border: "1px solid #ddd",
              borderRadius: 16,
              padding: 20,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}
          >
            <Link
              href={`/weeks/${week.id}`}
              style={{
                textDecoration: "none",
                fontWeight: 600,
                fontSize: 18
              }}
            >
              Settimana del {week.week_start}
            </Link>

            <button
              onClick={() => deleteWeek(week.id)}
              style={{
                background: "#eee",
                border: "none",
                padding: "8px 12px",
                borderRadius: 8,
                cursor: "pointer"
              }}
            >
              Elimina
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
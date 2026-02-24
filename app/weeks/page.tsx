'use client'

import { useEffect, useState } from "react"
import Link from "next/link"
import { supabase } from "../lib/supabase"

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

  useEffect(() => {
    fetchWeeks()
  }, [])

  return (
    <div style={{ padding: 24 }}>
      <h1>Settimane</h1>

      <div style={{ marginBottom: 24 }}>
        <input
          type="date"
          value={weekStart}
          onChange={(e) => setWeekStart(e.target.value)}
          style={{ padding: 10, marginRight: 8 }}
        />
        <button onClick={createWeek}>Crea settimana</button>
      </div>

      <ul>
 			 {weeks.map((week) => (
    			<li key={week.id}>
      			<Link href={`/weeks/${week.id}`}>
       			 {week.week_start}
    			  </Link>
    			</li>
  			))}
			</ul>
    </div>
  )
}
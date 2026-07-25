import { getSupabaseAdmin } from "../../../lib/supabaseAdmin";

export async function GET() {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase.from("meals").select("student_name, score");
    if (error) throw error;

    const byStudent = {};
    for (const row of data) {
      if (!byStudent[row.student_name]) {
        byStudent[row.student_name] = { nome: row.student_name, total: 0, refeicoes: 0 };
      }
      byStudent[row.student_name].total += row.score;
      byStudent[row.student_name].refeicoes += 1;
    }
    const leaderboard = Object.values(byStudent)
      .map((s) => ({ ...s, avg: Math.round(s.total / s.refeicoes) }))
      .sort((a, b) => b.total - a.total);

    return Response.json({ leaderboard });
  } catch (e) {
    return Response.json({ error: "Não foi possível carregar o placar." }, { status: 500 });
  }
}

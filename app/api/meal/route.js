import { getSupabaseAdmin } from "../../../lib/supabaseAdmin";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const student = searchParams.get("student");
    const date = searchParams.get("date");
    if (!student || !date) {
      return Response.json({ error: "Faltam parâmetros." }, { status: 400 });
    }
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("meals")
      .select("*")
      .eq("student_name", student)
      .eq("date", date);
    if (error) throw error;
    return Response.json({ meals: data });
  } catch (e) {
    console.error("Erro em GET /api/meal:", e);
    return Response.json({ error: `Não foi possível carregar as refeições: ${e.message || e}` }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { studentName, date, slot, score, feedback } = await req.json();
    if (!studentName || !date || !slot) {
      return Response.json({ error: "Dados incompletos." }, { status: 400 });
    }
    const supabase = getSupabaseAdmin();
    const { error } = await supabase
      .from("meals")
      .upsert(
        { student_name: studentName, date, slot, score, feedback },
        { onConflict: "student_name,date,slot" }
      );
    if (error) throw error;
    return Response.json({ ok: true });
  } catch (e) {
    console.error("Erro em POST /api/meal:", e);
    return Response.json({ error: `Não foi possível salvar a refeição: ${e.message || e}` }, { status: 500 });
  }
}

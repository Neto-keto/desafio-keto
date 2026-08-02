export async function POST(req) {
  try {
    const body = await req.json();
    // Aceita tanto uma lista de imagens (novo formato) quanto uma imagem única (compatibilidade).
    const images = Array.isArray(body.images) ? body.images : body.image ? [body.image] : [];
    if (images.length === 0) {
      return Response.json({ error: "Nenhuma imagem enviada." }, { status: 400 });
    }

    const prompt =
      images.length > 1
        ? 'Você é um avaliador de dieta cetogênica. As fotos a seguir são pratos diferentes que fazem parte da MESMA refeição (ex: um prato de ovos e outro de queijo, lado a lado). Avalie o conjunto das fotos como uma única refeição e retorne SOMENTE um JSON puro (sem markdown, sem texto extra) no formato exato: {"score": <numero de 0 a 100>, "feedback": "<explicação breve em português, no máximo 12 palavras>"}. Critérios: pontuação alta (80-100) para refeições ricas em gordura boa e proteína, carboidrato praticamente zero (carnes, ovos, queijos, abacate, folhas verdes, azeite, oleaginosas). Pontuação média (40-70) para refeições com pouco carboidrato ou incertas. Pontuação baixa (0-30) para refeições claramente ricas em carboidrato (arroz, pão, massa, batata, açúcar, frutas doces, refrigerante). Se nenhuma das imagens parecer comida, retorne score 0 e explique isso no feedback.'
        : 'Você é um avaliador de dieta cetogênica. Analise esta foto de um prato de comida e retorne SOMENTE um JSON puro (sem markdown, sem texto extra) no formato exato: {"score": <numero de 0 a 100>, "feedback": "<explicação breve em português, no máximo 12 palavras>"}. Critérios: pontuação alta (80-100) para pratos ricos em gordura boa e proteína, carboidrato praticamente zero (carnes, ovos, queijos, abacate, folhas verdes, azeite, oleaginosas). Pontuação média (40-70) para pratos com pouco carboidrato ou incertos. Pontuação baixa (0-30) para pratos claramente ricos em carboidrato (arroz, pão, massa, batata, açúcar, frutas doces, refrigerante). Se a imagem não parecer comida, retorne score 0 e explique isso no feedback.';

    const imageBlocks = images.map((img) => ({
      type: "image",
      source: { type: "base64", media_type: "image/jpeg", data: img },
    }));

    const anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 300,
        messages: [
          {
            role: "user",
            content: [...imageBlocks, { type: "text", text: prompt }],
          },
        ],
      }),
    });

    if (!anthropicRes.ok) {
      const errText = await anthropicRes.text();
      return Response.json({ error: `Erro da API: ${errText}` }, { status: 500 });
    }

    const data = await anthropicRes.json();
    const text = (data.content || []).map((b) => b.text || "").join("");
    const clean = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);

    return Response.json({
      score: Math.max(0, Math.min(100, Math.round(parsed.score))),
      feedback: parsed.feedback || "",
    });
  } catch (e) {
    return Response.json({ error: "Não foi possível avaliar a foto." }, { status: 500 });
  }
}

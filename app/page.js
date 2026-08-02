"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { Camera, Flame, Trophy, RotateCcw, Loader2, BookOpen, ChevronDown } from "lucide-react";

const C = {
  bg: "#14130F",
  surface: "#1F1D17",
  surface2: "#29261E",
  border: "rgba(243,239,228,0.09)",
  text: "#F3EFE4",
  muted: "#9C9686",
  ember: "#E8A33D",
  forest: "#7C9473",
  alert: "#C1523D",
};
const FONT_DISPLAY = "'Fraunces', serif";
const FONT_BODY = "'Inter', sans-serif";
const FONT_MONO = "'JetBrains Mono', monospace";

const SLOTS = [
  { key: "refeicao1", label: "Refeição 1" },
  { key: "refeicao2", label: "Refeição 2" },
  { key: "refeicao3", label: "Refeição 3" },
  { key: "refeicao4", label: "Refeição 4" },
  { key: "refeicao5", label: "Refeição 5" },
];

function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

function scoreColor(score) {
  if (score >= 75) return C.forest;
  if (score >= 40) return C.ember;
  return C.alert;
}

function fileToCompressedBase64(file, maxDim = 480, quality = 0.6) {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    const reader = new FileReader();
    reader.onload = (e) => {
      img.onload = () => {
        let { width, height } = img;
        if (width > height && width > maxDim) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else if (height > maxDim) {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality).split(",")[1]);
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function BurnerDial({ score, size = 72 }) {
  const pct = Math.max(0, Math.min(100, score ?? 0));
  const color = scoreColor(pct);
  const ticks = [0, 25, 50, 75, 100];
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <div
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          background: `conic-gradient(${color} ${pct}%, rgba(255,255,255,0.08) ${pct}% 100%)`,
          display: "grid",
          placeItems: "center",
          transition: "background 0.5s ease",
        }}
      >
        <div
          style={{
            width: size - 12,
            height: size - 12,
            borderRadius: "50%",
            background: C.surface,
            display: "grid",
            placeItems: "center",
          }}
        >
          {score === null || score === undefined ? (
            <Flame size={size * 0.28} color={C.muted} />
          ) : (
            <span style={{ fontFamily: FONT_MONO, fontSize: size * 0.26, color: C.text, fontWeight: 600 }}>
              {score}
            </span>
          )}
        </div>
      </div>
      {ticks.map((t) => {
        const angle = (t / 100) * 360 - 90;
        const rad = (angle * Math.PI) / 180;
        const r = size / 2 + 3;
        const x = size / 2 + r * Math.cos(rad);
        const y = size / 2 + r * Math.sin(rad);
        return (
          <div
            key={t}
            style={{
              position: "absolute",
              left: x - 1.5,
              top: y - 1.5,
              width: 3,
              height: 3,
              borderRadius: "50%",
              background: "rgba(243,239,228,0.18)",
            }}
          />
        );
      })}
    </div>
  );
}

function MealCard({ slot, entry, pendingPhotos, busy, onAddPhoto, onClearPending, onSubmit }) {
  const inputRef = useRef(null);
  const pendingCount = pendingPhotos ? pendingPhotos.length : 0;

  return (
    <div
      style={{
        background: C.surface,
        border: `1px solid ${C.border}`,
        borderRadius: 16,
        padding: 14,
        display: "flex",
        flexDirection: "column",
        gap: 10,
        minHeight: 168,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <span style={{ fontFamily: FONT_BODY, fontSize: 13, color: C.muted }}>{slot.label}</span>
        {entry && <BurnerDial score={entry.score} size={48} />}
      </div>

      {entry ? (
        <div style={{ display: "flex", alignItems: "center", flex: 1 }}>
          <p style={{ fontFamily: FONT_BODY, fontSize: 12.5, color: C.text, lineHeight: 1.35, margin: 0 }}>
            {entry.feedback}
          </p>
        </div>
      ) : pendingCount > 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 4,
              border: `1.5px dashed ${C.border}`,
              borderRadius: 12,
              padding: 10,
            }}
          >
            <span style={{ fontFamily: FONT_BODY, fontSize: 12.5, color: C.text }}>
              {pendingCount === 1 ? "1 foto adicionada" : `${pendingCount} fotos adicionadas`}
            </span>
            <span style={{ fontFamily: FONT_BODY, fontSize: 11, color: C.muted }}>
              São pratos da mesma refeição
            </span>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => inputRef.current && inputRef.current.click()}
              disabled={busy}
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                background: "transparent",
                border: `1px solid ${C.border}`,
                borderRadius: 10,
                color: C.muted,
                cursor: busy ? "default" : "pointer",
                fontFamily: FONT_BODY,
                fontSize: 12,
                padding: "8px 6px",
              }}
            >
              <Camera size={16} color={C.muted} />
              <span>Add. foto</span>
            </button>
            <button
              onClick={() => onSubmit(slot.key)}
              disabled={busy}
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                background: busy ? "transparent" : C.ember,
                border: `1px solid ${C.ember}`,
                borderRadius: 10,
                color: busy ? C.ember : C.bg,
                cursor: busy ? "default" : "pointer",
                fontFamily: FONT_BODY,
                fontSize: 12,
                fontWeight: 600,
                padding: "8px 6px",
              }}
            >
              {busy ? (
                <Loader2 size={16} className="animate-spin" color={C.ember} />
              ) : (
                <span>Avaliar</span>
              )}
            </button>
          </div>
          {!busy && (
            <button
              onClick={() => onClearPending(slot.key)}
              style={{
                background: "transparent",
                border: "none",
                color: C.muted,
                fontFamily: FONT_BODY,
                fontSize: 11,
                cursor: "pointer",
                textDecoration: "underline",
              }}
            >
              Cancelar
            </button>
          )}
        </div>
      ) : (
        <button
          onClick={() => inputRef.current && inputRef.current.click()}
          disabled={busy}
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            background: "transparent",
            border: `1.5px dashed ${C.border}`,
            borderRadius: 12,
            color: C.muted,
            cursor: busy ? "default" : "pointer",
            fontFamily: FONT_BODY,
            fontSize: 12.5,
          }}
        >
          <Camera size={22} color={C.muted} />
          <span>Tirar foto</span>
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={(e) => {
          const file = e.target.files[0];
          if (file) onAddPhoto(slot.key, file);
          e.target.value = "";
        }}
      />
    </div>
  );
}

const GUIDE_SECTIONS = [
  {
    title: "O que é a dieta cetogênica",
    body:
      "É uma dieta com pouquíssimo carboidrato e rica em gorduras boas. Com o carboidrato quase zerado, o corpo esgota suas reservas de glicose e passa a produzir cetonas a partir da gordura, usando-as como principal fonte de energia. Esse estado se chama cetose — daí o nome \"keto\".",
  },
  {
    title: "Como fica a divisão de macros",
    body:
      "Na versão clássica: cerca de 70-75% das calorias vêm de gorduras, 20-25% de proteínas e só 5-10% de carboidratos — normalmente até 20-50g de carboidrato líquido por dia (carboidrato líquido = carboidrato total menos fibras). É uma proporção bem diferente da dieta comum, então costuma exigir planejamento nas primeiras semanas.",
  },
  {
    title: "Alimentos liberados",
    body:
      "Carnes em geral (boi, porco, aves), peixes e frutos do mar, ovos, queijos gordos, manteiga e ghee, azeite e óleo de coco, abacate, oleaginosas (castanhas, nozes, amêndoas), vegetais folhosos e de baixo carboidrato (couve, espinafre, brócolis, couve-flor, abobrinha, pepino) e temperos naturais.",
  },
  {
    title: "Alimentos para evitar",
    body:
      "Pães, massas, arroz e farinhas em geral; açúcar e doces; refrigerantes e sucos industrializados; tubérculos ricos em amido (batata, mandioca, batata-doce) em quantidade; leguminosas (feijão, lentilha, grão-de-bico) em excesso; frutas bem doces (banana, uva, manga); cerveja e bebidas destiladas adoçadas.",
  },
  {
    title: "A \"gripe da keto\" nos primeiros dias",
    body:
      "É comum sentir cansaço, dor de cabeça, tontura ou irritação na primeira semana, enquanto o corpo se adapta e perde água e eletrólitos junto com o glicogênio. Ajuda beber bastante água e caprichar no sódio, potássio e magnésio (ex: água com uma pitada de sal, caldo de carne, folhas verdes, abacate). Costuma passar em 1 a 2 semanas.",
  },
  {
    title: "Benefícios relatados",
    body:
      "Muita gente relata perda de gordura corporal, mais saciedade entre as refeições, menos picos de fome e energia mais estável ao longo do dia. Os resultados variam de pessoa para pessoa, e dependem também de sono, treino e consistência — não é fórmula mágica.",
  },
  {
    title: "Pontos de atenção",
    body:
      "Vale conversar com um médico ou nutricionista antes de começar, principalmente em casos de diabetes (sobretudo tipo 1), doenças renais ou hepáticas, gravidez, amamentação, histórico de transtornos alimentares, ou uso contínuo de medicamentos. A dieta é restritiva e precisa de acompanhamento em algumas situações.",
  },
  {
    title: "Dicas práticas para o dia a dia",
    body:
      "Leia rótulos — molhos prontos, embutidos e temperos industrializados costumam esconder açúcar e amido. Planeje as refeições com antecedência para não cair em opções fáceis com carboidrato. Prefira gorduras de qualidade em vez de frituras industrializadas. E tenha paciência: a adaptação plena costuma levar de 1 a 4 semanas.",
  },
];

function GuideTab() {
  const [openIndex, setOpenIndex] = useState(0);
  return (
    <div style={{ padding: "0 20px", maxWidth: 480, margin: "0 auto" }}>
      <p style={{ fontFamily: FONT_BODY, color: C.muted, fontSize: 12.5, margin: "0 0 14px" }}>
        Guia da dieta cetogênica
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
        {GUIDE_SECTIONS.map((section, i) => {
          const open = openIndex === i;
          return (
            <div
              key={section.title}
              style={{
                background: C.surface,
                border: `1px solid ${C.border}`,
                borderRadius: 14,
                overflow: "hidden",
              }}
            >
              <button
                onClick={() => setOpenIndex(open ? -1 : i)}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 10,
                  padding: "14px 16px",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                <span style={{ fontFamily: FONT_BODY, color: C.text, fontSize: 14, fontWeight: 500 }}>
                  {section.title}
                </span>
                <ChevronDown
                  size={16}
                  color={C.muted}
                  style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s ease", flexShrink: 0 }}
                />
              </button>
              {open && (
                <p
                  style={{
                    fontFamily: FONT_BODY,
                    color: C.muted,
                    fontSize: 13,
                    lineHeight: 1.55,
                    margin: 0,
                    padding: "0 16px 16px",
                  }}
                >
                  {section.body}
                </p>
              )}
            </div>
          );
        })}
      </div>
      <p style={{ fontFamily: FONT_BODY, color: C.muted, fontSize: 11, lineHeight: 1.5, textAlign: "center", opacity: 0.8, marginBottom: 24 }}>
        Este guia é educativo e não substitui orientação de um médico ou nutricionista.
      </p>
    </div>
  );
}

export default function Page() {
  const [profile, setProfile] = useState(null);
  const [nameInput, setNameInput] = useState("");
  const [ready, setReady] = useState(false);
  const [tab, setTab] = useState("hoje");
  const [meals, setMeals] = useState({});
  const [busySlot, setBusySlot] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [leaderboard, setLeaderboard] = useState([]);
  const [loadingBoard, setLoadingBoard] = useState(false);
  const date = todayKey();

  useEffect(() => {
    const saved = window.localStorage.getItem("keto_nome");
    if (saved) setProfile({ nome: saved });
    setReady(true);
  }, []);

  useEffect(() => {
    if (!profile) return;
    (async () => {
      try {
        const res = await fetch(`/api/meal?student=${encodeURIComponent(profile.nome)}&date=${date}`);
        const json = await res.json();
        const m = {};
        (json.meals || []).forEach((row) => {
          m[row.slot] = { score: row.score, feedback: row.feedback };
        });
        setMeals(m);
      } catch (e) {
        setMeals({});
      }
    })();
  }, [profile, date]);

  const saveProfile = () => {
    const name = nameInput.trim();
    if (!name) return;
    setErrorMsg("");
    window.localStorage.setItem("keto_nome", name);
    setProfile({ nome: name });
  };

  const [pendingPhotos, setPendingPhotos] = useState({});

  const addPendingPhoto = (slotKey, file) => {
    setErrorMsg("");
    setPendingPhotos((prev) => ({
      ...prev,
      [slotKey]: [...(prev[slotKey] || []), file],
    }));
  };

  const clearPendingPhotos = (slotKey) => {
    setPendingPhotos((prev) => {
      const next = { ...prev };
      delete next[slotKey];
      return next;
    });
  };

  const submitMeal = async (slotKey) => {
    const files = pendingPhotos[slotKey] || [];
    if (files.length === 0) return;
    setErrorMsg("");
    setBusySlot(slotKey);
    try {
      const images = await Promise.all(files.map((f) => fileToCompressedBase64(f)));
      const scoreRes = await fetch("/api/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ images }),
      });
      const scoreJson = await scoreRes.json();
      if (scoreJson.error) throw new Error(scoreJson.error);

      const entry = { score: scoreJson.score, feedback: scoreJson.feedback };

      const saveRes = await fetch("/api/meal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentName: profile.nome,
          date,
          slot: slotKey,
          score: entry.score,
          feedback: entry.feedback,
        }),
      });
      const saveJson = await saveRes.json();
      if (!saveRes.ok || saveJson.error) {
        throw new Error(saveJson.error || "Falha ao salvar.");
      }

      // Só atualiza a tela depois de confirmar que salvou de verdade,
      // assim a refeição nunca "aparece e some" depois.
      setMeals((prev) => ({ ...prev, [slotKey]: entry }));
      clearPendingPhotos(slotKey);
    } catch (e) {
      setErrorMsg("Não deu para salvar essa refeição. Tente novamente.");
    } finally {
      setBusySlot(null);
    }
  };

  const loadLeaderboard = useCallback(async () => {
    setLoadingBoard(true);
    try {
      const res = await fetch("/api/leaderboard");
      const json = await res.json();
      setLeaderboard(json.leaderboard || []);
    } catch (e) {
      setLeaderboard([]);
    }
    setLoadingBoard(false);
  }, []);

  useEffect(() => {
    if (tab === "placar") loadLeaderboard();
  }, [tab, loadLeaderboard]);

  const loggedCount = Object.keys(meals).length;
  const dayScores = Object.values(meals).map((m) => m.score);
  const dayAvg = dayScores.length ? Math.round(dayScores.reduce((a, b) => a + b, 0) / dayScores.length) : null;

  const globalStyle = (
    <style>{`
      * { box-sizing: border-box; }
      @keyframes spin { to { transform: rotate(360deg); } }
      .animate-spin { animation: spin 1s linear infinite; }
      input, button { font-family: ${FONT_BODY}; }
    `}</style>
  );

  if (!ready) {
    return (
      <div style={{ minHeight: "100vh", background: C.bg, display: "grid", placeItems: "center" }}>
        {globalStyle}
        <Loader2 className="animate-spin" color={C.ember} size={28} />
      </div>
    );
  }

  if (!profile) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: C.bg,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
        }}
      >
        {globalStyle}
        <div style={{ marginBottom: 22 }}>
          <BurnerDial score={92} size={84} />
        </div>
        <h1 style={{ fontFamily: FONT_DISPLAY, color: C.text, fontSize: 28, fontWeight: 600, margin: "0 0 6px", textAlign: "center" }}>
          Desafio Keto
        </h1>
        <p style={{ fontFamily: FONT_BODY, color: C.muted, fontSize: 14, margin: "0 0 28px", textAlign: "center" }}>
          Registre suas refeições, receba pontos e acompanhe sua chama.
        </p>
        <div style={{ width: "100%", maxWidth: 320 }}>
          <input
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && saveProfile()}
            placeholder="Seu nome"
            style={{
              width: "100%",
              padding: "14px 16px",
              borderRadius: 12,
              border: `1px solid ${C.border}`,
              background: C.surface,
              color: C.text,
              fontSize: 15,
              marginBottom: 12,
              outline: "none",
            }}
          />
          <button
            onClick={saveProfile}
            style={{
              width: "100%",
              padding: "14px 16px",
              borderRadius: 12,
              border: "none",
              background: C.ember,
              color: "#14130F",
              fontSize: 15,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Entrar no desafio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: C.bg, paddingBottom: 32 }}>
      {globalStyle}
      <div style={{ padding: "24px 20px 16px", textAlign: "center" }}>
        <h1 style={{ fontFamily: FONT_DISPLAY, color: C.text, fontSize: 22, fontWeight: 600, margin: 0 }}>
          Desafio Keto
        </h1>
        <p style={{ fontFamily: FONT_BODY, color: C.muted, fontSize: 12.5, margin: "4px 0 0" }}>Olá, {profile.nome}</p>
      </div>

      <div style={{ display: "flex", gap: 8, padding: "0 20px 18px", justifyContent: "center" }}>
        {[
          { id: "hoje", label: "Hoje", icon: Flame },
          { id: "placar", label: "Placar", icon: Trophy },
          { id: "guia", label: "Guia", icon: BookOpen },
        ].map((t) => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "9px 18px",
                borderRadius: 999,
                border: `1px solid ${active ? C.ember : C.border}`,
                background: active ? "rgba(232,163,61,0.12)" : "transparent",
                color: active ? C.ember : C.muted,
                fontFamily: FONT_BODY,
                fontSize: 13,
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              <Icon size={15} />
              {t.label}
            </button>
          );
        })}
      </div>

      {tab === "guia" ? (
        <GuideTab />
      ) : tab === "hoje" ? (
        <div style={{ padding: "0 20px", maxWidth: 480, margin: "0 auto" }}>
          <div
            style={{
              background: C.surface2,
              borderRadius: 20,
              padding: 20,
              display: "flex",
              alignItems: "center",
              gap: 18,
              marginBottom: 18,
              border: `1px solid ${C.border}`,
            }}
          >
            <BurnerDial score={dayAvg === null ? 0 : dayAvg} size={78} />
            <div>
              <p style={{ fontFamily: FONT_BODY, color: C.muted, fontSize: 12, margin: 0 }}>Pontuação de hoje</p>
              <p style={{ fontFamily: FONT_DISPLAY, color: C.text, fontSize: 26, fontWeight: 600, margin: "2px 0 4px" }}>
                {dayAvg === null ? "—" : dayAvg}
                <span style={{ fontSize: 14, color: C.muted, fontFamily: FONT_BODY }}> /100</span>
              </p>
              <p style={{ fontFamily: FONT_BODY, color: C.muted, fontSize: 12, margin: 0 }}>
                {loggedCount} de 4 refeições registradas
              </p>
            </div>
          </div>

          {errorMsg && (
            <p style={{ color: C.alert, fontFamily: FONT_BODY, fontSize: 12.5, marginBottom: 12, textAlign: "center" }}>
              {errorMsg}
            </p>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {SLOTS.map((slot) => (
              <MealCard
                key={slot.key}
                slot={slot}
                entry={meals[slot.key]}
                pendingPhotos={pendingPhotos[slot.key]}
                busy={busySlot === slot.key}
                onAddPhoto={addPendingPhoto}
                onClearPending={clearPendingPhotos}
                onSubmit={submitMeal}
              />
            ))}
          </div>
        </div>
      ) : (
        <div style={{ padding: "0 20px", maxWidth: 480, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <p style={{ fontFamily: FONT_BODY, color: C.muted, fontSize: 12.5, margin: 0 }}>Placar de todos os alunos</p>
            <button onClick={loadLeaderboard} style={{ background: "transparent", border: "none", cursor: "pointer", color: C.muted }}>
              <RotateCcw size={16} />
            </button>
          </div>

          {loadingBoard ? (
            <div style={{ display: "grid", placeItems: "center", padding: 40 }}>
              <Loader2 className="animate-spin" color={C.ember} size={22} />
            </div>
          ) : leaderboard.length === 0 ? (
            <p style={{ fontFamily: FONT_BODY, color: C.muted, fontSize: 13, textAlign: "center", padding: 30 }}>
              Ninguém pontuou ainda. Registre sua primeira refeição!
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {leaderboard.map((row, i) => {
                const isMe = row.nome === profile.nome;
                return (
                  <div
                    key={row.nome}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 14,
                      background: isMe ? "rgba(232,163,61,0.08)" : C.surface,
                      border: `1px solid ${isMe ? C.ember : C.border}`,
                      borderRadius: 14,
                      padding: "10px 14px",
                    }}
                  >
                    <span style={{ fontFamily: FONT_MONO, color: i === 0 ? C.ember : C.muted, fontSize: 14, width: 20 }}>
                      {i + 1}
                    </span>
                    <BurnerDial score={row.avg} size={40} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontFamily: FONT_BODY, color: C.text, fontSize: 14, fontWeight: 500, margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {row.nome} {isMe && <span style={{ color: C.ember }}>(você)</span>}
                      </p>
                      <p style={{ fontFamily: FONT_BODY, color: C.muted, fontSize: 11.5, margin: 0 }}>{row.refeicoes} refeições registradas</p>
                    </div>
                    <span style={{ fontFamily: FONT_MONO, color: C.text, fontSize: 15, fontWeight: 600 }}>{row.total}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

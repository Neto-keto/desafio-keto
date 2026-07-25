export const metadata = {
  title: "Desafio Keto",
  description: "Registre suas refeições e acompanhe sua pontuação na dieta cetogênica.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Desafio Keto",
  },
};

export const viewport = {
  themeColor: "#14130F",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@500;600&display=swap"
        />
      </head>
      <body style={{ margin: 0, background: "#14130F" }}>{children}</body>
    </html>
  );
}

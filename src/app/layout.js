import "./globals.css";


export const metadata = {
  title: "Xpnse | Smart Finance & Collab",
  description: "Xpnse is an intelligent, beautifully designed finance management system. Track your budget, share ledgers seamlessly, and get AI-powered insights with Aura.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
  
        {children}

      </body>
    </html>
  );
}

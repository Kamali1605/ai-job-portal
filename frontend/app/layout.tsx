import "./globals.css";
import Link from "next/link";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-100 text-gray-900">

        {/* GLOBAL NAVBAR */}
        <header className="bg-black understand text-white">
          <div className="max-w-7xl mx-auto px-8 py-4 flex justify-between items-center">
            <Link href="/" className="text-xl font-bold">
              Resume Analyzer
            </Link>

            <Link
              href="/login"
              className="border border-white px-4 py-1.5 rounded hover:bg-white hover:text-black transition"
            >
              Login
            </Link>
          </div>
        </header>

        {children}

      </body>
    </html>
  );
}







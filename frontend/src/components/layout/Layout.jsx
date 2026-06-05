import Navbar from "./Navbar"

export default function Layout({ children }) {
  return (
    <div className="app-shell">
      <Navbar />
      <main className="app-shell__main max-w-screen-2xl mx-auto px-8 py-8">
        {children}
      </main>
    </div>
  )
}

export default function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="footer">
      © {year} MyBlog — 使用 React + FastAPI + SQLite 打造
    </footer>
  )
}

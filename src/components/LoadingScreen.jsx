import '../styles/loading.css'

export function LoadingScreen({ message = 'Carregando...' }) {
  return (
    <div className="loading-screen">
      <div className="loading-content">
        <div className="loading-spinner-large" />
        <p className="loading-message">{message}</p>
      </div>
    </div>
  )
}

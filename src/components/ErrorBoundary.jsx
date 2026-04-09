import { Component } from 'react'

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <div className="error-boundary-content">
            <div className="error-boundary-icon">
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#e74c3c"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <h2>Algo deu errado</h2>
            <p>Ocorreu um erro inesperado. Tente recarregar a página.</p>
            <button className="btn-primary" onClick={this.handleReload}>
              Tentar novamente
            </button>
            <button
              className="btn-secondary"
              onClick={() => window.location.reload()}
              style={{ marginTop: '8px' }}
            >
              Recarregar página
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

import { Component } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export class AppErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    console.error('Frontend error:', error);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <main className="grid min-h-screen place-items-center bg-slate-100 p-6 text-ink">
        <section className="card max-w-lg p-8 text-center">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-lg bg-red-50 text-redline">
            <AlertTriangle size={22} />
          </div>
          <h1 className="mt-5 text-2xl font-black">Nao foi possivel carregar o painel</h1>
          <p className="mt-3 text-sm text-slate-500">
            O A.F.D Ads Pro encontrou uma falha temporaria na interface. Recarregue a pagina para tentar novamente.
          </p>
          <button className="btn-primary mx-auto mt-6 inline-flex items-center gap-2" type="button" onClick={() => window.location.reload()}>
            <RefreshCw size={16} /> Recarregar
          </button>
        </section>
      </main>
    );
  }
}

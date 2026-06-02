import { LockKeyhole, User } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { Alert } from '../components/ui/Alert';
import { Button } from '../components/ui/Button';
import { Checkbox } from '../components/ui/Checkbox';
import { FormField } from '../components/ui/FormField';
import { useAuth } from '../contexts/AuthContext';
import { hasApiBaseUrl } from '../services/api';

type LocationState = {
  from?: {
    pathname?: string;
  };
};

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState | null;
  const redirectTo = state?.from?.pathname ?? '/';

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    setErrorMessage('');
    setIsSubmitting(true);

    try {
      await login({ username, password, rememberMe });
      navigate(redirectTo, { replace: true });
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Não foi possível entrar.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center overflow-x-hidden bg-paper px-4 py-8 text-ink">
      <form
        className="min-w-0 w-full max-w-[320px] rounded-lg border border-line bg-white p-5 shadow-soft sm:max-w-[430px] sm:p-6"
        onSubmit={handleSubmit}
      >
        <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-lg bg-forest text-white">
          <LockKeyhole size={25} />
        </div>
        <p className="mb-2 text-xs font-extrabold uppercase text-clay">Acesso</p>
        <h1 className="mb-6 text-3xl font-black leading-tight text-ink">Entrar no app</h1>

        <div className="space-y-4">
          <FormField
            autoCapitalize="none"
            autoComplete="username"
            disabled={isSubmitting}
            icon={<User size={18} />}
            label="Usuário"
            name="username"
            onChange={(event) => setUsername(event.target.value)}
            placeholder="Digite seu usuário"
            required
            value={username}
          />
          <FormField
            autoComplete="current-password"
            disabled={isSubmitting}
            icon={<LockKeyhole size={18} />}
            label="Senha"
            name="password"
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Digite sua senha"
            required
            type="password"
            value={password}
          />
          <Checkbox
            checked={rememberMe}
            disabled={isSubmitting}
            label="Permanecer conectado"
            onChange={setRememberMe}
          />
        </div>

        <div className="mt-5 space-y-3">
          {!hasApiBaseUrl() ? (
            <Alert tone="warning">Configure a URL da API no arquivo .env.</Alert>
          ) : null}
          {errorMessage ? <Alert tone="danger">{errorMessage}</Alert> : null}
          <Button className="w-full" isLoading={isSubmitting} type="submit">
            Entrar
          </Button>
        </div>
      </form>
    </main>
  );
}

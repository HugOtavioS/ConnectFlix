'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import apiService from '@/lib/apiService';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    city: '',
    state: '',
    country: 'Brasil',
  });
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        // Login
        console.log('Starting login process');
        const loginResult = await apiService.login(formData.email, formData.password);
        console.log('Login result:', loginResult);
        
        // Aguarda um pouco para garantir que o token foi armazenado
        console.log('Waiting 500ms before redirect');
        await new Promise(resolve => setTimeout(resolve, 500));
        
        console.log('Checking if authenticated:', apiService.isAuthenticated());
        console.log('Redirecting to /home');
        router.push('/home');
      } else {
        // Register
        if (formData.password !== formData.confirmPassword) {
          setError('As senhas não correspondem');
          setLoading(false);
          return;
        }

        await apiService.register({
          username: formData.username || formData.name,
          email: formData.email,
          password: formData.password,
          city: formData.city,
          state: formData.state,
          country: formData.country,
        });

        // Auto-login após registro
        await apiService.login(formData.email, formData.password);
        router.push('/home');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 
                          err.message || 
                          'Erro ao processar solicitação';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-red-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Image
              src="/imgs/Logo_Origin.png"
              alt="ConnectFlix Logo"
              width={100}
              height={100}
              className="drop-shadow-lg"
            />
          </div>
          <h1 className="text-4xl font-bold text-white">ConnectFlix</h1>
          <p className="text-gray-300 mt-2">Mais do que assistir. Colecione, compita e conecte</p>
        </div>

        {/* Auth Container */}
        <div className="bg-black/60 border border-red-600/30 rounded-lg p-8 backdrop-blur">
          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 px-4 rounded font-semibold transition-colors ${
                isLogin
                  ? 'bg-white text-black'
                  : 'bg-transparent text-gray-400 border border-gray-600'
              }`}
            >
              Entrar
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 px-4 rounded font-semibold transition-colors ${
                !isLogin
                  ? 'bg-white text-black'
                  : 'bg-transparent text-gray-400 border border-gray-600'
              }`}
            >
              Cadastrar
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-900/50 border border-red-700 rounded-lg p-3 mb-4">
              <p className="text-red-200 text-sm">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-white text-sm mb-2">Username</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="seu_username"
                  className="w-full bg-gray-900/50 border border-gray-700 rounded px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                  required={!isLogin}
                />
              </div>
            )}

            {!isLogin && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white text-sm mb-2">Cidade</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      placeholder="São Paulo"
                      className="w-full bg-gray-900/50 border border-gray-700 rounded px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                      required={!isLogin}
                    />
                  </div>
                  <div>
                    <label className="block text-white text-sm mb-2">Estado</label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      placeholder="SP"
                      className="w-full bg-gray-900/50 border border-gray-700 rounded px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                      required={!isLogin}
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-white text-sm mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="example@mail.com"
                className="w-full bg-gray-900/50 border border-gray-700 rounded px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-white text-sm mb-2">Senha</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full bg-gray-900/50 border border-gray-700 rounded px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
              />
            </div>

            {!isLogin && (
              <div>
                <label className="block text-white text-sm mb-2">Confirmar senha</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full bg-gray-900/50 border border-gray-700 rounded px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-red-600 text-white font-semibold py-2 px-4 rounded hover:opacity-90 transition-opacity mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Processando...' : isLogin ? 'Entrar' : 'Criar Conta'}
            </button>
          </form>

          {isLogin && (
            <div className="text-center mt-4">
              <a href="#" className="text-gray-300 hover:text-white text-sm">
                Esqueceu a Senha?
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

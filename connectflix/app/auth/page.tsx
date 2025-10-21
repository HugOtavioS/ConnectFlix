'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Aqui você adicionaria a lógica de autenticação
    console.log('Form submitted:', formData);
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

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-white text-sm mb-2">Nome</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Seu nome"
                  className="w-full bg-gray-900/50 border border-gray-700 rounded px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                />
              </div>
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

            <Link href="/home">
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-600 to-red-600 text-white font-semibold py-2 px-4 rounded hover:opacity-90 transition-opacity mt-6"
              >
                {isLogin ? 'Entrar' : 'Criar Conta'}
              </button>
            </Link>
          </form>

          {isLogin && (
            <div className="text-center mt-4">
              <Link href="#" className="text-gray-300 hover:text-white text-sm">
                Esqueceu a Senha?
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

'use client';

import Navigation from '@/app/components/Navigation';
import { useState, useEffect, useRef } from 'react';
import { RadioIcon, X, MapPin, Volume2, VolumeX, Play } from 'lucide-react';
import './radio.css';

interface RadioStation {
  stationuuid: string;
  name: string;
  url_resolved: string;
  country: string;
  state: string;
  favicon: string; // Adicionado para exibir o favicon
}

const BRAZILIAN_STATES = [
  'Acre', 'Alagoas', 'Amapá', 'Amazonas', 'Bahia', 'Ceará', 'Distrito Federal',
  'Espírito Santo', 'Goiás', 'Maranhão', 'Mato Grosso', 'Mato Grosso do Sul',
  'Minas Gerais', 'Pará', 'Paraíba', 'Paraná', 'Pernambuco', 'Piauí',
  'Rio de Janeiro', 'Rio Grande do Norte', 'Rio Grande do Sul', 'Rondônia',
  'Roraima', 'Santa Catarina', 'São Paulo', 'Sergipe', 'Tocantins'
];

export default function Radio() {
  const [selectedState, setSelectedState] = useState('São Paulo');
  const [stations, setStations] = useState<RadioStation[]>([]);
  const [recommendedStations, setRecommendedStations] = useState<RadioStation[]>([]);
  const [loading, setLoading] = useState(false);
  const [playingStation, setPlayingStation] = useState<RadioStation | null>(null);
  const [isMuted, setIsMuted] = useState(false); // Estado para mute
  const [volume, setVolume] = useState(0.5); // Estado para volume
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    fetchRecommendedStations();
    fetchStationsByState(selectedState);
  }, []);

  useEffect(() => {
    fetchStationsByState(selectedState);
  }, [selectedState]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume; // Atualizar volume do áudio
    }
  }, [volume]);

  const fetchRecommendedStations = async () => {
    try {
      const topStates = ['São Paulo', 'Rio de Janeiro', 'Minas Gerais', 'Bahia', 'Pernambuco'];
      const allRecommendations: RadioStation[] = [];

      for (const state of topStates) {
        const response = await fetch(
          `https://fi1.api.radio-browser.info/json/stations/search?countrycode=BR&state=${encodeURIComponent(
            state
          )}&stateExact=true&order=votes&reverse=true&limit=2&hidebroken=true&codec=Mp3`
        );
        const data = await response.json();
        allRecommendations.push(...data);
      }

      setRecommendedStations(allRecommendations.slice(0, 6));
    } catch (error) {
      console.error('Erro ao buscar estações recomendadas:', error);
    }
  };

  const fetchStationsByState = async (state: string) => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://fi1.api.radio-browser.info/json/stations/search?countrycode=BR&state=${encodeURIComponent(
          state
        )}&stateExact=true&order=votes&reverse=true&limit=10&hidebroken=true&codec=Mp3`
      );
      const data = await response.json();
      setStations(data);
    } catch (error) {
      console.error('Erro ao buscar estações:', error);
      setStations([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePlayStation = (station: RadioStation) => {
    if (playingStation?.stationuuid === station.stationuuid) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setPlayingStation(null);
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setPlayingStation(station);

      const audio = new Audio(station.url_resolved);
      audio.crossOrigin = 'anonymous';
      audioRef.current = audio;
      audio.muted = isMuted; // Aplicar estado de mute
      audio.volume = volume; // Aplicar volume inicial

      audio
        .play()
        .catch((error) => {
          console.error('Erro ao reproduzir estação:', error);
          alert('Erro ao reproduzir a estação. A transmissão pode estar indisponível.');
          setPlayingStation(null);
        });
    }
  };

  const handleMuteToggle = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
  };

  const handleStopPlayback = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setPlayingStation(null);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-4xl font-bold mb-8">
          <RadioIcon className="inline-block mr-2" size={36} /> Rádio
        </h1>

        {/* Recomendações */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Recomendações Para Você</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommendedStations.map((station) => (
              <div
                key={station.stationuuid}
                className="bg-gray-900/50 border border-gray-800 rounded-lg overflow-hidden hover:border-purple-500 transition-colors group cursor-pointer"
                onClick={() => handlePlayStation(station)}
              >
                <div className="bg-gradient-to-br from-gray-800 to-gray-900 aspect-video flex items-center justify-center relative group-hover:from-gray-700 group-hover:to-gray-800 transition-colors">
                  {station.favicon && (
                    <img
                      src={station.favicon}
                      alt="Favicon"
                      className="absolute inset-0 w-full h-full object-cover opacity-30"
                    />
                  )}
                  <Play
                    size={48}
                    fill={
                      playingStation?.stationuuid === station.stationuuid
                        ? '#ef4444'
                        : 'white'
                    }
                    color={
                      playingStation?.stationuuid === station.stationuuid
                        ? '#ef4444'
                        : 'white'
                    }
                  />
                </div>
                <div className="p-4">
                  <p className="font-bold text-sm mb-2 truncate">{station.name}</p>
                  <p className="text-gray-400 text-xs flex items-center">
                    <MapPin size={14} className="inline mr-1" /> {station.state}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Filtrar por Estado */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Estações por Estado</h2>
          <div className="mb-6">
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500 min-w-max"
            >
              {BRAZILIAN_STATES.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <p className="text-gray-400">Carregando estações...</p>
            </div>
          ) : stations.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {stations.map((station) => (
                <div
                  key={station.stationuuid}
                  onClick={() => handlePlayStation(station)}
                  className="bg-gray-900/50 border border-gray-800 rounded-lg overflow-hidden hover:border-purple-500 transition-colors cursor-pointer group"
                >
                  <div className="bg-gradient-to-br from-gray-800 to-gray-900 aspect-video flex items-center justify-center relative group-hover:from-gray-700 group-hover:to-gray-800 transition-colors">
                    {station.favicon && (
                      <img
                        src={station.favicon}
                        alt="Favicon"
                        className="absolute inset-0 w-full h-full object-cover opacity-30"
                      />
                    )}
                    <Play
                      size={40}
                      fill={
                        playingStation?.stationuuid === station.stationuuid
                          ? '#ef4444'
                          : 'white'
                      }
                      color={
                        playingStation?.stationuuid === station.stationuuid
                          ? '#ef4444'
                          : 'white'
                      }
                    />
                  </div>
                  <div className="p-3">
                    <p className="text-gray-300 text-xs font-bold truncate">
                      {station.name}
                    </p>
                    <p className="text-gray-500 text-xs mt-1 flex items-center">
                      <MapPin size={12} className="inline mr-1" /> {station.state}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-400">
                Nenhuma estação encontrada para este estado.
              </p>
            </div>
          )}
        </section>

        {playingStation && (
          <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-gray-900 to-black text-white shadow-lg p-4 flex items-center justify-between z-50">
            <div className="flex items-center gap-4">
              {playingStation.favicon && (
                <img
                  src={playingStation.favicon}
                  alt="Favicon"
                  className="w-12 h-12 rounded-full"
                />
              )}
              <div className="flex items-center gap-2">
                <div className={`sound-wave ${isMuted ? 'paused' : ''}`}>
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <div>
                  <h2 className="text-lg font-bold">{playingStation.name}</h2>
                  <p className="text-sm text-gray-400">{playingStation.state}, Brasil</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={handleMuteToggle}
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-6 rounded-full transition-all transform hover:scale-105 flex items-center justify-center gap-2"
              >
                {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />} {isMuted ? 'Desmutar' : 'Mutar'}
              </button>

              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                className="w-32"
              />

              <button
                onClick={handleStopPlayback}
                className="text-gray-400 hover:text-red-500 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

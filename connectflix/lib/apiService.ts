import axios, { AxiosInstance, AxiosError } from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

// Interface para armazenar token
interface AuthTokens {
  access_token: string;
  token_type: string;
}

class ApiService {
  private api: AxiosInstance;
  private token: string | null = null;
  
  constructor() {
    
    this.api = axios.create({
      baseURL: 'http://localhost:8000/api',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
    });

    // Interceptor para adicionar token automaticamente
    this.api.interceptors.request.use(
      (config) => {
        const token = this.getStoredToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Interceptor para lidar com erros de autenticação
    this.api.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Token expirado ou inválido
          this.clearToken();
          if (typeof window !== 'undefined') {
            window.location.href = '/auth';
          }
        }
        return Promise.reject(error);
      }
    );
  }

  // ==================== AUTENTICAÇÃO ====================

  /**
   * Login de usuário
   * POST /auth/login
   */
  async login(email: string, password: string): Promise<AuthTokens> {
    try {
      console.log('Login attempt with email:', email);
      const response = await this.api.post('/auth/login', { email, password });
      console.log('Raw response:', response);
      
      // Pega o token da resposta (pode estar em data.token, data.access_token, ou diretamente em data)
      const tokenData = response.data;
      const token = tokenData.access_token || tokenData.token || tokenData;
      
      console.log('Token data received:', tokenData);
      console.log('Extracted token:', token);
      
      if (token) {
        this.storeToken(token);
        this.token = token;
        console.log('Token stored successfully');
        
        // Verifica se foi armazenado
        if (typeof window !== 'undefined') {
          const stored = localStorage.getItem('authToken');
          console.log('Token verified in localStorage:', stored);
        }
      } else {
        console.error('No token found in response');
        throw new Error('Token não recebido da API');
      }
      
      return tokenData;
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      throw error;
    }
  }

  /**
   * Registrar novo usuário
   * POST /auth/register
   */
  async register(userData: {
    username: string;
    email: string;
    password: string;
    city: string;
    state: string;
    country: string;
  }): Promise<any> {
    try {
      const response = await this.api.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      console.error('Erro ao registrar:', error);
      throw error;
    }
  }

  /**
   * Logout de usuário
   * POST /auth/logout
   */
  async logout(): Promise<void> {
    try {
      await this.api.post('/auth/logout');
      this.clearToken();
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      this.clearToken();
    }
  }

  // ==================== USUÁRIOS ====================

  /**
   * Obter perfil do usuário logado
   * GET /users/me
   */
  async getCurrentUser(): Promise<any> {
    try {
      const response = await this.api.get('/users/me');
      return response.data;
    } catch (error) {
      console.error('Erro ao obter usuário atual:', error);
      throw error;
    }
  }

  /**
   * Atualizar perfil do usuário logado
   * PUT /users/me
   */
  async updateCurrentUser(userData: any): Promise<any> {
    try {
      const response = await this.api.put('/users/me', userData);
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      throw error;
    }
  }

  /**
   * Obter perfil de outro usuário
   * GET /users/{user_id}
   */
  async getUser(userId: string): Promise<any> {
    try {
      const response = await this.api.get(`/users/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao obter usuário:', error);
      throw error;
    }
  }

  /**
   * Buscar usuários
   * GET /users/search?q={term}
   */
  async searchUsers(query: string): Promise<any[]> {
    try {
      const response = await this.api.get('/users/search', { params: { q: query } });
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      throw error;
    }
  }

  /**
   * Busca avançada de usuários com filtros
   * GET /users/search/advanced
   */
  async searchUsersAdvanced(filters?: {
    q?: string;
    query?: string;
    city?: string;
    state?: string;
    country?: string;
    min_level?: number;
    max_level?: number;
    min_xp?: number;
    max_xp?: number;
    order_by?: 'username' | 'level' | 'xp' | 'created_at';
    order_dir?: 'asc' | 'desc';
    limit?: number;
    page?: number;
  }): Promise<any> {
    try {
      const response = await this.api.get('/users/search/advanced', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar usuários (avançado):', error);
      throw error;
    }
  }

  /**
   * Verificar status de conexão com outro usuário
   * GET /users/{user_id}/connection-status
   */
  async getConnectionStatus(userId: string): Promise<any> {
    try {
      const response = await this.api.get(`/users/${userId}/connection-status`);
      return response.data;
    } catch (error) {
      console.error('Erro ao verificar status de conexão:', error);
      throw error;
    }
  }

  // ==================== PREFERÊNCIAS ====================

  /**
   * Obter preferências do usuário
   * GET /preferences/me
   */
  async getPreferences(): Promise<any> {
    try {
      const response = await this.api.get('/preferences/me');
      return response.data;
    } catch (error) {
      console.error('Erro ao obter preferências:', error);
      throw error;
    }
  }

  /**
   * Atualizar preferências do usuário
   * PUT /preferences/me
   */
  async updatePreferences(preferences: {
    favorite_categories?: string[];
    favorite_actors?: string[];
  }): Promise<any> {
    try {
      const response = await this.api.put('/preferences/me', preferences);
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar preferências:', error);
      throw error;
    }
  }

  // ==================== MÍDIAS ====================

  /**
   * Listar todas as mídias
   * GET /media?type={type}&category_id={id}&actor_id={id}
   */
  async getMedia(filters?: {
    type?: 'movie' | 'tv';
    category_id?: string;
    actor_id?: string;
    limit?: number;
    page?: number;
  }): Promise<any> {
    try {
      const response = await this.api.get('/media', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar mídias:', error);
      throw error;
    }
  }

  /**
   * Obter detalhes de uma mídia específica
   * GET /media/{media_id}
   */
  async getMediaDetails(mediaId: string): Promise<any> {
    try {
      const response = await this.api.get(`/media/${mediaId}`);
      return response.data.media || response.data;
    } catch (error) {
      console.error('Erro ao obter detalhes da mídia:', error);
      throw error;
    }
  }

  /**
   * Obter mídias similares
   * GET /media/{media_id} (inclui similar)
   */
  async getSimilarMediaFromDetails(mediaId: string): Promise<any[]> {
    try {
      const response = await this.api.get(`/media/${mediaId}`);
      return response.data.similar || [];
    } catch (error) {
      console.error('Erro ao obter mídias similares:', error);
      return [];
    }
  }

  /**
   * Criar nova mídia (admin only)
   * POST /media
   */
  async createMedia(mediaData: any): Promise<any> {
    try {
      const response = await this.api.post('/media', mediaData);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar mídia:', error);
      throw error;
    }
  }

  /**
   * Atualizar mídia (admin only)
   * PUT /media/{media_id}
   */
  async updateMedia(mediaId: string, mediaData: any): Promise<any> {
    try {
      const response = await this.api.put(`/media/${mediaId}`, mediaData);
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar mídia:', error);
      throw error;
    }
  }

  /**
   * Deletar mídia (admin only)
   * DELETE /media/{media_id}
   */
  async deleteMedia(mediaId: string): Promise<void> {
    try {
      await this.api.delete(`/media/${mediaId}`);
    } catch (error) {
      console.error('Erro ao deletar mídia:', error);
      throw error;
    }
  }

  /**
   * Buscar mídias por termo
   * GET /media/search?query={term}
   */
  async searchMedia(query: string): Promise<any[]> {
    try {
      const response = await this.api.get('/media/search', { params: { query } });
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar mídias:', error);
      throw error;
    }
  }

  /**
   * Buscar mídias para o explorador com status de desbloqueio
   * GET /media/explorer
   */
  async getExplorerMedia(filters?: {
    type?: 'movie' | 'series';
    category_id?: string;
    category_name?: string;
    order_by?: 'created_at' | 'rating' | 'title';
    order_dir?: 'asc' | 'desc';
    limit?: number;
  }): Promise<any> {
    try {
      const response = await this.api.get('/media/explorer', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar mídias do explorador:', error);
      throw error;
    }
  }

  /**
   * Buscar ou criar mídia baseada no YouTube ID
   * POST /media/find-or-create
   */
  async findOrCreateMediaByYoutubeId(data: {
    youtube_id: string;
    title?: string;
    description?: string;
    poster_url?: string;
    type?: 'movie' | 'series';
  }): Promise<any> {
    try {
      const response = await this.api.post('/media/find-or-create', data);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar/criar mídia:', error);
      throw error;
    }
  }

  // ==================== CATEGORIAS E ATORES ====================

  /**
   * Listar todas as categorias
   * GET /categories
   */
  async getCategories(): Promise<any[]> {
    try {
      const response = await this.api.get('/categories');
      return response.data;
    } catch (error) {
      console.error('Erro ao obter categorias:', error);
      throw error;
    }
  }

  /**
   * Listar todos os atores
   * GET /actors?query={name}
   */
  async getActors(query?: string): Promise<any[]> {
    try {
      const response = await this.api.get('/actors', { params: { query } });
      return response.data;
    } catch (error) {
      console.error('Erro ao obter atores:', error);
      throw error;
    }
  }

  /**
   * Obter categorias de uma mídia
   * GET /media/{media_id}/categories
   */
  async getMediaCategories(mediaId: string): Promise<any[]> {
    try {
      const response = await this.api.get(`/media/${mediaId}/categories`);
      return response.data;
    } catch (error) {
      console.error('Erro ao obter categorias da mídia:', error);
      throw error;
    }
  }

  /**
   * Obter atores de uma mídia
   * GET /media/{media_id}/actors
   */
  async getMediaActors(mediaId: string): Promise<any[]> {
    try {
      const response = await this.api.get(`/media/${mediaId}/actors`);
      return response.data;
    } catch (error) {
      console.error('Erro ao obter atores da mídia:', error);
      throw error;
    }
  }

  // ==================== RECOMENDAÇÕES ====================

  /**
   * Obter recomendação aleatória
   * GET /recommendations/roulette
   */
  async getRecommendationRoulette(): Promise<any> {
    try {
      const response = await this.api.get('/recommendations/roulette');
      return response.data;
    } catch (error) {
      console.error('Erro ao obter recomendação:', error);
      throw error;
    }
  }

  /**
   * Obter mídias similares
   * GET /recommendations/similar/{media_id}
   */
  async getSimilarMedia(mediaId: string): Promise<any[]> {
    try {
      const response = await this.api.get(`/recommendations/similar/${mediaId}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao obter mídias similares:', error);
      throw error;
    }
  }

  // ==================== CARDS ====================

  /**
   * Buscar cards
   * GET /cards
   */
  async getCards(filters?: { type?: string; category_name?: string }): Promise<any[]> {
    try {
      const response = await this.api.get('/cards', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar cards:', error);
      throw error;
    }
  }

  /**
   * Buscar cards por categoria
   * GET /cards/by-category/{category_name}
   */
  async getCardsByCategory(categoryName: string): Promise<any[]> {
    try {
      const response = await this.api.get(`/cards/by-category/${encodeURIComponent(categoryName)}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar cards por categoria:', error);
      throw error;
    }
  }

  // ==================== COLECIONÁVEIS ====================

  /**
   * Obter colecionáveis do usuário
   * GET /collectibles/me
   */
  async getCollectibles(): Promise<any> {
    try {
      const response = await this.api.get('/collectibles/me');
      return response.data;
    } catch (error) {
      console.error('Erro ao obter colecionáveis:', error);
      throw error;
    }
  }

  /**
   * Adicionar card ao consumir mídia
   * POST /collectibles
   */
  async addCollectible(mediaId: string): Promise<any> {
    try {
      const response = await this.api.post('/collectibles', { media_id: mediaId });
      return response.data;
    } catch (error) {
      console.error('Erro ao adicionar colecionável:', error);
      throw error;
    }
  }

  /**
   * Obter detalhes de um card específico
   * GET /collectibles/{collectible_id}
   */
  async getCollectibleDetails(collectibleId: string): Promise<any> {
    try {
      const response = await this.api.get(`/collectibles/${collectibleId}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao obter detalhes do colecionável:', error);
      throw error;
    }
  }

  // ==================== ATIVIDADES ====================

  /**
   * Registrar atividade (watch ou stay)
   * POST /activities
   */
  async logActivity(activity: {
    media_id?: string;
    activity_type: 'watch' | 'stay';
    duration_seconds: number;
  }): Promise<any> {
    try {
      const response = await this.api.post('/activities', activity);
      return response.data;
    } catch (error) {
      console.error('Erro ao registrar atividade:', error);
      throw error;
    }
  }

  /**
   * Obter atividades do usuário
   * GET /activities/me?type={type}
   */
  async getActivities(type?: 'watch' | 'stay'): Promise<any> {
    try {
      const response = await this.api.get('/activities/me', { params: { type } });
      return response.data;
    } catch (error) {
      console.error('Erro ao obter atividades:', error);
      throw error;
    }
  }

  /**
   * Obter estatísticas de atividade do usuário
   * GET /activities/stats/me
   */
  async getActivityStats(): Promise<any> {
    try {
      const response = await this.api.get('/activities/stats/me');
      return response.data;
    } catch (error) {
      console.error('Erro ao obter estatísticas de atividade:', error);
      throw error;
    }
  }

  /**
   * Obter última atividade de watch de um vídeo
   * GET /activities/last-watch/{media_id}
   */
  async getLastWatch(mediaId: string): Promise<any> {
    try {
      const response = await this.api.get(`/activities/last-watch/${mediaId}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao obter última atividade:', error);
      throw error;
    }
  }

  /**
   * Obter vídeos para continuar assistindo
   * GET /activities/continue-watching
   */
  async getContinueWatching(limit?: number): Promise<any> {
    try {
      const response = await this.api.get('/activities/continue-watching', { 
        params: { limit } 
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao obter continue watching:', error);
      throw error;
    }
  }

  // ==================== RANKINGS ====================

  /**
   * Obter ranking nacional
   * GET /rankings/national?period={period}&limit={limit}
   */
  async getNationalRanking(period: 'week' | 'month' | 'all' = 'week', limit: number = 10, sortBy?: 'level' | 'xp' | 'cards' | 'hours'): Promise<any[]> {
    try {
      const params: any = { period, limit };
      if (sortBy) {
        params.sort_by = sortBy;
      }
      const response = await this.api.get('/rankings/national', { params });
      return response.data;
    } catch (error) {
      console.error('Erro ao obter ranking nacional:', error);
      throw error;
    }
  }

  /**
   * Obter ranking por estado
   * GET /rankings/state?state={uf}&period={period}
   */
  async getStateRanking(state: string, period: 'week' | 'month' | 'all' = 'week'): Promise<any[]> {
    try {
      const response = await this.api.get('/rankings/state', { params: { state, period } });
      return response.data;
    } catch (error) {
      console.error('Erro ao obter ranking estadual:', error);
      throw error;
    }
  }

  /**
   * Obter ranking por cidade
   * GET /rankings/regional?city={city}&period={period}
   */
  async getRegionalRanking(city: string, period: 'week' | 'month' | 'all' = 'week'): Promise<any[]> {
    try {
      const response = await this.api.get('/rankings/regional', { params: { city, period } });
      return response.data;
    } catch (error) {
      console.error('Erro ao obter ranking regional:', error);
      throw error;
    }
  }

  /**
   * Obter posição do usuário nos rankings
   * GET /rankings/me
   */
  async getUserRankings(): Promise<any> {
    try {
      const response = await this.api.get('/rankings/me');
      return response.data;
    } catch (error) {
      console.error('Erro ao obter rankings do usuário:', error);
      throw error;
    }
  }

  // ==================== CONEXÕES ====================

  /**
   * Obter conexões aceitas do usuário
   * GET /connections/me
   */
  async getConnections(): Promise<any[]> {
    try {
      const response = await this.api.get('/connections/me');
      return response.data;
    } catch (error) {
      console.error('Erro ao obter conexões:', error);
      throw error;
    }
  }

  /**
   * Obter conexões pendentes
   * GET /connections/pending
   */
  async getPendingConnections(): Promise<any[]> {
    try {
      const response = await this.api.get('/connections/pending');
      return response.data;
    } catch (error) {
      console.error('Erro ao obter conexões pendentes:', error);
      throw error;
    }
  }

  /**
   * Enviar pedido de conexão
   * POST /connections/request/{user_id}
   */
  async requestConnection(userId: string): Promise<any> {
    try {
      const response = await this.api.post(`/connections/request/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao solicitar conexão:', error);
      throw error;
    }
  }

  /**
   * Aceitar conexão
   * PUT /connections/accept/{connection_id}
   */
  async acceptConnection(connectionId: string): Promise<any> {
    try {
      const response = await this.api.put(`/connections/accept/${connectionId}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao aceitar conexão:', error);
      throw error;
    }
  }

  /**
   * Rejeitar conexão
   * PUT /connections/reject/{connection_id}
   */
  async rejectConnection(connectionId: string): Promise<any> {
    try {
      const response = await this.api.put(`/connections/reject/${connectionId}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao rejeitar conexão:', error);
      throw error;
    }
  }

  /**
   * Remover conexão
   * DELETE /connections/{connection_id}
   */
  async removeConnection(connectionId: string): Promise<void> {
    try {
      await this.api.delete(`/connections/${connectionId}`);
    } catch (error) {
      console.error('Erro ao remover conexão:', error);
      throw error;
    }
  }

  /**
   * Obter interesses compartilhados
   * GET /connections/shared-interests/{user_id}
   */
  async getSharedInterests(userId: string): Promise<any> {
    try {
      const response = await this.api.get(`/connections/shared-interests/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao obter interesses compartilhados:', error);
      throw error;
    }
  }

  // ==================== DESBLOQUEIOS ====================

  /**
   * Obter mídias desbloqueadas
   * GET /unlocks/me
   */
  async getUnlockedMedia(): Promise<any[]> {
    try {
      const response = await this.api.get('/unlocks/me');
      return response.data;
    } catch (error) {
      console.error('Erro ao obter mídias desbloqueadas:', error);
      throw error;
    }
  }

  /**
   * Obter requisitos para desbloquear uma mídia
   * GET /unlocks/requirements/{media_id}
   */
  async getUnlockRequirements(mediaId: string): Promise<any> {
    try {
      const response = await this.api.get(`/unlocks/requirements/${mediaId}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao obter requisitos de desbloqueio:', error);
      throw error;
    }
  }

  /**
   * Verificar e desbloquear mídia
   * POST /unlocks/check/{media_id}
   */
  async checkAndUnlockMedia(mediaId: string, youtubeIds?: string[]): Promise<any> {
    try {
      const payload: any = {};
      if (youtubeIds && youtubeIds.length > 0) payload.youtube_ids = youtubeIds;
      const response = await this.api.post(`/unlocks/check/${mediaId}`, payload);
      return response.data;
    } catch (error) {
      console.error('Erro ao desbloquear mídia:', error);
      throw error;
    }
  }

  // ==================== RÁDIO ====================

  /**
   * Obter todas as estações de rádio
   * GET /radios
   */
  async getRadios(): Promise<any[]> {
    try {
      const response = await this.api.get('/radios');
      return response.data;
    } catch (error) {
      console.error('Erro ao obter estações de rádio:', error);
      throw error;
    }
  }

  /**
   * Obter detalhes de uma estação
   * GET /radios/{radio_id}
   */
  async getRadioDetails(radioId: string): Promise<any> {
    try {
      const response = await this.api.get(`/radios/${radioId}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao obter detalhes da estação:', error);
      throw error;
    }
  }

  /**
   * Criar nova estação (admin only)
   * POST /radios
   */
  async createRadio(radioData: any): Promise<any> {
    try {
      const response = await this.api.post('/radios', radioData);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar estação:', error);
      throw error;
    }
  }

  /**
   * Atualizar estação (admin only)
   * PUT /radios/{radio_id}
   */
  async updateRadio(radioId: string, radioData: any): Promise<any> {
    try {
      const response = await this.api.put(`/radios/${radioId}`, radioData);
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar estação:', error);
      throw error;
    }
  }

  // ==================== BUSCA GERAL ====================

  /**
   * Busca geral por mídias
   * GET /search?query={term}&type=media
   */
  async searchAll(query: string, type: 'media' | 'users' | 'all' = 'all'): Promise<any> {
    try {
      const response = await this.api.get('/search', { params: { query, type } });
      return response.data;
    } catch (error) {
      console.error('Erro ao fazer busca geral:', error);
      throw error;
    }
  }

  // ==================== NOTIFICAÇÕES ====================

  /**
   * Buscar notificações
   * GET /notifications
   */
  async getNotifications(unreadOnly: boolean = false, page: number = 1, limit: number = 20): Promise<any> {
    try {
      const response = await this.api.get('/notifications', {
        params: {
          unread_only: unreadOnly,
          page,
          limit,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar notificações:', error);
      throw error;
    }
  }

  /**
   * Obter contagem de notificações não lidas
   * GET /notifications/unread-count
   */
  async getUnreadNotificationsCount(): Promise<number> {
    try {
      const response = await this.api.get('/notifications/unread-count');
      return response.data.count || 0;
    } catch (error) {
      console.error('Erro ao obter contagem de notificações:', error);
      return 0;
    }
  }

  /**
   * Marcar notificação como lida
   * PUT /notifications/{id}/read
   */
  async markNotificationAsRead(notificationId: string | number): Promise<any> {
    try {
      const response = await this.api.put(`/notifications/${notificationId}/read`);
      return response.data;
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error);
      throw error;
    }
  }

  /**
   * Marcar todas as notificações como lidas
   * PUT /notifications/read-all
   */
  async markAllNotificationsAsRead(): Promise<void> {
    try {
      await this.api.put('/notifications/read-all');
    } catch (error) {
      console.error('Erro ao marcar todas as notificações como lidas:', error);
      throw error;
    }
  }

  // ==================== GERENCIAMENTO DE TOKEN ====================

  storeToken(token: string): void {
    console.log('Attempting to store token:', token);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('authToken', token);
        console.log('Token stored in localStorage successfully');
      } catch (e) {
        console.error('Error storing token in localStorage:', e);
      }
    } else {
      console.log('Window is undefined, cannot store token');
    }
  }

  getStoredToken(): string | null {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('authToken');
      console.log('Retrieved token from localStorage:', token);
      return token;
    }
    console.log('Window is undefined, cannot retrieve token');
    return null;
  }

  clearToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
    }
    this.token = null;
  }

  getToken(): string | null {
    return this.token || this.getStoredToken();
  }

  isAuthenticated(): boolean {
    return !!this.getStoredToken();
  }
}

export const apiService = new ApiService();
export default apiService;

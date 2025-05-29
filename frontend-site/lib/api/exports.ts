import { API_ENDPOINTS } from './endpoints';
import { api } from './index';

// Types pour les exports
export interface ExportJob {
  id: number;
  user_id: number;
  type: 'results' | 'certificate' | 'progress_report' | 'quiz_summary' | 'leaderboard';
  format: 'pdf' | 'csv' | 'xlsx' | 'json';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  file_path?: string;
  file_size?: number;
  download_url?: string;
  parameters: Record<string, any>;
  progress_percentage: number;
  error_message?: string;
  expires_at?: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

export interface ExportResultsData {
  quiz_id?: number;
  session_id?: number;
  user_id?: number;
  date_from?: string;
  date_to?: string;
  format?: 'pdf' | 'csv' | 'xlsx';
  include_details?: boolean;
  include_answers?: boolean;
  include_statistics?: boolean;
}

export interface ExportCertificateData {
  quiz_id: number;
  session_id?: number;
  template?: string;
  custom_text?: string;
  include_score?: boolean;
  include_date?: boolean;
  format?: 'pdf';
}

export interface ExportProgressReportData {
  user_id?: number;
  date_from?: string;
  date_to?: string;
  categories?: string[];
  include_achievements?: boolean;
  include_statistics?: boolean;
  include_charts?: boolean;
  format?: 'pdf' | 'xlsx';
}

export interface ExportQuizSummaryData {
  quiz_id: number;
  include_questions?: boolean;
  include_answers?: boolean;
  include_statistics?: boolean;
  include_participants?: boolean;
  format?: 'pdf' | 'xlsx';
}

export interface ExportLeaderboardData {
  type: 'global' | 'category' | 'quiz' | 'friends';
  category?: string;
  quiz_id?: number;
  period?: 'daily' | 'weekly' | 'monthly' | 'all_time';
  limit?: number;
  format?: 'pdf' | 'csv' | 'xlsx';
}

export interface ExportTemplate {
  id: number;
  name: string;
  type: 'certificate' | 'report' | 'summary';
  description?: string;
  template_data: Record<string, any>;
  is_default: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Service pour la gestion des exports utilisant les endpoints définis
 */
export const exportService = {
  /**
   * Récupérer tous les exports de l'utilisateur
   */
  getAll: async (params?: {
    type?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) => {
    const searchParams = new URLSearchParams();
    
    if (params?.type) searchParams.append('type', params.type);
    if (params?.status) searchParams.append('status', params.status);
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());

    const url = searchParams.toString() 
      ? `${API_ENDPOINTS.exports.list}?${searchParams.toString()}`
      : API_ENDPOINTS.exports.list;

    return await api.get<{
      data: ExportJob[];
      total: number;
      current_page: number;
      last_page: number;
    }>(url);
  },

  /**
   * Exporter les résultats d'un quiz
   */
  exportResults: async (data: ExportResultsData) => {
    return await api.post<ExportJob>(API_ENDPOINTS.exports.results, data);
  },

  /**
   * Exporter un certificat
   */
  exportCertificate: async (data: ExportCertificateData) => {
    return await api.post<ExportJob>(API_ENDPOINTS.exports.certificate, data);
  },

  /**
   * Exporter un rapport de progression
   */
  exportProgressReport: async (data: ExportProgressReportData) => {
    return await api.post<ExportJob>(API_ENDPOINTS.exports.progressReport, data);
  },

  /**
   * Exporter un résumé de quiz
   */
  exportQuizSummary: async (data: ExportQuizSummaryData) => {
    return await api.post<ExportJob>(`${API_ENDPOINTS.exports.list}/quiz-summary`, data);
  },

  /**
   * Exporter un classement
   */
  exportLeaderboard: async (data: ExportLeaderboardData) => {
    return await api.post<ExportJob>(`${API_ENDPOINTS.exports.list}/leaderboard`, data);
  },

  /**
   * Télécharger un export
   */
  download: async (id: number | string) => {
    const response = await fetch(`${API_ENDPOINTS.exports.download(id)}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Erreur lors du téléchargement');
    }

    return response.blob();
  },

  /**
   * Supprimer un export
   */
  delete: async (id: number | string) => {
    return await api.delete(API_ENDPOINTS.exports.delete(id));
  },

  /**
   * Récupérer le statut d'un export
   */
  getStatus: async (id: number | string) => {
    return await api.get<ExportJob>(`${API_ENDPOINTS.exports.list}/${id}/status`);
  },

  /**
   * Annuler un export en cours
   */
  cancel: async (id: number | string) => {
    return await api.post(`${API_ENDPOINTS.exports.list}/${id}/cancel`);
  },

  /**
   * Relancer un export échoué
   */
  retry: async (id: number | string) => {
    return await api.post<ExportJob>(`${API_ENDPOINTS.exports.list}/${id}/retry`);
  },

  /**
   * Récupérer les templates disponibles
   */
  getTemplates: async (type?: string) => {
    const url = type 
      ? `${API_ENDPOINTS.exports.list}/templates?type=${type}`
      : `${API_ENDPOINTS.exports.list}/templates`;

    return await api.get<ExportTemplate[]>(url);
  },

  /**
   * Créer un nouveau template
   */
  createTemplate: async (templateData: Omit<ExportTemplate, 'id' | 'created_at' | 'updated_at'>) => {
    return await api.post<ExportTemplate>(`${API_ENDPOINTS.exports.list}/templates`, templateData);
  },

  /**
   * Mettre à jour un template
   */
  updateTemplate: async (id: number | string, templateData: Partial<ExportTemplate>) => {
    return await api.put<ExportTemplate>(`${API_ENDPOINTS.exports.list}/templates/${id}`, templateData);
  },

  /**
   * Supprimer un template
   */
  deleteTemplate: async (id: number | string) => {
    return await api.delete(`${API_ENDPOINTS.exports.list}/templates/${id}`);
  },

  /**
   * Prévisualiser un export
   */
  preview: async (type: string, data: any) => {
    return await api.post(`${API_ENDPOINTS.exports.list}/preview`, {
      type,
      data
    });
  },

  /**
   * Récupérer les statistiques d'exports
   */
  getStats: async () => {
    return await api.get<{
      total_exports: number;
      exports_by_type: Record<string, number>;
      exports_by_status: Record<string, number>;
      total_downloads: number;
      storage_used: number;
    }>(`${API_ENDPOINTS.exports.list}/stats`);
  },

  /**
   * Nettoyer les exports expirés
   */
  cleanup: async () => {
    return await api.post(`${API_ENDPOINTS.exports.list}/cleanup`);
  },

  /**
   * Programmer un export récurrent
   */
  schedule: async (data: {
    type: string;
    parameters: Record<string, any>;
    frequency: 'daily' | 'weekly' | 'monthly';
    next_run_at: string;
    is_active?: boolean;
  }) => {
    return await api.post(`${API_ENDPOINTS.exports.list}/schedule`, data);
  },

  /**
   * Récupérer les exports programmés
   */
  getScheduled: async () => {
    return await api.get(`${API_ENDPOINTS.exports.list}/scheduled`);
  },

  /**
   * Mettre à jour un export programmé
   */
  updateScheduled: async (id: number | string, data: any) => {
    return await api.put(`${API_ENDPOINTS.exports.list}/scheduled/${id}`, data);
  },

  /**
   * Supprimer un export programmé
   */
  deleteScheduled: async (id: number | string) => {
    return await api.delete(`${API_ENDPOINTS.exports.list}/scheduled/${id}`);
  },

  /**
   * Exporter en lot
   */
  bulkExport: async (exports: Array<{
    type: string;
    parameters: Record<string, any>;
  }>) => {
    return await api.post<ExportJob[]>(`${API_ENDPOINTS.exports.list}/bulk`, {
      exports
    });
  },

  /**
   * Télécharger plusieurs exports en archive
   */
  downloadArchive: async (exportIds: (number | string)[]) => {
    const response = await fetch(`${API_ENDPOINTS.exports.list}/download-archive`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
      },
      body: JSON.stringify({ export_ids: exportIds }),
    });

    if (!response.ok) {
      throw new Error('Erreur lors du téléchargement de l\'archive');
    }

    return response.blob();
  },

  /**
   * Partager un export
   */
  share: async (id: number | string, options: {
    expires_in_hours?: number;
    password?: string;
    allow_download?: boolean;
  }) => {
    return await api.post<{
      share_url: string;
      expires_at: string;
    }>(`${API_ENDPOINTS.exports.list}/${id}/share`, options);
  },

  /**
   * Révoquer un partage
   */
  revokeShare: async (id: number | string) => {
    return await api.delete(`${API_ENDPOINTS.exports.list}/${id}/share`);
  },
};

export default exportService; 
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthProvider';
import axios from 'axios';
import '../styles/Dashboard.css';
import '../styles/UserManagement.css';

const DashboardPage: React.FC = () => {
  const { username, role, logout } = useAuth();
  const navigate = useNavigate();
  const [isUploading, setIsUploading] = React.useState(false);
  const [uploadProgress, setUploadProgress] = React.useState(0);
  const [uploadStatus, setUploadStatus] = React.useState<{ type: 'success' | 'error', message: string } | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setIsUploading(true);
    setUploadProgress(0);
    setUploadStatus(null);

    try {
      const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
      const response = await axios.post(`${apiBase}/api/v1/ingestion/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const progress = progressEvent.total
            ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
            : 0;
          setUploadProgress(progress);
        },
      });

      setUploadStatus({
        type: 'success',
        message: `¡Éxito! ${response.data.filename} cargado correctamente.`
      });
      
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (error: any) {
      setUploadStatus({
        type: 'error',
        message: 'Error al cargar el archivo. Intenta de nuevo.'
      });
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <div className="dashboard-brand">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          <span>Análisis Territorial</span>
        </div>
        <nav className="dashboard-nav">
          <button className="nav-link active" onClick={() => navigate('/dashboard')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            Dashboard
          </button>
          {role === 'ADMIN' && (
            <button className="nav-link" onClick={() => navigate('/admin/users')}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              Gestión de Usuarios
            </button>
          )}
        </nav>
        <div className="dashboard-user">
          <span className="user-greeting">Hola, <strong>{username}</strong></span>
          <span className="user-role-badge">{role}</span>
          <button onClick={handleLogout} className="btn-logout">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Salir
          </button>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="welcome-card">
          <div className="welcome-icon">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <h1>¡Bienvenido, {username}!</h1>
          <p>Has iniciado sesión correctamente en el sistema de Análisis Territorial.</p>
        </div>

        <div className="dashboard-grid">
          {/* ... existing stat cards ... */}
          <div className="stat-card">
            <div className="stat-icon stat-icon-blue">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            </div>
            <div className="stat-info">
              <span className="stat-label">Territorios</span>
              <span className="stat-value">--</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon stat-icon-green">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
              </svg>
            </div>
            <div className="stat-info">
              <span className="stat-label">Análisis</span>
              <span className="stat-value">--</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon stat-icon-purple">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
            </div>
            <div className="stat-info">
              <span className="stat-label">Reportes</span>
              <span className="stat-value">--</span>
            </div>
          </div>
        </div>

        <section className="ingestion-section">
          <div className="section-header">
            <h2>Ingesta de Datos</h2>
            <p>Sube archivos para procesar y analizar información territorial.</p>
          </div>
          
          <div className="upload-container">
            <input 
              type="file" 
              id="file-upload" 
              hidden 
              onChange={handleFileUpload}
              ref={fileInputRef}
              disabled={isUploading}
            />
            <label htmlFor="file-upload" className={`upload-box ${isUploading ? 'disabled' : ''}`}>
              <div className="upload-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
              </div>
              <div className="upload-text">
                {isUploading ? 'Subiendo archivo...' : 'Haz clic para cargar un archivo'}
              </div>
              <span className="upload-hint">Formatos soportados: CSV, JSON, XLS</span>
            </label>

            {isUploading && (
              <div className="progress-wrapper">
                <div className="progress-info">
                  <span>Progreso de carga</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="progress-bar-container">
                  <div 
                    className="progress-bar-fill" 
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </div>
            )}

            {uploadStatus && (
              <div className={`upload-msg ${uploadStatus.type}`}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  {uploadStatus.type === 'success' ? (
                    <polyline points="20 6 9 17 4 12" />
                  ) : (
                    <>
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </>
                  )}
                </svg>
                {uploadStatus.message}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default DashboardPage;
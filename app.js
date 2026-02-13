class AuroraMindApp {
  constructor() {
    this.token = localStorage.getItem('auroraToken');
    this.user = JSON.parse(localStorage.getItem('auroraUser') || 'null');
    this.apiBase = 'http://localhost:3000/api';
    this.init();
  }

  init() {
    this.setupEventListeners();
    if (this.token) {
      this.loadDashboard();
    }
  }

  setupEventListeners() {
    // Auth Events
    document.addEventListener('click', (e) => {
      if (e.target.closest('.auth-modal-toggle')) {
        this.toggleAuthModal();
      }
      if (e.target.closest('.login-btn')) {
        this.handleLogin();
      }
      if (e.target.closest('.register-btn')) {
        this.handleRegister();
      }
      if (e.target.closest('.logout-btn')) {
        this.logout();
      }
      if (e.target.closest('.cta')) {
        this.showAuthModal();
      }
      if (e.target.closest('.tab-btn')) {
        const tabName = e.target.closest('.tab-btn').dataset.tab;
        this.switchTab(tabName);
      }
      if (e.target.closest('.predict-btn')) {
        this.submitPrediction();
      }
      if (e.target.closest('.refresh-btn')) {
        this.refreshDashboard();
      }
    });

    // Close modal on background click
    document.addEventListener('click', (e) => {
      const modal = document.getElementById('authModal');
      if (modal && e.target === modal) {
        this.hideAuthModal();
      }
    });
  }

  async handleLogin() {
    const email = document.getElementById('loginEmail')?.value;
    const password = document.getElementById('loginPassword')?.value;

    if (!email || !password) {
      this.showNotification('Please fill all fields', 'error');
      return;
    }

    try {
      const response = await fetch(`${this.apiBase}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      this.token = data.token;
      this.user = data.user;
      localStorage.setItem('auroraToken', this.token);
      localStorage.setItem('auroraUser', JSON.stringify(this.user));

      this.showNotification('Login successful! 🎉', 'success');
      this.hideAuthModal();
      this.loadDashboard();
    } catch (error) {
      this.showNotification(error.message, 'error');
    }
  }

  async handleRegister() {
    const email = document.getElementById('registerEmail')?.value;
    const password = document.getElementById('registerPassword')?.value;
    const name = document.getElementById('registerName')?.value;

    if (!email || !password || !name) {
      this.showNotification('Please fill all fields', 'error');
      return;
    }

    try {
      const response = await fetch(`${this.apiBase}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      this.showNotification('Registration successful! Please login. ✨', 'success');
      this.switchTab('login');
      document.getElementById('loginEmail').value = email;
      document.getElementById('loginPassword').value = password;
    } catch (error) {
      this.showNotification(error.message, 'error');
    }
  }

  logout() {
    localStorage.removeItem('auroraToken');
    localStorage.removeItem('auroraUser');
    this.token = null;
    this.user = null;
    this.showNotification('Logged out successfully', 'success');
    window.location.reload();
  }

  async loadDashboard() {
    try {
      const response = await fetch(`${this.apiBase}/dashboard`, {
        headers: { 'Authorization': `Bearer ${this.token}` }
      });

      const data = await response.json();
      this.displayDashboard(data);
      this.loadInsights();
      this.loadPredictions();
    } catch (error) {
      console.error('Dashboard load error:', error);
    }
  }

  async refreshDashboard() {
    const btn = document.querySelector('.refresh-btn');
    btn?.classList.add('rotating');
    await this.loadDashboard();
    setTimeout(() => btn?.classList.remove('rotating'), 600);
  }

  displayDashboard(data) {
    const dashboardContent = document.querySelector('.dashboard-main');
    if (!dashboardContent) return;

    dashboardContent.innerHTML = `
      <div class="dashboard-hero">
        <div class="hero-greeting">
          <h1>Welcome back, <span class="user-name">${this.user.name}</span> 👋</h1>
          <p>Your AI intelligence platform is ready to transform decisions into insights</p>
        </div>
      </div>

      <div class="stats-grid">
        <div class="stat-card glow-blue">
          <div class="stat-icon">📊</div>
          <div class="stat-content">
            <h3>${data.insights}</h3>
            <p>Active Insights</p>
          </div>
        </div>
        <div class="stat-card glow-purple">
          <div class="stat-icon">🔮</div>
          <div class="stat-content">
            <h3>${data.predictions}</h3>
            <p>Predictions Made</p>
          </div>
        </div>
        <div class="stat-card glow-pink">
          <div class="stat-icon">⚡</div>
          <div class="stat-content">
            <h3>${parseFloat(data.avgConfidence).toFixed(1)}%</h3>
            <p>Average Confidence</p>
          </div>
        </div>
        <div class="stat-card glow-cyan">
          <div class="stat-icon">💫</div>
          <div class="stat-content">
            <h3>${data.aiHealthScore}%</h3>
            <p>AI Health Score</p>
          </div>
        </div>
      </div>

      <div class="dashboard-sections">
        <div class="insights-section">
          <div class="section-header">
            <h2>Latest Insights</h2>
            <button class="refresh-btn">↻</button>
          </div>
          <div class="insights-list" id="insightsList">
            <p class="loading">Loading insights...</p>
          </div>
        </div>

        <div class="prediction-section">
          <div class="section-header">
            <h2>AI Prediction Engine</h2>
          </div>
          <textarea id="predictionInput" placeholder="Describe your data or scenario..." rows="4" class="prediction-input"></textarea>
          <button class="predict-btn">Generate Prediction ✨</button>
          <div class="predictions-list" id="predictionsList"></div>
        </div>
      </div>
    `;
  }

  async loadInsights() {
    try {
      const response = await fetch(`${this.apiBase}/insights`, {
        headers: { 'Authorization': `Bearer ${this.token}` }
      });

      const insights = await response.json();
      const insightsList = document.getElementById('insightsList');

      if (insights.length === 0) {
        insightsList.innerHTML = '<p class="empty-state">No insights yet. Start predicting! 🚀</p>';
        return;
      }

      insightsList.innerHTML = insights.map(insight => `
        <div class="insight-card">
          <div class="insight-header">
            <h3>${insight.title}</h3>
            <span class="confidence-badge">${(insight.confidence * 100).toFixed(0)}%</span>
          </div>
          <p>${insight.description}</p>
          <div class="insight-meta">
            <span class="category-tag">${insight.category}</span>
            <span class="time-tag">${new Date(insight.created_at).toLocaleDateString()}</span>
          </div>
        </div>
      `).join('');
    } catch (error) {
      console.error('Load insights error:', error);
    }
  }

  async loadPredictions() {
    try {
      const response = await fetch(`${this.apiBase}/predictions`, {
        headers: { 'Authorization': `Bearer ${this.token}` }
      });

      const predictions = await response.json();
      const predictionsList = document.getElementById('predictionsList');

      if (predictions.length === 0) {
        predictionsList.innerHTML = '';
        return;
      }

      predictionsList.innerHTML = `<div class="predictions-header"><h4>Recent Predictions</h4></div>` +
        predictions.slice(0, 5).map(pred => `
          <div class="prediction-result">
            <div class="result-icon">${pred.prediction.includes('Positive') ? '✅' : '⚠️'}</div>
            <div class="result-content">
              <p class="result-text">${pred.prediction}</p>
              <p class="result-accuracy">Accuracy: ${(pred.accuracy * 100).toFixed(1)}%</p>
            </div>
          </div>
        `).join('');
    } catch (error) {
      console.error('Load predictions error:', error);
    }
  }

  async submitPrediction() {
    const input = document.getElementById('predictionInput')?.value;
    if (!input) {
      this.showNotification('Please enter prediction data', 'error');
      return;
    }

    try {
      const response = await fetch(`${this.apiBase}/predict`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ inputData: input })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      this.showNotification('Prediction generated! 🎯', 'success');
      document.getElementById('predictionInput').value = '';
      this.loadDashboard();
    } catch (error) {
      this.showNotification(error.message, 'error');
    }
  }

  showAuthModal() {
    const modal = document.createElement('div');
    modal.id = 'authModal';
    modal.className = 'auth-modal';
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h2>Enter AuroraMind 🌌</h2>
          <button class="close-btn" onclick="this.closest('.auth-modal').remove()">✕</button>
        </div>

        <div class="auth-tabs">
          <button class="tab-btn active" data-tab="login">Login</button>
          <button class="tab-btn" data-tab="register">Sign Up</button>
        </div>

        <div class="tab-content">
          <div class="tab-pane active" id="loginTab">
            <input type="email" id="loginEmail" placeholder="Email address" class="auth-input">
            <input type="password" id="loginPassword" placeholder="Password" class="auth-input">
            <button class="login-btn auth-submit">Login to Aurora</button>
            <p class="auth-hint">Demo: demo@auroramind.ai / Demo@123</p>
          </div>

          <div class="tab-pane" id="registerTab">
            <input type="text" id="registerName" placeholder="Full name" class="auth-input">
            <input type="email" id="registerEmail" placeholder="Email address" class="auth-input">
            <input type="password" id="registerPassword" placeholder="Create password" class="auth-input">
            <button class="register-btn auth-submit">Create Account</button>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }

  hideAuthModal() {
    document.getElementById('authModal')?.remove();
  }

  toggleAuthModal() {
    const existing = document.getElementById('authModal');
    if (existing) {
      this.hideAuthModal();
    } else {
      this.showAuthModal();
    }
  }

  switchTab(tabName) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('active'));
    
    document.querySelector(`[data-tab="${tabName}"]`)?.classList.add('active');
    document.getElementById(`${tabName}Tab`)?.classList.add('active');
  }

  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => notification.remove(), 3000);
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.auroraApp = new AuroraMindApp();
});

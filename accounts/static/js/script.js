function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

class AuthManager {
    constructor() {
        this.loginForm = document.getElementById('loginForm');
        this.registerForm = document.getElementById('registerForm');
        this.authCard = document.getElementById('authCard');
        this.init();
    }

    init() {
        this.setupToggles();
        this.setupInputs();
        this.setupForms();
        this.setupPasswordVisibility();
    }

    setupToggles() {
        const toReg = document.getElementById('showRegisterBtn');
        const toLog = document.getElementById('showLoginBtn');

        if (toReg) toReg.onclick = () => this.switchView('loginView', 'registerView');
        if (toLog) toLog.onclick = () => this.switchView('registerView', 'loginView');
    }

    switchView(hideId, showId) {
        const hideView = document.getElementById(hideId);
        const showView = document.getElementById(showId);
        hideView.style.opacity = '0';
        setTimeout(() => {
            hideView.style.display = 'none';
            showView.style.display = 'block';
            setTimeout(() => { showView.style.opacity = '1'; }, 50);
        }, 300);
    }

    setupInputs() {
        document.querySelectorAll('input').forEach(input => {
            input.oninput = () => {
                input.value.trim() !== '' ? input.classList.add('has-value') : input.classList.remove('has-value');
            };
        });
    }

    setupPasswordVisibility() {
        document.querySelectorAll('.password-toggle').forEach(btn => {
            btn.onclick = () => {
                const input = document.getElementById(btn.dataset.target);
                input.type = input.type === 'password' ? 'text' : 'password';
            };
        });
    }

    setupForms() {
        if (this.loginForm) {
            this.loginForm.onsubmit = async (e) => {
                e.preventDefault();
                await this.handleAuth('/accounts/auth/login/', this.loginForm);
            };
        }
        if (this.registerForm) {
            this.registerForm.onsubmit = async (e) => {
                e.preventDefault();
                await this.handleAuth('/accounts/auth/register/', this.registerForm);
            };
        }
    }

    async handleAuth(url, form) {
        const btn = form.querySelector('.login-btn');
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        
        btn.disabled = true;
        try {
            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-CSRFToken': getCookie('csrftoken') },
                body: JSON.stringify(data)
            });
            const result = await res.json();
            if (result.success) {
                this.showSuccess(result.redirect_url);
            } else {
                alert(result.message || "Error occurred");
            }
        } catch (e) {
            console.error(e);
        } finally {
            btn.disabled = false;
        }
    }

    showSuccess(redirectUrl) {
        document.getElementById('loginView').style.display = 'none';
        document.getElementById('registerView').style.display = 'none';
        document.getElementById('successMessage').style.display = 'block';
        setTimeout(() => { window.location.href = redirectUrl; }, 2000);
    }
}

document.addEventListener('DOMContentLoaded', () => { new AuthManager(); });

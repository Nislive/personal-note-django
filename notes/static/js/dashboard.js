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

class DashboardManager {
    constructor() {
        this.modal = document.getElementById('noteModal');
        this.openBtn = document.getElementById('openModalBtn');
        this.closeBtn = document.getElementById('closeModalBtn');
        this.noteForm = document.getElementById('noteForm');
        this.modalTitle = document.getElementById('modalTitleLabel');
        this.summaryModal = document.getElementById('summaryModal');
        this.closeSummaryBtn = document.getElementById('closeSummaryBtn');
        this.copySummaryBtn = document.getElementById('copySummaryBtn');
        this.currentEditId = null;
        this.init();
    }

    init() {
        this.setupFloatingLabels();
        this.addBackgroundEffects();
        this.setupModal();
        this.setupNoteForm();
        this.setupActionButtons();
        this.setupSummaryModal();
    }

    setupSummaryModal() {
        this.closeSummaryBtn.addEventListener('click', () => this.closeSummary());
        this.summaryModal.addEventListener('click', (e) => {
            if (e.target === this.summaryModal) this.closeSummary();
        });
        this.copySummaryBtn.addEventListener('click', () => {
            const text = document.getElementById('summaryText').innerText;
            navigator.clipboard.writeText(text);
            this.copySummaryBtn.querySelector('.btn-text').textContent = 'Copied!';
            setTimeout(() => {
                this.copySummaryBtn.querySelector('.btn-text').textContent = 'Copy';
            }, 2000);
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.summaryModal.classList.contains('active')) {
                this.closeSummary();
            }
        });
    }

    closeSummary() {
        this.summaryModal.classList.remove('active');
    }

    async handleSummarize(noteId) {
        const noteCard = document.getElementById('note-' + noteId);
        const title = noteCard.querySelector('.note-title').textContent;

        document.getElementById('summaryNoteTitle').textContent = title;
        document.getElementById('summaryLoading').style.display = 'flex';
        document.getElementById('summaryResult').style.display = 'none';
        document.getElementById('summaryError').style.display = 'none';
        this.copySummaryBtn.style.display = 'none';
        this.summaryModal.classList.add('active');

        const csrftoken = getCookie('csrftoken');

        try {
            const response = await fetch(`/dashboard/ai/${noteId}/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrftoken
                }
            });
            const data = await response.json();

            document.getElementById('summaryLoading').style.display = 'none';

            if (data.success) {
                document.getElementById('summaryText').innerHTML = data.message;
                document.getElementById('summaryResult').style.display = 'block';
                this.copySummaryBtn.style.display = 'inline-flex';
            } else {
                document.getElementById('summaryError').style.display = 'block';
            }
        } catch (error) {
            document.getElementById('summaryLoading').style.display = 'none';
            document.getElementById('summaryError').style.display = 'block';
        }
    }

    setupNoteForm() {
        if (!this.noteForm) return;
        this.noteForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = this.noteForm.querySelector('.login-btn');
            const title = document.getElementById('noteTitle').value;
            const content = document.getElementById('noteContent').value;
            const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;
            const url = this.currentEditId ? `/dashboard/update/${this.currentEditId}/` : '/dashboard/create/';
            btn.classList.add('loading');
            try {
                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': csrftoken
                    },
                    body: JSON.stringify({ 'title': title, 'content': content })
                });
                const data = await response.json();
                if (data.success) {
                    this.closeModal();
                    window.location.reload();
                }
            } catch (error) {
                console.error(error);
            } finally {
                btn.classList.remove('loading');
            }
        });
    }

    setupActionButtons() {
        document.addEventListener('click', (e) => {
            const deleteBtn = e.target.closest('.delete-btn');
            const editBtn = e.target.closest('.edit-btn');
            const summarizeBtn = e.target.closest('.summarize-btn');

            if (deleteBtn) this.handleDelete(deleteBtn.dataset.id);
            if (editBtn) this.openEditModal(editBtn.dataset.id, editBtn.dataset.title, editBtn.dataset.content);
            if (summarizeBtn) this.handleSummarize(summarizeBtn.dataset.id);
        });
    }

    async handleDelete(id) {
        if (!confirm("Are you sure?")) return;
        const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;
        try {
            const response = await fetch(`/dashboard/delete/${id}/`, {
                method: 'POST',
                headers: { 'X-CSRFToken': csrftoken }
            });
            const data = await response.json();
            if (data.success) window.location.reload();
        } catch (error) {
            console.error(error);
        }
    }

    openEditModal(id, title, content) {
        this.currentEditId = id;
        this.modalTitle.textContent = "Edit Note";
        const titleInput = document.getElementById('noteTitle');
        const contentInput = document.getElementById('noteContent');
        titleInput.value = title;
        contentInput.value = content;
        titleInput.classList.add('has-value');
        contentInput.classList.add('has-value');
        this.modal.classList.add('active');
    }

    setupModal() {
        this.openBtn.addEventListener('click', () => {
            this.currentEditId = null;
            this.modalTitle.textContent = "Create Note";
            this.modal.classList.add('active');
            document.getElementById('noteTitle').focus();
        });
        this.closeBtn.addEventListener('click', () => this.closeModal());
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) this.closeModal();
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal.classList.contains('active')) {
                this.closeModal();
            }
        });
    }

    closeModal() {
        this.modal.classList.remove('active');
        setTimeout(() => {
            this.noteForm.reset();
            this.currentEditId = null;
            const inputs = document.querySelectorAll('#noteForm input, #noteForm textarea');
            inputs.forEach(input => input.classList.remove('has-value'));
        }, 300);
    }

    setupFloatingLabels() {
        const inputs = document.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            input.addEventListener('input', () => {
                input.value.trim() !== '' ? input.classList.add('has-value') : input.classList.remove('has-value');
            });
            input.addEventListener('focus', (e) => {
                const wrapper = e.target.closest('.input-wrapper');
                if (wrapper) wrapper.classList.add('focused');
            });
            input.addEventListener('blur', (e) => {
                const wrapper = e.target.closest('.input-wrapper');
                if (wrapper) wrapper.classList.remove('focused');
            });
        });
    }

    addBackgroundEffects() {
        document.addEventListener('mousemove', (e) => {
            const orbs = document.querySelectorAll('.glow-orb');
            const x = e.clientX / window.innerWidth;
            const y = e.clientY / window.innerHeight;
            orbs.forEach((orb, index) => {
                const speed = (index + 1) * 0.5;
                orb.style.transform = `translate(${(x - 0.5) * speed * 20}px, ${(y - 0.5) * speed * 20}px)`;
            });
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new DashboardManager();
});
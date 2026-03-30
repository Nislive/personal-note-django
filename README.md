# ⚡ Neon Notes

A full-stack personal note-taking application built with **Django** and vanilla **JavaScript**, featuring AI-powered note summarization via the Groq API. Built as a learning project to explore Django and backend architecture from authentication to API integration.

https://github.com/user-attachments/assets/186d77bc-d611-4cab-a506-efafc9c9169e

---

## Features

- **User Authentication** — Register, login, logout with Django's built-in auth system
- **CRUD Operations** — Create, read, update, and delete personal notes
- **AI Summarization** — One-click note summarization powered by Groq (LLaMA 3.3 70B)
- **User Scoping** — Each user can only access their own notes (`get_object_or_404` with user filtering)
- **CSRF Protection** — All AJAX requests include CSRF tokens
- **Neon UI** — Dark theme with glassmorphism, glow effects, and smooth animations
- **Responsive Design** — Works on desktop and mobile

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Python, Django |
| Frontend | HTML, CSS, JavaScript (Vanilla) |
| Database | SQLite (default) |
| AI/LLM | Groq API — LLaMA 3.3 70B |
| Auth | Django's built-in `auth` module |

---

## Architecture Overview

```
Browser Request
    │
    ▼
urls.py (URL Routing)
    │
    ▼
views.py (Business Logic)
    │
    ├── models.py ◄──► Database (ORM + Migrations)
    │
    └── Template (HTML) ──► Browser Response
```

The app uses two patterns for rendering:

- **Server-Side Rendering (SSR)** — Dashboard page loads notes via Django template context
- **AJAX / Fetch API** — Note creation, editing, deletion, and AI summarization happen asynchronously without page reload

---

## Project Structure

```
personalnote/
├── accounts/              # Authentication app
│   ├── templates/
│   │   └── index.html     # Login & Register page
│   ├── static/
│   │   ├── css/style.css
│   │   └── js/script.js
│   ├── models.py
│   ├── urls.py
│   └── views.py           # login, register, logout views
│
├── notes/                 # Notes app
│   ├── templates/
│   │   └── dashboard.html # Dashboard page
│   ├── static/
│   │   ├── css/dashboard.css
│   │   └── js/dashboard.js
│   ├── models.py          # Note model (title, content, timestamps)
│   ├── urls.py
│   └── views.py           # CRUD + AI summarize views
│
├── personalnote/          # Django project config
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
│
├── .env                   # Environment variables (GROQ_API_KEY, SECRET_KEY)
├── .gitignore
├── db.sqlite3
└── manage.py
```

---

## Key Concepts Practiced

### Django ORM & Models
The `Note` model uses a `ForeignKey` to `AUTH_USER_MODEL`, ensuring each note belongs to a user. `auto_now_add` and `auto_now` handle timestamps automatically.

### Authentication & Authorization
- Django's `authenticate()` and `login()` for session-based auth
- `@login_required` decorator protects all dashboard views
- User scoping: `get_object_or_404(Note, id=pk, user=request.user)` prevents users from accessing or modifying another user's notes — returns 404 if ownership doesn't match

### CSRF Protection
All POST requests from the frontend include the `X-CSRFToken` header, extracted from cookies via a `getCookie()` helper function.

### Third-Party API Integration
The AI summarization feature calls the **Groq API** from the backend, converts the Markdown response to HTML, and returns it to the frontend as JSON.

---

## Getting Started

### Prerequisites

- Python 3.10+
- A [Groq API key](https://console.groq.com/)

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/neon-notes.git
cd neon-notes

# Create and activate virtual environment
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate

# Install dependencies
pip install django groq markdown python-dotenv

# Create .env file
echo "GROQ_API_KEY=your_groq_api_key_here" > .env
echo "SECRET_KEY=your_django_secret_key_here" >> .env

# Run migrations
python manage.py migrate

# Start the development server
python manage.py runserver
```

Then open [http://127.0.0.1:8000](http://127.0.0.1:8000) in your browser.

---

## API Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|:---:|
| GET | `/` | Login / Register page | ✗ |
| POST | `/accounts/auth/login/` | User login | ✗ |
| POST | `/accounts/auth/register/` | User registration | ✗ |
| GET | `/logout/` | Logout and redirect | ✓ |
| GET | `/dashboard/` | Fetch and display notes | ✓ |
| POST | `/dashboard/create/` | Create a new note | ✓ |
| POST | `/dashboard/update/<id>/` | Update existing note | ✓ |
| POST | `/dashboard/delete/<id>/` | Delete a note | ✓ |
| POST | `/dashboard/ai/<id>/` | AI summarize a note | ✓ |

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| `GROQ_API_KEY` | API key for Groq LLM service |
| `SECRET_KEY` | Django secret key |

---

## What I Learned

This project was my hands-on exploration of how Django and backend works end-to-end. The key takeaways:

- How the **request lifecycle** flows: URL → View → Model → Template → Response
- The difference between **SSR** and **AJAX-based** interactions in the same app
- How **session-based authentication** works with `@login_required` and CSRF tokens
- Using **`get_object_or_404`** with user filtering for secure, scoped data access
- Integrating a **third-party LLM API** into a Django backend
- Structuring a Django project with **multiple apps** (accounts, notes)

---

## License

This project is open source and available under the [MIT License](LICENSE).

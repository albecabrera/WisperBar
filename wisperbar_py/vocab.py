VOCAB_ES: list[str] = [
    # Tech general
    "API", "backend", "frontend", "full-stack", "DevOps", "CI/CD",
    "JavaScript", "TypeScript", "Python", "Docker", "Kubernetes",
    "machine learning", "deep learning", "inteligencia artificial",
    "base de datos", "framework", "repositorio", "pull request",
    "merge", "commit", "branch", "deploy", "deployment",
    "microservicio", "endpoint", "middleware", "webhook",
    # Negocio
    "stakeholder", "KPI", "roadmap", "sprint", "backlog",
    "MVP", "SaaS", "startup", "onboarding", "feedback",
    "benchmark", "pipeline", "workflow",
    # Signos de apertura (guía a Whisper)
    "¿verdad?", "¡exacto!",
]

VOCAB_EN: list[str] = [
    # Tech general
    "API", "backend", "frontend", "full-stack", "DevOps", "CI/CD",
    "JavaScript", "TypeScript", "Python", "Docker", "Kubernetes",
    "machine learning", "deep learning", "artificial intelligence",
    "database", "framework", "repository", "pull request",
    "merge", "commit", "branch", "deploy", "deployment",
    "microservice", "endpoint", "middleware", "webhook",
    # Business
    "stakeholder", "KPI", "roadmap", "sprint", "backlog",
    "MVP", "SaaS", "startup", "onboarding", "feedback",
    "benchmark", "pipeline", "workflow",
]

VOCAB_DE: list[str] = [
    # Tech general
    "API", "Backend", "Frontend", "Full-Stack", "DevOps",
    "JavaScript", "TypeScript", "Python", "Docker", "Kubernetes",
    "maschinelles Lernen", "künstliche Intelligenz",
    "Datenbank", "Framework", "Repository", "Pull Request",
    "Branch", "Deployment", "Commit", "Merge",
    "Microservice", "Middleware", "Webhook",
    # Business
    "Stakeholder", "Roadmap", "Sprint", "Backlog",
    "MVP", "SaaS", "Onboarding", "Feedback",
    "Benchmark", "Pipeline", "Workflow",
    # Compuestos alemanes tech
    "Benutzeroberfläche", "Softwareentwicklung", "Datenschutz",
    "Entwicklungsumgebung", "Schnittstelle",
]

_VOCAB_BY_LANG: dict[str, list[str]] = {
    "es": VOCAB_ES,
    "en": VOCAB_EN,
    "de": VOCAB_DE,
}


def build_initial_prompt(lang: str, user_terms: list[str] | None = None) -> str:
    base  = _VOCAB_BY_LANG.get(lang, [])
    extra = user_terms or []
    terms = base + [t.strip() for t in extra if t.strip()]
    return ", ".join(terms) if terms else ""

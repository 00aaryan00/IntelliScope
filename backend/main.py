from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from core.config import settings
from api.routes import router

# This is exactly equivalent to `const app = express()` in Node.js!
app = FastAPI(title="Tasknova API", description="Backend for the Tasknova AI Dashboard")

# Enable CORS (Equivalent to app.use(cors()) in Express)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow your React frontend (localhost:5173) to connect
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register our API endpoints
app.include_router(router)

# This is equivalent to `app.get('/health', (req, res) => res.json({...}))`
@app.get("/health")
def health_check():
    return {
        "status": "ok", 
        "message": "Tasknova backend is running!",
        "database_connected": True if settings.DATABASE_URL else False
    }

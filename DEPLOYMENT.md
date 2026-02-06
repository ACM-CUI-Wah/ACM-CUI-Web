# 🚀 Deployment Instructions

This application is ready for production deployment!

## Quick Deploy

### Backend → Railway
1. Create Railway project from GitHub
2. Set environment variables (see `.env.example`)
3. Deploy automatically
4. Run migrations: `railway run python manage.py migrate`

### Frontend → Vercel
1. Create Vercel project from GitHub
2. Set environment variables (see `.env.example`)
3. Deploy automatically

### Database → Supabase
Already configured! Just use your existing Supabase credentials.

---

## 📚 Detailed Guide

See the comprehensive deployment guide in the artifacts for step-by-step instructions.

## 🔑 Required Environment Variables

### Backend (Railway)
- `DJANGO_SECRET_KEY` - Generate at https://djecrety.ir/
- `DEBUG=False`
- `ALLOWED_HOSTS=your-app.railway.app`
- All Supabase credentials
- `CORS_ALLOWED_ORIGINS=https://your-app.vercel.app`
- `CSRF_TRUSTED_ORIGINS=https://your-app.railway.app,https://your-app.vercel.app`

### Frontend (Vercel)
- `VITE_API_URL=https://your-app.railway.app/api`

---

## ✅ What's Been Fixed

- ✅ Security issues resolved (SECRET_KEY, DEBUG, ALLOWED_HOSTS)
- ✅ Static files configured with WhiteNoise
- ✅ Production dependencies added (gunicorn, whitenoise)
- ✅ Railway configuration created
- ✅ Vercel configuration created
- ✅ CORS properly configured
- ✅ JWT token lifetime increased to 60 minutes

---

## 📖 Documentation

- See `deployment_guide.md` artifact for complete deployment instructions
- See `implementation_plan.md` artifact for all changes made
- See `.env.example` files for environment variable documentation

---

*Your app is production-ready! 🎉*

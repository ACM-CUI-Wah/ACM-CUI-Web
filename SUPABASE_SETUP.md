# Supabase Setup Guide

This guide explains how to configure a new Supabase project for the CodeHub application.

---

## Step 1: Create a New Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign in or create an account
3. Click **"New Project"**
4. Fill in the project details:
   - **Name:** CodeHub (or your preferred name)
   - **Database Password:** Create a strong password (save this!)
   - **Region:** Choose the closest region to your users
5. Click **"Create new project"**
6. Wait for the project to be provisioned (takes 1-2 minutes)

---

## Step 2: Get Database Connection Details

Once your project is created:

1. Go to **Project Settings** (gear icon in sidebar)
2. Click on **Database** in the left menu
3. Scroll down to **Connection string** section
4. Select **URI** tab
5. You'll see connection details like:

```
Host: aws-0-[region].pooler.supabase.com
Database: postgres
Port: 6543 (for connection pooler) or 5432 (direct)
User: postgres.[your-project-ref]
```

**Important:** The project reference is the random string in your project URL:
- URL: `https://[project-ref].supabase.co`
- Your user will be: `postgres.[project-ref]`

---

## Step 3: Update Django Settings

Open `backend/backend/settings.py` and update the database configuration:

```python
# Supabase PostgreSQL configuration
DATABASES = {
    "default": {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'postgres',
        'USER': 'postgres.[YOUR-PROJECT-REF]',      # Replace with your project ref
        'PASSWORD': '[YOUR-DATABASE-PASSWORD]',      # The password you set when creating the project
        'HOST': 'aws-0-[REGION].pooler.supabase.com', # Replace with your host
        'PORT': '6543',
        'OPTIONS': {
            'sslmode': 'require',
        },
    }
}
```

### Example with actual values:

```python
DATABASES = {
    "default": {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'postgres',
        'USER': 'postgres.abcdefghijklmnop',
        'PASSWORD': 'YourSecurePassword123!',
        'HOST': 'aws-0-ap-southeast-1.pooler.supabase.com',
        'PORT': '6543',
        'OPTIONS': {
            'sslmode': 'require',
        },
    }
}
```

---

## Step 4: Run Database Migrations

After updating the settings, run the Django migrations to create all tables:

```bash
cd backend

# Create migrations (if needed)
python manage.py makemigrations

# Apply migrations to the new database
python manage.py migrate
```

This will create the following tables:
- `api_user` - Custom user model
- `api_student` - Student profiles
- `api_blog` - Blog posts
- `api_blogimage` - Blog images
- `api_inlineimage` - Temporary inline images
- `api_meeting` - Meetings
- `api_meetingattendance` - Attendance records
- `api_event` - Events
- `api_eventimage` - Event images
- `api_bill` - Bills
- Plus Django's built-in tables (auth, sessions, etc.)

---

## Step 5: Create a Superuser

Create an admin user to access the Django admin panel:

```bash
python manage.py createsuperuser
```

Follow the prompts to set:
- Username
- Email
- Password

---

## Step 6: Verify Connection

Test the database connection:

```bash
python manage.py dbshell
```

If successful, you'll see a PostgreSQL prompt. Type `\dt` to list tables and `\q` to exit.

Or run the development server:

```bash
python manage.py runserver
```

If no errors appear, the connection is working.

---

## Configuration Reference

### Current Configuration (as of last setup)

| Setting | Value |
|---------|-------|
| Host | `aws-1-ap-southeast-1.pooler.supabase.com` |
| Port | `6543` |
| Database | `postgres` |
| User | `postgres.nicwsajhxfynxflfklti` |
| SSL Mode | `require` |

### Required Environment Variables (Recommended)

For security, it's recommended to use environment variables instead of hardcoding credentials:

```bash
# .env file
SUPABASE_HOST=aws-0-ap-southeast-1.pooler.supabase.com
SUPABASE_PORT=6543
SUPABASE_DB=postgres
SUPABASE_USER=postgres.your-project-ref
SUPABASE_PASSWORD=your-secure-password
DJANGO_SECRET_KEY=your-django-secret-key
```

Then update `settings.py`:

```python
import os

DATABASES = {
    "default": {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.environ.get('SUPABASE_DB', 'postgres'),
        'USER': os.environ.get('SUPABASE_USER'),
        'PASSWORD': os.environ.get('SUPABASE_PASSWORD'),
        'HOST': os.environ.get('SUPABASE_HOST'),
        'PORT': os.environ.get('SUPABASE_PORT', '6543'),
        'OPTIONS': {
            'sslmode': 'require',
        },
    }
}
```

---

## Supabase Dashboard Features

### Database Tables
- Go to **Table Editor** in Supabase dashboard to view/edit data directly
- You can also use the **SQL Editor** for custom queries

### Connection Pooling
- Supabase uses **PgBouncer** for connection pooling
- Port `6543` = Pooled connection (recommended for web apps)
- Port `5432` = Direct connection (for migrations or admin tasks)

### SSL/TLS
- SSL is required for all Supabase connections
- The `sslmode: require` option ensures encrypted connections

---

## Troubleshooting

### Error: Connection refused
- Check if your IP is allowed (Supabase allows all IPs by default)
- Verify the host, port, and credentials are correct
- Ensure you're using port `6543` for pooled connections

### Error: Password authentication failed
- Double-check your database password
- The user format must be `postgres.[project-ref]`
- Try resetting the database password in Supabase settings

### Error: SSL required
- Ensure `'sslmode': 'require'` is in your OPTIONS
- Your network might be blocking SSL connections

### Error: Too many connections
- Use the pooled connection (port 6543) instead of direct (port 5432)
- Supabase free tier has connection limits

### Migrations fail
- Try running with direct connection (port 5432) for migrations
- Check if all previous migrations are applied

---

## Switching to a New Supabase Account

To migrate to a new Supabase project:

1. **Create new project** (follow Steps 1-2)
2. **Update credentials** in `settings.py` (Step 3)
3. **Run migrations** (Step 4)
4. **Create superuser** (Step 5)
5. **Migrate data** (optional - export from old, import to new)

### Exporting Data from Old Project

In Supabase dashboard:
1. Go to **SQL Editor**
2. Run: `COPY table_name TO STDOUT WITH CSV HEADER;`
3. Or use `pg_dump` for full backup

### Importing Data to New Project

1. Run migrations first to create tables
2. Use **SQL Editor** or `psql` to import data
3. Or use Supabase's built-in **CSV Import** feature

---

## Security Recommendations

1. **Never commit credentials** to git
2. Use **environment variables** for sensitive data
3. Create a **`.env`** file (add to `.gitignore`)
4. Use **`.env.example`** to document required variables
5. Rotate passwords periodically
6. Use the **Database** section in Supabase to manage access

---

## Quick Reference

### Connection String Format
```
postgresql://postgres.[project-ref]:[password]@[host]:6543/postgres
```

### Files to Update When Changing Supabase
1. `backend/backend/settings.py` - Database credentials
2. `.env` file (if using environment variables)

### Required Python Package
```bash
pip install psycopg2-binary
```

---

## Support

- Supabase Documentation: https://supabase.com/docs
- Django Database Settings: https://docs.djangoproject.com/en/5.1/ref/settings/#databases
- PostgreSQL Documentation: https://www.postgresql.org/docs/

---

*Last updated: January 2026*

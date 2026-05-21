# XchangeSkills Admin Panel

A simple admin dashboard for managing XchangeSkills platform content.

## Features

- **Pending Skills Management**: Review, approve, and reject pending skill submissions
- **Categories List**: View all skill categories
- **Base Skills List**: View all base skills
- **Reports Management**: View and resolve user reports

## Setup

```bash
# Install dependencies
npm install

# Create .env.local file
echo "NEXT_PUBLIC_API_URL=http://localhost:1337/api" > .env.local

# Run development server
npm run dev
```

The admin panel will be available at `http://localhost:3001`

## API Integration

All APIs are integrated from the backend:

### Skills APIs
- `GET /skills?filters[status][$eq]=pending` - Get pending skills
- `PUT /skills/{id}/approve` - Approve a skill
- `PUT /skills/{id}/reject` - Reject a skill with reason

### Categories APIs
- `GET /categories` - Get all categories

### Base Skills APIs
- `GET /base-skills` - Get all base skills

### Reports APIs
- `GET /reports` - Get all reports
- `PUT /reports/{id}/status` - Update report status

## Technology Stack

- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Axios
- Lucide Icons

## Directory Structure

```
src/
├── app/           # Next.js app router
├── components/    # React components
├── services/      # API services
└── globals.css    # Global styles
```

## Notes

- No authentication required (university project)
- No role-based access control implemented
- Read-only for most content (only skill approval/rejection and report status updates)

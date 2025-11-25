# Onboarding Alchemy Platform

A comprehensive HR onboarding platform built with React, TypeScript, Express, and Prisma. This platform streamlines the employee onboarding process with features for HR management, employee portals, document management, meeting scheduling, and AI-powered assistance.

## 🏗️ Architecture

### Tech Stack

**Frontend (Client)**
- React 18 with TypeScript
- Vite for build tooling
- React Router for navigation
- TanStack Query (React Query) for data fetching
- Shadcn/UI + Tailwind CSS for styling
- Recharts for analytics
- React Hook Form + Zod for form validation
- Axios for API communication

**Backend (Server)**
- Express.js with TypeScript
- Prisma ORM with SQLite (development) / PostgreSQL (production recommended)
- JWT authentication
- Bcrypt for password hashing
- Multer for file uploads
- Azure OpenAI integration for AI features
- Winston for logging

### Project Structure

```
onboarding-alchemy-platform/
├── client/                 # Frontend application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── contexts/      # React contexts (Auth, etc.)
│   │   ├── hooks/         # Custom React hooks
│   │   ├── lib/          # Utilities and API client
│   │   ├── pages/        # Page components
│   │   └── types/        # TypeScript type definitions
│   ├── public/           # Static assets
│   └── package.json
├── server/                # Backend API
│   ├── src/
│   │   ├── controllers/  # Route controllers
│   │   ├── middleware/   # Express middleware
│   │   ├── routes/       # API routes
│   │   ├── services/     # Business logic services
│   │   └── index.ts      # Server entry point
│   ├── prisma/           # Database schema and migrations
│   └── package.json
├── supabase/             # Database migrations (legacy)
└── package.json          # Root workspace configuration
```

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd onboarding-alchemy-platform
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```
   This will install dependencies for both client and server using npm workspaces.

3. **Set up environment variables**

   **Server (.env)**
   ```bash
   cd server
   cp .env.example .env
   ```
   Edit `server/.env` with your configuration:
   - `JWT_SECRET`: Your secret key for JWT tokens
   - `DATABASE_URL`: Database connection string
   - `AZURE_OPENAI_*`: Azure OpenAI credentials (optional)

   **Client (.env)**
   ```bash
   cd ../client
   cp .env.example .env
   ```
   The default settings should work for local development.

4. **Initialize the database**
   ```bash
   cd ../server
   npm run db:generate
   npm run db:migrate
   npm run db:seed
   ```

### Development

Run both client and server concurrently:

```bash
# From the root directory
npm run dev
```

Or run them separately:

```bash
# Terminal 1 - Run server
npm run dev:server

# Terminal 2 - Run client
npm run dev:client
```

The application will be available at:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000/api
- **API Health Check**: http://localhost:3000/health

### Default Credentials

After seeding the database, you can use these credentials:

**HR User**
- Email: `hr@example.com`
- Password: `password123`

**Employee User**
- Email: `employee@example.com`
- Password: `password123`

## 📦 Available Scripts

### Root Level

- `npm run dev` - Run both client and server in development mode
- `npm run dev:client` - Run only the client
- `npm run dev:server` - Run only the server
- `npm run build` - Build both client and server for production
- `npm run start` - Start the production server
- `npm run lint` - Lint the client code
- `npm run clean` - Remove all node_modules and build files

### Server

- `npm run dev` - Start development server with hot reload
- `npm run build` - Compile TypeScript to JavaScript
- `npm run start` - Start production server
- `npm run db:generate` - Generate Prisma client
- `npm run db:migrate` - Run database migrations
- `npm run db:seed` - Seed the database with sample data
- `npm run db:studio` - Open Prisma Studio (database GUI)

### Client

- `npm run dev` - Start Vite development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🔑 Key Features

### HR Portal
- **Dashboard**: Overview of onboarding activities, stats, and tasks
- **Employee Management**: Add, view, and manage employee records
- **Document Management**: Upload and organize employee documents
- **Meeting Scheduler**: Schedule and manage meetings with employees
- **30-60-90 Day Plans**: Create and track milestone-based onboarding plans
- **HR Tasks**: Manage onboarding-related tasks across departments
- **Analytics**: Visualize onboarding metrics and trends
- **Messaging**: Communicate with employees
- **AI Copilot**: Get AI-powered assistance for HR tasks

### Employee Portal
- **Personal Dashboard**: View onboarding progress and milestones
- **Document Access**: Access and download necessary documents
- **Meeting Scheduler**: Schedule meetings with HR
- **Progress Tracking**: Track 30-60-90 day plan completion
- **Profile Management**: Update personal information

### Security Features
- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control (HR vs Employee)
- Protected API routes
- Secure file uploads

## 🗄️ Database

The application uses Prisma ORM with:
- **Development**: SQLite (file-based database)
- **Production**: PostgreSQL recommended

### Database Schema

Key models:
- **User**: Authentication and user profile
- **Employee**: Employee records
- **Document**: File attachments
- **Milestone**: 30-60-90 day plan milestones
- **HrTask**: Onboarding tasks for HR
- **Meeting**: Scheduled meetings
- **Message**: Internal messaging

### Migrations

```bash
# Create a new migration
npm run db:migrate --workspace=server

# Apply migrations in production
npm run db:migrate:prod --workspace=server

# Open Prisma Studio to view data
npm run db:studio --workspace=server
```

## 🎨 Styling

The application uses:
- **Tailwind CSS**: Utility-first CSS framework
- **Shadcn/UI**: Pre-built accessible components
- **Custom Theme**: HR-focused color palette
- **Lucide Icons**: Modern icon library
- **Responsive Design**: Mobile-first approach

## 🔧 Configuration

### Environment Variables

#### Server Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `NODE_ENV` | Environment (development/production) | `development` | No |
| `PORT` | Server port | `3000` | No |
| `DATABASE_URL` | Database connection string | `file:./dev.db` | Yes |
| `JWT_SECRET` | Secret for JWT signing | - | Yes |
| `JWT_EXPIRES_IN` | JWT expiration time | `7d` | No |
| `CORS_ORIGIN` | Allowed CORS origin | `http://localhost:5173` | No |
| `AZURE_OPENAI_API_KEY` | Azure OpenAI API key | - | No |
| `MAX_FILE_SIZE` | Max upload file size in bytes | `5242880` | No |

#### Client Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `VITE_API_URL` | Backend API URL | `http://localhost:3000/api` | Yes |
| `VITE_API_TIMEOUT` | API request timeout (ms) | `10000` | No |

### Switching to PostgreSQL (Production)

1. Update `server/prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

2. Update `DATABASE_URL` in `server/.env`:
   ```
   DATABASE_URL="postgresql://user:password@localhost:5432/dbname"
   ```

3. Run migrations:
   ```bash
   npm run db:migrate --workspace=server
   ```

## 🚢 Deployment

### Building for Production

```bash
# Build both client and server
npm run build

# Or build separately
npm run build:client
npm run build:server
```

### Deployment Options

**Backend (Server)**
- Deploy to any Node.js hosting (Heroku, Railway, Render, AWS, etc.)
- Set environment variables in your hosting platform
- Run `npm run start` to start the production server

**Frontend (Client)**
- Deploy to Vercel, Netlify, or any static hosting
- Build output is in `client/dist/`
- Set `VITE_API_URL` to your production API URL

### Docker (Coming Soon)

Docker support will be added for containerized deployments.

## 🧪 Testing

Testing setup is planned for future releases.

## 📝 API Documentation

### Authentication Endpoints

- `POST /api/auth/register` - Register new HR user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user (requires auth)

### Employee Endpoints

- `GET /api/employees` - List all employees (HR only)
- `POST /api/employees` - Create new employee (HR only)
- `GET /api/employees/:id` - Get employee details
- `PUT /api/employees/:id` - Update employee
- `DELETE /api/employees/:id` - Delete employee (HR only)

### Document Endpoints

- `GET /api/employees/:id/documents` - List employee documents
- `POST /api/employees/:id/documents` - Upload document
- `DELETE /api/documents/:id` - Delete document

### Meeting Endpoints

- `GET /api/meetings` - List meetings
- `POST /api/meetings` - Schedule meeting
- `PUT /api/meetings/:id` - Update meeting
- `DELETE /api/meetings/:id` - Cancel meeting

### Plan (30-60-90) Endpoints

- `GET /api/employees/:id/plan` - Get employee plan
- `POST /api/employees/:id/plan` - Create/update plan

For detailed API documentation, see [API.md](./docs/API.md) (coming soon).

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 🐛 Known Issues

- SQLite is used for development; PostgreSQL recommended for production
- AI features require Azure OpenAI configuration
- File uploads are stored locally (consider cloud storage for production)

## 🗺️ Roadmap

- [ ] Add comprehensive testing (unit, integration, e2e)
- [ ] Docker containerization
- [ ] PostgreSQL migration guide
- [ ] Cloud storage integration (AWS S3, Azure Blob)
- [ ] Email notifications
- [ ] Calendar integration
- [ ] Mobile app
- [ ] Advanced analytics dashboard
- [ ] Multi-tenant support

## 📞 Support

For support, please open an issue in the GitHub repository.

---

Built with ❤️ for better employee onboarding experiences.

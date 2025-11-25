# Development Guide

This guide provides detailed instructions for developers working on the Onboarding Alchemy Platform.

## Table of Contents

- [Setup](#setup)
- [Development Workflow](#development-workflow)
- [Project Structure](#project-structure)
- [Coding Standards](#coding-standards)
- [Database Management](#database-management)
- [API Development](#api-development)
- [Frontend Development](#frontend-development)
- [Debugging](#debugging)
- [Common Issues](#common-issues)

## Setup

### Initial Setup

1. **Clone and install dependencies**
   ```bash
   git clone <repository-url>
   cd onboarding-alchemy-platform
   npm install
   ```

2. **Set up environment variables**
   ```bash
   # Server
   cp server/.env.example server/.env
   
   # Client
   cp client/.env.example client/.env
   ```
   
   Edit the files with your configuration.

3. **Initialize database**
   ```bash
   cd server
   npm run db:generate
   npm run db:push
   npm run db:seed
   cd ..
   ```

4. **Start development servers**
   ```bash
   npm run dev
   ```

### IDE Setup

#### VS Code (Recommended)

Install these extensions:
- ESLint
- Prettier
- Prisma
- Tailwind CSS IntelliSense
- TypeScript Vue Plugin (Volar)

Recommended `.vscode/settings.json`:
```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true
}
```

## Development Workflow

### Starting the Application

**Option 1: Run both services together**
```bash
npm run dev
```

**Option 2: Run services separately**
```bash
# Terminal 1 - Backend
npm run dev:server

# Terminal 2 - Frontend
npm run dev:client
```

### Making Changes

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Follow the coding standards below
   - Write clean, documented code
   - Test your changes

3. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

4. **Push and create PR**
   ```bash
   git push origin feature/your-feature-name
   ```

### Commit Message Convention

Follow conventional commits:
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting)
- `refactor:` - Code refactoring
- `test:` - Adding tests
- `chore:` - Maintenance tasks

## Project Structure

### Backend (Server)

```
server/
├── src/
│   ├── controllers/      # Request handlers
│   │   ├── authController.ts
│   │   ├── employeeController.ts
│   │   ├── documentController.ts
│   │   ├── meetingController.ts
│   │   └── ...
│   ├── middleware/       # Express middleware
│   │   ├── auth.ts      # JWT authentication
│   │   └── upload.ts    # File upload handling
│   ├── routes/          # API routes
│   │   └── index.ts     # Route definitions
│   ├── services/        # Business logic
│   │   └── openaiService.ts
│   ├── prisma.ts        # Prisma client
│   ├── seed.ts          # Database seeding
│   └── index.ts         # Server entry point
├── prisma/
│   ├── schema.prisma    # Database schema
│   └── dev.db          # SQLite database (dev)
├── uploads/            # Uploaded files
└── package.json
```

### Frontend (Client)

```
client/
├── src/
│   ├── components/
│   │   ├── ui/           # Shadcn/UI components
│   │   ├── common/       # Shared components
│   │   ├── dashboard/    # Dashboard components
│   │   ├── employees/    # Employee components
│   │   └── Sidebar.tsx   # Main sidebar
│   ├── contexts/
│   │   └── AuthContext.tsx  # Authentication context
│   ├── hooks/            # Custom React hooks
│   │   └── use-toast.ts
│   ├── lib/
│   │   ├── api.ts        # Axios API client
│   │   └── utils.ts      # Utility functions
│   ├── pages/            # Page components
│   │   ├── Auth.tsx
│   │   ├── Index.tsx
│   │   ├── Employees.tsx
│   │   └── ...
│   ├── types/            # TypeScript types
│   ├── App.tsx           # App component
│   └── main.tsx          # Entry point
├── public/               # Static assets
└── package.json
```

## Coding Standards

### TypeScript

- Use TypeScript for all new code
- Define proper types and interfaces
- Avoid `any` type when possible
- Use type inference where appropriate

```typescript
// Good
interface User {
  id: string;
  email: string;
  name: string;
}

const getUser = async (id: string): Promise<User> => {
  const response = await api.get(`/users/${id}`);
  return response.data;
};

// Bad
const getUser = async (id: any): Promise<any> => {
  const response = await api.get(`/users/${id}`);
  return response.data;
};
```

### React Components

- Use functional components with hooks
- Keep components small and focused
- Extract reusable logic into custom hooks
- Use proper prop types

```typescript
// Good
interface ButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

const Button: React.FC<ButtonProps> = ({ label, onClick, disabled = false }) => {
  return (
    <button onClick={onClick} disabled={disabled}>
      {label}
    </button>
  );
};

export default Button;
```

### API Endpoints

- Use RESTful conventions
- Return consistent response formats
- Handle errors properly
- Use appropriate HTTP status codes

```typescript
// Good
export const getEmployees = async (req: Request, res: Response) => {
  try {
    const employees = await prisma.employee.findMany();
    return res.status(200).json(employees);
  } catch (error) {
    console.error('Error fetching employees:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch employees',
      message: error.message 
    });
  }
};
```

### Naming Conventions

- **Files**: camelCase for utilities, PascalCase for components
  - `userUtils.ts`, `Button.tsx`
- **Variables/Functions**: camelCase
  - `getUserById`, `isAuthenticated`
- **Classes/Components/Types**: PascalCase
  - `UserProfile`, `AuthContext`, `UserType`
- **Constants**: UPPER_SNAKE_CASE
  - `API_URL`, `MAX_FILE_SIZE`

## Database Management

### Schema Changes

1. **Modify the schema**
   ```prisma
   // server/prisma/schema.prisma
   model Employee {
     id    String @id @default(uuid())
     name  String
     email String @unique
     // Add new field
     department String?
   }
   ```

2. **Create migration**
   ```bash
   cd server
   npm run db:migrate
   # Enter migration name when prompted
   ```

3. **Generate Prisma Client**
   ```bash
   npm run db:generate
   ```

### Querying the Database

```typescript
import { prisma } from './prisma';

// Find many
const employees = await prisma.employee.findMany({
  where: { status: 'active' },
  include: { hr: true },
  orderBy: { createdAt: 'desc' },
});

// Find one
const employee = await prisma.employee.findUnique({
  where: { id: employeeId },
  include: { documents: true, meetings: true },
});

// Create
const newEmployee = await prisma.employee.create({
  data: {
    name: 'John Doe',
    email: 'john@example.com',
    role: 'Developer',
    hrId: hrUserId,
  },
});

// Update
const updated = await prisma.employee.update({
  where: { id: employeeId },
  data: { status: 'active' },
});

// Delete
await prisma.employee.delete({
  where: { id: employeeId },
});
```

### Viewing Data

Use Prisma Studio to view and edit data:
```bash
cd server
npm run db:studio
```

## API Development

### Creating a New Endpoint

1. **Define the route** in `server/src/routes/index.ts`
   ```typescript
   router.get('/employees', authMiddleware, getEmployees);
   router.post('/employees', authMiddleware, createEmployee);
   ```

2. **Create the controller** in `server/src/controllers/`
   ```typescript
   // employeeController.ts
   export const getEmployees = async (req: Request, res: Response) => {
     try {
       const employees = await prisma.employee.findMany();
       res.json(employees);
     } catch (error) {
       res.status(500).json({ error: 'Failed to fetch employees' });
     }
   };
   ```

3. **Test the endpoint**
   ```bash
   curl http://localhost:3000/api/employees \
     -H "Authorization: Bearer YOUR_TOKEN"
   ```

### Authentication

Protected routes require JWT authentication:

```typescript
import { authMiddleware } from '../middleware/auth';

router.get('/protected', authMiddleware, (req: Request, res: Response) => {
  // req.user contains the authenticated user
  const userId = req.user.id;
  res.json({ message: `Hello ${userId}` });
});
```

## Frontend Development

### Adding a New Page

1. **Create the page component** in `client/src/pages/`
   ```typescript
   // NewPage.tsx
   import React from 'react';
   import { Button } from '@/components/ui/button';
   
   const NewPage: React.FC = () => {
     return (
       <div>
         <h1>New Page</h1>
       </div>
     );
   };
   
   export default NewPage;
   ```

2. **Add the route** in `client/src/App.tsx`
   ```typescript
   import NewPage from './pages/NewPage';
   
   <Routes>
     <Route path="/new-page" element={<NewPage />} />
     {/* ... other routes */}
   </Routes>
   ```

3. **Add navigation** in `client/src/components/Sidebar.tsx`

### Using the API Client

```typescript
import api from '@/lib/api';

// GET request
const employees = await api.get('/employees');

// POST request
const newEmployee = await api.post('/employees', {
  name: 'John Doe',
  email: 'john@example.com',
});

// PUT request
await api.put(`/employees/${id}`, { status: 'active' });

// DELETE request
await api.delete(`/employees/${id}`);
```

### Using React Query

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

// Fetching data
const { data, isLoading, error } = useQuery({
  queryKey: ['employees'],
  queryFn: async () => {
    const response = await api.get('/employees');
    return response.data;
  },
});

// Mutating data
const queryClient = useQueryClient();
const mutation = useMutation({
  mutationFn: (newEmployee) => api.post('/employees', newEmployee),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['employees'] });
  },
});
```

## Debugging

### Backend Debugging

1. **Console logging**
   ```typescript
   console.log('Debug info:', variable);
   console.error('Error:', error);
   ```

2. **VS Code debugger**
   Add to `.vscode/launch.json`:
   ```json
   {
     "type": "node",
     "request": "launch",
     "name": "Debug Server",
     "skipFiles": ["<node_internals>/**"],
     "program": "${workspaceFolder}/server/src/index.ts",
     "preLaunchTask": "tsc: build - server/tsconfig.json",
     "outFiles": ["${workspaceFolder}/server/dist/**/*.js"]
   }
   ```

### Frontend Debugging

1. **Browser DevTools**
   - Open Chrome/Firefox DevTools (F12)
   - Use Console, Network, and React DevTools tabs

2. **React DevTools**
   Install the browser extension for React debugging

## Common Issues

### Port Already in Use

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Kill process on port 5173
lsof -ti:5173 | xargs kill -9
```

### Database Issues

```bash
# Reset database
cd server
rm prisma/dev.db
npm run db:push
npm run db:seed
```

### Node Modules Issues

```bash
# Clean install
npm run clean
npm install
```

### TypeScript Errors

```bash
# Regenerate types
cd server
npm run db:generate
```

### CORS Errors

Ensure `CORS_ORIGIN` in `server/.env` matches your frontend URL:
```
CORS_ORIGIN=http://localhost:5173
```

## Additional Resources

- [React Documentation](https://react.dev)
- [Express Documentation](https://expressjs.com)
- [Prisma Documentation](https://www.prisma.io/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Shadcn/UI Documentation](https://ui.shadcn.com)

## Getting Help

If you encounter issues:
1. Check this guide and the main README
2. Search for similar issues in the repository
3. Ask in the team chat/channel
4. Create a new issue with detailed information

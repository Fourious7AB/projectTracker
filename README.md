# AEO Tracker - AI Search Visibility Tracker

A comprehensive multi-tenant Next.js application for tracking AI search visibility across different AI engines (ChatGPT, Gemini, Claude, Perplexity, etc.).

## Features

- **Multi-tenant Architecture**: User authentication with JWT and project-based data isolation
- **Project Management**: Create and manage multiple projects with domains, brands, competitors, and keywords
- **AI Engine Monitoring**: Track visibility across ChatGPT, Gemini, Claude, Perplexity, and Copilot
- **Real-time Dashboard**: Comprehensive visibility metrics, trends, and recommendations
- **Simulation Mode**: Realistic seeded data for testing and demonstration
- **Responsive UI**: Modern interface built with React, Tailwind CSS, and Redux Toolkit

## Tech Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** authentication
- **CORS** enabled for frontend communication
- **Rate limiting** and security middleware

### Frontend
- **React 18** with Vite bundler
- **Redux Toolkit** for state management
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Recharts** for data visualization
- **React Hook Form** for form handling

## Project Structure

```
AEO/
├── backend/
│   ├── models/           # MongoDB schemas
│   ├── routes/           # API routes
│   ├── middleware/       # Authentication middleware
│   ├── scripts/          # Database seeding
│   └── server.js         # Express server
├── frontend/
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── pages/        # Page components
│   │   ├── store/        # Redux store and slices
│   │   └── App.jsx       # Main app component
│   └── vite.config.js    # Vite configuration
└── package.json          # Root package.json
```

## Database Schema

### Users
- `name`, `email`, `password` (hashed)
- `role` (user/admin)
- `isActive` (boolean)

### Projects
- `name`, `description`, `domain`, `brand`
- `competitors` (array of objects)
- `keywords` (array with category and target position)
- `owner` (user reference)
- `settings` (check frequency, engines)

### Checks
- `project`, `engine`, `keyword`
- `position`, `presence`, `answerSnippet`
- `citationsCount`, `observedUrls`
- `metadata` (query time, response size, etc.)
- `status` (pending/completed/failed)

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Projects
- `GET /api/projects` - List user projects
- `POST /api/projects` - Create project
- `GET /api/projects/:id` - Get project details
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Visibility Checks
- `POST /api/checks/run` - Run visibility checks
- `GET /api/checks/project/:projectId` - Get project checks
- `GET /api/checks/:id` - Get single check

### Dashboard
- `GET /api/dashboard/overview` - Dashboard overview
- `GET /api/dashboard/keyword/:keyword` - Keyword analysis
- `GET /api/dashboard/engine-comparison` - Engine comparison

## Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB Atlas account or local MongoDB
- Git

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
# Create .env file with the following variables:
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb+srv://arupbera800_db_user:121@cluster0.9grwmqf.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=your_jwt_secret_key_here_change_in_production
JWT_EXPIRE=7d
```

4. Seed the database:
```bash
node scripts/seedData.js
```

5. Start the server:
```bash
npm run dev
```

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

### Running Both Services

From the root directory:
```bash
npm run dev
```

This will start both backend (port 5000) and frontend (port 5173) concurrently.

## Usage

### Test Account
- **Email**: test@example.com
- **Password**: password123

### Creating a Project
1. Login to the application
2. Navigate to "Projects" → "New Project"
3. Fill in project details:
   - Project name and description
   - Domain URL and brand name
   - Add competitors (optional)
   - Add keywords with categories and target positions
   - Select AI engines to monitor
   - Set check frequency

### Running Visibility Checks
1. Go to Dashboard or Project Detail page
2. Click "Run Visibility Checks" button
3. The system will simulate AI engine responses
4. View results in the dashboard with charts and metrics

### Dashboard Features
- **Visibility Score**: Performance across different AI engines
- **Trends**: Historical data over time
- **Keyword Breakdown**: Top performing keywords
- **Recommendations**: AI-powered suggestions for improvement

## Simulation Design

The application includes a sophisticated simulation system that generates realistic data:

### AI Engine Simulation
- **Presence Rate**: 60-90% base presence with engine-specific modifiers
- **Position Distribution**: Realistic ranking positions (1-8)
- **Citations**: Variable citation counts (0-4)
- **Response Snippets**: Contextual AI-generated content
- **URLs**: Realistic domain and page references

### Data Generation
- **14 days** of historical data
- **Multiple engines** per keyword
- **Trending patterns** with realistic fluctuations
- **Performance variations** across different engines

## Development

### Adding New AI Engines
1. Update the engine enum in `backend/models/Check.js`
2. Add engine to project settings in `frontend/src/pages/CreateProject.jsx`
3. Update simulation logic in `backend/routes/checks.js`

### Customizing Dashboard
- Modify components in `frontend/src/components/dashboard/`
- Add new chart types using Recharts
- Update Redux slices for new data structures

### Database Seeding
- Run `node scripts/seedData.js` to populate with test data
- Modify seed script to add more realistic data
- Adjust simulation parameters for different scenarios

## Deployment

### Backend Deployment
1. Set up MongoDB Atlas cluster
2. Update environment variables
3. Deploy to Vercel, Heroku, or similar platform
4. Configure CORS for production domain

### Frontend Deployment
1. Build the application: `npm run build`
2. Deploy to Vercel, Netlify, or similar platform
3. Update API endpoints in production

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
- Create an issue in the repository
- Check the documentation
- Review the API endpoints

---

**Note**: This application is designed for demonstration and testing purposes. In production, you would need to integrate with actual AI engine APIs and implement proper rate limiting, caching, and monitoring.

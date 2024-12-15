# Next.js Document Parser with Qwen API

A document management system built with Next.js 14 that uses Qwen API for document parsing and analysis.

## Features

- User Authentication (with default user support)
- Document Upload and Management
- Document Parsing with Qwen API
- Document Corrections History
- Knowledge Base Management

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- Qwen API key

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
DATABASE_URL=your_postgres_connection_string
JWT_SECRET=your_jwt_secret
QWEN_API_KEY=your_qwen_api_key
```

## Installation

1. Install dependencies:
```bash
npm install
```

2. Run database migrations:
```bash
npm run db:migrate
```

3. Start the development server:
```bash
npm run dev
```

## Project Structure

- `/app` - Next.js 14 app directory with route handlers and pages
- `/components` - Reusable React components
- `/utils` - Utility functions and helpers
- `/db` - Database schema and migrations
- `/lib` - Shared libraries and configurations

## API Routes

### Documents
- `POST /api/documents` - Upload and parse a new document
- `GET /api/documents` - List all documents
- `GET /api/documents/[id]` - Get document details
- `PATCH /api/documents/[id]` - Update document or add corrections

### Authentication
- `POST /api/auth/signup` - Create a new user account
- `POST /api/auth/login` - Log in to existing account
- `POST /api/auth/logout` - Log out current user
- `GET /api/auth/session` - Get current session info

## Document Processing

1. When a document is uploaded:
   - File hash is calculated to prevent duplicates
   - Content is sent to Qwen API for parsing
   - Original and parsed content are stored
   - Document status is tracked (pending → processing → processed)

2. Document corrections:
   - Users can make corrections to parsed content
   - All corrections are stored in history
   - Original parsed content is preserved

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License.

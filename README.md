# DocuChat

## Overview

DocuChat is an AI-powered application that allows users to interact with their PDF documents via a chatbot interface. Users can upload PDFs, ask questions about their content, and receive instant AI-generated responses.

## Features

- Secure authentication with Kinde Auth
- Upload and process PDF files
- AI-driven chatbot for document-based Q&A
- User-friendly dashboard for managing files
- Subscription plans with Stripe integration
- Mobile-responsive UI with modern design

## Tech Stack

- **Frontend**: Next.js, React, Tailwind CSS
- **Backend**: Next.js API routes, tRPC, Prisma
- **Database**: mySQL (via Prisma ORM)
- **Authentication**: Kinde Auth
- **AI Integration**: OpenAI API
- **File Storage & Processing**: UploadThing, Pinecone, LangChain
- **Payments**: Stripe

## Installation

### Prerequisites

- Node.js (>= 16.x)
- PostgreSQL
- Environment variables set up (see `.env.example`)

### Steps

1. Clone the repository:

   ```sh
   git clone https://github.com/your-username/docuchat.git
   cd docuchat
   ```

2. Install dependencies:

   ```sh
   npm install
   ```

3. Set up environment variables:

   - Copy `.env.example` to `.env.local` and fill in the required values.

4. Run database migrations:

   ```sh
   npx prisma migrate dev
   ```

5. Start the development server:

   ```sh
   npm run dev
   ```

## Usage

1. Sign up or log in using Kinde Auth.
2. Upload a PDF document via the dashboard.
3. Start chatting with the AI-powered chatbot.
4. Manage your documents and subscription via the user dashboard.

## Deployment

To deploy to production:

1. Set up environment variables for production.
2. Deploy the app on Vercel:

   ```sh
   vercel
   ```

3. Configure your database and API keys.

## Contributing

Feel free to submit issues or pull requests. Before contributing, please read the contribution guidelines.

## License

This project is licensed under the MIT License.

## Contact

For any queries, reach out at [hrithikinfinite@gmail.com](mailto:hrithikinfinite@gmail.com).

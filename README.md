# 📄 DocuChat

DocuChat is an AI-powered platform that transforms your PDFs into clear, actionable summaries. Built with the latest web technologies, DocuChat offers a secure, beautiful, and responsive experience for managing and understanding your documents.

---

## 🚀 Features

- 📝 Clear, structured summaries with key points and insights
- 🎨 Beautiful, interactive summary viewer with progress tracking
- 🔒 Secure file handling and processing
- 🔐 Protected routes and API endpoints
- 💰 Flexible pricing plans (Basic and Pro)
- 🪝 Webhook implementation for Stripe events
- 📊 User dashboard for managing summaries
- 📱 Responsive design for mobile and desktop
- 🔄 Real-time updates and path revalidation
- 🚀 Production-ready deployment
- 🔔 Toast notifications for upload status, processing updates, and error handling
- 📈 Performance optimizations
- 🔍 SEO-friendly summary generation
- 🗂️ Markdown Export that can be converted into a blog post

---

## 🛠️ Core Technologies

- 🚀 **Next.js 15 App Router** for server-side rendering, routing, and API endpoints with Server Components and Server Actions
- ⚛️ **React 19** for building interactive user interfaces with reusable components
- 🔑 **Clerk** for secure authentication with Passkeys, Github, and Google Sign-in
- 🤖 **GPT-4** powered summarization with contextual understanding and emoji-enhanced output
- 🧠 **Langchain** for PDF parsing, text extraction, and document chunking
- 🎨 **ShadCN UI** for accessible, customizable React components
- 💾 **NeonDB (PostgreSQL)** for serverless database storage of summaries and user data
- 📤 **UploadThing** for secure PDF uploads (up to 32MB) and file management
- 💳 **Stripe** for subscription management, cancellations and secure payment processing
- 🔔 **Toast notifications** for user feedback
- 📜 **TypeScript** for static typing and enhanced development experience
- 💅 **TailwindCSS 4** for utility-first, responsive styling
- 🚀 **Deployment on Vercel**

---

## 🏁 Getting Started

1. **Clone the Repository**
    ```bash
    git clone https://github.com/your-username/docuchat.git
    cd docuchat
    ```

2. **Install Dependencies**
    ```bash
    npm install
    # or
    yarn install
    ```

3. **Set Up Environment Variables**

    Create a `.env.local` file and add your keys:
    ```env
    CLERK_SECRET_KEY=your_clerk_secret
    OPENAI_API_KEY=your_openai_key
    DATABASE_URL=your_neondb_url
    STRIPE_SECRET_KEY=your_stripe_key
    UPLOADTHING_SECRET=your_uploadthing_key
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable
    ```

4. **Run the Development Server**
    ```bash
    npm run dev
    # or
    yarn dev
    ```

    Visit [http://localhost:3000](http://localhost:3000) to view the app.

---

## 📦 Deployment

Deploy instantly to [Vercel](https://vercel.com/) for best performance and scalability.

---

## 📚 Learn More

- [Clerk Docs](https://clerk.com/docs)
- [OpenAI Docs](https://platform.openai.com/docs)
- [Langchain Docs](https://js.langchain.com/docs/)
- [ShadCN UI](https://ui.shadcn.com/)
- [NeonDB](https://neon.tech/)
- [UploadThing](https://uploadthing.com/)
- [Stripe Docs](https://stripe.com/docs)
- [TailwindCSS](https://tailwindcss.com/)

---

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

---

## 📝 License

MIT

---

**DocuChat** – Summarize smarter, not harder.
# Plan 2: New Features & Enhancements

## Overview
This plan outlines new features to enhance DocuChat, with **Claude LLM integration** as the foundation for improved AI capabilities.

## Current Features
- PDF upload and AI summarization (OpenAI GPT-4)
- User authentication (Clerk)
- Payments and subscriptions (Stripe)
- Dashboard with summary management
- Markdown export

---

## Priority Features (User Selected)

### Feature 1: Claude LLM Integration

**Goal:** Replace OpenAI with Anthropic Claude for better summarization quality and longer context windows.

**Benefits:**
- Superior document understanding
- 200K token context window (vs 128K for GPT-4)
- Better structured output
- Consistent with DocuChat development tools

**Implementation:**

#### Step 1: Install Anthropic SDK
```bash
npm install @anthropic-ai/sdk
```

#### Step 2: Create Claude Integration
**New file: `lib/claude.ts`**
```typescript
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export async function generateSummary(
  documentText: string,
  template: string = "detailed"
): Promise<string> {
  const systemPrompt = getPromptForTemplate(template);

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4096,
    system: systemPrompt,
    messages: [
      {
        role: "user",
        content: `Please summarize the following document:\n\n${documentText}`,
      },
    ],
  });

  return response.content[0].type === "text"
    ? response.content[0].text
    : "";
}
```

#### Step 3: Update Prompts
**Modify: `utils/prompts.ts`**
- Optimize prompts for Claude's strengths
- Add template-specific prompts

#### Step 4: Update Upload Actions
**Modify: `actions/upload-actions.ts`**
- Replace OpenAI calls with Claude
- Add template parameter

#### Step 5: Environment Setup
```env
ANTHROPIC_API_KEY=your_api_key_here
```

#### Step 6: Cleanup
- Remove `lib/openai.ts`
- Remove OpenAI dependencies (can keep LangChain for PDF parsing)

**Files to Modify:**
- `lib/claude.ts` (new)
- `utils/prompts.ts`
- `actions/upload-actions.ts`
- `package.json`
- `.env.local`

---

### Feature 2: Summary Templates

**Goal:** Let users choose different summary styles based on their needs.

**Templates:**

| Template | Description | Use Case |
|----------|-------------|----------|
| Executive | Brief, high-level overview | Quick decisions |
| Detailed | Comprehensive analysis | Deep understanding |
| Study Notes | Key points + definitions | Learning |
| Meeting Notes | Action items focused | Business meetings |

**Implementation:**

#### Step 1: Define Template Types
**New file: `types/templates.ts`**
```typescript
export type SummaryTemplate =
  | "executive"
  | "detailed"
  | "study-notes"
  | "meeting-notes";

export const TEMPLATES: Record<SummaryTemplate, TemplateConfig> = {
  executive: {
    name: "Executive Summary",
    description: "Brief, high-level overview for quick decisions",
    icon: "Briefcase",
  },
  detailed: {
    name: "Detailed Analysis",
    description: "Comprehensive breakdown with full context",
    icon: "FileText",
  },
  "study-notes": {
    name: "Study Notes",
    description: "Key points and definitions for learning",
    icon: "GraduationCap",
  },
  "meeting-notes": {
    name: "Meeting Notes",
    description: "Action items and decisions summary",
    icon: "Users",
  },
};
```

#### Step 2: Create Template Prompts
**Update: `utils/prompts.ts`**
```typescript
export const TEMPLATE_PROMPTS: Record<SummaryTemplate, string> = {
  executive: `Create a brief executive summary...`,
  detailed: `Create a detailed analysis...`,
  "study-notes": `Create study notes with...`,
  "meeting-notes": `Extract action items and decisions...`,
};
```

#### Step 3: Add Template Selector UI
**New component: `components/upload/template-selector.tsx`**

#### Step 4: Update Database Schema
```sql
ALTER TABLE pdf_summaries
ADD COLUMN template VARCHAR(50) DEFAULT 'detailed';
```

#### Step 5: Update Upload Form
- Add template selection step
- Store template choice with summary

**Files to Modify:**
- `types/templates.ts` (new)
- `utils/prompts.ts`
- `components/upload/template-selector.tsx` (new)
- `components/upload/upload-form.tsx`
- `actions/upload-actions.ts`
- `schema.sql`

---

### Feature 3: Multi-Format Support

**Goal:** Support Word, PowerPoint, Excel, and plain text files in addition to PDFs.

**Supported Formats:**
- PDF (.pdf) - existing
- Word (.docx)
- PowerPoint (.pptx)
- Excel (.xlsx)
- Text (.txt, .md)

**Implementation:**

#### Step 1: Install Document Parsers
```bash
npm install mammoth      # Word documents
npm install xlsx         # Excel spreadsheets
npm install officeparser # PowerPoint (alternative: pptx-parser)
```

#### Step 2: Create Document Extractors
**New file: `lib/document-parser.ts`**
```typescript
import mammoth from "mammoth";
import * as XLSX from "xlsx";

export async function extractText(
  fileBuffer: Buffer,
  fileType: string
): Promise<string> {
  switch (fileType) {
    case "application/pdf":
      return extractPDF(fileBuffer);
    case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      return extractWord(fileBuffer);
    case "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
      return extractExcel(fileBuffer);
    case "application/vnd.openxmlformats-officedocument.presentationml.presentation":
      return extractPowerPoint(fileBuffer);
    case "text/plain":
    case "text/markdown":
      return fileBuffer.toString("utf-8");
    default:
      throw new Error(`Unsupported file type: ${fileType}`);
  }
}
```

#### Step 3: Update UploadThing Config
**Modify: `utils/uploadthing.ts`**
```typescript
const allowedTypes = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "text/plain",
  "text/markdown",
];
```

#### Step 4: Update UI
- Show supported formats in upload area
- Display appropriate icons for each format

**Files to Modify:**
- `lib/document-parser.ts` (new)
- `utils/uploadthing.ts`
- `actions/upload-actions.ts`
- `components/upload/upload-form.tsx`

---

### Feature 4: Chat with PDF (RAG)

**Goal:** Allow users to ask questions about their uploaded documents using Retrieval-Augmented Generation.

**Architecture:**
```
User Question → Embed Query → Search Chunks → Retrieve Context → Claude → Answer
```

**Implementation:**

#### Step 1: Choose Embedding Strategy
**Option A: Claude-native (recommended)**
- Use Claude for both embeddings and responses
- Simpler architecture

**Option B: External Vector DB**
- Use Pinecone, Supabase Vector, or pgvector
- Better for large documents

#### Step 2: Document Chunking
**New file: `lib/chunking.ts`**
```typescript
export function chunkDocument(
  text: string,
  chunkSize: number = 1000,
  overlap: number = 200
): string[] {
  // Split into overlapping chunks for better context
}
```

#### Step 3: Database Schema Update
```sql
CREATE TABLE document_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  summary_id UUID REFERENCES pdf_summaries(id) ON DELETE CASCADE,
  chunk_index INTEGER NOT NULL,
  content TEXT NOT NULL,
  embedding VECTOR(1536), -- If using pgvector
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Step 4: Create Chat Interface
**New files:**
- `components/summaries/chat-interface.tsx`
- `components/summaries/chat-message.tsx`

#### Step 5: Create Chat API
**New file: `app/api/chat/route.ts`**
```typescript
export async function POST(request: Request) {
  const { summaryId, message } = await request.json();

  // 1. Get relevant chunks
  const chunks = await getRelevantChunks(summaryId, message);

  // 2. Build context
  const context = chunks.map(c => c.content).join("\n\n");

  // 3. Ask Claude
  const answer = await askClaude(message, context);

  return Response.json({ answer });
}
```

#### Step 6: Add Chat Route
**New file: `app/(logged-in)/summaries/[id]/chat/page.tsx`**

**Files to Create:**
- `lib/chunking.ts`
- `lib/embeddings.ts`
- `components/summaries/chat-interface.tsx`
- `components/summaries/chat-message.tsx`
- `app/api/chat/route.ts`
- `app/(logged-in)/summaries/[id]/chat/page.tsx`

**Files to Modify:**
- `schema.sql`
- `components/summaries/summary-viewer.tsx` (add chat button)

---

## Implementation Roadmap

### Phase 1: Foundation (Week 1)
1. Claude LLM Integration
2. Remove OpenAI dependency
3. Test summarization quality

### Phase 2: Templates (Week 2)
1. Implement template system
2. Create template prompts
3. Add UI selector
4. Update database

### Phase 3: Multi-Format (Week 3)
1. Add document parsers
2. Update file validation
3. Test each format
4. Update UI

### Phase 4: Chat/RAG (Week 4-5)
1. Implement chunking
2. Set up embeddings
3. Build chat interface
4. Create chat API
5. Test thoroughly

---

## Future Features (Lower Priority)

These can be implemented after the core features:

### Folder Organization
- Organize summaries into folders/categories
- Database: Add `folders` table

### Summary Sharing
- Generate shareable links
- Public/private toggle
- New route: `/shared/[token]`

### Batch Processing
- Upload multiple files at once
- Background queue processing

### Export Options
- Export as PDF (styled)
- Export as Word document
- Notion integration

### API Access
- REST API for developers
- API key management
- Rate limiting

---

## Verification Plan

### Claude Integration
- [ ] Generate summaries with Claude
- [ ] Compare quality with OpenAI output
- [ ] Test error handling
- [ ] Verify token limits work

### Templates
- [ ] Each template produces distinct output
- [ ] Template selection persists
- [ ] UI is intuitive

### Multi-Format
- [ ] Upload Word document
- [ ] Upload PowerPoint
- [ ] Upload Excel
- [ ] Upload text file
- [ ] Verify extraction quality

### Chat/RAG
- [ ] Ask questions about document
- [ ] Verify answers are contextual
- [ ] Test with long documents
- [ ] Check performance

---

## Environment Variables

```env
# Existing
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
DATABASE_URL=
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
UPLOADTHING_SECRET=

# New
ANTHROPIC_API_KEY=your_anthropic_api_key

# Remove (after migration)
# OPENAI_API_KEY=
```

---

## Database Migrations

```sql
-- Template support
ALTER TABLE pdf_summaries
ADD COLUMN template VARCHAR(50) DEFAULT 'detailed';

-- Chat support
CREATE TABLE document_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  summary_id UUID REFERENCES pdf_summaries(id) ON DELETE CASCADE,
  chunk_index INTEGER NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_chunks_summary ON document_chunks(summary_id);
```

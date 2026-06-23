# PLC Question Generator - Project Blueprint & Context

## 1. Project Overview
This project is a React-based single-page application (SPA) built with Vite. Its primary function is to serve as an intelligent, automated generator for Programmable Logic Controller (PLC) examination questions and industrial automation scenarios. It utilizes generative AI to create robust technical narratives, I/O mapping tables, and flowchart logic based on user-defined parameters.

## 2. Technology Stack & Architecture
- **Frontend Framework**: React 19 (Hooks, Functional Components)
- **Bundler & Build Tool**: Vite
- **Routing**: `react-router-dom` for client-side routing.
- **State Management**: React `useState` and `useEffect` for local component state.
- **Authentication & Database**: Supabase (`@supabase/supabase-js`)
- **AI Integration**: Google Gemini API via REST (`https://generativelanguage.googleapis.com/v1`)
- **Data Rendering**:
  - `react-markdown` & `remark-gfm` (for rendering AI markdown narratives)
  - `mermaid` (for rendering flowchart graphs natively from AI string outputs)
  - Document Export: `docx`, `html2pdf.js`, `file-saver`, `html2canvas`

## 3. Directory Structure & Core Modules
The logic is divided into modular components and pages inside the `src/` directory.

### `src/pages/`
Contains the main route components:
- **`Dashboard.jsx`**: The landing page. It calculates and displays usage statistics. It retrieves the number of generated questions and categories from `localStorage` (`stats_questions_generated`, `stats_categories_used`).
- **`Generator.jsx`**: The core business logic module.
  - Manages a complex form state (`formData`) capturing: Scenario, selected Omron Instructions (TIM, CNT, KEEP, SET, etc.), Input/Output counts, Step Count, Operation Mode, Branching Flow, PLC Hardware, and Custom text.
  - Constructs a highly structured prompt enforcing strict constraints (e.g., "Instructional Stealth", logical sequence, safety requirements).
  - Makes a POST request to the Gemini API (`generateContent`).
  - Expects a strict JSON payload in return: `{ narrative: "...", io_table: [...], flowchart_code: "..." }`.
  - Parses the AI response, tracks generation statistics in `localStorage`, and handles saving the result to Supabase (or `localStorage` fallback if in localhost/guest mode).
- **`Saved.jsx`**: Retrieves and lists previously generated questions. It queries the `saved_questions` table via Supabase or falls back to `plc_saved_questions_local` in `localStorage` for local testing.
- **`Auth.jsx`**: Handles user authentication flow utilizing Supabase Auth API.

### `src/components/`
Contains reusable logic wrappers:
- **`MarkdownRenderer.jsx`**: Wraps `react-markdown` to safely render the `narrative` part of the AI JSON payload.
- **`Mermaid.jsx`**: Initializes and renders Mermaid.js SVG charts dynamically from the `flowchart_code` string returned by the AI.
- **`NumberStepper.jsx`**: A controlled input component for numerical form data in the Generator.
- **`Layout.jsx`**: The structural shell that wraps all routes via React Router's `<Outlet />`.

### `src/lib/`
- **`supabaseClient.js`**: Initializes the Supabase client using environment variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`).

## 4. Data Flow & Integration Details

### AI Generation Flow
1. User configures parameters in `Generator.jsx`.
2. App constructs a text prompt requesting a strict JSON format output.
3. Fetch request is sent to `VITE_GEMINI_API_ENDPOINT` using `VITE_GEMINI_API_KEY` and `VITE_GEMINI_MODEL`.
4. Response is parsed. The raw text is stripped of any surrounding markdown blocks (using Regex `/\{[\s\S]*\}/`) to extract pure JSON.
5. The extracted JSON string is parsed into a JS object and passed to rendering components (`MarkdownRenderer`, `Mermaid`, HTML Table).
6. Local statistics (`stats_questions_generated`, `stats_categories_used`) are incremented in `localStorage`.

### Data Persistence Flow
- **Authentication**: Checks `supabase.auth.getUser()`.
- **Localhost Fallback**: If the user is unauthenticated but running on `localhost`, data is saved to `localStorage` under `plc_saved_questions_local`.
- **Cloud Storage**: If authenticated, data is inserted into the Supabase table `saved_questions` linked to the `user_id`.

## 5. Environment Variables
The application relies on the following environment configurations (`.env`):
- `VITE_GEMINI_API_KEY`: API Key for Google Gemini.
- `VITE_GEMINI_MODEL`: (Optional) Specifies model version (e.g., `gemini-1.5-flash`).
- `VITE_GEMINI_API_ENDPOINT`: Base URL for the Gemini API.
- `VITE_SUPABASE_URL`: Project URL for the Supabase backend.
- `VITE_SUPABASE_ANON_KEY`: Public anonymous key for Supabase access.

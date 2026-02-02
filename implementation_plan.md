# Master Implementation Plan - Kids Story Book Generator

**Tech Stack**: Next.js 14, Tailwind CSS, Firebase (Auth/Firestore), Cloudinary, Infip API (`nbpro`), OpenRouter (Nemotron/Hermes 3), ReactBits, JSZip.

This is the definitive plan for a **Bulk AI Storybook Platform** capable of generating 1-100 consistent images in a single session.

## User Review Required
> [!IMPORTANT]
> **Bulk Generation Strategy (The Engine)**:
> To handle 100 images without crashing or hitting limits:
> 1.  **Queue**: We create 100 "Empty Slots" in Firebase immediately upon clicking Start.
> 2.  **Client-Side Loop**: The browser processes these slots one by one.
> 3.  **Resumability**: If you close the window at Image 50, you can re-open it later, click "Resume", and it continues from Image 51.
>
> **File Naming**:
> Final images will be saved and downloaded as `1_Title.jpg`, `2_Title.jpg`, ..., `100_Title.jpg`.

## 1. Project Architecture & Setup
#### [NEW] Configuration
- **Environment**: Setup `.env` for Infip, OpenRouter, Firebase, Cloudinary.
- **Dependencies**: `openai` (for OpenRouter), `jszip` (for bulk download), `react-dropzone`.

## 2. Admin Dashboard
#### [NEW] src/app/admin/page.tsx
- **Security**: Route protected by `user.role === 'admin'`.
- **User Stats**: Card showing total user count.
- **User Management Table**:
    - Columns: Name, Email, Status.
    - **Actions**: "Block User", "Delete User".

## 3. The Studio (Generator Hub)
#### [NEW] src/components/studio/PromptInput.tsx
- **Dual Input Modes**:
    1.  **Paste Text**: Large textarea.
    2.  **Upload Text File**: Parses `.txt` file, splitting by newline (Line 1 = Page 1).
- **Preview List**: A scrollable "Dark Mode" list of all parsed prompts.
    - **Action**: "Edit" specific line.
    - **Action**: "Delete" specific line.

#### [NEW] src/components/studio/CharacterManager.tsx
- **Slots**: Dynamic list (up to 10 characters).
- **Input**: Upload Image + Enter Name (e.g., "John", "Dolly").
- **AI Analysis (Nemotron)**:
    - On upload, sends image to `nemotron-nano-12b-2-vl`.
    - Returns text description (e.g., "A boy with messy red hair").
    - User can edit/save this description for the generator to use.

#### [NEW] src/components/studio/ConfigPanel.tsx
- **Model Selector**: Dropdown for `nbpro` (default), `qwen`, `sdxl`.
- **Aspect Ratio**: Buttons [1:1], [16:9], [9:16].

## 4. The Bulk Generation Engine
#### [NEW] src/hooks/useBulkGenerator.ts
This is the core logic that handles the "1-to-100" requirement.
- **Start Process**:
    1.  Create `Book` document in Firebase.
    2.  Create `Page` sub-collection items (Status: `pending`).
- **The Loop**:
    1.  **Verify**: Check "Stop/Pause" flag.
    2.  **Fetch**: Get next `pending` page.
    3.  **Enhance (OpenRouter)**: Send Prompt + Character Layout to `Hermes 3 405B`.
        - *Goal*: "Rewrite prompt to include visual traits of John/Dolly if mentioned."
    4.  **Generate (Infip)**: Send enhanced prompt to Infip API.
        - *Logic*: Poll `poll_url` every 5s until complete.
    5.  **Upload**: Save to Cloudinary with public ID `${index}_${bookTitle}`.
    6.  **Save**: Update Firebase with new Image URL.
    7.  **Next**: Wait 2s, repeat loop.

## 5. Library & Downloads
#### [NEW] src/app/library/page.tsx
- **Gallery**: Grid of Books (Cover Image + Title + Page Count).

#### [NEW] src/app/library/[bookId]/page.tsx
- **Detail View**: Scrollable list of all generated images (1-100).
- **Download Single**: Button to download specific JPG.
- **Download All (ZIP)**:
    - Fetches all 100 images.
    - Zips them as `BookTitle.zip`.
    - Internal files named `1_BookTitle.jpg`, `2_BookTitle.jpg`, etc.

## Verification Plan
1.  **Bulk Integrity**: Load 50 prompts. Start generation. Close browser at #10. Re-open. Resume. Verify #11 starts.
2.  **Consistency**: Define "John". Prompt: "John runs". Verify output shows John.
3.  **Naming**: Download Zip. Extract. Check file names match format `N_Title.jpg`.

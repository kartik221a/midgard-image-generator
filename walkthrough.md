# Verification & Walkthrough

The **Kids Story Book Generator** is now implemented. Follow these steps to run and verify the application.

## 1. Local Setup
Ensure all dependencies are installed and environment variables are set.

1.  **Environment Variables**:
    Update `.env.local` with your keys:
    ```bash
    # Firebase
    NEXT_PUBLIC_FIREBASE_API_KEY=...
    NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
    # ... other firebase config
    
    # AI Services
    OPENROUTER_API_KEY=...
    INFIP_API_KEY=...
    
    # Cloudinary
    NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=...
    CLOUDINARY_API_KEY=...
    CLOUDINARY_API_SECRET=...
    ```

2.  **Run Development Server**:
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000).

## 2. Verification Steps

### A. Admin Dashboard
1.  Navigate to `/admin`.
2.  **Expected**: You should be redirected to home if you are not an `admin`.
3.  **Setup**: Manually set your user role to `admin` in Firestore (`users/{uid}/role: "admin"`).
4.  **Verify**: Access Admin Dashboard. You should see User Stats and a table of users.

### B. Studio & Bulk Generation
1.  Navigate to `/studio`.
2.  **Prompt Input**: Paste text lines (e.g., "A cat sits on a mat\nThe cat jumps").
3.  **Configuration**: Select `NanoBanana Pro` model and `Square` aspect ratio.
4.  **Characters**: Upload a reference image for "Fluffy".
5.  **Start**: Click "Start Generation".
6.  **Verify**:
    - Progress bar moves.
    - Logs appear: "Enhancing...", "Generating...", "Uploading...".
    - You can **Pause** and **Resume**.

### C. Library & Downloads
1.  Once completed (or partially done), click "View in Library".
2.  **Gallery**: You should see your new book card.
3.  **Detail View**: Click the book. See the grid of images.
4.  **Download**: Click "Download All (ZIP)".
    - **Verify**: A zip file downloads containing images named `1_Untitled Book.jpg`, etc.

## 3. Troubleshooting
- **Cloudinary Error**: Check `CLOUDINARY_API_SECRET` and ensure your Cloudinary account allows unsigned uploads OR (since we implemented server-side signing) ensure API keys in `.env.local` are correct.
- **Firebase Permission**: Ensure Firestore Rules allow read/write for authenticated users.

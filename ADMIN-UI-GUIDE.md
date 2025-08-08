# Admin UI Guide

## Creating a Complete Pack

### Step 1: Create Pack
1. Go to http://localhost:3000/admin
2. Click **"Create Pack"** button (top right)
3. Enter:
   - YouTube URL (any valid YouTube video)
   - Title
   - Price
4. Click **"Save Pack"**

### Step 2: Add PDF
1. After creating the pack, you'll be redirected back to the admin dashboard
2. Find your pack in the list
3. Click **"Edit"** button
4. Scroll down to **"PDF Upload"** section
5. Click "Choose File" and select a PDF
6. The upload happens automatically when you select a file

### Step 3: Create Quiz
1. In the same edit page, scroll to **"Quiz"** section
2. Click **"Create Quiz"** button
3. You'll be taken to the quiz builder where you can:
   - Add a quiz title
   - Add multiple choice questions
   - Rearrange questions with up/down arrows
   - Add explanations for answers
4. Click **"Save Quiz"**

### Step 4: Get Payment Link
1. After saving everything, go back to the pack edit page
2. At the bottom, you'll see the **"Payment Link"** section
3. Click **"Copy"** to copy the Stripe payment link

## Pack Status Indicators

In the admin dashboard, each pack shows status icons:
- ✓ Video (always checked)
- ✓ or ✗ PDF (depends if uploaded)
- ✓ or ✗ Quiz (depends if created)

Packs that need completion are shown at the top under "Needs Completion".
# Local Testing Instructions

## 🚀 The server is now running!

### Access the application:

1. **Main Site**: http://localhost:3000
2. **Admin Login**: http://localhost:3000/login
   - Email: `admin@englishunleashed.com`
   - Password: `changeme123`

### Test Flow:

1. **Login as Admin**
   - Go to http://localhost:3000/login
   - Use the credentials above

2. **Create a Pack**
   - Click "Create Pack" in admin dashboard
   - Enter a YouTube video URL (any valid YouTube URL)
   - Set a title and price
   - Save the pack

3. **Test Features**
   - Upload a PDF (it won't actually upload in local dev, but UI will work)
   - Create a quiz with multiple questions
   - Copy the payment link (won't work without Stripe keys)

4. **View as Customer**
   - Create a regular user account
   - Go to http://localhost:3000/account to see purchases
   - (In local dev, you'll need to manually create orders in the database)

### Notes:

- **Database**: Using SQLite (dev.db file in project root)
- **PDFs**: Won't actually upload without Vercel Blob token
- **Payments**: Won't work without Stripe keys
- **Emails**: Will log to console instead of sending

### To stop the server:
Press `Ctrl+C` in the terminal

### To view/edit database:
```bash
pnpm db:studio
```
This opens Prisma Studio at http://localhost:5555
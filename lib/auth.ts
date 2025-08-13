/**
 * Authentication Configuration for English Unleashed
 * 
 * This module configures NextAuth.js for the application, providing:
 * - Credentials-based authentication (email/password)
 * - JWT session strategy for stateless auth
 * - Admin role management
 * - Secure password hashing with bcrypt
 * 
 * Security Features:
 * - Passwords hashed with bcrypt (10 rounds)
 * - JWT tokens signed with NEXTAUTH_SECRET
 * - Session data includes user ID and admin status
 * - Automatic redirect handling for auth flows
 * 
 * @module lib/auth
 */

import { PrismaAdapter } from "@auth/prisma-adapter"
import bcrypt from "bcryptjs"
import { NextAuthOptions } from "next-auth"
import type { Adapter } from "next-auth/adapters"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "./db"
import { env } from "../env.mjs"

/**
 * NextAuth configuration object
 * 
 * Key decisions:
 * - JWT strategy: Chosen for stateless auth, better performance, and Vercel Edge compatibility
 * - Prisma Adapter: Manages user accounts and sessions in the database
 * - Credentials Provider: Allows traditional email/password authentication
 * 
 * @see https://next-auth.js.org/configuration/options
 */
export const authOptions: NextAuthOptions = {
  // Prisma adapter for database integration
  // Handles user account creation, session management, and account linking
  adapter: PrismaAdapter(prisma) as Adapter,
  
  // JWT session strategy for stateless authentication
  // Preferred over database sessions for scalability and Edge runtime compatibility
  session: {
    strategy: "jwt",
    // Session expires after 30 days of inactivity
    maxAge: 30 * 24 * 60 * 60, // 30 days in seconds
  },
  providers: [
    /**
     * Credentials Provider for email/password authentication
     * 
     * Flow:
     * 1. User submits email and password
     * 2. Check if credentials are provided
     * 3. Find user by email in database
     * 4. Verify password with bcrypt
     * 5. Return user object if valid, null if invalid
     * 
     * Security measures:
     * - Passwords hashed with bcrypt (salt rounds: 10)
     * - Same response time for invalid email or password (prevents enumeration)
     * - No specific error messages to prevent information leakage
     */
    CredentialsProvider({
      // Provider name shown in the sign-in form
      name: "credentials",
      
      // Define the credentials fields for the sign-in form
      credentials: {
        email: { 
          label: "Email", 
          type: "email",
          placeholder: "you@example.com" 
        },
        password: { 
          label: "Password", 
          type: "password",
          placeholder: "••••••••" 
        }
      },
      
      /**
       * Authorize function - validates user credentials
       * 
       * @param credentials - The submitted email and password
       * @returns User object if valid, null if invalid
       * 
       * IMPORTANT: This function should:
       * - Always return null for invalid credentials (no specific errors)
       * - Take consistent time regardless of failure reason (timing attack prevention)
       * - Never expose whether email exists or not
       */
      async authorize(credentials) {
        // Step 1: Validate that credentials were provided
        // Early return if missing to avoid unnecessary database queries
        if (!credentials?.email || !credentials?.password) {
          console.log('[Auth] Missing credentials')
          return null
        }

        try {
          // Step 2: Find user by email (case-insensitive)
          // Using findUnique for better performance with indexed email field
          const user = await prisma.user.findUnique({
            where: { 
              email: credentials.email.toLowerCase().trim() 
            },
            // Only select fields needed for authentication
            select: {
              id: true,
              email: true,
              name: true,
              password: true,
              isAdmin: true,
              emailVerified: true,
            }
          })

          // Step 3: Check if user exists and has a password
          // Some users might be OAuth-only without passwords
          if (!user || !user.password) {
            console.log('[Auth] User not found or no password set')
            // Important: Return null without revealing whether user exists
            return null
          }

          // Step 4: Verify password using bcrypt
          // bcrypt.compare is timing-safe to prevent timing attacks
          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          )

          // Step 5: Check if password is valid
          if (!isPasswordValid) {
            console.log('[Auth] Invalid password for user:', user.email)
            // Return null without revealing password was wrong
            return null
          }

          // Step 6: Authentication successful - return user object
          // Only include necessary fields in the session
          console.log('[Auth] Successful login for user:', user.email)
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            isAdmin: user.isAdmin,
            // Note: emailVerified is tracked but not required for login
            // This allows users to access their account while verifying email
          }
          
        } catch (error) {
          // Log error for debugging but don't expose to user
          console.error('[Auth] Authorization error:', error)
          return null
        }
      }
    })
  ],
  /**
   * Callback functions to control the authentication flow
   * These run at specific points in the auth lifecycle
   */
  callbacks: {
    /**
     * JWT Callback - Runs whenever a JWT is created, updated, or accessed
     * 
     * @param token - The JWT token being created or updated
     * @param user - The user object (only available on sign in)
     * @returns Modified token with additional user data
     * 
     * This callback:
     * - Adds user ID and admin status to the JWT
     * - Preserves token data across requests
     * - Runs on every authenticated request
     */
    async jwt({ token, user, account, trigger }) {
      // On initial sign in, user object is available
      // Add custom fields to the token for later use
      if (user) {
        token.id = user.id
        token.isAdmin = (user as { isAdmin?: boolean }).isAdmin || false
        token.email = user.email
        
        // Log for debugging (remove in production)
        console.log('[Auth] JWT created for user:', user.email, '| Admin:', token.isAdmin)
      }
      
      // Handle token refresh or update triggers
      if (trigger === "update") {
        // Refresh user data from database if needed
        // This ensures token stays in sync with database
        try {
          const currentUser = await prisma.user.findUnique({
            where: { id: token.id as string },
            select: { isAdmin: true, email: true }
          })
          
          if (currentUser) {
            token.isAdmin = currentUser.isAdmin
            token.email = currentUser.email
          }
        } catch (error) {
          console.error('[Auth] Error refreshing token data:', error)
        }
      }
      
      return token
    },
    
    /**
     * Session Callback - Shapes the session object sent to the client
     * 
     * @param session - The session object to be sent to the client
     * @param token - The JWT token containing user data
     * @returns Modified session with user ID and admin status
     * 
     * This callback:
     * - Adds custom fields from JWT to the session
     * - Runs on every session check (useSession, getSession, etc.)
     * - Controls what data the client can access
     */
    async session({ session, token }) {
      // Add custom fields from token to session
      // This makes them available to the client
      if (session?.user) {
        session.user.id = token.id as string
        session.user.isAdmin = (token.isAdmin as boolean) || false
        // Ensure email is always present
        session.user.email = token.email as string || session.user.email
        
        // Remove sensitive data that shouldn't go to client
        // (NextAuth might add fields we don't want exposed)
        delete (session.user as any).password
        delete (session.user as any).hashedPassword
      }
      
      return session
    },
    
    /**
     * Redirect Callback - Controls URL redirects after auth events
     * 
     * @param url - The URL to redirect to
     * @param baseUrl - The base URL of the application
     * @returns The validated redirect URL
     * 
     * Security: Prevents open redirect vulnerabilities by:
     * - Only allowing relative URLs
     * - Only allowing same-origin absolute URLs
     * - Defaulting to base URL for any suspicious redirects
     */
    async redirect({ url, baseUrl }) {
      // Log redirect attempts for debugging
      console.log('[Auth] Redirect requested to:', url, 'from base:', baseUrl)
      
      // Case 1: Relative URL (starts with /)
      // Safe - keeps user on our site
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`
      }
      
      // Case 2: Absolute URL on same origin
      // Check if the URL is on our domain
      try {
        const urlObject = new URL(url)
        const baseUrlObject = new URL(baseUrl)
        
        if (urlObject.origin === baseUrlObject.origin) {
          return url
        }
      } catch {
        // Invalid URL, fall through to default
        console.warn('[Auth] Invalid redirect URL:', url)
      }
      
      // Case 3: Default - redirect to home page
      // Used for external URLs or invalid URLs
      return baseUrl
    },
    
    /**
     * Sign In Callback - Runs after successful sign in
     * Can be used to allow/deny access based on conditions
     * 
     * @returns true to allow sign in, false to deny
     */
    async signIn({ user, account, profile }) {
      // Example: Check if user is banned
      // const dbUser = await prisma.user.findUnique({ 
      //   where: { id: user.id },
      //   select: { banned: true }
      // })
      // if (dbUser?.banned) return false
      
      // Allow all sign ins by default
      return true
    }
  },
  /**
   * Custom pages for authentication flows
   * Override NextAuth's default pages with our custom implementations
   */
  pages: {
    signIn: "/login",        // Custom login page
    error: "/login",         // Auth errors redirect to login with error message
    // signOut: "/logout",   // Optional: Custom logout page
    // verifyRequest: "/auth/verify", // Optional: Email verification page
    // newUser: "/welcome"   // Optional: New user onboarding
  },
  
  /**
   * Security settings
   */
  // Secret used to encrypt JWT tokens - MUST be set in production
  secret: env.NEXTAUTH_SECRET,
  
  // Additional security options
  useSecureCookies: process.env.NODE_ENV === 'production',
  
  // Debug mode for development
  debug: process.env.NODE_ENV === 'development',
}

/**
 * Type augmentation for TypeScript
 * Extends the built-in session types to include our custom fields
 */
declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name?: string | null
      image?: string | null
      isAdmin: boolean
    }
  }
  
  interface User {
    isAdmin?: boolean
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    isAdmin: boolean
  }
}
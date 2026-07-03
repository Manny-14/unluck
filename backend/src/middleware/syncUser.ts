import { Request, Response, NextFunction } from 'express';
import { prisma } from '../prisma';
import { clerkClient, getAuth } from '@clerk/express';

/**
 * Middleware that runs after Clerk's clerkMiddleware().
 * It ensures the user is authenticated and syncs them to our local SQLite database.
 * If they do not exist (first login), it fetches their profile from Clerk and creates a local record.
 */
export const syncUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const auth = getAuth(req);
    const userId = auth?.userId;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized: No Clerk User ID found' });
    }

    let user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      // First time user is hitting our API, fetch from Clerk
      const clerkUser = await clerkClient.users.getUser(userId);
      const email = clerkUser.emailAddresses[0]?.emailAddress || 'no-email@clerk.com';
      const name = `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || 'User';

      user = await prisma.user.create({
        data: {
          id: userId,
          email: email,
          name: name
        }
      });
    }

    // Attach local db user to request for convenience in route handlers
    // @ts-ignore
    req.dbUser = user;
    
    next();
  } catch (error) {
    console.error("Error in syncUser middleware:", error);
    res.status(500).json({ error: 'Internal Server Error during user sync' });
  }
};

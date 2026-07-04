import { Request, Response } from "express";
import * as identityService from "../services/identityService";

/**
 * Fetches the user's identities and their calculated experience levels.
 */
export async function getIdentitiesHandler(req: Request, res: Response) {
  try {
    // @ts-ignore
    const userId = req.dbUser.id;
    const data = await identityService.getIdentities(userId);
    return res.json(data);
  } catch (error: any) {
    console.error("Error fetching identities:", error);
    return res.status(500).json({ error: error.message });
  }
}

import { prisma } from "../prisma";

/**
 * Computes and returns all user identities along with their calculated 
 * levels based on the count of completely finished tasks.
 */
export async function getIdentities(userId: string) {
  const userIdentities = await prisma.identity.findMany({
    where: { userId },
  });

  const identitiesWithVotes = await Promise.all(
    userIdentities.map(async (identity) => {
      const votes = await prisma.task.count({
        where: { 
          identityId: identity.id,
          completedAt: { not: null } 
        },
      });

      let level = "Novice";
      if (votes >= 10) level = "Expert";
      else if (votes >= 5) level = "Amateur";
      else if (votes >= 2) level = "Beginner";

      return {
        id: identity.id,
        name: identity.name,
        level,
        votes,
      };
    })
  );

  return identitiesWithVotes;
}

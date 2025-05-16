import { prisma } from "@/lib/db";

export const getUserByEmail = async (email: string) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        email: email,
      },
      select: {
        name: true,
        emailVerified: true,
      },
    });

    return user;
  } catch (error) {
    console.error("Error in getUserByEmail:", error);
    return null;
  }
};

export const getUserById = async (id: string) => {
  try {
    const user = await prisma.user.findUnique({ 
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        emailVerified: true
      }
    });

    if (!user) {
      console.log("No user found with id:", id);
    }

    return user;
  } catch (error) {
    console.error("Error in getUserById:", error);
    return null;
  }
};
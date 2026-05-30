import { cache } from "react";
import { prisma } from "@/lib/prisma";
import type { AccessoryItem } from "@/types/api";

export const getActiveAccessories = cache(async (): Promise<AccessoryItem[]> => {
  const accessories = await prisma.accessory.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    select: {
      id: true,
      name: true,
      description: true,
      price: true,
      groupName: true,
      colorOptions: true,
      imageUrl: true,
      sortOrder: true,
    },
  });

  return accessories.map((accessory) => ({
    ...accessory,
    price: Number(accessory.price),
  }));
});

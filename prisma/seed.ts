import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Read admin password from environment, fallback only in development
  const adminPassword = process.env.ADMIN_SEED_PASSWORD;
  if (!adminPassword && process.env.NODE_ENV === "production") {
    throw new Error(
      "ADMIN_SEED_PASSWORD environment variable is required in production",
    );
  }
  const hashedPassword = await bcrypt.hash(adminPassword || "admin123", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@temanyoga.com" },
    update: {},
    create: {
      email: "admin@temanyoga.com",
      name: "Admin",
      password: hashedPassword,
      role: "ADMIN",
    },
  });
  console.log("Admin user created:", admin.email);

  // Create sample products
  const products = [
    {
      name: "Gantungan Kunci Kucing Lucu",
      slug: "gantungan-kunci-kucing-lucu",
      description:
        "Gantungan kunci handmade berbentuk kucing lucu, terbuat dari resin berkualitas tinggi dengan detail warna yang cantik.",
      price: 35000,
      stock: 50,
    },
    {
      name: "Gantungan Kunci Bunga Sakura",
      slug: "gantungan-kunci-bunga-sakura",
      description:
        "Gantungan kunci dengan desain bunga sakura elegan, cocok sebagai hadiah atau koleksi pribadi.",
      price: 45000,
      stock: 30,
    },
    {
      name: "Gantungan Kunci Custom Nama",
      slug: "gantungan-kunci-custom-nama",
      description:
        "Gantungan kunci yang bisa dicustom dengan nama kamu. Hadiah personal yang unik untuk orang tersayang.",
      price: 55000,
      stock: null, // unlimited — made to order
    },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {},
      create: product,
    });
    console.log("Product created:", product.name);
  }

  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

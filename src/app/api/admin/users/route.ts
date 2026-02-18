import { prisma } from "@/lib/prisma";
import {
  apiSuccess,
  unauthorized,
  badRequest,
  serverError,
  notFound,
} from "@/lib/api-response";
import { auth } from "@/lib/auth";
import { updateUserSchema, createUserSchema } from "@/lib/validations/user";
import bcrypt from "bcryptjs";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return unauthorized();
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: "asc" },
    });

    return apiSuccess(users);
  } catch (error) {
    console.error("GET /api/admin/users error:", error);
    return serverError();
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return unauthorized();
    }

    const body = await request.json();
    const parsed = createUserSchema.safeParse(body);

    if (!parsed.success) {
      return badRequest(parsed.error.issues[0].message);
    }

    const { email, name, password, role } = parsed.data;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return badRequest("Email sudah terdaftar");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return apiSuccess(user);
  } catch (error) {
    console.error("POST /api/admin/users error:", error);
    return serverError();
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return unauthorized();
    }

    const body = await request.json();
    const parsed = updateUserSchema.safeParse(body);

    if (!parsed.success) {
      return badRequest(parsed.error.issues[0].message);
    }

    const { email, name, password, role } = parsed.data;
    const targetUserId = body.id || session.user.id;

    // Prevent non-admins from updating other users or changing roles
    // and prevent changing own role to avoid self-lockout
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
    });
    if (currentUser?.role !== "ADMIN") {
      return unauthorized();
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        email,
        NOT: { id: targetUserId },
      },
    });

    if (existingUser) {
      return badRequest("Email sudah digunakan oleh pengguna lain");
    }

    const updateData: {
      email: string;
      name: string;
      password?: string;
      role?: "ADMIN" | "CUSTOMER";
    } = { email, name };

    if (password && password.length >= 6) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    if (role && targetUserId !== session.user.id) {
      updateData.role = role as "ADMIN" | "CUSTOMER";
    }

    const user = await prisma.user.update({
      where: { id: targetUserId },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return apiSuccess(user);
  } catch (error) {
    console.error("PATCH /api/admin/users error:", error);
    return serverError();
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return unauthorized();
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("id");

    if (!userId) {
      return badRequest("ID pengguna diperlukan");
    }

    if (userId === session.user.id) {
      return badRequest("Tidak dapat menghapus akun sendiri");
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return notFound("Pengguna");
    }

    await prisma.user.delete({
      where: { id: userId },
    });

    return apiSuccess({ deleted: true });
  } catch (error) {
    console.error("DELETE /api/admin/users error:", error);
    return serverError();
  }
}

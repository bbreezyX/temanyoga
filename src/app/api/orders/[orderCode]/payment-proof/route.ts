import { prisma } from "@/lib/prisma";
import { OrderStatus, NotificationType } from "@prisma/client";
import {
  apiSuccess,
  apiError,
  badRequest,
  notFound,
  serverError,
} from "@/lib/api-response";
import { uploadToR2 } from "@/lib/r2";
import { broadcastNotification } from "@/lib/notification-broadcast";
import { rateLimiters, getClientIp } from "@/lib/rate-limit";
import { sendWhatsAppToAdmin, getSiteSetting } from "@/lib/whatsapp";
import { paymentProofUploadedAdmin } from "@/lib/whatsapp-templates";
import { sendEmailToCustomer } from "@/lib/email";
import { paymentProofReceivedEmail } from "@/lib/email-templates";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export async function POST(
  request: Request,
  { params }: { params: Promise<{ orderCode: string }> },
) {
  try {
    const ip = getClientIp(request);
    const { success } = await rateLimiters.strict.limit(ip);
    if (!success) {
      return apiError("Too many requests. Please try again later.", 429);
    }

    const { orderCode } = await params;

    const order = await prisma.order.findUnique({
      where: { orderCode },
    });

    if (!order) return notFound("Order");

    if (
      order.status !== OrderStatus.PENDING_PAYMENT &&
      order.status !== OrderStatus.AWAITING_VERIFICATION
    ) {
      return badRequest(
        "Payment proof can only be uploaded for orders with PENDING_PAYMENT or AWAITING_VERIFICATION status",
      );
    }

    const formData = await request.formData();

    // Validate ownership via email
    const email = formData.get("email") as string | null;
    if (!email) {
      return badRequest("Email is required for verification");
    }
    if (email.toLowerCase().trim() !== order.customerEmail.toLowerCase()) {
      return badRequest("Email does not match order records");
    }

    const file = formData.get("file") as File | null;

    if (!file) return badRequest("File is required");
    if (!ALLOWED_TYPES.includes(file.type)) {
      return badRequest("Only JPEG, PNG, and WebP images are allowed");
    }
    if (file.size > MAX_FILE_SIZE) {
      return badRequest("File size must be less than 5MB");
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const { url, key } = await uploadToR2(buffer, "payment-proofs", file.type);

    const paymentProof = await prisma.$transaction(async (tx) => {
      const proof = await tx.paymentProof.create({
        data: {
          orderId: order.id,
          imageUrl: url,
          imageKey: key,
        },
      });

      await tx.order.update({
        where: { id: order.id },
        data: { status: OrderStatus.AWAITING_VERIFICATION },
      });

      return proof;
    });

    const notification = await prisma.notification.create({
      data: {
        type: NotificationType.PAYMENT_PROOF_UPLOADED,
        title: "Bukti Pembayaran Diunggah",
        message: `Bukti pembayaran untuk pesanan ${order.orderCode} dari ${order.customerName} menunggu verifikasi`,
        orderId: order.id,
      },
      include: {
        order: {
          select: {
            orderCode: true,
            customerName: true,
          },
        },
      },
    });

    broadcastNotification(notification);

    // Send WhatsApp notification to admin (fire-and-forget)
    sendWhatsAppToAdmin(
      paymentProofUploadedAdmin(order.orderCode, order.customerName)
    ).catch((err) => console.error("WA to admin failed:", err));

    // Send email confirmation to customer (fire-and-forget)
    const siteUrl =
      (await getSiteSetting("site_url")) || "https://temanyoga.com";
    const emailData = paymentProofReceivedEmail(
      order.orderCode,
      order.customerName,
      siteUrl
    );
    sendEmailToCustomer(
      order.customerEmail,
      emailData.subject,
      emailData.html,
      emailData.text,
    ).catch((err) => console.error("Email to customer failed:", err));

    return apiSuccess(
      {
        id: paymentProof.id,
        imageUrl: paymentProof.imageUrl,
        status: paymentProof.status,
      },
      201,
    );
  } catch (error) {
    console.error("POST /api/orders/[orderCode]/payment-proof error:", error);
    return serverError();
  }
}

import { prisma } from "@/lib/prisma";
import { OrderStatus, PaymentProofStatus } from "@prisma/client";
import {
  apiSuccess,
  badRequest,
  notFound,
  serverError,
} from "@/lib/api-response";
import { reviewPaymentProofSchema } from "@/lib/validations/payment-proof";
import { sendWhatsAppToCustomer, getSiteSetting } from "@/lib/whatsapp";
import {
  paymentApprovedCustomer,
  paymentRejectedCustomer,
} from "@/lib/whatsapp-templates";
import { sendEmailToCustomer } from "@/lib/email";
import {
  paymentApprovedEmail,
  paymentRejectedEmail,
} from "@/lib/email-templates";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = reviewPaymentProofSchema.safeParse(body);

    if (!parsed.success) {
      return badRequest(parsed.error.issues[0].message);
    }

    const proof = await prisma.paymentProof.findUnique({
      where: { id },
      include: { order: true },
    });

    if (!proof) return notFound("Payment proof");

    if (proof.status !== PaymentProofStatus.PENDING) {
      return badRequest("This payment proof has already been reviewed");
    }

    const result = await prisma.$transaction(async (tx) => {
      const updatedProof = await tx.paymentProof.update({
        where: { id },
        data: {
          status: parsed.data.status,
          notes: parsed.data.notes,
          reviewedAt: new Date(),
        },
      });

      // Update order status based on review result
      if (parsed.data.status === PaymentProofStatus.APPROVED) {
        await tx.order.update({
          where: { id: proof.orderId },
          data: { status: OrderStatus.PAID },
        });
      } else {
        // Rejected — revert to PENDING_PAYMENT so customer can re-upload
        await tx.order.update({
          where: { id: proof.orderId },
          data: { status: OrderStatus.PENDING_PAYMENT },
        });
      }

      return updatedProof;
    });

    // Send WhatsApp notification to customer (fire-and-forget)
    const siteUrl =
      (await getSiteSetting("site_url")) || "https://ditemaniyoga.com";

    if (parsed.data.status === PaymentProofStatus.APPROVED) {
      sendWhatsAppToCustomer(
        proof.order.customerPhone,
        paymentApprovedCustomer(
          proof.order.orderCode,
          proof.order.customerName,
          siteUrl,
        ),
      ).catch((err) => console.error("WA to customer failed:", err));

      const emailData = paymentApprovedEmail(
        proof.order.orderCode,
        proof.order.customerName,
        siteUrl,
      );
      sendEmailToCustomer(
        proof.order.customerEmail,
        emailData.subject,
        emailData.html,
        emailData.text,
      ).catch((err) => console.error("Email to customer failed:", err));
    } else {
      sendWhatsAppToCustomer(
        proof.order.customerPhone,
        paymentRejectedCustomer(
          proof.order.orderCode,
          proof.order.customerName,
          siteUrl,
          parsed.data.notes || undefined,
        ),
      ).catch((err) => console.error("WA to customer failed:", err));

      const emailData = paymentRejectedEmail(
        proof.order.orderCode,
        proof.order.customerName,
        siteUrl,
        parsed.data.notes || undefined,
      );
      sendEmailToCustomer(
        proof.order.customerEmail,
        emailData.subject,
        emailData.html,
        emailData.text,
      ).catch((err) => console.error("Email to customer failed:", err));
    }

    return apiSuccess(result);
  } catch (error) {
    console.error("PATCH /api/admin/payment-proofs/[id] error:", error);
    return serverError();
  }
}

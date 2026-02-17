import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  orderCreatedEmail,
  paymentProofReceivedEmail,
  paymentApprovedEmail,
  paymentRejectedEmail,
  orderShippedEmail,
  orderCompletedEmail,
  orderCancelledEmail,
} from "@/lib/email-templates";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session || session.user?.role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const template = searchParams.get("template");

  const mockOrder = {
    orderCode: "TY-123456",
    customerName: "Budi Santoso",
    customerPhone: "081234567890",
    totalAmount: 155000,
    shippingCost: 15000,
    discountAmount: 10000,
  };

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const settings = await prisma.siteSetting.findMany({
    where: {
      key: { in: ["bank_name", "bank_account_number", "bank_account_name"] },
    },
  });
  const settingsMap: Record<string, string> = {};
  for (const s of settings) settingsMap[s.key] = s.value;

  const mockBank = {
    bankName: settingsMap.bank_name || "BCA",
    accountNumber: settingsMap.bank_account_number || "1234567890",
    accountName: settingsMap.bank_account_name || "D'TEMAN YOGA Studio",
  };

  const mockTracking = {
    courier: "J&T Express",
    trackingNumber: "JT1234567890",
  };

  let emailData;

  switch (template) {
    case "order_created":
      emailData = orderCreatedEmail(mockOrder, siteUrl, mockBank);
      break;
    case "payment_received":
      emailData = paymentProofReceivedEmail(
        mockOrder.orderCode,
        mockOrder.customerName,
        siteUrl
      );
      break;
    case "payment_approved":
      emailData = paymentApprovedEmail(
        mockOrder.orderCode,
        mockOrder.customerName,
        siteUrl
      );
      break;
    case "payment_rejected":
      emailData = paymentRejectedEmail(
        mockOrder.orderCode,
        mockOrder.customerName,
        siteUrl,
        "Bukti pembayaran tidak terbaca atau tidak valid."
      );
      break;
    case "order_shipped":
      emailData = orderShippedEmail(
        mockOrder.orderCode,
        mockOrder.customerName,
        mockTracking,
        siteUrl
      );
      break;
    case "order_completed":
      emailData = orderCompletedEmail(
        mockOrder.orderCode,
        mockOrder.customerName
      );
      break;
    case "order_cancelled":
      emailData = orderCancelledEmail(
        mockOrder.orderCode,
        mockOrder.customerName
      );
      break;
    default:
      return new NextResponse("Template not found", { status: 404 });
  }

  return new NextResponse(emailData.html, {
    headers: {
      "Content-Type": "text/html",
    },
  });
}

import { prisma } from "@/lib/prisma";
import type { Product } from "@/generated/prisma/client";
import { NotificationType } from "@/generated/prisma/client";
import {
  apiSuccess,
  badRequest,
  serverError,
  rateLimited,
  insufficientStock,
  invalidCoupon,
} from "@/lib/api-response";
import { createOrderSchema } from "@/lib/validations/order";
import { generateOrderCode } from "@/lib/order-code";
import { broadcastNotification } from "@/lib/notification-broadcast";
import { rateLimiters, getClientIp } from "@/lib/rate-limit";
import { isAllowedShippingCourier } from "@/lib/shipping-couriers";
import {
  sendWhatsAppToCustomer,
  sendWhatsAppToAdmin,
} from "@/lib/whatsapp";
import {
  orderCreatedCustomer,
  orderCreatedAdmin,
} from "@/lib/whatsapp-templates";
import { sendEmailToCustomer } from "@/lib/email";
import { orderCreatedEmail } from "@/lib/email-templates";

type NormalizedAccessorySelection = {
  accessoryId: string;
  selectedColor: string | null;
};

function normalizeAccessorySelections(item: {
  accessorySelections?: { accessoryId: string; selectedColor?: string | null }[];
  accessoryIds?: string[];
}): NormalizedAccessorySelection[] {
  if (item.accessorySelections && item.accessorySelections.length > 0) {
    const uniqueSelections = new Map<string, NormalizedAccessorySelection>();

    for (const selection of item.accessorySelections) {
      if (!uniqueSelections.has(selection.accessoryId)) {
        uniqueSelections.set(selection.accessoryId, {
          accessoryId: selection.accessoryId,
          selectedColor: selection.selectedColor?.trim() || null,
        });
      }
    }

    return [...uniqueSelections.values()];
  }

  if (item.accessoryIds && item.accessoryIds.length > 0) {
    return Array.from(new Set(item.accessoryIds)).map((accessoryId) => ({
      accessoryId,
      selectedColor: null,
    }));
  }

  return [];
}

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const { success } = await rateLimiters.standard.limit(ip);
    if (!success) {
      return rateLimited(60);
    }

    const body = await request.json();
    const parsed = createOrderSchema.safeParse(body);

    if (!parsed.success) {
      return badRequest(parsed.error.issues[0].message);
    }

    const {
      items,
      shippingZoneId,
      destinationVillageCode,
      selectedCourierCode,
      selectedCourierName,
      couponCode,
      ...customerData
    } = parsed.data;
    const normalizedItems = items.map((item) => ({
      ...item,
      accessorySelections: normalizeAccessorySelections(item),
    }));

    // Fetch all products in one query
    const productIds = normalizedItems.map((item) => item.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, isActive: true },
    });

    // Validate all products exist
    if (products.length !== productIds.length) {
      const foundIds = new Set(products.map((p) => p.id));
      const missing = productIds.find((id) => !foundIds.has(id));
      return badRequest(`Product not found: ${missing}`);
    }

    // Validate stock
    const productMap = new Map<string, Product>(products.map((p) => [p.id, p]));
    for (const item of normalizedItems) {
      const product = productMap.get(item.productId)!;
      if (product.stock !== null && product.stock < item.quantity) {
        return insufficientStock(product.name, product.stock);
      }
    }

    // Collect all unique accessory IDs from all items
    const allAccessoryIds = new Set<string>();
    for (const item of normalizedItems) {
      for (const selection of item.accessorySelections) {
        allAccessoryIds.add(selection.accessoryId);
      }
    }

    // Fetch accessories if any were requested
    const accessoryMap = new Map<
      string,
      {
        id: string;
        name: string;
        price: number;
        groupName: string | null;
        colorOptions: string[];
        isActive: boolean;
      }
    >();
    if (allAccessoryIds.size > 0) {
      const accessories = await prisma.accessory.findMany({
        where: { id: { in: [...allAccessoryIds] } },
        select: {
          id: true,
          name: true,
          price: true,
          groupName: true,
          colorOptions: true,
          isActive: true,
        },
      });
      for (const a of accessories) accessoryMap.set(a.id, a);

      // Validate all accessories exist and are active
      for (const accId of allAccessoryIds) {
        const acc = accessoryMap.get(accId);
        if (!acc) return badRequest(`Aksesoris tidak ditemukan: ${accId}`);
        if (!acc.isActive)
          return badRequest(`Aksesoris "${acc.name}" tidak aktif`);
      }
    }

    // Validate group constraints and build order items
    let subtotal = 0;
    const orderItems: {
      productId: string;
      quantity: number;
      unitPriceSnapshot: number;
      productNameSnapshot: string;
      accessoriesSnapshot: string | null;
      accessoriesTotal: number;
    }[] = [];

    for (const item of normalizedItems) {
      const product = productMap.get(item.productId)!;
      const itemAccessories: {
        name: string;
        price: number;
        selectedColor: string | null;
      }[] = [];
      let accTotal = 0;

      if (item.accessorySelections.length > 0) {
        const groupSeen = new Map<string, string>();

        for (const selection of item.accessorySelections) {
          const acc = accessoryMap.get(selection.accessoryId)!;
          if (acc.groupName) {
            if (groupSeen.has(acc.groupName)) {
              return badRequest(
                `Hanya bisa pilih 1 aksesoris dari grup "${acc.groupName}" untuk produk "${product.name}"`,
              );
            }
            groupSeen.set(acc.groupName, acc.id);
          }

          if (acc.colorOptions.length > 0) {
            if (!selection.selectedColor) {
              return badRequest(`Pilih warna untuk aksesoris "${acc.name}" pada produk "${product.name}"`);
            }

            if (!acc.colorOptions.includes(selection.selectedColor)) {
              return badRequest(`Warna "${selection.selectedColor}" tidak tersedia untuk aksesoris "${acc.name}"`);
            }
          } else if (selection.selectedColor) {
            return badRequest(`Aksesoris "${acc.name}" tidak memiliki pilihan warna`);
          }

          itemAccessories.push({
            name: acc.name,
            price: acc.price,
            selectedColor: selection.selectedColor,
          });
          accTotal += acc.price;
        }
      }

      const itemTotal = (product.price + accTotal) * item.quantity;
      subtotal += itemTotal;

      orderItems.push({
        productId: item.productId,
        quantity: item.quantity,
        unitPriceSnapshot: product.price,
        productNameSnapshot: product.name,
        accessoriesSnapshot:
          itemAccessories.length > 0 ? JSON.stringify(itemAccessories) : null,
        accessoriesTotal: accTotal,
      });
    }

    // Validate and calculate coupon discount
    let couponId: string | null = null;
    let validCouponCode: string | null = null;
    let discountAmount = 0;

    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({
        where: { code: couponCode.toUpperCase().trim() },
      });

      if (!coupon || !coupon.isActive) {
        return invalidCoupon("Kode kupon tidak valid atau tidak aktif");
      }

      if (coupon.expiresAt && coupon.expiresAt < new Date()) {
        return invalidCoupon("Kode kupon sudah kedaluwarsa");
      }

      couponId = coupon.id;
      validCouponCode = coupon.code;

      if (coupon.discountType === "PERCENTAGE") {
        discountAmount = Math.floor((subtotal * coupon.discountValue) / 100);
      } else {
        discountAmount = Math.min(coupon.discountValue, subtotal);
      }
    }

    // Determine shipping cost based on mode (API courier vs fallback zone)
    let shippingCost: number;
    let shippingZoneSnapshot: string;
    let resolvedShippingZoneId: string | null = shippingZoneId ?? null;

    if (destinationVillageCode && selectedCourierCode) {
      // MODE API: re-verify price with api.co.id
      if (
        !isAllowedShippingCourier({
          courier_code: selectedCourierCode,
          courier_name: selectedCourierName,
        })
      ) {
        return badRequest("Kurir tidak tersedia untuk rute ini");
      }

      const weight = items.reduce((sum, item) => sum + item.quantity, 0) || 1;
      const originSetting = await prisma.siteSetting.findUnique({
        where: { key: "origin_village_code" },
      });

      if (!originSetting?.value) {
        return badRequest("Kode kelurahan asal belum dikonfigurasi");
      }

      const apiKey = process.env.API_CO_ID_KEY;
      if (!apiKey) {
        return badRequest("Konfigurasi cek ongkir belum lengkap");
      }

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);

      try {
        const url = new URL("https://use.api.co.id/expedition/shipping-cost");
        url.searchParams.set("origin_village_code", originSetting.value);
        url.searchParams.set("destination_village_code", destinationVillageCode.replace(/\./g, ""));
        url.searchParams.set("weight", String(weight));

        const apiRes = await fetch(url.toString(), {
          headers: { "x-api-co-id": apiKey },
          signal: controller.signal,
        });
        clearTimeout(timeout);

        if (!apiRes.ok) {
          return badRequest("Ongkir tidak dapat diverifikasi");
        }

        const apiData = await apiRes.json();
        if (!apiData.is_success || !apiData.data?.couriers) {
          return badRequest("Ongkir tidak dapat diverifikasi");
        }

        const courier = apiData.data.couriers.find(
          (c: { courier_code: string }) => c.courier_code === selectedCourierCode,
        );
        if (!courier || !isAllowedShippingCourier(courier) || courier.price <= 0) {
          return badRequest("Kurir tidak tersedia untuk rute ini");
        }

        shippingCost = courier.price;
        shippingZoneSnapshot = JSON.stringify({
          mode: "api",
          courier_code: courier.courier_code,
          courier_name: courier.courier_name || selectedCourierName || selectedCourierCode,
          price: courier.price,
          estimation: courier.estimation,
        });
        resolvedShippingZoneId = null;
      } catch (err) {
        clearTimeout(timeout);
        console.error("api.co.id verification failed:", err);
        return badRequest("Ongkir tidak dapat diverifikasi, silakan coba lagi");
      }
    } else if (shippingZoneId) {
      // MODE FALLBACK: use DB zone
      const shippingZone = await prisma.shippingZone.findUnique({
        where: { id: shippingZoneId },
      });
      if (!shippingZone || !shippingZone.isActive) {
        return badRequest("Zona pengiriman tidak valid atau tidak aktif");
      }
      shippingCost = shippingZone.price;
      shippingZoneSnapshot = JSON.stringify({
        mode: "fallback",
        name: shippingZone.name,
        price: shippingZone.price,
      });
    } else {
      return badRequest("Wajib pilih kurir atau zona pengiriman");
    }

    const totalAmount = subtotal - discountAmount + shippingCost;

    // Create order in transaction with stock decrement
    const order = await prisma.$transaction(async (tx) => {
      // Decrement stock for products with finite stock
      for (const item of normalizedItems) {
        const product = productMap.get(item.productId)!;
        if (product.stock !== null) {
          const updated = await tx.product.updateMany({
            where: {
              id: item.productId,
              stock: { gte: item.quantity },
            },
            data: {
              stock: { decrement: item.quantity },
            },
          });
          if (updated.count === 0) {
            throw new Error(`Insufficient stock for "${product.name}"`);
          }
        }
      }

      return tx.order.create({
        data: {
          orderCode: generateOrderCode(),
          ...customerData,
          totalAmount,
          shippingCost,
          shippingZoneId: resolvedShippingZoneId,
          shippingZoneSnapshot,
          couponId,
          couponCode: validCouponCode,
          discountAmount,
          items: { create: orderItems },
        },
        include: { items: true },
      });
    });

    const notification = await prisma.notification.create({
      data: {
        type: NotificationType.NEW_ORDER,
        title: "Pesanan Baru",
        message: `Pesanan baru dari ${order.customerName} senilai Rp ${order.totalAmount.toLocaleString("id-ID")}`,
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

    // Send WhatsApp notifications (fire-and-forget)
    const settings = await prisma.siteSetting.findMany({
      where: {
        key: {
          in: [
            "site_url",
            "bank_name",
            "bank_account_number",
            "bank_account_name",
          ],
        },
      },
    });

    const settingsMap: Record<string, string> = {};
    for (const s of settings) {
      settingsMap[s.key] = s.value;
    }

    const siteUrl = settingsMap.site_url || "https://ditemaniyoga.com";
    const bankData = {
      bankName: settingsMap.bank_name || "BCA",
      accountNumber: settingsMap.bank_account_number || "1234567890",
      accountName: settingsMap.bank_account_name || "D'TEMAN YOGA Studio",
    };

    const waOrderData = {
      orderCode: order.orderCode,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      totalAmount: order.totalAmount,
      shippingCost: order.shippingCost,
      discountAmount: order.discountAmount,
    };

    sendWhatsAppToCustomer(
      order.customerPhone,
      orderCreatedCustomer(waOrderData, siteUrl, bankData),
    ).catch((err) => console.error("WA to customer failed:", err));

    sendWhatsAppToAdmin(orderCreatedAdmin(waOrderData)).catch((err) =>
      console.error("WA to admin failed:", err),
    );

    // Send email notification to customer (fire-and-forget)
    const emailData = orderCreatedEmail(waOrderData, siteUrl, bankData);
    sendEmailToCustomer(
      order.customerEmail,
      emailData.subject,
      emailData.html,
      emailData.text,
    ).catch((err) => console.error("Email to customer failed:", err));

    return apiSuccess(
      {
        orderCode: order.orderCode,
        totalAmount: order.totalAmount,
        shippingCost: order.shippingCost,
        discountAmount: order.discountAmount,
        couponCode: order.couponCode,
        status: order.status,
        items: order.items,
      },
      201,
    );
  } catch (error) {
    console.error("POST /api/orders error:", error);
    if (
      error instanceof Error &&
      error.message.includes("Insufficient stock")
    ) {
      return badRequest(error.message);
    }
    return serverError();
  }
}

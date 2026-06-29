import { Order } from "@/types";

export interface NextAction {
    key: string;
    label: string;
    description: string;
    severity: "info" | "warning" | "danger" | "success";
    tabIndex?: number;
    ctaLabel?: string;
}

export interface OrderAlert {
    key: string;
    severity: "info" | "warning" | "danger";
    message: string;
}

export function resolveNextAction(order: Order): NextAction | null {
    if (order.paymentStatus === "not_yet_priced") {
        return {
            key: "not_yet_priced",
            label: "Tunggu Penentuan Harga",
            description: "Order ini belum memiliki harga. Tambahkan item untuk menentukan harga.",
            severity: "warning",
            tabIndex: 1,
            ctaLabel: "Lihat Items",
        };
    }

    if (
        order.requiresPaymentBeforeDelivery &&
        order.remainingAmount > 0 &&
        order.status === "ready"
    ) {
        return {
            key: "pay_before_delivery",
            label: "Selesaikan Pelunasan",
            description: "Order harus lunas sebelum dikirim.",
            severity: "danger",
            tabIndex: 2,
            ctaLabel: "Catat Pembayaran",
        };
    }

    if (
        order.canPay &&
        order.remainingAmount > 0 &&
        !["completed", "cancelled", "rejected"].includes(order.status)
    ) {
        return {
            key: "record_payment",
            label: "Catat Pembayaran",
            description: "Order memiliki tagihan yang belum dilunasi.",
            severity: "warning",
            tabIndex: 2,
            ctaLabel: "Catat Pembayaran",
        };
    }

    if (order.status === "ready_to_process" && order.completionPercentage === 0) {
        return {
            key: "start_production",
            label: "Mulai Produksi",
            description: "Order sudah siap diproses.",
            severity: "info",
            tabIndex: 1,
            ctaLabel: "Lihat Items",
        };
    }

    if (
        order.completionPercentage > 0 &&
        order.completionPercentage < 100 &&
        order.status === "in_progress"
    ) {
        return {
            key: "continue_production",
            label: "Lanjutkan Produksi",
            description: "Ada proses produksi yang belum selesai.",
            severity: "info",
            tabIndex: 1,
            ctaLabel: "Lihat Items",
        };
    }

    if (order.status === "ready" && order.deliveryType !== "walk_in") {
        return {
            key: "prepare_fulfillment",
            label: "Siapkan Pengiriman",
            description: "Order siap dan menunggu pengiriman atau pickup.",
            severity: "info",
        };
    }

    if (order.canScheduleDelivery) {
        return {
            key: "schedule_delivery",
            label: "Jadwalkan Pengiriman",
            description: "Pengiriman bisa dijadwalkan sekarang.",
            severity: "info",
        };
    }

    if (order.status === "completed" && order.paymentStatus === "paid") {
        return {
            key: "completed",
            label: "Order Selesai",
            description: "Tidak ada tindakan mendesak untuk saat ini.",
            severity: "success",
        };
    }

    return null;
}

export function resolveOrderAlerts(order: Order): OrderAlert[] {
    const alerts: OrderAlert[] = [];

    if (
        order.estimatedCompletion &&
        !["completed", "cancelled", "rejected"].includes(order.status)
    ) {
        const est = new Date(order.estimatedCompletion).getTime();
        const now = new Date().getTime();
        if (now > est) {
            alerts.push({
                key: "overdue",
                severity: "danger",
                message: "Order melewati estimasi selesai",
            });
        }
    }

    if (order.requiresPaymentBeforeDelivery && order.remainingAmount > 0) {
        alerts.push({
            key: "pay_before_delivery",
            severity: "danger",
            message: "Order harus lunas sebelum dikirim",
        });
    }

    if (order.paymentStatus === "not_yet_priced") {
        alerts.push({
            key: "not_yet_priced",
            severity: "warning",
            message: "Harga order belum ditentukan",
        });
    }

    if (
        order.remainingAmount > 0 &&
        order.paymentStatus !== "cod" &&
        !["completed", "cancelled", "rejected"].includes(order.status)
    ) {
        alerts.push({
            key: "unpaid",
            severity: "warning",
            message: "Masih ada sisa tagihan",
        });
    }

    if (order.status === "ready" && !order.canScheduleDelivery) {
        alerts.push({
            key: "cannot_schedule_delivery",
            severity: "warning",
            message: "Pengiriman belum bisa dijadwalkan",
        });
    }

    if (order.orderItems && order.orderItems.length === 0) {
        alerts.push({
            key: "no_items",
            severity: "warning",
            message: "Order belum memiliki item",
        });
    }

    if (
        order.deliveryType !== "walk_in" &&
        !order.pickupAddress &&
        !order.deliveryAddress
    ) {
        alerts.push({
            key: "no_address",
            severity: "info",
            message: "Alamat belum tersedia",
        });
    }

    if (order.customer && !order.customer.phone) {
        alerts.push({
            key: "no_phone",
            severity: "info",
            message: "Nomor telepon customer kosong",
        });
    }

    const severityOrder = { danger: 0, warning: 1, info: 2 };

    return alerts
        .sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity])
        .slice(0, 4);
}

import { Order, OrderItem } from "@/types";

export interface OrderItemsIndexProps {
    order: Order;
    orderItems: OrderItem[];
    isLoading?: boolean;
}

export interface OrderItemCardProps {
    item: any;
}

export interface ProcessDetailModalProps {
    process: any;
    isOpen: boolean;
    onClose: () => void;
}

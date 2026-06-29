import React from "react";
import { motion } from "framer-motion";
import { Card } from "@/Components/Card";
import { OrderSettingsProps } from "../types";

const OrderSettings: React.FC<OrderSettingsProps> = ({ order }) => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
        >
            <Card className="p-6">
                <h2
                    className="text-lg font-semibold mb-4"
                    style={{ color: "var(--color-text-primary)" }}
                >
                    Pengaturan Order
                </h2>
                <p style={{ color: "var(--color-text-secondary)" }}>
                    Tab ini akan menampilkan pengaturan order (ubah status, dll)
                </p>
            </Card>
        </motion.div>
    );
};

export default OrderSettings;

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/Components/Badge";
import CourierServiceRow from "./CourierServiceRow";

interface CourierCategoryAccordionItemProps {
    categoryName: string;
    services: any[];
    onToggleService: (service: any) => void;
}

const CourierCategoryAccordionItem: React.FC<CourierCategoryAccordionItemProps> = ({
    categoryName,
    services,
    onToggleService,
}) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const total = services.length;
    const activeCount = services.filter((s) => s.supportsCourier).length;

    return (
        <div className="border border-border rounded-xl overflow-hidden bg-surface">
            <div
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-surface-muted/50 transition-colors"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center gap-3">
                    <div className="w-1.5 h-6 bg-gradient-to-b from-indigo-500 to-indigo-600 rounded-full" />
                    <div>
                        <p className="text-sm font-bold text-text-primary uppercase tracking-tight">
                            {categoryName}
                        </p>
                        <p className="text-xs text-text-tertiary">
                            {total} Layanan
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Badge
                        variant={activeCount === total ? "success" : activeCount === 0 ? "secondary" : "warning"}
                        size="sm"
                        isGlass
                        className="text-[10px]"
                    >
                        {activeCount} / {total} Kurir
                    </Badge>
                    <motion.div
                        animate={{ rotate: isExpanded ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <ChevronDown className="w-4 h-4 text-text-tertiary" />
                    </motion.div>
                </div>
            </div>

            <motion.div
                initial={false}
                animate={{ height: isExpanded ? "auto" : 0, opacity: isExpanded ? 1 : 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden bg-surface-muted/10"
            >
                <div className="p-4 space-y-4 border-t border-border">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {services.map((service) => (
                            <CourierServiceRow
                                key={service.id}
                                service={service}
                                onToggle={onToggleService}
                            />
                        ))}
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default CourierCategoryAccordionItem;

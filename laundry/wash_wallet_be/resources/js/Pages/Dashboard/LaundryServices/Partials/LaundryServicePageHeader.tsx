import React from "react";
import { motion } from "framer-motion";
import { Shirt, ArrowLeft, Edit } from "lucide-react";
import { Button } from "@/Components/Button";
import { Badge } from "@/Components/Badge";
import { Card } from "@/Components/Card";
import { router } from "@inertiajs/react";
import { LaundryServicePageHeaderProps } from "../types";

const LaundryServicePageHeader: React.FC<LaundryServicePageHeaderProps> = ({
    laundryService,
    isLoading = false,
}) => {
    const handleBack = () => {
        router.visit(route("laundry-services.index"));
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <Card className="p-6">
                <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                        {/* Icon */}
                        <div
                            className="w-16 h-16 rounded-xl flex items-center justify-center"
                            style={{
                                backgroundColor: "var(--color-primary-100)",
                            }}
                        >
                            <Shirt
                                className="w-8 h-8"
                                style={{ color: "var(--color-primary-600)" }}
                            />
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-2">
                                <h1
                                    className="text-2xl font-bold truncate"
                                    style={{
                                        color: "var(--color-text-primary)",
                                    }}
                                >
                                    {laundryService.name}
                                </h1>
                                <Badge
                                    variant={
                                        laundryService.isActive
                                            ? "success"
                                            : "secondary"
                                    }
                                >
                                    {laundryService.isActive
                                        ? "Aktif"
                                        : "Nonaktif"}
                                </Badge>
                            </div>

                            <div className="flex items-center gap-2 text-sm flex-wrap">
                                <span
                                    style={{
                                        color: "var(--color-text-secondary)",
                                    }}
                                >
                                    {laundryService.category?.outlet?.name}
                                </span>
                                <span
                                    style={{
                                        color: "var(--color-text-tertiary)",
                                    }}
                                >
                                    •
                                </span>
                                <span
                                    style={{
                                        color: "var(--color-text-secondary)",
                                    }}
                                >
                                    {laundryService.category?.name}
                                </span>
                                <span
                                    style={{
                                        color: "var(--color-text-tertiary)",
                                    }}
                                >
                                    •
                                </span>
                                <span
                                    style={{
                                        color: "var(--color-text-secondary)",
                                    }}
                                >
                                    {laundryService.unit?.name} (
                                    {laundryService.unit?.symbol})
                                </span>
                            </div>

                            {laundryService.description && (
                                <p
                                    className="mt-2 text-sm line-clamp-2"
                                    style={{
                                        color: "var(--color-text-tertiary)",
                                    }}
                                >
                                    {laundryService.description}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3 ml-4">
                        <Button
                            variant="warning"
                            size="md"
                            onClick={() => router.visit(route('laundry-services.edit', laundryService.id))}
                            leftIcon={<Edit className="w-4 h-4" />}
                            disabled={isLoading}
                        >
                            Edit
                        </Button>
                        <Button
                            variant="outline"
                            size="md"
                            onClick={handleBack}
                            leftIcon={<ArrowLeft className="w-4 h-4" />}
                            disabled={isLoading}
                        >
                            Kembali
                        </Button>
                    </div>
                </div>
            </Card>
        </motion.div>
    );
};

export default LaundryServicePageHeader;

import React, { useState } from "react";
import { Card } from "@/Components/Card";
import { Button } from "@/Components/Button";
import { Copy, Check, Share2 } from "lucide-react";

interface ReferralCodeCardProps {
    referralCode: string | null;
}

export const ReferralCodeCard: React.FC<ReferralCodeCardProps> = ({ referralCode }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        if (!referralCode) return;
        try {
            await navigator.clipboard.writeText(referralCode);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error("Failed to copy text", err);
        }
    };

    if (!referralCode) {
        return (
            <Card>
                <div className="p-6 text-center">
                    <p className="text-sm text-secondary">
                        Kode referral belum digenerate untuk akun Anda.
                    </p>
                </div>
            </Card>
        );
    }

    return (
        <Card className="relative overflow-hidden bg-gradient-to-br from-info-50 to-primary-50 border-border dark:border-border">
            <div className="p-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="space-y-1 text-center md:text-left">
                        <h3 className="text-base font-semibold text-primary">
                            Undang Teman & Dapatkan Komisi
                        </h3>
                        <p className="text-xs text-secondary">
                            Bagikan kode referral Anda dan dapatkan komisi koin setiap kali mereka bertransaksi.
                        </p>
                    </div>

                    <div className="flex items-center gap-2 bg-surface p-1.5 rounded-lg border border-color shadow-sm w-full md:w-auto justify-between md:justify-start">
                        <span className="font-mono text-lg font-bold tracking-wider text-primary px-3">
                            {referralCode}
                        </span>
                        <Button
                            variant={copied ? "success" : "primary"}
                            size="sm"
                            onClick={handleCopy}
                            leftIcon={copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        >
                            {copied ? "Tersalin" : "Salin"}
                        </Button>
                    </div>
                </div>
            </div>
        </Card>
    );
};

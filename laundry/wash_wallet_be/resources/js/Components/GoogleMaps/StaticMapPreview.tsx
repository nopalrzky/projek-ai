import React, { useState } from "react";
import { MapPin, Loader2, AlertCircle } from "lucide-react";

interface StaticMapPreviewProps {
    latitude: number | null;
    longitude: number | null;
    apiKey: string;
    className?: string;
}

const StaticMapPreview: React.FC<StaticMapPreviewProps> = ({
    latitude,
    longitude,
    apiKey,
    className,
}) => {
    const [imgStatus, setImgStatus] = useState<'loading' | 'loaded' | 'error'>('loading');

    if (!latitude || !longitude || !apiKey) return null;

    const mapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${latitude},${longitude}&zoom=15&size=600x300&markers=color:red%7C${latitude},${longitude}&key=${apiKey}`;

    return (
        <div className={`relative rounded-xl overflow-hidden border border-[var(--color-border)] bg-[var(--color-gray-50)] min-h-[150px] flex items-center justify-center ${className}`}>
            {imgStatus === 'loading' && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-[var(--color-gray-50)]">
                    <Loader2 className="w-6 h-6 animate-spin text-[var(--color-primary-500)]" />
                </div>
            )}

            {imgStatus === 'error' ? (
                <div className="flex flex-col items-center justify-center p-6 text-center space-y-2">
                    <AlertCircle className="w-8 h-8 text-[var(--color-text-quaternary)]" />
                    <p className="text-xs font-medium text-[var(--color-text-secondary)]">
                        Gagal memuat pratinjau peta
                    </p>
                    <p className="text-[10px] text-[var(--color-text-tertiary)]">
                        Pastikan Static Maps API aktif di Google Console
                    </p>
                </div>
            ) : (
                <img 
                    src={mapUrl} 
                    alt="Lokasi Outlet" 
                    className={`w-full h-[150px] object-cover transition-opacity duration-300 ${imgStatus === 'loaded' ? 'opacity-100' : 'opacity-0'}`}
                    onLoad={() => setImgStatus('loaded')}
                    onError={() => setImgStatus('error')}
                />
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent pointer-events-none" />
            
            <div className="absolute bottom-3 left-3 flex items-center gap-2 px-2 py-1 bg-white/90 backdrop-blur-sm rounded-md shadow-sm border border-black/5 z-20">
                <MapPin className="w-3 h-3 text-[var(--color-error-500)]" />
                <span className="text-[10px] font-medium text-[var(--color-text-primary)]">
                    {latitude.toFixed(6)}, {longitude.toFixed(6)}
                </span>
            </div>
        </div>
    );
};

export default StaticMapPreview;

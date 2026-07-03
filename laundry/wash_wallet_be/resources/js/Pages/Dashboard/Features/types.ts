import { Feature, FeatureFilters, PaginationMeta } from "@/types";

export interface FeatureIndexProps {
    features: {
        data: Feature[];
        meta: PaginationMeta;
    };
    filters: FeatureFilters;
    flash?: {
        success?: string;
        error?: string;
    };
}

export interface FeatureCreateProps {}

export interface FeatureEditProps {
    feature: Feature;
}

export interface FeatureFormProps {
    feature?: Feature;
    data: any;
    setData: (key: any, value: any) => void;
    errors: any;
    processing: boolean;
    onSubmit: (e: React.FormEvent) => void;
}

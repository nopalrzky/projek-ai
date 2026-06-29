import { useState, useEffect, useCallback } from "react";

export const useOutletTabs = (outletId: number, defaultTab: number = 0) => {
    const tabStorageKey = `outlet-${outletId}-active-tab`;

    const [activeTab, setActiveTab] = useState(() => {
        const savedTab = localStorage.getItem(tabStorageKey);
        const parsed = savedTab ? parseInt(savedTab, 10) : defaultTab;
        return parsed > 12 ? 12 : parsed;
    });

    const handleTabChange = useCallback(
        (index: number) => {
            setActiveTab(index);
            localStorage.setItem(tabStorageKey, index.toString());
        },
        [tabStorageKey],
    );

    const setTabFromOutside = useCallback(
        (index: number) => {
            setActiveTab(index);
            localStorage.setItem(tabStorageKey, index.toString());
        },
        [tabStorageKey],
    );

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const tabParam = urlParams.get("tab");
        if (tabParam) {
            const tabIndex = parseInt(tabParam, 10);
            if (!isNaN(tabIndex) && tabIndex >= 0) {
                setActiveTab(tabIndex);
                localStorage.setItem(tabStorageKey, tabIndex.toString());
                window.history.replaceState({}, "", window.location.pathname);
            }
        }
    }, [tabStorageKey]);

    return {
        activeTab,
        handleTabChange,
        setTabFromOutside,
    };
};

export const TAB_INDICES = {
    OVERVIEW: 0,
    FEATURES_ACTIVATION: 1,
    OPERATIONAL_DAYS: 2,
    COURIER: 3,
    POSITIONS: 4,
    EMPLOYEES: 5,
    CUSTOMERS: 6,
    CATEGORIES: 7,
    LAUNDRY_SERVICES: 8,
    FINES: 9,
    MEMBERSHIP: 10,
    SERVICE_PACKAGES: 11,
    SETTINGS: 12,
} as const;

export const navigateToOutletTab = (outletId: number, tabIndex: number) => {
    const route = window.route;
    return route("outlets.show", outletId) + `?tab=${tabIndex}`;
};

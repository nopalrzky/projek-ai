import {
    Employee,
    Outlet,
    PaginationMeta,
    Permission,
    Position,
    PositionFilters,
} from "@/types";

/**
 * Position Index page props
 */
export interface PositionIndexProps {
    positions: {
        data: Position[];
        meta: PaginationMeta;
    };
    filterOptions: {
        outlets: Outlet[];
    };
    filters: PositionFilters;
    flash?: {
        success?: string;
        error?: string;
    };
}

/**
 * Position Create page props
 */
export interface PositionCreateProps {
    outlets: Outlet[];
    flash?: {
        success?: string;
        error?: string;
    };
}

/**
 * Position Edit page props
 */
export interface PositionEditProps {
    position: Position;
    outlets: Outlet[];
    flash?: {
        success?: string;
        error?: string;
    };
}

/**
 * Position Show page props
 */
export interface PositionShowProps {
    position: Position;
}

export interface PositionEmployeesProps {
    position: Position;
    employees: Employee[];
    onAddEmployee: () => void;
}

export interface PositionPermissionsProps {
    position: Position;
    permissions: Permission[];
    onPermissionChange?: (permissionId: number, granted: boolean) => void;
}

/**
 * Delete Position modal props
 */
export interface DeletePositionModalProps {
    isOpen: boolean;
    position?: Position;
    onClose: () => void;
    onConfirm: () => void;
    isLoading?: boolean;
}

export interface PositionPageHeaderProps {
    position: Position & {
        employeePositions?: any[];
    };
    isLoading?: boolean;
}
export interface PositionOverviewProps {
    position: Position;
}

export interface PositionOutletProps {
    position: Position;
}

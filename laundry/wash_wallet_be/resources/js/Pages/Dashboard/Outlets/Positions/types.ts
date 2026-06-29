import { Outlet, Position } from "@/types";
import { PermissionCatalogItem } from "@/types/permission";

export interface OutletPositionIndexProps {
    outlet: Outlet;
    isLoading?: boolean;
}

export interface PositionCreateProps {
    outlet: Outlet;
}

export interface PositionEditProps {
    outlet: Outlet;
    position: Position;
}

export interface PositionCreatePropsExtended extends PositionCreateProps {
    permissionCatalog: PermissionCatalogItem[];
}

export interface PositionEditPropsExtended extends PositionEditProps {
    permissionCatalog: PermissionCatalogItem[];
}

export interface DeletePositionModalProps {
    isOpen: boolean;
    position?: Position;
    onClose: () => void;
    onConfirm: (position: Position) => void;
    isLoading?: boolean;
}

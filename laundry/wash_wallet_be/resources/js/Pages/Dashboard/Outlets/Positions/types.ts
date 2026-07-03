import { Outlet, Position } from "@/types";
import { PermissionCatalogGroup } from "@/types/permission";

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
    permissionCatalog: PermissionCatalogGroup[];
}

export interface PositionEditPropsExtended extends PositionEditProps {
    permissionCatalog: PermissionCatalogGroup[];
}

export interface DeletePositionModalProps {
    isOpen: boolean;
    position?: Position;
    onClose: () => void;
    onConfirm: (position: Position) => void;
    isLoading?: boolean;
}

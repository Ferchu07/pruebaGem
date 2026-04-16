import { useCallback, useContext } from "react";
import { PrivilegeContext } from "../components/priviledge/PriviledgeProvider";
import { DropdownMenuItemsType, DropdownMenuItemType, PermissionRequired, PermissionsRequired } from "../type/menu-type";

// ----------------------------------------------------------
/**
 * EN: Hook to check if Menu items have access
 * ES: Hook para verificar si los elementos del menú tienen acceso
 * 
 * @returns function (permissionsRequired, dropdownItems) => boolean
 */
// ----------------------------------------------------------
export function useCheckMenuAccess() {
    const { userCan } = useContext(PrivilegeContext);

    const checkAccess = useCallback((
        permissionsRequired: PermissionsRequired | undefined,
        dropdownItems?: DropdownMenuItemsType | undefined | null
    ): boolean => {

        console.log(permissionsRequired, dropdownItems)

        let hasPermission = true;
        let childPermissionCount = 0;
        let hasChildPermission = !((dropdownItems?.length ?? 0) > 0);
        let subChildPermissionCount = 0;
        let hasSubChildPermission = true;

        if (permissionsRequired) {
            permissionsRequired.forEach((permission: PermissionRequired) => {
                if (!userCan(permission.action, permission.group, permission.isSuperAdmin || false)) {
                    hasPermission = false;
                }
            });
        }

        // Check if has at least one permission from children
        if (!hasChildPermission && dropdownItems && hasPermission) {
            hasSubChildPermission = false;

            dropdownItems.forEach((item: DropdownMenuItemType) => {
                if (!item.permissions_required || item.permissions_required.length === 0) {
                    hasChildPermission = true;
                } else if (item && item.permissions_required !== undefined) {
                    childPermissionCount += item.permissions_required.length;
                    for (const permission of item.permissions_required) {
                        if (userCan(permission.action, permission.group, permission.isSuperAdmin || false)) {
                            hasChildPermission = true;
                            break;
                        }
                    }
                }

                // Ahora verificamos los permisos en los subMenuItems
                if (item.subMenuItems) {
                    item.subMenuItems.forEach((subItem) => {
                        if (!subItem.permissions_required || subItem.permissions_required.length === 0) {
                            hasSubChildPermission = true;
                        } else if (subItem.permissions_required !== undefined) {
                            subChildPermissionCount += subItem.permissions_required.length;
                            for (const permission of subItem.permissions_required) {
                                if (userCan(permission.action, permission.group, permission.isSuperAdmin || false)) {
                                    hasSubChildPermission = true;
                                    break;
                                }
                            }
                        }
                    });
                }
            });

            if (subChildPermissionCount === 0) hasSubChildPermission = true;
            if (childPermissionCount === 0) hasChildPermission = true;
        }

        return hasPermission && hasChildPermission && hasSubChildPermission;
    }, [userCan]);

    return checkAccess;
}
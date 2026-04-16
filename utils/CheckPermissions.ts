import { usePrivilege } from "../components/priviledge/PriviledgeProvider";
import { PermissionsRequired } from "../type/menu-type";

export function CheckPermissions(permissions: PermissionsRequired) {
    let hasAllPermissions = false;
    let { userCan } = usePrivilege()

    permissions.forEach(permission => {
        if (userCan(permission.action, permission.group, permission.isSuperAdmin || false)) {
            hasAllPermissions = true;
        } else {
            hasAllPermissions = false;
            return false;
        }
    });

    return hasAllPermissions;
}
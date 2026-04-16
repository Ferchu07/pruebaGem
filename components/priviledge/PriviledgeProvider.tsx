// Priviledge provider to handle priviledge checking and state management to view and hide components based on user priviledges

import React, { useContext, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { AuthState, User, UserGrantAccess } from "../../redux/authSlice";
import { RootState } from "../../redux/store";
import { JWTDecoded, Permissions } from "../../type/jwt-type";

export type permissionsGroup = "companies" | "roles" | "user" | "dashboard" | "devices" | "vehicles" | "brands" | "models" | "vehicle_types" | "vehicle_subtypes" | "metrics";

type PrivilegeContextType = {
  permissions?: Permissions | null,
  roles?: string[],
  userCan: (action: string, group: permissionsGroup, superAdmin?: boolean) => boolean,
}

// Create default context
const PrivilegeContext: React.Context<PrivilegeContextType> = React.createContext<PrivilegeContextType>({
  permissions: {},
  roles: [],
  userCan: (action: string, group: permissionsGroup, superAdmin?: boolean): boolean => false,
});

type PrivilegeProviderProps = {
  children: React.ReactNode
}

const decode = (token: string) => {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace('-', '+').replace('_', '/');
  return JSON.parse(window.atob(base64));
}

export const isUser = (user: User | UserGrantAccess | null): user is User => {
  return !!user && (user as User).token !== undefined;
};

export const isUserGrantAccess = (user: User | UserGrantAccess | null): user is UserGrantAccess => {
  return !!user && (user as UserGrantAccess).user_id !== undefined;
};

// Create provider component
const PrivilegeProvider: React.FC<PrivilegeProviderProps> = ({ children }) => {
  const { user, hasToken }: AuthState = useSelector((state: RootState) => state.auth);
  const [permissions, setPermissions] = useState<Permissions | undefined | null>(undefined);
  const [roles, setRoles] = useState<string[] | undefined>([]);

  const resetState = () => {
    setPermissions(undefined);
    setRoles(undefined);
  }

  const decodeToken = async () => {
    if (user !== null && isUser(user)) {
      const decoded: JWTDecoded = decode(user?.token as string);
      setRoles(decoded.roles)
      setPermissions(decoded.permissions);
    }
  }

  // JWT token decode and configure state
  useEffect(() => {
    resetState();
    if (user && hasToken) {
      decodeToken();
    } else {
      setPermissions(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const userCan = (action: string, group: permissionsGroup, superAdmin?: boolean) => {
    if (permissions === undefined || permissions === null) {
      return false;
    }

    if (superAdmin && !roles?.includes("Superadministrador")) {
      return false;
    }

    if (permissions[group] && permissions[group].includes(action)) {
      return true;
    }

    return false;
  }

  // Define context and mount
  const value: PrivilegeContextType = {
    permissions: permissions,
    roles: roles,
    userCan
  }

  return (
    <>
      {permissions !== undefined
        ? <PrivilegeContext.Provider value={value}>{children}</PrivilegeContext.Provider>
        : <></>
      }
    </>
  )
}

export { PrivilegeContext, PrivilegeProvider };

export function usePrivilege() {
  return useContext(PrivilegeContext);
}
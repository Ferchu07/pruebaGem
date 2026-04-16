import { isUser } from "../components/priviledge/PriviledgeProvider";
import { User, UserRole } from "../type/entities/user-type";

export function test() {
  return null;
}

export function getOS() {
  const { userAgent } = window.navigator;
  const { platform } = window.navigator;
  const macosPlatforms = ["Macintosh", "MacIntel", "MacPPC", "Mac68K"];
  const windowsPlatforms = ["Win32", "Win64", "Windows", "WinCE"];
  const iosPlatforms = ["iPhone", "iPad", "iPod"];
  let os = null;

  if (macosPlatforms.indexOf(platform) !== -1) {
    os = "MacOS";
  } else if (iosPlatforms.indexOf(platform) !== -1) {
    os = "iOS";
  } else if (windowsPlatforms.indexOf(platform) !== -1) {
    os = "Windows";
  } else if (/Android/.test(userAgent)) {
    os = "Android";
  } else if (!os && /Linux/.test(platform)) {
    os = "Linux";
  }

  // @ts-ignore
  document.documentElement.setAttribute("os", os);
  return os;
}

export const hasNotch = () => {
  /**
   * For storybook test
   */
  const storybook = window.location !== window.parent.location;
  // @ts-ignore
  const iPhone = /iPhone/.test(navigator.userAgent) && !window.MSStream;
  const aspect = window.screen.width / window.screen.height;
  const aspectFrame = window.innerWidth / window.innerHeight;
  return (
    (iPhone && aspect.toFixed(3) === "0.462") ||
    (storybook && aspectFrame.toFixed(3) === "0.462")
  );
};

export const mergeRefs = (refs: any[]) => {
  return (value: any) => {
    refs.forEach((ref) => {
      if (typeof ref === "function") {
        ref(value);
      } else if (ref != null) {
        ref.current = value;
      }
    });
  };
};

export const randomColor = () => {
  const colors = [
    "primary",
    "secondary",
    "success",
    "info",
    "warning",
    "danger",
  ];

  const color = Math.floor(Math.random() * colors.length);

  return colors[color];
};

export const priceFormat = (price: number) => {
  return price.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });
};

export const priceFormatEuro = (price: number) => {
  return price.toLocaleString("es-ES", {
    style: "currency",
    currency: "EUR",
    currencyDisplay: "symbol",
  });
};

export const average = (array: any[]) =>
  array.reduce((a, b) => a + b) / array.length;

export const percent = (value1: number, value2: number) => {
  let percentageChange;

  if (value2 !== 0) {
    percentageChange = Number(((value1 / value2 - 1) * 100).toFixed(2));
  } else {
    // Manejar el caso cuando value2 es 0, tal vez asignar un valor predeterminado
    percentageChange = 100; // O cualquier valor que desees en este caso
  }

  return percentageChange;
};

export const getFirstLetter = (text: string, letterCount = 2): string =>
  // @ts-ignore
  text
    .toUpperCase()
    .match(/\b(\w)/g)
    .join("")
    .substring(0, letterCount);

export const debounce = (func: (arg0: any) => void, wait = 1000) => {
  let timeout: string | number | NodeJS.Timeout | undefined;

  return function executedFunction(...args: any[]) {
    const later = () => {
      clearTimeout(timeout);
      // @ts-ignore
      func(...args);
    };

    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

export const getUserRoles = (user: any) => {
  if (!isUser(user) || user.roles.length === 0) return null;

  return user.roles
    .filter((role: string) => role !== "ROLE_USER")
    .map((role: string) => role);
};

export const getUserRolesByObject = (user: User) => {
  if (user?.userRoles?.length === 0) return null;

  return user?.userRoles?.map((role: UserRole) => role.role.name);
};
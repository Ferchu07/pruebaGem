import anticontaminacionIcon from "../../../../../../assets/Iconos/Menu_seleccion_ECUs/anticontaminacion.png";
import anticontaminacionGrayIcon from "../../../../../../assets/Iconos/Menu_seleccion_ECUs/anticontaminacion_gris.png";
import aireComprimidoIcon from "../../../../../../assets/Iconos/Menu_seleccion_ECUs/aire_comprimido.png";
import aireComprimidoGrayIcon from "../../../../../../assets/Iconos/Menu_seleccion_ECUs/aire_comprimido_gris.png";
import cajaCambiosIcon from "../../../../../../assets/Iconos/Menu_seleccion_ECUs/caja_cambios.png";
import cajaCambiosGrayIcon from "../../../../../../assets/Iconos/Menu_seleccion_ECUs/caja_cambios_gris.png";
import computadorCentralIcon from "../../../../../../assets/Iconos/Menu_seleccion_ECUs/computador_central.png";
import computadorCentralGrayIcon from "../../../../../../assets/Iconos/Menu_seleccion_ECUs/computador_central_gris.png";
import direccionIcon from "../../../../../../assets/Iconos/Menu_seleccion_ECUs/direccion.png";
import direccionGrayIcon from "../../../../../../assets/Iconos/Menu_seleccion_ECUs/direccion_gris.png";
import frenoIcon from "../../../../../../assets/Iconos/Menu_seleccion_ECUs/freno.png";
import frenoGrayIcon from "../../../../../../assets/Iconos/Menu_seleccion_ECUs/freno_gris.png";
import instrumentacionIcon from "../../../../../../assets/Iconos/Menu_seleccion_ECUs/instrumentacion.png";
import instrumentacionGrayIcon from "../../../../../../assets/Iconos/Menu_seleccion_ECUs/instrumentacion_gris.png";
import moduloCarroceroIcon from "../../../../../../assets/Iconos/Menu_seleccion_ECUs/modulo_carrocero.png";
import moduloCarroceroGrayIcon from "../../../../../../assets/Iconos/Menu_seleccion_ECUs/modulo_carrocero_gris.png";
import modulosAdicionalesIcon from "../../../../../../assets/Iconos/Menu_seleccion_ECUs/modulos_adicionales.png";
import modulosAdicionalesGrayIcon from "../../../../../../assets/Iconos/Menu_seleccion_ECUs/modulos_adicionales_gris.png";
import motorIcon from "../../../../../../assets/Iconos/Menu_seleccion_ECUs/motor.png";
import motorGrayIcon from "../../../../../../assets/Iconos/Menu_seleccion_ECUs/motor_gris.png";
import personalizacionIcon from "../../../../../../assets/Iconos/Menu_seleccion_ECUs/personalizacion.png";
import presionNeumaticosIcon from "../../../../../../assets/Iconos/Menu_seleccion_ECUs/presion_neumaticos.png";
import presionNeumaticosGrayIcon from "../../../../../../assets/Iconos/Menu_seleccion_ECUs/presion_neumaticos_gris.png";
import propulsionIcon from "../../../../../../assets/Iconos/Menu_seleccion_ECUs/propulsion.png";
import propulsionGrayIcon from "../../../../../../assets/Iconos/Menu_seleccion_ECUs/propulsion_gris.png";
import seguridadIcon from "../../../../../../assets/Iconos/Menu_seleccion_ECUs/seguridad.png";
import seguridadGrayIcon from "../../../../../../assets/Iconos/Menu_seleccion_ECUs/seguridad_gris.png";
import suspensionIcon from "../../../../../../assets/Iconos/Menu_seleccion_ECUs/suspension.png";
import suspensionGrayIcon from "../../../../../../assets/Iconos/Menu_seleccion_ECUs/suspension_gris.png";
import telematicaIcon from "../../../../../../assets/Iconos/Menu_seleccion_ECUs/telematica.png";
import telematicaGrayIcon from "../../../../../../assets/Iconos/Menu_seleccion_ECUs/telematica_gris.png";
import { normalizeText } from "./helpers";

export interface EcuIconPair {
  active: string;
  inactive: string;
}

export const ECU_ICON_BY_KEY: Record<string, EcuIconPair> = {
  PERSONALIZAR: { active: personalizacionIcon, inactive: personalizacionIcon },
  MOTOR: { active: motorIcon, inactive: motorGrayIcon },
  FRENOS: { active: frenoIcon, inactive: frenoGrayIcon },
  CAJA_CAMBIOS: { active: cajaCambiosIcon, inactive: cajaCambiosGrayIcon },
  PRESION_NEUMATICOS: { active: presionNeumaticosIcon, inactive: presionNeumaticosGrayIcon },
  COMPUTADOR_CENTRAL: { active: computadorCentralIcon, inactive: computadorCentralGrayIcon },
  ANTICONTAMINACION: { active: anticontaminacionIcon, inactive: anticontaminacionGrayIcon },
  DIRECCION: { active: direccionIcon, inactive: direccionGrayIcon },
  INSTRUMENTACION: { active: instrumentacionIcon, inactive: instrumentacionGrayIcon },
  AIRE_COMPRIMIDO: { active: aireComprimidoIcon, inactive: aireComprimidoGrayIcon },
  MODULO_CARROCERO: { active: moduloCarroceroIcon, inactive: moduloCarroceroGrayIcon },
  PROPULSION: { active: propulsionIcon, inactive: propulsionGrayIcon },
  TELEMATICA: { active: telematicaIcon, inactive: telematicaGrayIcon },
  SEGURIDAD: { active: seguridadIcon, inactive: seguridadGrayIcon },
  SUSPENSION: { active: suspensionIcon, inactive: suspensionGrayIcon },
  MODULOS_ADICIONALES: { active: modulosAdicionalesIcon, inactive: modulosAdicionalesGrayIcon },
};

export const resolveEcuIcon = (name: string): EcuIconPair => {
  const normalized = normalizeText(name).replace(/\s+/g, "_");
  if (normalized.includes("MOTOR")) return ECU_ICON_BY_KEY.MOTOR;
  if (normalized.includes("FRENO")) return ECU_ICON_BY_KEY.FRENOS;
  if (normalized.includes("CAJA") && normalized.includes("CAMBIO")) return ECU_ICON_BY_KEY.CAJA_CAMBIOS;
  if (normalized.includes("PRESION") && normalized.includes("NEUMATIC")) return ECU_ICON_BY_KEY.PRESION_NEUMATICOS;
  if (normalized.includes("COMPUTADOR") || normalized.includes("COMPUTER")) return ECU_ICON_BY_KEY.COMPUTADOR_CENTRAL;
  if (normalized.includes("ANTICONTAMIN")) return ECU_ICON_BY_KEY.ANTICONTAMINACION;
  if (normalized.includes("DIRECCION")) return ECU_ICON_BY_KEY.DIRECCION;
  if (normalized.includes("INSTRUMENT")) return ECU_ICON_BY_KEY.INSTRUMENTACION;
  if (normalized.includes("AIRE") && normalized.includes("COMPRIM")) return ECU_ICON_BY_KEY.AIRE_COMPRIMIDO;
  if (normalized.includes("CARROCER")) return ECU_ICON_BY_KEY.MODULO_CARROCERO;
  if (normalized.includes("PROPULS")) return ECU_ICON_BY_KEY.PROPULSION;
  if (normalized.includes("TELEMATIC")) return ECU_ICON_BY_KEY.TELEMATICA;
  if (normalized.includes("SEGURIDAD")) return ECU_ICON_BY_KEY.SEGURIDAD;
  if (normalized.includes("SUSPENSION")) return ECU_ICON_BY_KEY.SUSPENSION;
  if (normalized.includes("MODULO") && normalized.includes("ESPEC")) return ECU_ICON_BY_KEY.MODULOS_ADICIONALES;
  return ECU_ICON_BY_KEY.MODULOS_ADICIONALES;
};


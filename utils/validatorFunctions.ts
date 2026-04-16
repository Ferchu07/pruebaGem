// Validación robusta de DNI (2025)
export function validateDNI(value: string): boolean {
  if (!value) return false;
  const dniRegex = /^\d{8}[A-Z]$/i;
  if (!dniRegex.test(value)) return false;
  const number = value.slice(0, 8);
  const letter = value.slice(8, 9).toUpperCase();
  const letters = "TRWAGMYFPDXBNJZSQVHLCKE";
  const index = parseInt(number, 10) % 23;
  return letters.charAt(index) === letter;
}

// Validación robusta de NIE (2025)
export function validateNIE(value: string): boolean {
  if (!value) return false;
  const nieRegex = /^[XYZ]\d{7}[A-Z]$/i;
  if (!nieRegex.test(value)) return false;
  let nie = value.toUpperCase();
  let prefix = nie.charAt(0);
  let number = '';
  switch (prefix) {
    case 'X': number = '0' + nie.slice(1, 8); break;
    case 'Y': number = '1' + nie.slice(1, 8); break;
    case 'Z': number = '2' + nie.slice(1, 8); break;
    default: return false;
  }
  const letter = nie.slice(8, 9);
  const letters = "TRWAGMYFPDXBNJZSQVHLCKE";
  const index = parseInt(number, 10) % 23;
  return letters.charAt(index) === letter;
}

// Validación robusta de CIF (2025, revisada)
export function validateCIF(cif: string): boolean {
  if (!cif) return false;
  cif = cif.toUpperCase().replace(/\s|-/g, "");
  const cifRegex = /^[ABCDEFGHJKLMNPQRSUVW]\d{7}[0-9A-J]$/;
  if (!cifRegex.test(cif)) {
    return false;
  }
  const letter = cif[0];
  const digits = cif.slice(1, 8);
  const control = cif.slice(-1);
  let sumaPar = 0;
  let sumaImpar = 0;
  for (let i = 0; i < 7; i++) {
    let n = parseInt(digits[i], 10);
    if ((i + 1) % 2 === 0) {
      sumaPar += n;
    } else {
      let doble = n * 2;
      sumaImpar += doble > 9 ? doble - 9 : doble;
    }
  }
  const total = sumaPar + sumaImpar;
  const unidad = total % 10;
  const controlDigit = (unidad === 0) ? 0 : 10 - unidad;
  const controlLetters = "JABCDEFGHI";
  // Tipos de entidades que usan letra, dígito o ambos
  if (/[ABEH]/.test(letter)) {
    return control === String(controlDigit);
  } else if (/[KPQS]/.test(letter)) {
    return control === controlLetters[controlDigit];
  } else {
    return control === String(controlDigit) || control === controlLetters[controlDigit];
  }
}

// Validador conjunto para DNI, NIE y CIF (2025)
export function validateDniNieCif(value: string): boolean {
  return validateDNI(value) || validateNIE(value) || validateCIF(value);
}

// Validación de número de Seguridad Social (SS) (2025)
export function validateSS(numeroSS: string): boolean {
  const cleanNum = numeroSS.replace(/\s/g, '');
  if (!/^\d{12}$/.test(cleanNum)) {
    return false;
  }
  const baseNum = cleanNum.slice(0, 10);
  const controlDigits = cleanNum.slice(10);
  const baseNumInt = parseInt(baseNum, 10);
  if (baseNumInt < 0 || baseNumInt > 9999999999) {
    return false;
  }
  const calculateControl = ('0' + (baseNumInt % 97)).slice(-2);
  return calculateControl === controlDigits;
}

export function validateNotWhitespace(value: string) {
  if (value && value.trim() === '') {
    return false;
  }
  return true;
}
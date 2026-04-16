import * as yup from 'yup';
import { validateDniNieCif, validateSS } from './utils/validatorFunctions';


yup.addMethod(yup.string, 'isValidCifNif', function (message = 'El CIF/NIF no es válido') {
    return this.test('valid-cif-nif', message, function (value) {
        if (value !== undefined && value !== null && value.length > 0) {
            return validateDniNieCif(value);
        }
        return true;
    });
});

yup.addMethod(yup.string, 'isValidSS', function (message = 'El número de la SS no es válido') {
    return this.test('valid-ss', message, function (value) {
        if (value !== undefined && value !== null && value.length > 0) {
            return validateSS(value);
        }
        return true;
    });
});

export default yup;
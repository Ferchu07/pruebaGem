import { useFormik } from "formik";
import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button, Password, Text } from "rizzui";
import { toast } from "sonner";
import * as yup from 'yup';
import fullLogo from '../../assets/full_logo.png';
import { menuRoutes } from "../../router/menu";
import { LoginService } from "../../services/auth/loginService";
import cn from "../../utils/classNames";

const schema = yup.object({
    password: yup.string()
        .required('Requerido')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])/, 'La contraseña debe contener al menos una letra mayúscula, una minúscula y un número'),
    passwordRepeat: yup.string().required('Requerido').test('passwords-match', 'Las contraseñas no coinciden', function (value) {
        const { password } = this.parent as { password: string };
        if (password && value) {
            return value === password;
        }
        return true;
    }),
});


const InitialPassword = () => {

    // STATES

    const [isLoading, setIsLoading] = useState(false);

    // HOOKS

    const [searchParams] = useSearchParams();
    const activationToken = searchParams.get("activation_token");
    const navigate = useNavigate();

    // FUNCTIONS

    // ------------------------------------------------------------------------------------------------------
    /**
     * @ES CAMBIA LA CONTRASEÑA INICIAL DEL USUARIO
     * @EN SETS THE INITIAL PASSWORD OF THE USER    
     * 
     * @param password 
     * @param passwordRepeat 
     * @returns 
     */
    // ------------------------------------------------------------------------------------------------------
    const handleSetInitialPassword = async (password: string, passwordRepeat: string) => {
        setIsLoading(true);
        const response = await (await (new LoginService()).setInitialPassword(activationToken || '', password, passwordRepeat)).getResponseData();

        if (!response?.success) {
            toast.error(response?.message || 'Error al cambiar la contraseña. Por favor, inténtalo de nuevo más tarde.');
            setIsLoading(false);
            return;
        }

        if (response && response.success) {
            toast.success('Contraseña cambiada con éxito.');
            navigate(menuRoutes.auth.login);
            setIsLoading(false);
            return;
        }
    };
    // ------------------------------------------------------------------------------------------------------

    // FORMIK

    const formik = useFormik({
        enableReinitialize: true,
        initialValues: {
            password: '',
            passwordRepeat: '',
        },
        validationSchema: schema,
        validateOnChange: false,
        onSubmit: (values) => { handleSetInitialPassword(values.password, values.passwordRepeat) },
    });

    // RENDER

    return (
        <div className="relative min-h-screen">
            <div className=' w-full flex-col justify-center p-4 md:p-12 lg:p-28'>
                <div className={cn('mx-auto w-full max-w-md rounded-xl px-4 py-9 flex flex-col justify-center',)}>
                    <div className='flex flex-col justify-center text-center mb-5'>
                        <Link to='/' className={'flex justify-center items-center mb-5'}>
                            <img src={fullLogo} height={'30vh'} alt="Logo de Rother" />
                        </Link>

                        <Text className="text-2xl font-bold text-gray-800">
                            Establece una nueva contraseña
                        </Text>
                    </div>

                    <form onSubmit={formik.handleSubmit}>
                        <div className="space-y-5">

                            <Password
                                id='password'
                                label="Nueva contraseña"
                                placeholder="Nueva contraseña"
                                size="lg"
                                className="[&>label>span]:font-medium"
                                inputClassName="text-sm"
                                value={formik.values.password}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                error={formik.errors.password}
                            />

                            <Password
                                id='passwordRepeat'
                                label="Repetir contraseña"
                                placeholder="Repite tu contraseña"
                                size="lg"
                                className="[&>label>span]:font-medium"
                                inputClassName="text-sm"
                                value={formik.values.passwordRepeat}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                error={formik.errors.passwordRepeat}
                            />

                            <Button className="w-full" type="submit" size="lg" disabled={isLoading} isLoading={isLoading}>
                                Restablecer contraseña
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default InitialPassword;
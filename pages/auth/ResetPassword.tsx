import { useFormik } from 'formik';
import { FC, useContext, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button, Password, Text } from 'rizzui';
import { toast } from 'sonner';
import * as yup from 'yup';
import fullLogo from '../../assets/full_logo.png';
import logo from '../../assets/rother_logo.png';
import Spinner from '../../components/bootstrap/Spinner';
import { PrivilegeContext } from '../../components/priviledge/PriviledgeProvider';
import { RootState } from '../../redux/store';
import { LoginService } from '../../services/auth/loginService';
import cn from '../../utils/classNames';

const ResetPasswordSchema = yup.object({
    password: yup.string().required('La contraseña es obligatoria').min(8, 'La contraseña debe tener al menos 8 caracteres').max(30, 'Lacontraseña no puede excederse de 30 caracteres')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])/, 'La contraseña debe contener al menos una letra mayúscula, una minúscula y un número'),
    password_confirmation: yup.string().required('La confirmación de contraseña obligatoria').oneOf([yup.ref('password'), ''], 'Contraseñas no coinciden'),
});

const ForgotPassword: FC = () => {

    const navigate = useNavigate();
    const { userCan } = useContext(PrivilegeContext);
    const userToken = new URLSearchParams(useLocation().search).get('token');
    const { isAuthenticated } = useSelector((state: RootState) => state.auth);

    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!isAuthenticated) return;
        navigate(userCan('get_dashboard_information', 'dashboard') ? '/dashboard' : '/users', { replace: true });
    }, [isAuthenticated, navigate, userCan]);

    const handleResetPassword = async (userToken: string, password: string, password_confirmation: string) => {
        setIsLoading(true);
        const response = await (await (new LoginService()).resetForgotPassword(userToken, password, password_confirmation)).getResponseData();

        if (!response.success) {
            toast.error(response.message);
            setIsLoading(false);
            return;
        }

        if (response.success) {
            try {
                navigate('/login', { replace: true });
                toast.success('Contraseña actualizada con éxito');
            } catch (error) {
                toast.error('Error al actualizar la contraseña');
                return;
            } finally {
                setIsLoading(false);
            }
        }
    };

    const formik = useFormik({
        enableReinitialize: true,
        initialValues: {
            password: '',
            password_confirmation: ''
        },
        validationSchema: ResetPasswordSchema,
        validateOnChange: false,
        onSubmit: (values) => {
            if (userToken && userToken.length > 10) {
                handleResetPassword(userToken, values.password, values.password_confirmation);
            } else {
                toast.error('Token inválido o nulo.');
            }
        },
    });

    return (
        <div className="relative min-h-screen">
            <div className="float-start">
                <Link to='/' className={'flex justify-center items-center m-5'}>
                    <img src={fullLogo} width={'150px'} alt="Logo de Rother" />
                </Link>
            </div>

            <div className=' w-full flex-col justify-center p-4 md:p-12 lg:p-28'>
                <div className={cn('mx-auto w-full max-w-md rounded-xl px-4 py-9 sm:px-6 md:max-w-xl md:px-10 md:py-12 lg:max-w-[500px] lg:px-16 xl:rounded-2xl 3xl:rounded-3xl',)}>
                    <div className='text-center mb-5'>
                        <Link to='/' className={'flex justify-center items-center mb-5'}>
                            <img src={logo} height={'30vh'} alt="Logo de Rother" />
                        </Link>
                        <Text className="text-2xl font-bold text-gray-800 mt-5 mb-3">Actualiza tu contraseña</Text>
                        <Text className="text-sm text-gray-500">Por favor, introduce tu nueva contraseña.</Text>
                    </div>

                    <form onSubmit={formik.handleSubmit}>
                        <div className="space-y-5">
                            <Password
                                id='password'
                                label="Contraseña"
                                placeholder="Introduce tu contraseña"
                                size="lg"
                                className="[&>label>span]:font-medium"
                                inputClassName="text-sm"
                                value={formik.values.password}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                error={formik.errors.password}
                            />

                            <Password
                                id='password_confirmation'
                                label="Confirmar Contraseña"
                                placeholder="Confirma tu contraseña"
                                size="lg"
                                className="[&>label>span]:font-medium"
                                inputClassName="text-sm"
                                value={formik.values.password_confirmation}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                error={formik.errors.password_confirmation}
                            />

                            <Button className="w-full" type="submit" size="lg" disabled={isLoading}>
                                {isLoading ? <Spinner /> : 'Resetear contraseña'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;

import { useFormik } from 'formik';
import { FC, useContext, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Input, Text } from 'rizzui';
import { toast } from 'sonner';
import fullLogo from '../../assets/full_logo.png';
import logo from '../../assets/rother_logo.png';
import Spinner from '../../components/bootstrap/Spinner';
import { PrivilegeContext } from '../../components/priviledge/PriviledgeProvider';
import { RootState } from '../../redux/store';
import { LoginService } from '../../services/auth/loginService';
import cn from '../../utils/classNames';

const ForgotPassword: FC = () => {

    const navigate = useNavigate();
    const { userCan } = useContext(PrivilegeContext);
    const { isAuthenticated } = useSelector((state: RootState) => state.auth);

    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!isAuthenticated) return;
        navigate(userCan('get_dashboard_information', 'dashboard') ? '/dashboard' : '/users', { replace: true });
    }, [isAuthenticated, navigate, userCan]);

    const handleEmailForgotPassword = async (username: string) => {
        setIsLoading(true);
        const response = await (await (new LoginService()).sendEmailForgotPassword(username)).getResponseData();

        if (!response.success) {
            toast.error(response.message);
            setIsLoading(false);
            return;
        }

        if (response.success) {
            try {
                navigate('/login', { replace: true });
                toast.success('Email enviado. Por favor revise su correo.');
            } catch (error) {
                toast.error('Error sending email. Please try again later.');
                return;
            } finally {
                setIsLoading(false);
            }
        }
    };

    const formik = useFormik({
        enableReinitialize: true,
        initialValues: { loginUsername: '' },
        validate: (values) => {
            const errors: { loginUsername?: string; loginPassword?: string } = {};
            if (!values.loginUsername) {
                errors.loginUsername = 'Requerido';
            }
            return errors;
        },
        validateOnChange: false,
        onSubmit: (values) => { handleEmailForgotPassword(values.loginUsername) },
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
                        <Link to='/' className={'flex justify-center items-center mb-5  w-full'}>
                            <img src={logo} height={'30vh'} alt="Logo de Rother" />
                        </Link>
                        <Text className="text-2xl font-bold text-gray-800 mt-5 mb-3">¿Has olvidado tu contraseña?</Text>
                        <Text className="text-sm text-gray-500">Introduce tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.</Text>
                    </div>

                    <form onSubmit={formik.handleSubmit}>
                        <div className="space-y-5">
                            <Input
                                id='loginUsername'
                                type="email"
                                size="lg"
                                label="Email"
                                placeholder="Introducte tu email"
                                className="[&>label>span]:font-medium"
                                inputClassName="text-sm"
                                onChange={formik.handleChange}
                                error={formik.errors.loginUsername}
                            />

                            <Button className="w-full" type="submit" size="lg" disabled={isLoading}>
                                {isLoading ? <Spinner /> : 'Enviar email de recuperación'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;

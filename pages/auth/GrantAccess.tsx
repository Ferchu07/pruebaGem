import { useFormik } from 'formik';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Text } from 'rizzui';
import { toast } from 'sonner';
import fullLogo from '../../assets/full_logo.png';
import CustomSelect from '../../components/forms/CustomSelect';
import { isUserGrantAccess } from '../../components/priviledge/PriviledgeProvider';
import { User, login, logout } from '../../redux/authSlice';
import { AppDispatch, RootState } from '../../redux/store';
import { menuRoutes } from '../../router/menu';
import { LoginService } from '../../services/auth/loginService';
import cn from '../../utils/classNames';

interface GrantAccessProps { }

const GrantAccess: React.FC<GrantAccessProps> = ({ }) => {

    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();
    const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

    const [isLoading, setIsLoading] = useState(false);
    const [companies, setCompanies] = useState<{ value: string, label: string }[]>([]);

    const handleLogin = async (companyId: string) => {
        setIsLoading(true);
        if (!isUserGrantAccess(user)) return;
        const response = await (await (new LoginService()).authUserGrantAccess(companyId, user?.user_id, user?.provisional_code)).getResponseData();

        try {
            const user: User = {
                token: response.data.token,
                id: response.data.user.id,
                email: response.data.user.email,
                name: response.data.user.name,
                lastName: response.data.user.lastName,
                profileImage: response.data.user.imgProfile,
                roles: response.data.user.roles,
                roleId: response.data.user.roleId,
                companyName: response.data.user.companyName || '',
                companyCif: response.data.user.companyCif || '',
                companyId: response.data.user.loggedCompany || '',
                multiCompany: true, // Indicating that the user can access multiple companies
            };

            // dispatch login action
            dispatch(login({
                user: user,
                isAuthenticated: true,
                hasToken: true,
                loading: false,
                error: null,
            }));

            navigate(menuRoutes.dashboard.path, { replace: true });
        } catch (error) {
            toast.error(response?.message || 'Error al iniciar sesión. Por favor, inténtalo de nuevo más tarde.');
            return;
        } finally {
            setIsLoading(false);
        }
    };

    const formik = useFormik({
        enableReinitialize: true,
        initialValues: {
            companyId: '',
        },
        validate: (values) => {
            const errors: { companyId?: string } = {};

            if (!values.companyId) {
                errors.companyId = 'Requerido';
            }

            return errors;
        },
        validateOnChange: false,
        onSubmit: (values) => { handleLogin(values.companyId) },
    });

    useEffect(() => {
        if (!isAuthenticated) {
            navigate(menuRoutes.auth.login, { replace: true });
        }
    }, [isAuthenticated, navigate]);

    useEffect(() => {
        if (user && user.companies && user.companies.length > 0) {
            setCompanies(user.companies.map((c: any) => ({ value: c.company.id, label: `${c.company.name} - ${c.company.cif}` })));
        }
    }, [user]);

    return (
        <div className="relative min-h-screen">
            <div className=' w-full flex-col justify-center p-4 md:p-20 lg:p-52'>
                <div className={cn('mx-auto w-full max-w-md rounded-xl px-4 py-9 flex flex-col justify-center',)}>
                    <div className='flex flex-col justify-center text-center mb-5'>
                        <Link to='/' className={'flex justify-center items-center mb-5'}>
                            <img src={fullLogo} height={'30vh'} alt="Logo de Rother" />
                        </Link>

                        <Text className="text-2xl font-bold text-gray-800">Selecciona la empresa</Text>
                    </div>

                    <form onSubmit={formik.handleSubmit}>
                        <div className="space-y-5">
                            <CustomSelect
                                id={'companyId'}
                                isSearchable
                                value={{ value: formik.values.companyId, label: companies.find(c => c.value === formik.values.companyId)?.label || '' }}
                                options={companies}
                                onChange={(e: any) => { formik.setFieldValue('companyId', e?.value) }}
                                error={formik.errors.companyId}
                                containerClassName='my-5'
                            />

                            <Button className="w-full" type="submit" size="lg" disabled={isLoading} isLoading={isLoading}>
                                Acceder
                            </Button>
                        </div>
                    </form>
                    <div className="text-center mt-5">
                        <Link to='/login' className="font-semibold text-gray-700 transition-colors hover:text-gray-1000" onClick={() => { dispatch(logout()) }}>
                            Cambiar de usuario
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GrantAccess;

import { useFormik } from 'formik';
import { FC, useContext, useEffect, useState } from 'react';
import { ReactComponent as InfoIcon } from '../../assets/Iconos/Interfaz/ver.svg';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Checkbox, Input, Password, Text, Tooltip } from 'rizzui';
import { toast } from 'sonner';
import fullLogo from '../../assets/full_logo.png';
import { PrivilegeContext } from '../../components/priviledge/PriviledgeProvider';
import { User, UserGrantAccess, login } from '../../redux/authSlice';
import { AppDispatch, RootState } from '../../redux/store';
import { menuRoutes } from '../../router/menu';
import { LoginService } from '../../services/auth/loginService';
import cn from '../../utils/classNames';

const Login: FC = () => {

  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { userCan } = useContext(PrivilegeContext);
  const { isAuthenticated, hasToken } = useSelector((state: RootState) => state.auth);

  const [isLoading, setIsLoading] = useState(false);
  const [remindMe, setRemindMe] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;

    if (!hasToken) {
      navigate(menuRoutes.auth.grant_access, { replace: true });
      return;
    }

    if (userCan('get_dashboard_information', 'dashboard')) {
      navigate(menuRoutes.dashboard.path, { replace: true });
      return;
    }

    navigate(menuRoutes.users.path, { replace: true });
  }, [hasToken, isAuthenticated, navigate, userCan]);

  const handleLogin = async (username: string, password: string) => {
    setIsLoading(true);
    const response = await (await (new LoginService()).authUserCredentials(username, password, remindMe)).getResponseData();

    if (!response?.success) {
      toast.error(response?.message || 'Error al iniciar sesión. Por favor, inténtalo de nuevo más tarde.');
      setIsLoading(false);
      dispatch(login({
        user: null,
        isAuthenticated: false,
        hasToken: false,
        loading: false,
        error: response?.message || 'Error al iniciar sesión. Por favor, inténtalo de nuevo más tarde.',
      }))
      return;
    }

    if (response && response.success) {
      if (response.data?.token) {
        // store data in indexDb for service worker.
        try {
          //saveUser(response.data);
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
            companyId: response.data.user.loggedCompany || '',
            companyCif: response.data.user.companyCif || '',
          };

          // dispatch login action
          dispatch(login({
            user: user,
            isAuthenticated: true,
            hasToken: true,
            loading: false,
            error: null,
          }))
        } catch (error) {
          toast.error('Error guardando usuario en indexDb');
          return;
        } finally {
          setIsLoading(false);
        }
      } else {
        // store data in indexDb for service worker.
        try {
          const user: UserGrantAccess = {
            user_id: response.data.user_id,
            companies: response.data.companies,
            provisional_code: response.data.provisional_code,
            companyId: response.data.companyId,
            roles: response.data.roles
          };

          // dispatch login action
          dispatch(login({
            user: user,
            isAuthenticated: true,
            hasToken: false,
            loading: false,
            error: null,
          }))
        } catch (error) {
          toast.error('Error saving user to indexDb');
          return;
        } finally {
          setIsLoading(false);
        }
      }
    }
  };

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      loginUsername: '',
      loginPassword: '',
    },
    validate: (values) => {
      const errors: { loginUsername?: string; loginPassword?: string } = {};

      if (!values.loginUsername) {
        errors.loginUsername = 'Requerido';
      }

      if (!values.loginPassword) {
        errors.loginPassword = 'Requerido';
      }

      return errors;
    },
    validateOnChange: false,
    onSubmit: (values) => { handleLogin(values.loginUsername, values.loginPassword) },
  });

  return (
    <div className="relative min-h-screen">
      <div className=' w-full flex-col justify-center p-4 md:p-12 lg:p-28'>
        <div className={cn('mx-auto w-full max-w-md rounded-xl px-4 py-9 flex flex-col justify-center',)}>
          <div className='flex flex-col justify-center text-center mb-5'>
            <Link to='/' className={'flex justify-center items-center mb-5'}>
              <img src={fullLogo} height={'30vh'} alt="Logo de Rother" />
            </Link>

            <Text className="text-2xl font-bold text-gray-800">Entra con tus credenciales</Text>
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

              <Password
                id='loginPassword'
                label="Contraseña"
                placeholder="Introduce tu contraseña"
                size="lg"
                className="[&>label>span]:font-medium"
                inputClassName="text-sm"
                value={formik.values.loginPassword}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.errors.loginPassword}
              />

              <Checkbox
                id='remindMe'
                label={
                  <Tooltip
                    size="md"
                    content={<div className='tooltip-container'>La duración de tu sesión será de 24 horas</div>}
                    placement="top"
                    color="invert"
                  >
                    <div className={'flex ms-1'}>
                      Recuérdame <InfoIcon className='w-5 h-5 text-primary ms-2' />
                    </div>
                  </Tooltip>
                }
                checked={remindMe}
                onChange={() => setRemindMe(!remindMe)}
                className="text-sm"
              />

              <Button className="w-full" type="submit" size="lg" disabled={isLoading} isLoading={isLoading}>
                Iniciar Sesión
              </Button>
            </div>
          </form>
          <Text className="mt-5 text-center text-[15px] leading-loose text-gray-500 md:mt-7 lg:mt-9 lg:text-base">
            ¿No recuerdas la contraseña?{' '}
            <Link to='/forgot-password' className="font-semibold text-gray-700 transition-colors hover:text-gray-1000">
              Recupérala
            </Link>
          </Text>
        </div>
      </div>
    </div>
  );
};

export default Login;

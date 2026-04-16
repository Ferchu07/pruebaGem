import { ReactComponent as InicioIcon } from '../../assets/Iconos/Interfaz/inicio.svg';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Button, Title } from 'rizzui';
import fullLogo from '../../assets/full_logo.png';
import NotFound from '../../assets/images/NotFound.png';
import { RootState } from '../../redux/store';
import { menuRoutes } from '../../router/menu';

export default function Page404() {
    const user = useSelector((state: RootState) => state.auth);

    return (
        <div className="flex min-h-screen flex-col bg-[#F8FAFC]">
            <div className="sticky top-0 z-40 flex justify-center py-5 backdrop-blur-lg lg:backdrop-blur-none xl:py-10">
                <Link to="/">
                    <img src={fullLogo} alt="Logo de Rother" className='max-w-[150px]' />
                </Link>
            </div>

            <div className="flex grow items-center px-6 xl:px-10">
                <div className="mx-auto text-center">
                    <img src={NotFound} alt="Imagen 404" className="mx-auto mb-8 max-w-[70%] md:max-w-[40%] lg:max-w-[25%] lg:mb-12 2xl:mb-16" />
                    <Title
                        as="h1"
                        className="text-[22px] font-bold leading-normal text-gray-1000 lg:text-3xl"
                    >
                        Lo sentimos, la página no se encuentra
                    </Title>
                    <p className="mt-3 text-sm leading-loose text-gray-500 lg:mt-6 lg:text-base lg:leading-loose">
                        La página que estás buscando no existe,
                        <br className="hidden sm:inline-block" />
                        o quizás fue movida a otro lugar.
                    </p>
                    <Link to={(user.isAuthenticated && menuRoutes.dashboard.path) || '/'}>
                        <Button
                            as="span"
                            size="xl"
                            color="primary"
                            className="mt-8 h-12 px-4 xl:h-14 xl:px-6"
                        >
                            <InicioIcon className="mr-1.5 text-lg w-5 h-5 brightness-0 invert" />
                            Volver al Inicio
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import FormCard from '../../../components/card/FormCard';
import useHandleErrors from '../../../hooks/useHandleErrors';
import { menuRoutes } from '../../../router/menu';
import { OrganisationService } from '../../../services/organisation/organisationService';
import OrganisationForm from '../OrganisationForm';
import { useSetAtom } from 'jotai';
import { headerConfigAtom } from '../../../atoms/headerAtoms';
import { ReactComponent as OrganisationCreateIcon } from "../../../assets/Iconos/Interfaz/nueva_organizacion.svg";

const pageHeader = {
	title: 'Crear Organización',
	breadcrumb: [
		{ name: 'Administración' },
		{ name: 'Control de acceso' },
		{ href: menuRoutes.organisations.path, name: 'Organizaciones' },
		{ name: 'Crear' },
	],
};

export default function OrganisationCreate() {

	// HOOKS

	const { handleErrors } = useHandleErrors();
	const navigate = useNavigate();

	// STATES

	const [loading, setLoading] = useState<boolean>(false);

	// ATOMS 
	
	const setHeaderConfig = useSetAtom(headerConfigAtom); 

	const handleSubmit = async (values: any) => {
		setLoading(true);
		const formData = new FormData();
		for (let value in values) {
			if (values[value]) {
				formData.append(value, values[value]);
			}
		}

		try {
			const response = await (await (new OrganisationService()).createOrganisation(formData)).getResponseData();
			if (response.success) {
				navigate(-1);
				toast.success(response.message || 'Organización creada correctamente');
			} else {
				handleErrors(response);
			}
		} catch (error: any) {
			toast.error('Error al crear la organización');
		} finally {
			setLoading(false);
		}
	};

	// USE EFFECT 

	useEffect(() => {

        // CONFIGURE HEADER TITLE AND ICON

        setHeaderConfig({
            title: "NUEVA ORGANIZACIÓN",
            icon: <OrganisationCreateIcon className="app-sub-icon" />,
            breadcrumbs: [
                { label: 'Inicio', path: '/' },
				{ label: "Control de acceso", path: undefined },
                { label: 'Organizaciones', path: '/organisations' },
                { label: "Crear", path: '/organisations/create', active: true },
            ]
        });

        // CLEANUP EFFECT

        return () => {
            setHeaderConfig(null);
        };
    
    }, [navigate, setHeaderConfig]);

	// RENDER

	return (
		<>
			<FormCard title='Datos Principales' className='mb-4'>
				<OrganisationForm submit={handleSubmit} isLoading={loading} />
			</FormCard>
		</>
	);
}
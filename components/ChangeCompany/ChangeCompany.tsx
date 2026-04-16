import { useFormik } from "formik";
import { FC, useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import useFetch from "../../hooks/useFetch";
import { useWindowDimensions } from "../../hooks/useWindowDimensions";
import { User, login } from "../../redux/authSlice";
import { UserService } from "../../services/user/userService";
import AsyncImg from "../extras/AsyncImg";
import CustomSelect from "../forms/CustomSelect";

const ChangeCompany: FC = () => {

    // HOOKS 

    const dispatch = useDispatch();
    const currentUser = useSelector((state: any) => state.auth.user);

    // FETCH DATA
    const fetchCompanies = useCallback(async () => {
        try {
            const userService = new UserService();
            const response = await userService.listCompanies();
            return response.getResponseData();
        } catch (error) {
            console.error('Error fetching data:', error);
            return null;
        }
    }, [currentUser?.id]);

    const [data, loading, error] = useFetch(fetchCompanies);

    const formik = useFormik({
        initialValues: {
            companySelected: currentUser?.companyId || "",
        },
        onSubmit: async (values) => {
            try {
                const response = await (new UserService()).changeActiveCompany(values.companySelected);
                const responseData = response.getResponseData();

                if (!responseData.success) {
                    toast.error(responseData.message);
                    return;
                }

                const user: User = {
                    token: responseData.data.token,
                    id: responseData.data.user.id,
                    email: responseData.data.user.email,
                    name: responseData.data.user.name,
                    lastName: responseData.data.user.lastName,
                    profileImage: responseData.data.user.imgProfile,
                    roles: responseData.data.user.roles,
                    roleId: responseData.data.user.roleId,
                    companyName: responseData.data.user.companyName || '',
                    companyCif: responseData.data.user.companyCif || '',
                    companyId: responseData.data.user.loggedCompany || '',
                    multiCompany: true, // Indicating that the user can access multiple companies
                };

                dispatch(login({
                    user: user,
                    isAuthenticated: true,
                    hasToken: true,
                    loading: false,
                    error: null,
                }))

                toast.success('Has cambiado de compañía correctamente');
            } catch (error) {
                console.error('Error al cambiar de compañía:', error);
                toast.error('Error al cambiar de compañía');
            }
        },
    });

    useEffect(() => {
        if (data && data.length > 0) {
            const currentCompany = data.find((c: any) => c.id === currentUser?.companyId) || 
                                 data.find((c: any) => c.name === currentUser?.companyName) || 
                                 data[0];
            
            if (currentCompany) {
                formik.setFieldValue("companySelected", currentCompany.id);
            }
        }
    }, [data, currentUser]);

    // Preparar las opciones para CustomSelect
    const companyOptions = data ? data.map((companyData: any) => ({
        value: companyData.id,
        label: companyData.name,
        image: companyData.logo
    })) : [];

    // Encontrar la opción seleccionada basada en formik
    const selectedOption = companyOptions.find((option: any) => option.value === formik.values.companySelected);

    // RENDER

    if (currentUser?.roles?.includes('Superadministrador')) return null;

    if (error) return <div className="text-white text-sm">Error al cargar</div>;

    return (
        <div className="relative inline-block text-left w-full">
            <CustomSelect
                isLoading={loading}
                isDisabled={loading || !data || data.length === 0}
                placeholder={(!data || data.length === 0) ? "No hay compañías" : "Seleccionar empresa"}
                id="companySelect"
                // key={formik.values.companySelected || "companySelect-key"} // Eliminamos key para evitar re-montaje innecesario
                isMulti={false}
                value={selectedOption || null} // Usamos value controlado
                options={companyOptions}
                onChange={(selected: any) => {
                    if (selected) {
                        formik.setFieldValue('companySelected', selected.value);
                        formik.submitForm();
                    }
                }}
                formatOptionLabel={(option: any) => (
                    <div className="flex items-center">
                        <AsyncImg
                            id={option.image}
                            className="rounded-full w-6 h-6 mr-2"
                        />
                        <span>{option.label}</span>
                    </div>
                )}
                formatSingleValueLabel={(option: any) => (
                    <div className="flex items-center">
                        <AsyncImg
                            id={option.image}
                            className="rounded-full w-6 h-6 mr-2"
                        />
                        <span>{option.label}</span>
                    </div>
                )}
            />
        </div>
    );
}

export default ChangeCompany;
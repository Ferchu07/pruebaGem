import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Loader } from "rizzui";
import { toast } from "sonner";
import FormCard from "../../../components/card/FormCard";
import useFetch from "../../../hooks/useFetch";
import useHandleErrors from "../../../hooks/useHandleErrors";
import PageHeader from "../../../layout/shared/page-header";
import { menuRoutes } from "../../../router/menu";
import { OrganisationService } from "../../../services/organisation/organisationService";
import { OrganisationApiResponse } from "../../../type/entities/organisation-type";
import OrganisationForm from "../OrganisationForm";
import { useSetAtom } from "jotai";
import { headerConfigAtom } from "../../../atoms/headerAtoms";
import { ReactComponent as EditarIcon } from '../../../assets/Iconos/Interfaz/perfil_organizacion.svg';

export default function OrganisationEdit() {

  // HOOKS

  const { id = "" } = useParams<{ id: string }>();
  const { handleErrors } = useHandleErrors();
  const navigate = useNavigate();
  const service = new OrganisationService();

  // STATES

  const [loading, setLoading] = useState<boolean>(false);

  // ATOMS 

  const setHeaderConfig = useSetAtom(headerConfigAtom); 

  // FUNCTIONS

  // ----------------------------------------------------------------------------------------------
  /**
   * @ES OBTIENE LOS DATOS DE UNA ORGANIZACIÓN POR SU ID
   * @EN GETS THE DATA OF AN ORGANISATION BY ITS ID
   * 
   * @param id 
   * @returns 
   */
  // ----------------------------------------------------------------------------------------------
  const [data] = useFetch(useCallback(async () => {
    if (!id) return;
    const response = await service.getOrganisationById(id as string);
    return response.getResponseData() as OrganisationApiResponse;
  }, [id]));
  // ----------------------------------------------------------------------------------------------

  // ----------------------------------------------------------------------------------------------
  /**
   * @ES MANEJA EL ENVÍO DEL FORMULARIO DE EDICIÓN DE UNA ORGANIZACIÓN
   * @EN HANDLES THE SUBMISSION OF THE ORGANISATION EDIT FORM
   * 
   * @param values 
   */
  // ----------------------------------------------------------------------------------------------
  const handleSubmit = async (values: any) => {
    setLoading(true);
    const formData = new FormData();
    for (let value in values) {
      if (values[value]) {
        formData.append(value, values[value]);
      }
    }

    try {
      const response = await (await service.editOrganisation(formData, true)).getResponseData();
      if (response.success) {
        navigate(-1);
        toast.success(response.message || "Organización editada correctamente");
      } else {
        handleErrors(response);
      }
    } catch (error: any) {
      toast.error("Error al editar la organización");
    } finally {
      setLoading(false);
    }
  };
  // ----------------------------------------------------------------------------------------------

  // USE EFFECT
    
  useEffect(() => {

      if (data === null || data === undefined) return;

      // CONFIGURE HEADER TITLE AND ICON

      setHeaderConfig({
          title: `EDITAR ORGANIZACIÓN: ${data?.name || ""}`,
          icon: <EditarIcon className="app-sub-icon w-8 h-8" />,
          breadcrumbs: [
              { label: 'Inicio', path: '/' },
              { label: "Control de acceso", path: undefined },
              { label: 'Organizaciones', path: '/organisations' },
              { label: "Editar", path: `/organisations/${id}/edit`, active: true },
          ]
      });

      // CLEANUP EFFECT

      return () => {
          setHeaderConfig(null);
      };
  
  }, [navigate, setHeaderConfig]);

  // RENDER

  if (loading) return <Loader />;

  return (
    <>
      <FormCard title="Datos Principales" className="mb-4">
        {(data !== null && data !== undefined) && <OrganisationForm data={data} submit={handleSubmit} isLoading={loading} />}
      </FormCard>
    </>
  );
}
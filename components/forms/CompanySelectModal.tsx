import React, { useEffect } from 'react';
import { Button, Loader } from 'rizzui';
import CustomSelect from './CustomSelect';
import ModalForm from './ModalForm';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import { isUser } from '../priviledge/PriviledgeProvider';

interface CompanySelectModalProps {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  formik: any;
  companies: any;
  label: string;
  buttonText: string;
  isLoading: boolean;
  loading: boolean;
}

const CompanySelectModal: React.FC<CompanySelectModalProps> = ({
  isOpen,
  title,
  onClose,
  formik,
  companies,
  label,
  buttonText,
  isLoading,
  loading
}) => {

  const { user } = useSelector((state: RootState) => state.auth);

  const isSuperadmin = isUser(user) && user.roles.includes("Superadministrador");

  // Si NO es superadmin, bloquear selector y forzar companyId
  const forcedCompanyId =
    !isSuperadmin && user?.companyId ? user.companyId : null;

  const selectValue = companies
    ?.map((c: any) => ({
      value: c.company.id,
      label: `${c.company.name} - ${c.company.cif}`
    }))
    .find((c: any) => c.value === (forcedCompanyId ?? formik.values.companyId));

  // Forzar valor en Formik si no es superadmin
  useEffect(() => {
    if (!isSuperadmin && forcedCompanyId) {
      if (formik.values.companyId !== forcedCompanyId) {
        formik.setFieldValue("companyId", forcedCompanyId);
      }
    }
  }, [isSuperadmin, forcedCompanyId]);

  return (
    <ModalForm isOpen={isOpen} title={title} onClose={onClose}>
      <form onSubmit={formik.handleSubmit}>
        <div className="space-y-5">

          <CustomSelect
            id={'companyId'}
            label={label}
            isSearchable={isSuperadmin}     // <--- NO buscar si no puede cambiarlo
            isDisabled={!isSuperadmin}      // <--- BLOQUEAR CAMBIO
            value={selectValue}
            options={companies?.map((c: any) => ({
              value: c.company.id,
              label: `${c.company.name} - ${c.company.cif}`
            }))}
            onChange={(e: any) => {
              if (isSuperadmin) {
                formik.setFieldValue('companyId', e?.value);
              }
            }}
            error={formik.errors.companyId}
            containerClassName='mt-7'
          />

          <div className='flex justify-center p-7'>
            <Button className="w-full" type="submit" size="lg" disabled={isLoading} isLoading={isLoading}>
              {loading ? <Loader className='text-white' /> : buttonText}
            </Button>
          </div>

        </div>
      </form>
    </ModalForm>
  );
};

export default CompanySelectModal;

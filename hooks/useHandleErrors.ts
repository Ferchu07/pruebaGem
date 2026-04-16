import { toast } from "sonner";
import Swal from 'sweetalert2';

export default function useHandleErrors() {

    const handleErrors = (response: any, refetch?: () => void) => {
        if (!response.success) {
            if (response.data?.errors) {
                response.data.errors?.forEach((error: any) => {
                    if (error.warning) toast.warning(error.message)
                    else toast.error(error.message);
                });
            } else {
                if (response.warning) {
                    const warningMessage = JSON.parse(response.message);
                    const warningList = warningMessage?.map((warning: string) => `<li>${warning}</li>`).join("");
                    Swal.fire({
                        title: 'Acción finalizada',
                        html: `<ul style="text-align: left; padding-left: 20px;">${warningList}</ul>`,
                        icon: 'info',
                        confirmButtonColor: '#009737',
                        confirmButtonText: 'Cerrar',
                    }).then(() => {
                        if (refetch) refetch();
                    });
                } else {
                    if (Array.isArray(response.message)) {
                        const messageList = response.message?.map((message: string) => `<li>${message}</li>`).join("");
                        Swal.fire({
                            title: 'Error',
                            html: `<ul style="text-align: left; padding-left: 20px;">${messageList}</ul>`,
                            icon: 'info',
                            confirmButtonColor: '#009737',
                            confirmButtonText: 'Cerrar'
                        });
                    } else {
                        toast.error(response.message);
                    }
                }
            }
        }
    }

    return { handleErrors };
}
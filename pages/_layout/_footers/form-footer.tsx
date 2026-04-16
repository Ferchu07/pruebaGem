import { Button } from 'rizzui';
import Spinner from '../../../components/bootstrap/Spinner';
import cn from '../../../utils/classNames';

interface FormFooterProps {
    customBg?: string;
    customClassName?: string;
    cancelBtnText?: string;
    submitBtnText?: string;
    isLoading?: boolean;
    isDisabled?: boolean;
    handleCancelBtn?: () => void;
    handleSubmitBtn?: () => void;
    classNameCancelBtn?: string;
    classNameSubmitBtn?: string;
}

export const negMargin = 'mx-4 md:-mx-5 lg:-mx-6 3xl:-mx-8 4xl:-mx-10';

export default function FormFooter({
    isLoading,
    isDisabled = false,
    cancelBtnText = 'Cancelar ',
    submitBtnText = 'Guardar Datos',
    customBg = "bg-white dark:bg-gray-50",
    customClassName = '',
    classNameCancelBtn = '',
    classNameSubmitBtn = '',
    handleCancelBtn,
    handleSubmitBtn,
}: FormFooterProps) {
    return (
        <div
            className={cn('bottom-0 left-0 right-0 z-10 md:z-0 flex items-center truncate justify-end gap-4 border-t border-black px-5 py-4 lg:px-7 -mx-5 -mb-5 lg:-mx-7 lg:-mb-7 rounded-b-lg', customBg, customClassName)}
        >
            <Button
                variant="outline"
                className={cn("w-full xl:w-auto bg-white hover:bg-gray-100", classNameCancelBtn)}
                onClick={handleCancelBtn}
            >
                {cancelBtnText}
            </Button>
            <Button
                type="submit"
                className={cn("w-full xl:w-auto", classNameSubmitBtn)}
                onClick={handleSubmitBtn}
                isLoading={isLoading}
                disabled={isLoading || isDisabled}
            >
                {isLoading ? <Spinner /> : submitBtnText}
            </Button>
        </div >
    );
}
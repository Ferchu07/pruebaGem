import { Outlet, useNavigate } from 'react-router-dom';
import { useAtomValue } from 'jotai';
import { headerActionAtom, headerConfigAtom, headerBottomAtom } from '../../atoms/headerAtoms';
import Header from './components/Header';
import SubHeader from './components/SubHeader';
import Breadcrumbs from './components/Breadcrumbs';
import { usePageMetadata } from './hooks/usePageMetadata';
import './MainLayout.css';
import { Button } from 'rizzui'; 
import DeletePopover from '../../components/buttons/DeletePopover';

const MainLayout = () => {

    // HOOKS

    const navigate = useNavigate();
    const { title, icon, breadcrumbs } = usePageMetadata();

    // ATOMS

    const headerConfig = useAtomValue(headerConfigAtom);
    const headerAction = useAtomValue(headerActionAtom);
    const headerBottom = useAtomValue(headerBottomAtom);

    // STATES

    const finalBreadcrumbs = (headerConfig?.breadcrumbs || breadcrumbs).map((crumb: any) => ({
        ...crumb,
        onClick: crumb.onClick || (crumb.path ? () => navigate(crumb.path) : undefined)
    }));

    const headerActions = Array.isArray(headerAction) ? headerAction : (headerAction ? [headerAction] : []);
    const hasActions = headerActions.some(action => action.show);

    // RENDER

    return (
        <div className="app-layout">
            <header className="app-layout-header">
                <Header 
                    onHomeClick={() => navigate('/')}
                />
                
                <div className='flex flex-col md:flex-row justify-between bg-[#515E7D]'>
                    <div className='border-l border-gray-200 flex-1 w-full md:w-auto grid'>
                        <SubHeader 
                            title={title} 
                            icon={icon as any}
                        />
                        <Breadcrumbs items={finalBreadcrumbs} />
                    </div>
                    {hasActions && (
                    <div className={`app-sub-actions ${hasActions ? 'has-actions' : ''} w-full md:w-auto !border-l-0 md:!border-l border-white`}>

                        <div id="sub-header-actions" className="flex flex-col">
                        
                            {/* MAIN ACTION BUTTONS */}

                            <div className='flex items-center justify-center md:justify-start flex-wrap gap-4'>
                                {headerActions.filter(action => action.newLine !== true).map((action, index) => action.show && (
                                    action.custom ? 
                                        <div key={index} className={action.className}>
                                            {action.label}
                                        </div>
                                    : (!action.delete ? 
                                        <Button
                                            key={index}
                                            className={`text-white hover:bg-primary/50 h-[40px] ${action.className || ''}`}
                                            onClick={action.onClick}
                                            variant="solid"
                                        >
                                            {action.icon}
                                            {action.label}
                                        </Button>
                                    :   <DeletePopover
                                            key={index}
                                            title={typeof action.label === 'string' ? `Eliminar ${action.label}` : 'Eliminar elemento'}
                                            description={typeof action.label === 'string' ? `¿Estás seguro de que deseas eliminar el ${action.label}?` : '¿Estás seguro de que deseas eliminar este elemento?'}
                                            size={'lg'}
                                            onDelete={action.onClick || (() => {})}
                                            actionIconClassName={`h-[40px] w-[40px] ${action.className || ''}`}
                                            Icon={typeof action.label !== 'string' ? action.label : undefined}
                                        />)
                                ))}
                            </div>

                            {headerActions.some(action => action.newLine === true) && (
                                <div className='flex items-center flex-wrap gap-4 mt-2'>
                                    {headerActions.filter(action => action.newLine === true).map((action, index) => action.show && (
                                        <div key={index} className={action.className}>
                                                {action.label}
                                            </div>
                                    ))}
                                </div>
                            )}

                        </div>

                    </div>
                    )}
                </div>

                {headerBottom && (
                    <div className="bg-[#7b95d4] border-t border-white">
                        {headerBottom}
                    </div>
                )}

            </header>

            <div className="app-layout-body">
                <main className="app-layout-content">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default MainLayout;

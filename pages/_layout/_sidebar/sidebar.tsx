import { Link } from 'react-router-dom';
import SimpleBar from 'simplebar-react';
import 'simplebar-react/dist/simplebar.min.css';
import fullLogo from "../../../assets/full_logo.png";
import cn from '../../../utils/classNames';
import { SidebarMenu } from "./sidebar-menu";

export default function Sidebar({ className, closeDrawer, tutor }: { className?: string, closeDrawer?: Function, tutor?: boolean }) {
  return (
    <aside
      className={cn(
        'fixed bottom-0 start-0 z-50 h-full w-[270px] border-e-2 border-gray-100 bg-white dark:bg-gray-100/50 2xl:w-72',
        className
      )}
    >
      <div className="sticky top-0 z-40 bg-gray-0/10 px-6 pb-5 pt-5 dark:bg-gray-100/5 2xl:px-8 2xl:pt-6">
        <Link
          to={'/'}
          aria-label="Site Logo"
          className="text-gray-800 hover:text-gray-900"
        >
          <img src={fullLogo} width={'100px'} alt="Logo de Rother" />
        </Link>
      </div>

      <SimpleBar className="sidebar-column h-[calc(100%-80px)]">
        <SidebarMenu closeDrawer={closeDrawer} />
      </SimpleBar>
    </aside>
  );
}
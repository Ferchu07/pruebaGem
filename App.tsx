import { PrivilegeProvider } from './components/priviledge/PriviledgeProvider';
import AppRouter from './router';

const App = () => {

  return (
    <PrivilegeProvider>
      <AppRouter />
    </PrivilegeProvider>
  );
};

export default App;
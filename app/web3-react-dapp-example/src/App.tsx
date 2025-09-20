import styled from 'styled-components';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import EnvironmentsHub from './pages/EnvironmentsHub';
import EnvironmentDetails from './pages/EnvironmentDetails';
import NewEnvironment from './pages/NewEnvironment';
import { ProtectedRoute } from './components/ProtectedRoute';

const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
`;

function App() {
  return (
    <AppContainer>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard/environments" replace />} />
          <Route path="/dashboard/environments" element={<EnvironmentsHub />} />
          <Route path="/dashboard/environments/new" element={<ProtectedRoute><NewEnvironment /></ProtectedRoute>} />
          <Route path="/dashboard/environments/:owner/:slug" element={<EnvironmentDetails />} />
          <Route path="*" element={<Navigate to="/dashboard/environments" replace />} />
        </Routes>
      </Layout>
    </AppContainer>
  );
}

export default App;

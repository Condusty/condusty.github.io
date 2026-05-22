import { Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { ToastProvider } from '@/components/ui/Toast';
import { HomePage } from '@/routes/HomePage';
import { JeopardyAdminPage } from '@/routes/JeopardyAdminPage';
import { JeopardyBoardPage } from '@/routes/JeopardyBoardPage';
import { LmsAdminPage } from '@/routes/LmsAdminPage';
import { LmsHostPage } from '@/routes/LmsHostPage';
import { LmsPlayPage } from '@/routes/LmsPlayPage';
import { PlaceholderPage } from '@/routes/PlaceholderPage';

export default function App() {
  return (
    <ToastProvider>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="/jeopardy" element={<JeopardyAdminPage />} />
          <Route path="/jeopardy/play" element={<JeopardyBoardPage />} />
          <Route path="/lms" element={<LmsAdminPage />} />
          <Route path="/lms/host" element={<LmsHostPage />} />
          <Route path="/lms/play" element={<LmsPlayPage />} />
          <Route path="/games/:slug" element={<PlaceholderPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </ToastProvider>
  );
}

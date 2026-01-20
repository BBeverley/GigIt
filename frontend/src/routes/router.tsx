import { createBrowserRouter, Navigate } from 'react-router-dom';

import { AppShell } from '../components/AppShell';
import { AllJobsPage } from '../pages/AllJobsPage';
import { CreateJobPage } from '../pages/CreateJobPage';
import { EditJobPage } from '../pages/EditJobPage';
import { JobWorkspaceLayout } from '../pages/JobWorkspace/JobWorkspaceLayout';
import { CrewTab } from '../pages/JobWorkspace/CrewTab';
import { FilesTab } from '../pages/JobWorkspace/FilesTab';
import { NotesTab } from '../pages/JobWorkspace/NotesTab';
import { OverviewTab } from '../pages/JobWorkspace/OverviewTab';
import { MyJobsPage } from '../pages/MyJobsPage';
import { ProfilePage } from '../pages/ProfilePage';
import { SignInPage } from '../pages/SignInPage';

function requireToken() {
  const token = window.localStorage.getItem('token');
  if (!token) return <Navigate to="/signin" replace />;
  return <AppShell />;
}

export const router = createBrowserRouter([
  {
    path: '/signin',
    element: <SignInPage />,
  },
  {
    path: '/',
    element: requireToken(),
    children: [
      { index: true, element: <MyJobsPage /> },
      { path: 'jobs/all', element: <AllJobsPage /> },
      { path: 'jobs/create', element: <CreateJobPage /> },
      {
        path: 'jobs/:jobId',
        element: <JobWorkspaceLayout />,
        children: [
          { index: true, element: <OverviewTab /> },
          { path: 'crew', element: <CrewTab /> },
          { path: 'files', element: <FilesTab /> },
          { path: 'notes', element: <NotesTab /> },
        ],
      },
      { path: 'jobs/:jobId/edit', element: <EditJobPage /> },
      { path: 'me', element: <ProfilePage /> },
    ],
  },
]);


import React, { CSSProperties } from 'react';

import AdminTable from 'components/AdminComponents/AdminTable';
import LAFeedbackTable from 'components/AdminComponents/LAFeedbackTable';
import LoginTable from 'components/AdminComponents/LoginTable';
import StudentTable from 'components/AdminComponents/StudentTable';

import TabbedScreen, { TabContents } from 'components/TabbedScreen';

type Props = {
  style: CSSProperties;
};

const TABS: TabContents[] = [
  {
    eventKey: 'feedback_tab',
    title: 'Feedback',
    children: <LAFeedbackTable />,
  },
  {
    eventKey: 'login_tab',
    title: 'Logins',
    children: <LoginTable />,
  },
  {
    eventKey: 'student_tab',
    title: 'Students',
    children: <StudentTable />,
  },
  {
    eventKey: 'admin_tab',
    title: 'Admins',
    children: <AdminTable />,
  },
];

const AdminScreen = ({ style }: Props) => (
  <div style={style} className="col-md-10">
    <TabbedScreen tabs={TABS} />
  </div>
);

export default AdminScreen;

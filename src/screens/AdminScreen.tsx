import React, { CSSProperties } from 'react';

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
];

const AdminTable = ({ style }: Props) => (
  <div style={style} className="col-md-10">
    <TabbedScreen tabs={TABS} />
  </div>
);

export default AdminTable;

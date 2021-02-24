import React, { CSSProperties, useCallback, useState } from 'react';

import Tabs from 'react-bootstrap/Tabs';
import Tab from 'react-bootstrap/Tab';

import LAFeedbackTable from 'components/AdminComponents/LAFeedbackTable';
import LoginTable from 'components/AdminComponents/LoginTable';

type Props = {
  style: CSSProperties;
};

const FEEDBACK_KEY = 'feedback_tab';
const LOGIN_KEY = 'login_tab';

const AdminTable = ({ style }: Props) => {
  const [activeKey, setActiveKey] = useState<string | null>(FEEDBACK_KEY);
  const setActiveKeyCallback = useCallback(
    (newKey: string | null) => setActiveKey(newKey),
    []
  );
  return (
    <div style={style} className="col-md-10">
      <Tabs activeKey={activeKey} onSelect={setActiveKeyCallback}>
        <Tab eventKey={FEEDBACK_KEY} title="Feedback">
          <LAFeedbackTable />
        </Tab>
        <Tab eventKey={LOGIN_KEY} title="Logins">
          <LoginTable />
        </Tab>
      </Tabs>
    </div>
  );
};

export default AdminTable;

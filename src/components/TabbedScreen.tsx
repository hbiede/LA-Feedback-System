import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import React, { useCallback, useState } from 'react';

export type TabContents = {
  children: JSX.Element;
  eventKey: string;
  title: string;
};

type Props = {
  tabs: TabContents[];
};

const TabbedScreen = ({ tabs }: Props) => {
  const [activeKey, setActiveKey] = useState<string | null>(
    tabs.length > 0 ? tabs[0].eventKey : null
  );
  const setActiveKeyCallback = useCallback(
    (newKey: string | null) => setActiveKey(newKey),
    []
  );
  if (tabs.length === 0) return null;
  return (
    <Tabs activeKey={activeKey} onSelect={setActiveKeyCallback}>
      {tabs.map((tab) => (
        <Tab {...tab} />
      ))}
    </Tabs>
  );
};

export default TabbedScreen;

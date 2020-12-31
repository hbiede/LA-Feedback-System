/*------------------------------------------------------------------------------
 - Copyright (c) 2020.
 -
 - File created by Hundter Biede for the UNL CSE Learning Assistant Program
 -----------------------------------------------------------------------------*/

import shallow from 'zustand/shallow';

import ServiceInterface from 'statics/ServiceInterface';

import Redux from 'redux/modules';

export type AnnouncementProps = {
  body: string;
  class: string;
  course: string;
};

const clearAnnouncements = async (): Promise<void> => {
  const requestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ clear: true }),
  };

  await fetch(`${ServiceInterface.getPath()}/announcements.php`, requestOptions)
    // eslint-disable-next-line no-alert
    .then(() => alert('Announcements cleared'))
    .catch((error) => {
      const { setResponse } = Redux(
        (state) => ({
          setResponse: state.setResponse,
        }),
        shallow
      );
      setResponse({ class: 'danger', content: error });
    });
};

export default clearAnnouncements;

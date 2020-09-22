/*------------------------------------------------------------------------------
 - Copyright (c) 2020.
 -
 - File created by Hundter Biede for the UNL CSE Learning Assistant Program
 -----------------------------------------------------------------------------*/

import React, { CSSProperties } from 'react';
import shallow from 'zustand/shallow';

import Badge from 'react-bootstrap/Badge';

import Redux, { AppReduxState } from 'redux/modules';

type Props = {
  style?: CSSProperties;
};

const FeedbackHeader = ({ style }: Props) => {
  const { isAdmin } = Redux(
    (state: AppReduxState) => ({
      isAdmin: state.isAdmin,
    }),
    shallow
  );

  return (
    <header role="banner" style={style}>
      {isAdmin ? (
        <>
          <h4>
            LA Feedback Interface
            <Badge variant="secondary" style={{ marginLeft: 10 }}>
              Admin
            </Badge>
          </h4>
          <p style={{ marginLeft: 0 }}>
            Record interactions on behalf of an LA
          </p>
        </>
      ) : (
        <>
          <h4>LA Feedback Interface</h4>
          <p style={{ marginLeft: 0 }}>
            This web interface allows LAs to receive anonymous feedback on their
            performance from students. Select the course you worked with and
            enter the Student&apos;s CSE username
          </p>
        </>
      )}
    </header>
  );
};

export default FeedbackHeader;

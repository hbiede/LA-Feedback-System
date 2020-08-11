/*------------------------------------------------------------------------------
 - Copyright (c) 2020.
 -
 - File created by Hundter Biede for the UNL CSE Learning Assistant Program
 -----------------------------------------------------------------------------*/

import { NamedStyles, StyleDef } from 'statics/Types';

type StyleTypes = StyleDef<
  'appHeading' | 'loadingContainer' | 'loadingSpinner' | 'tableContainer'
>;

const styles: NamedStyles<StyleTypes> = {
  appHeading: {
    marginLeft: 0,
    marginTop: 45,
  },
  loadingContainer: {
    display: 'flex',
    flexFlow: 'row',
  },
  loadingSpinner: {
    marginLeft: 20,
  },
  tableContainer: {
    marginTop: 25,
  },
};

export default styles;

/*------------------------------------------------------------------------------
 - Copyright (c) 2020.
 -
 - File created by Hundter Biede for the UNL CSE Learning Assistant Program
 -----------------------------------------------------------------------------*/

import ServiceInterface from 'statics/ServiceInterface';
import { RESTResponse } from 'statics/Types';

export const nameREST = async (name: string | null = null): Promise<string> =>
  ServiceInterface.rest(
    `${ServiceInterface.getPath()}/name.php`,
    ServiceInterface.getActiveUser(),
    name
  ).then((json: RESTResponse) => json.name ?? '');

export default nameREST;

/*------------------------------------------------------------------------------
 - Copyright (c) 2020.
 -
 - File created by Hundter Biede for the UNL CSE Learning Assistant Program
 -----------------------------------------------------------------------------*/

import ServiceInterface from 'statics/ServiceInterface';
import { RESTResponse } from 'statics/Types';

/**
 * Sets or modifies the course for the current LA
 * @param course  the new course
 */
const courseREST = async (course: string | null = null): Promise<string> =>
  ServiceInterface.rest(
    `${ServiceInterface.getPath()}/course.php`,
    ServiceInterface.getActiveUser(),
    course
  ).then((json: RESTResponse) => json.course ?? '');

export default courseREST;

/*------------------------------------------------------------------------------
 - Copyright (c) 2020.
 -
 - File created by Hundter Biede for the UNL CSE Learning Assistant Program
 -----------------------------------------------------------------------------*/

import ServiceInterface from 'statics/ServiceInterface';

const courseREST = async (course: string | null = null): Promise<string> =>
  ServiceInterface.rest(
    `${ServiceInterface.getPath()}/course.php`,
    ServiceInterface.getActiveUser(),
    course
  ).then((json) => json.course ?? '');

export default courseREST;

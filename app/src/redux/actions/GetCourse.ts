/*
 * Copyright (c) 2020.
 *
 * File created by Hundter Biede for the UNL CSE Learning Assistant Program
 */

import ServiceInterface from '../../statics/ServiceInterface';

const courseREST = async (
  course: string|null = null): Promise<string> => ServiceInterface.rest(
  'https://cse.unl.edu/~learningassistants/LA-Feedback/course.php',
  ServiceInterface.getActiveUser(),
  course,
).then((json) => (json.course ? json.course : ''));

export default courseREST;

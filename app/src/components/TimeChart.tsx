import React, { useEffect, useMemo, useState } from 'react';

import { Time } from 'redux/modules/Types';
import { api } from 'redux/modules';

import CanvasJSReact from 'canvas/canvasjs.react';

type TimeData = {
  type: string;
  name: string;
  showInLegend: boolean;
  dataPoints: DataPoint[];
};

type DataPoint = {
  label: string;
  y: number;
};

const TimeChart = () => {
  const [times, setTimes] = useState<Time[] | null>(null);

  useEffect(() => {
    api
      .getState()
      .getTimes()
      .then((newTimes) => {
        setTimes(newTimes);
      });
  }, []);

  const getTimeValues = useMemo<TimeData[]>(() => {
    if (times === null) return [];

    const courses = Array.from(new Set(times.map((time) => time.course)));
    return courses.map<TimeData>((course) => ({
      type: 'stackedColumn',
      name: course,
      showInLegend: true,
      dataPoints: Array.from(Array(24).keys()).map<DataPoint>((time) => ({
        label: time.toFixed(0),
        y: times
          .filter((int) => int.course === course)
          .filter((int) => int.time === time).length,
      })),
    }));
  }, [times]);

  const options = {
    animationEnabled: true,
    exportEnabled: true,
    title: {
      text: 'Interactions By Time of Day',
      fontFamily: 'arial',
    },
    axisX: {
      title: 'Hour',
    },
    axisY: {
      title: 'Students Helped',
    },
    toolTip: {
      shared: true,
    },
    legend: {
      verticalAlign: 'center',
      horizontalAlign: 'right',
    },
    data: getTimeValues,
  };

  return <CanvasJSReact.CanvasJSChart options={options} />;
};

export default TimeChart;

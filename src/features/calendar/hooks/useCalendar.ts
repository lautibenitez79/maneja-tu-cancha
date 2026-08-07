import {

useEffect,

useState,

} from "react";

import {

calendarService,

} from "../services/calendar.service";

import type {
  CalendarWeek,
} from "../types/calendar.types";

export function useCalendar(

resourceId: string,

weekStart: Date,

) {

const [

  week,

  setWeek,

] =

useState<CalendarWeek>();

const [

loading,

setLoading,

] =

useState(true);

useEffect(() => {

async function load() {

setLoading(true);

try {

const data =

await calendarService.getWeek(

resourceId,

weekStart,

);

setWeek(data);

}

finally {

setLoading(false);

}

}

load();

}, [

resourceId,

weekStart,

]);

return {

week,

loading,

};

}
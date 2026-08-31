import { addDays, format, startOfWeek } from "date-fns";
import { fromZonedTime, formatInTimeZone } from "date-fns-tz";

import { resourceService } from "@/features/resources/services/resource.service";
import { reservationService } from "@/features/reservations/services/reservation.service";
import { availabilityService } from "@/features/reservations/services/availability.service";
import { clubService } from "@/features/clubs/services/club.service";

import type {
  DashboardAnalytics,
  DashboardPeriod,
  DashboardRevenuePoint,
  DashboardHourPoint,
  DashboardMetric,
} from "../types/dashboard.types";

import type { Reservation } from "@/features/reservations/types/reservation.types";

function getPeriodDates(
  period: DashboardPeriod,
  timezone: string,
) {
  const now = new Date();

  const today = formatInTimeZone(
    now,
    timezone,
    "yyyy-MM-dd",
  );

  if (period === "today") {
    return {
      startDate: today,
      endDate: today,
    };
  }

  if (period === "week") {
    const localToday = new Date(`${today}T12:00:00`);

    const monday = startOfWeek(
      localToday,
      {
        weekStartsOn: 1,
      },
    );

    return {
      startDate: format(
        monday,
        "yyyy-MM-dd",
      ),
      endDate: format(
        addDays(monday, 6),
        "yyyy-MM-dd",
      ),
    };
  }

  const year = Number(today.substring(0, 4));
  const month = Number(today.substring(5, 7));

  const firstDay = new Date(
    year,
    month - 1,
    1,
  );

  const lastDay = new Date(
    year,
    month,
    0,
  );

  return {
    startDate: format(
      firstDay,
      "yyyy-MM-dd",
    ),
    endDate: format(
      lastDay,
      "yyyy-MM-dd",
    ),
  };
}

function getPreviousPeriodDates(
  period: DashboardPeriod,
  startDate: string,
) {
  const start = new Date(
    `${startDate}T12:00:00`,
  );

  if (period === "today") {
    const previous = addDays(
      start,
      -1,
    );

    const date = format(
      previous,
      "yyyy-MM-dd",
    );

    return {
      startDate: date,
      endDate: date,
    };
  }

  if (period === "week") {
    const previousMonday = addDays(
      start,
      -7,
    );

    return {
      startDate: format(
        previousMonday,
        "yyyy-MM-dd",
      ),
      endDate: format(
        addDays(previousMonday, 6),
        "yyyy-MM-dd",
      ),
    };
  }

  const current = new Date(
    `${startDate}T12:00:00`,
  );

  const previousMonth = new Date(
    current.getFullYear(),
    current.getMonth() - 1,
    1,
  );

  const lastDay = new Date(
    current.getFullYear(),
    current.getMonth(),
    0,
  );

  return {
    startDate: format(
      previousMonth,
      "yyyy-MM-dd",
    ),
    endDate: format(
      lastDay,
      "yyyy-MM-dd",
    ),
  };
}

function percentageChange(
  current: number,
  previous: number,
) {
  if (previous === 0) {
    return current === 0 ? 0 : 100;
  }

  return Math.round(
    ((current - previous) /
      previous) *
      100,
  );
}

function createMetric(
  value: number,
  previousValue: number,
): DashboardMetric {
  return {
    value,
    previousValue,
    percentage: percentageChange(
      value,
      previousValue,
    ),
  };
}

async function getReservations(
  clubId: string,
  startDate: string,
  endDate: string,
  timezone: string,
): Promise<Reservation[]> {
  const start = fromZonedTime(
    `${startDate}T00:00:00`,
    timezone,
  ).toISOString();

  const end = fromZonedTime(
    `${endDate}T23:59:59`,
    timezone,
  ).toISOString();

  return reservationService.listByClubAndDate(
    clubId,
    start,
    end,
  );
}

function getActiveReservations(
  reservations: Reservation[],
) {
  return reservations.filter(
    (reservation) =>
      reservation.status !== "cancelled",
  );
}

function calculateRevenue(
  reservations: Reservation[],
) {
  return getActiveReservations(
    reservations,
  ).reduce(
    (total, reservation) =>
      total +
      Number(
        reservation.amount_paid ?? 0,
      ),
    0,
  );
}

function calculatePopularHours(
  reservations: Reservation[],
  timezone: string,
): DashboardHourPoint[] {
  const map = new Map<
    string,
    number
  >();

  getActiveReservations(
    reservations,
  ).forEach((reservation) => {
    const hour = formatInTimeZone(
      reservation.starts_at,
      timezone,
      "HH:00",
    );

    map.set(
      hour,
      (map.get(hour) ?? 0) + 1,
    );
  });

  return Array.from(map.entries())
    .map(([hour, reservations]) => ({
      hour,
      reservations,
    }))
    .sort(
      (a, b) =>
        b.reservations -
        a.reservations,
    )
    .slice(0, 5);
}

function calculateRevenueByDay(
  reservations: Reservation[],
  startDate: string,
  endDate: string,
  timezone: string,
): DashboardRevenuePoint[] {
  const map = new Map<
    string,
    number
  >();

  const start = new Date(
    `${startDate}T12:00:00`,
  );

  const end = new Date(
    `${endDate}T12:00:00`,
  );

  for (
    let date = start;
    date <= end;
    date = addDays(date, 1)
  ) {
    const key = format(
      date,
      "yyyy-MM-dd",
    );

    map.set(key, 0);
  }

  getActiveReservations(
    reservations,
  ).forEach((reservation) => {
    const date = formatInTimeZone(
      reservation.starts_at,
      timezone,
      "yyyy-MM-dd",
    );

    if (!map.has(date)) {
      return;
    }

    map.set(
      date,
      (map.get(date) ?? 0) +
        Number(
          reservation.amount_paid ?? 0,
        ),
    );
  });

  return Array.from(map.entries()).map(
    ([date, value]) => ({
      label: format(
        new Date(`${date}T12:00:00`),
        "dd/MM",
      ),
      value,
    }),
  );
}

async function calculateOccupancy(
  clubId: string,
  startDate: string,
  endDate: string,
) {
  const resources =
    await resourceService.list(
      clubId,
    );

  let occupied = 0;
  let available = 0;

  for (
    let date = new Date(
      `${startDate}T12:00:00`,
    );
    date <=
    new Date(`${endDate}T12:00:00`);
    date = addDays(date, 1)
  ) {
    for (const resource of resources) {
      const weekStart =
        startOfWeek(date, {
          weekStartsOn: 1,
        });

      const week =
        await availabilityService.getWeek(
          resource.id,
          weekStart,
        );

      const day =
        week.days.find(
          (item) =>
            item.date ===
            format(
              date,
              "yyyy-MM-dd",
            ),
        );

      if (!day) {
        continue;
      }

      day.slots.forEach((slot) => {
        if (
          slot.status === "reserved" ||
          slot.status ===
            "pending_payment"
        ) {
          occupied++;
        }

        if (
          slot.status === "available"
        ) {
          available++;
        }
      });
    }
  }

  const total =
    occupied + available;

  return {
    occupied,
    available,
    percentage:
      total === 0
        ? 0
        : Math.round(
            (occupied / total) *
              100,
          ),
  };
}

class DashboardService {
  async getAnalytics(
    clubId: string,
    period: DashboardPeriod,
  ): Promise<DashboardAnalytics> {
    const club =
      await clubService.getClub(
        clubId,
      );

    if (!club) {
      throw new Error(
        "No se encontró el complejo.",
      );
    }

    const {
      startDate,
      endDate,
    } = getPeriodDates(
      period,
      club.timezone,
    );

    const previous =
      getPreviousPeriodDates(
        period,
        startDate,
      );

    const [
      reservations,
      previousReservations,
      occupancy,
      previousOccupancy,
    ] = await Promise.all([
      getReservations(
        clubId,
        startDate,
        endDate,
        club.timezone,
      ),

      getReservations(
        clubId,
        previous.startDate,
        previous.endDate,
        club.timezone,
      ),

      calculateOccupancy(
        clubId,
        startDate,
        endDate,
      ),

      calculateOccupancy(
        clubId,
        previous.startDate,
        previous.endDate,
      ),
    ]);

    const currentActive =
      getActiveReservations(
        reservations,
      );

    const previousActive =
      getActiveReservations(
        previousReservations,
      );

    const revenue =
      calculateRevenue(
        reservations,
      );

    const previousRevenue =
      calculateRevenue(
        previousReservations,
      );

    return {
      period,

      occupancy,

      revenue: createMetric(
        revenue,
        previousRevenue,
      ),

      reservations: createMetric(
        currentActive.length,
        previousActive.length,
      ),

      occupancyComparison:
        createMetric(
          occupancy.percentage,
          previousOccupancy.percentage,
        ),

      revenueByDay:
        calculateRevenueByDay(
          reservations,
          startDate,
          endDate,
          club.timezone,
        ),

      popularHours:
        calculatePopularHours(
          reservations,
          club.timezone,
        ),
    };
  }
}

export const dashboardService =
  new DashboardService();
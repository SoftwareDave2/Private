"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Button,
  Dialog,
  DialogBody,
  DialogFooter,
  DialogHeader,
  Input,
  Switch,
  Typography,
} from "@material-tailwind/react";

import { EventBoardEvent } from "../../types";

type EventBoardCalendarDialogProps = {
  open: boolean;
  events: EventBoardEvent[];
  onClose: () => void;
  onSaveEvent: (event: EventBoardEvent) => void;
  onDeleteEvent: (eventId: number) => void;
};

type CalendarDay = {
  iso: string;
  label: number;
  inCurrentMonth: boolean;
};

type EventDraft = {
  id: number | null;
  title: string;
  date: string;
  endDate: string;
  startTime: string;
  endTime: string;
  allDay: boolean;
  important: boolean;
  qrLink: string;
};

const WEEKDAY_LABELS = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

const toISODate = (date: Date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getMonthStart = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), 1);
const getMonthEnd = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth() + 1, 0);

const getCalendarDays = (anchor: Date): CalendarDay[] => {
  const firstOfMonth = getMonthStart(anchor);
  const lastOfMonth = getMonthEnd(anchor);

  const startDay = (firstOfMonth.getDay() + 6) % 7;
  const daysBefore = startDay;

  const totalDays = daysBefore + lastOfMonth.getDate();
  const totalCells = Math.ceil(totalDays / 7) * 7;

  const startDate = new Date(firstOfMonth);
  startDate.setDate(firstOfMonth.getDate() - daysBefore);

  return Array.from({ length: totalCells }).map((_, index) => {
    const cellDate = new Date(startDate);
    cellDate.setDate(startDate.getDate() + index);
    return {
      iso: toISODate(cellDate),
      label: cellDate.getDate(),
      inCurrentMonth: cellDate.getMonth() === anchor.getMonth(),
    };
  });
};

const parseDate = (value?: string) => {
  if (!value) {
    return null;
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }
  return parsed;
};

const normalizeDateString = (value?: string) => {
  const parsed = parseDate(value);
  return parsed ? toISODate(parsed) : "";
};

const formatDateLabel = (value?: string) => {
  if (!value) {
    return "Datum offen";
  }
  const parsed = parseDate(value);
  if (!parsed) {
    return value;
  }
  return parsed.toLocaleDateString("de-DE", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};


export function EventBoardCalendarDialog({
  open,
  events,
  onClose,
  onSaveEvent,
  onDeleteEvent,
}: EventBoardCalendarDialogProps) {
  const [viewDate, setViewDate] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  const [draft, setDraft] = useState<EventDraft | null>(null);
  const [showEventTitles, setShowEventTitles] = useState(true);

  const [errors, setErrors] = useState({
    title: "",
    endDate: "",
    time: "",
  });
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    if (!open) {
      setSelectedDate(null);
      setSelectedEventId(null);
      setDraft(null);
      setViewDate(new Date());
      return;
    }

    if (!selectedDate) {
      const firstEventDate = events.find(
        (event) => event.date && event.date.trim().length > 0
      )?.date;
      const baseDate =
        normalizeDateString(firstEventDate) || toISODate(new Date());
      setSelectedDate(baseDate);
      const parsed = parseDate(baseDate);
      if (parsed) {
        setViewDate(parsed);
      }
    }
  }, [open, events, selectedDate]);

  const eventsByDate = useMemo(() => {
    return events.reduce<Record<string, EventBoardEvent[]>>((acc, event) => {
      const dateKey = (event.date ?? "").trim();
      if (!dateKey) {
        return acc;
      }
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push(event);
      return acc;
    }, {});
  }, [events]);

  const undatedEvents = useMemo(
    () =>
      events.filter((event) => !(event.date && event.date.trim().length > 0)),
    [events]
  );

  const nextEventId = useMemo(() => {
    if (events.length === 0) {
      return 1;
    }
    return Math.max(...events.map((event) => event.id)) + 1;
  }, [events]);

  const calendarDays = useMemo(() => getCalendarDays(viewDate), [viewDate]);
  const selectedDateEvents = selectedDate
    ? eventsByDate[selectedDate] ?? []
    : [];

  const changeMonth = (offset: number) => {
    setViewDate((current) => {
      const next = new Date(current);
      next.setMonth(current.getMonth() + offset);
      return next;
    });
  };

  const jumpToToday = () => {
    const today = new Date();
    const iso = toISODate(today);
    setViewDate(today);
    setSelectedDate(iso);
    setSelectedEventId(null);
    setDraft((prev) => {
      if (prev && prev.id === null) {
        const nextDraft = { ...prev, date: iso };
        if (!nextDraft.endDate || nextDraft.endDate < iso) {
          nextDraft.endDate = iso;
        }
        return nextDraft;
      }
      return prev;
    });
  };

  const handleDayClick = (dayIso: string) => {
    setSelectedDate(dayIso);
    setSelectedEventId(null);
    setDraft((prev) => {
      if (prev && prev.id === null) {
        const nextDraft = { ...prev, date: dayIso };
        if (!nextDraft.endDate || nextDraft.endDate < dayIso) {
          nextDraft.endDate = dayIso;
        }
        return nextDraft;
      }
      return prev;
    });
  };

  const handleSelectEvent = (event: EventBoardEvent) => {
    setSelectedEventId(event.id);
    const normalizedDate = normalizeDateString(event.date);
    const normalizedEndDate =
      normalizeDateString(event.endDate) || normalizedDate || "";
    if (normalizedDate) {
      setSelectedDate(normalizedDate);
      const parsed = parseDate(normalizedDate);
      if (parsed) {
        setViewDate(parsed);
      }
    }
    setDraft({
      id: event.id,
      title: event.title,
      date: normalizedDate || "",
      endDate: normalizedEndDate,
      startTime: event.startTime,
      endTime: event.endTime,
      allDay: Boolean(event.allDay),
      important: Boolean(event.important),
      qrLink: event.qrLink,
    });
 };

  const handleStartNewDraft = () => {
    if (!selectedDate) {
      return;
    }
    setSelectedEventId(null);
    setDraft({
      id: null,
      title: "",
      date: selectedDate,
      endDate: selectedDate,
      startTime: "",
      endTime: "",
      allDay: false,
      important: false,
      qrLink: "",
    });
  };

  const handleDraftChange = <K extends keyof EventDraft>(
    key: K,
    value: EventDraft[K]
  ) => {
    setDraft((prev) => {
      if (!prev) {
        return prev;
      }
      const next = { ...prev, [key]: value } as EventDraft;
      if (key === "date") {
        const normalizedStart =
          typeof value === "string" ? normalizeDateString(value) : "";
        next.date = normalizedStart;
        if (!next.endDate || (normalizedStart && next.endDate < normalizedStart)) {
          next.endDate = normalizedStart;
        }
      } else if (key === "endDate") {
        const normalizedEnd =
          typeof value === "string" ? normalizeDateString(value) : "";
        if (!normalizedEnd) {
          next.endDate = next.date;
        } else if (next.date && normalizedEnd < next.date) {
          next.endDate = next.date;
        } else {
          next.endDate = normalizedEnd;
        }
      }
      return next;
    });
  };

  const handleAllDayToggle = (checked: boolean) => {
    setDraft((prev) =>
      prev
        ? {
            ...prev,
            allDay: checked,
            startTime: checked ? "" : prev.startTime,
            endTime: checked ? "" : prev.endTime,
          }
        : prev
    );
  };


  useEffect(() => {
    if (!draft) {
      setErrors({ title: "", endDate: "", time: "" });
      setIsValid(false);
      return;
    }

    const newErrors = { title: "", endDate: "", time: "" };
    let valid = true;

    // Title: required and max 50
    const title = (draft.title ?? "").trim();
    if (!title) {
      newErrors.title = "Titel ist erforderlich.";
      valid = false;
    } else if (title.length > 50) {
      newErrors.title = "Maximal 50 Zeichen.";
      valid = false;
    }

    // Enddate: must not be in past (compare by day)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const parsedEnd = parseDate(draft.endDate);
    if (!parsedEnd) {
      newErrors.endDate = "Enddatum ist erforderlich.";
      valid = false;
    } else if (parsedEnd < today) {
      newErrors.endDate = "Enddatum darf nicht in der Vergangenheit liegen.";
      valid = false;
    }

    // If same day and both times set -> endTime must be after startTime
    if (!draft.allDay && draft.date && draft.endDate && draft.date === draft.endDate) {
      const s = draft.startTime ? new Date(`1970-01-01T${draft.startTime}`) : null;
      const e = draft.endTime ? new Date(`1970-01-01T${draft.endTime}`) : null;
      if (s && e) {
        if (isNaN(s.getTime()) || isNaN(e.getTime())) {
          newErrors.time = !s ? "Ungültige Startzeit." : "";
          newErrors.time = !e ? "Ungültige Endzeit." : newErrors.time;
          valid = false;
        } else if (e <= s) {
          newErrors.time = "Endzeit muss nach Startzeit liegen (gleicher Tag).";
          valid = false;
        }
      }
    }

    setErrors(newErrors);
    setIsValid(valid);
  }, [draft]);


  const handleSaveDraft = () => {
    if (!draft || !draft.date) {
      return;
    }
    const normalizedStartDate = normalizeDateString(draft.date) || "";
    if (!normalizedStartDate) {
      return;
    }
    const rawEndDate = draft.endDate ? normalizeDateString(draft.endDate) : "";
    const normalizedEndDate =
      rawEndDate && rawEndDate >= normalizedStartDate
        ? rawEndDate
        : normalizedStartDate;
    const payload: EventBoardEvent = {
      id: draft.id ?? nextEventId,
      title: draft.title.trim(),
      date: normalizedStartDate,
      endDate: normalizedEndDate,
      startTime: draft.startTime.trim(),
      endTime: draft.endTime.trim(),
      allDay: draft.allDay,
      important: draft.important,
      qrLink: draft.qrLink.trim(),
    };
    onSaveEvent(payload);
    setDraft({
          ...draft,
          id: payload.id,
          title: payload.title,
          date: payload.date,
          endDate: (payload as any).endDate ?? payload.date,
        });
    setSelectedEventId(payload.id);
    setSelectedDate(payload.date);
  };

  const handleDeleteEvent = (eventId: number) => {
    onDeleteEvent(eventId);
    if (draft?.id === eventId) {
      setDraft(null);
    }
    if (selectedEventId === eventId) {
      setSelectedEventId(null);
    }
  };

  const monthLabel = viewDate.toLocaleDateString("de-DE", {
    month: "long",
    year: "numeric",
  });

  const saveDisabled = !draft || !isValid;
  const resolveTimeLabel = (
    event: Pick<EventBoardEvent, "startTime" | "endTime" | "allDay">
  ) => {
    if (event.allDay) {
      return "Ganztägig";
    }
    const start = (event.startTime ?? "").trim();
    const end = (event.endTime ?? "").trim();
    if (start) {
      return end ? `${start} – ${end}` : start;
    }
    return "Uhrzeit offen";
  };

  return (
    <Dialog
      open={open}
      handler={onClose}
      size={"xl"}



    >
      <DialogHeader
        className={"flex flex-col gap-1"}



      >
        <Typography
          variant={"h5"}
          className={"text-red-700"}



        >
          Kalenderübersicht
        </Typography>
        <Typography
          variant={"small"}
          color={"gray"}
          className={"font-normal"}



        >
          Wählen Sie einen Tag aus, sehen Sie bestehende Einträge und erstellen
          Sie neue Ereignisse direkt aus diesem Kalender.
        </Typography>
      </DialogHeader>
      <DialogBody
        className={"space-y-6 max-h-[75vh] overflow-y-auto pr-1"}



      >
        <div className={"flex flex-col gap-6 lg:flex-row"}>
          <div className={"lg:flex-1 space-y-4"}>
            <div
              className={
                "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
              }
            >
              <div
                className={
                  "flex flex-wrap items-center justify-between gap-2 sm:justify-start"
                }
              >
                <Button
                  variant={"text"}
                  color={"gray"}
                  size={"sm"}
                  className={"normal-case"}
                  onClick={() => changeMonth(-1)}



                >
                  Zurück
                </Button>
                <Typography
                  variant={"h6"}
                  className={"capitalize"}



                >
                  {monthLabel}
                </Typography>
                <Button
                  variant={"text"}
                  color={"gray"}
                  size={"sm"}
                  className={"normal-case"}
                  onClick={() => changeMonth(1)}



                >
                  Weiter
                </Button>
                <Button
                  variant={"outlined"}
                  color={"red"}
                  size={"sm"}
                  className={"normal-case"}
                  onClick={jumpToToday}



                >
                  Heute
                </Button>
              </div>
              <div className={"flex items-center justify-end gap-2"}>
                <Typography
                  variant={"small"}
                  className={"text-xs font-medium text-blue-gray-600"}



                >
                  Titel anzeigen
                </Typography>
                <Switch
                  crossOrigin={""}
                  label={""}
                  checked={showEventTitles}
                  onChange={(event) => setShowEventTitles(event.target.checked)}
                  ripple={false}


                />
              </div>
            </div>
            <div
              className={
                "flex flex-wrap items-center gap-4 rounded-xl bg-blue-gray-50/80 px-3 py-2 text-xs text-blue-gray-600"
              }
            >
              <div className={"flex items-center gap-1"}>
                <span className={"h-2.5 w-2.5 rounded-full bg-red-400"}></span>
                <span>Geplante Ereignisse</span>
              </div>
              <div className={"flex items-center gap-1"}>
                <span
                  className={
                    "h-2.5 w-2.5 rounded-full border border-blue-gray-200"
                  }
                ></span>
                <span>Keine Einträge</span>
              </div>
            </div>
            <div className={"overflow-x-auto"}>
              <div
                className={
                  "grid grid-cols-7 gap-2 min-w-[560px] text-center text-xs font-semibold uppercase text-blue-gray-400"
                }
              >
                {WEEKDAY_LABELS.map((label) => (
                  <span key={label}>{label}</span>
                ))}
              </div>
            </div>
            <div className={"overflow-x-auto pb-2"}>
              <div className={"grid grid-cols-7 gap-2 min-w-[560px]"}>
                {calendarDays.map((day) => {
                  const dayEvents = eventsByDate[day.iso] ?? [];
                  const hasEvents = dayEvents.length > 0;
                  const isSelected = selectedDate === day.iso;
                  const baseClasses = [
                    "rounded-xl",
                    "border",
                    "bg-gradient-to-b",
                    "p-3",
                    "text-left",
                    "transition-all",
                    "duration-200",
                    "cursor-pointer",
                    "min-h-[100px]",
                    "sm:min-h-[120px]",
                    "relative",
                  ];
                  if (isSelected) {
                    baseClasses.push(
                      "from-white",
                      "to-red-50",
                      "border-red-400",
                      "shadow-lg",
                      "ring-2",
                      "ring-red-100"
                    );
                  } else {
                    baseClasses.push(
                      "from-white",
                      hasEvents ? "to-red-50/40" : "to-white",
                      "border-blue-gray-100",
                      "hover:-translate-y-1",
                      "hover:shadow-md",
                      "hover:border-red-200"
                    );
                  }
                  if (!day.inCurrentMonth) {
                    baseClasses.push("opacity-60");
                  }
                  return (
                    <div
                      key={day.iso}
                      role="button"
                      tabIndex={0}
                      className={baseClasses.join(" ")}
                      title={formatDateLabel(day.iso)}
                      onClick={() => handleDayClick(day.iso)}
                      onKeyDown={(evt) => {
                        if (evt.key === "Enter" || evt.key === " ") {
                          evt.preventDefault();
                          handleDayClick(day.iso);
                        }
                      }}
                    >
                      <div className={"flex items-center justify-between"}>
                        <span
                          className={"text-sm font-semibold text-blue-gray-800"}
                        >
                          {day.label}
                        </span>
                        {hasEvents && (
                          <span
                            className={
                              "rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-700"
                            }
                          >
                            {dayEvents.length}x
                          </span>
                        )}
                      </div>
                      <div className={"mt-2 space-y-1"}>
                        {showEventTitles ? (
                          <>
                            {dayEvents.slice(0, 3).map((event) => {
                              const isActive = selectedEventId === event.id;
                              const chipClasses = [
                                "w-full",
                                "rounded-md",
                                "px-2",
                                "py-1",
                                "text-[11px]",
                                "font-medium",
                                "text-left",
                                "transition",
                                "duration-200",
                              ];
                              if (isActive) {
                                chipClasses.push(
                                  "bg-red-500",
                                  "text-white",
                                  "shadow-md"
                                );
                              } else {
                                chipClasses.push(
                                  "bg-red-50",
                                  "text-red-700",
                                  "hover:bg-red-100"
                                );
                              }
                              return (
                                <button
                                  key={event.id}
                                  type={"button"}
                                  className={chipClasses.join(" ")}
                                  onClick={(evt) => {
                                    evt.stopPropagation();
                                    handleSelectEvent(event);
                                  }}
                                >
                                  <span className={"block break-words"}>
                                    <span className={"flex items-center justify-between gap-1"}>
                                      <span>{event.title.trim() || "Ohne Titel"}</span>
                                      {event.important && (
                                        <span
                                          className={`rounded-full border px-1 text-[9px] font-semibold uppercase ${
                                            isActive
                                              ? "border-white text-white"
                                              : "border-red-500 text-red-500"
                                          }`}
                                        >
                                          !
                                        </span>
                                      )}
                                    </span>
                                  </span>
                                  <p className={"text-[10px] text-blue-gray-400"}>
                                    {(() => {
                                      const label = resolveTimeLabel(event);
                                      return label === "Uhrzeit offen" ? "" : label;
                                    })()}
                                  </p>
                                </button>
                              );
                            })}
                            {dayEvents.length > 3 && (
                              <div className={"text-[10px] text-blue-gray-400"}>
                                +{dayEvents.length - 3} weitere
                              </div>
                            )}
                          </>
                        ) : (
                          <div className={"flex flex-wrap gap-1"}>
                            {dayEvents.slice(0, 8).map((event) => (
                              <button
                                key={event.id}
                                type={"button"}
                                className={`h-2.5 w-2.5 rounded-full ${
                                  selectedEventId === event.id
                                    ? "bg-red-500 shadow-md shadow-red-200"
                                    : "bg-red-200 hover:bg-red-300"
                                } transition`}
                                onClick={(evt) => {
                                  evt.stopPropagation();
                                  handleSelectEvent(event);
                                }}
                                title={event.title.trim() || "Ohne Titel"}
                              />
                            ))}
                            {dayEvents.length > 8 && (
                              <span
                                className={"text-[10px] text-blue-gray-400"}
                              >
                                +{dayEvents.length - 8}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          <div className={"lg:w-96 space-y-4"}>
            <div
              className={
                "rounded-2xl border border-blue-gray-100 bg-blue-gray-50/70 p-4"
              }
            >
              <Typography
                variant={"small"}
                className={"font-semibold text-blue-gray-900"}



              >
                Ausgewählter Tag
              </Typography>
              {selectedDate ? (
                <div className={"mt-2 space-y-2"}>
                  <p className={"text-sm text-blue-gray-600"}>
                    {formatDateLabel(selectedDate)}
                  </p>
                  <div
                    className={
                      "flex items-center justify-between text-xs text-blue-gray-500"
                    }
                  >
                    <span>Ereignisse</span>
                    <span>{selectedDateEvents.length}</span>
                  </div>
                  {selectedDateEvents.length > 0 ? (
                    <div className={"space-y-2 max-h-64 overflow-y-auto pr-1"}>
                      {selectedDateEvents.map((event) => {
                        const isActive = selectedEventId === event.id;
                        return (
                          <div
                            key={event.id}
                            role="button"
                            tabIndex={0}
                            onClick={() => handleSelectEvent(event)}
                            onKeyDown={(evt) => {
                              if (evt.key === "Enter" || evt.key === " ") {
                                evt.preventDefault();
                                handleSelectEvent(event);
                              }
                            }}
                            className={`w-full rounded-xl border px-3 py-2 text-left transition hover:shadow-md ${
                              isActive
                                ? "border-red-300 bg-white shadow-sm"
                                : "border-white bg-white/80"
                            }`}
                          >
                            <div
                              className={
                                "flex items-center justify-between gap-2"
                              }
                            >
                              <p
                                className={
                                  "text-sm font-semibold text-blue-gray-900 break-words"
                                }
                              >
                                {event.title.trim() || "Ohne Titel"}
                              </p>
                              {event.important && (
                                <span
                                  className={
                                    "rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-semibold uppercase text-red-600"
                                  }
                                >
                                  Wichtig
                                </span>
                              )}
                            </div>
                            <p className={"text-xs text-blue-gray-500"}>
                              {resolveTimeLabel(event)}
                            </p>
                            {event.endDate &&
                              event.endDate.trim() &&
                              event.endDate.trim() !== event.date.trim() && (
                                <p className={"text-[11px] text-blue-gray-400"}>
                                  Bis {formatDateLabel(event.endDate)}
                                </p>
                              )}
                            {event.qrLink.trim() && (
                              <p
                                className={
                                  'mt-1 text-[11px] font-semibold text-blue-gray-600 break-words'
                                }
                              >
                                {event.qrLink}
                              </p>
                            )}
                              <div className={"mt-2 flex justify-end"}>
                                <button
                                  type="button"
                                  className="rounded-md px-2 py-1 text-xs font-semibold text-blue-gray-600 transition hover:bg-blue-gray-50 active:scale-95"
                                  onClick={(evt) => {
                                    evt.stopPropagation();
                                    handleDeleteEvent(event.id);
                                  }}
                                >
                                  Entfernen
                                </button>
                              </div>
                            </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className={"text-sm text-blue-gray-500"}>
                      Für diesen Tag gibt es noch keine Ereignisse.
                    </p>
                  )}
                  <Button
                    variant={"outlined"}
                    color={"red"}
                    size={"sm"}
                    className={"normal-case w-full"}
                    onClick={handleStartNewDraft}
                    disabled={!selectedDate}



                  >
                    Neues Ereignis
                  </Button>
                  {undatedEvents.length > 0 && (
                    <div
                      className={
                        "mt-3 rounded-xl border border-dashed border-blue-gray-100 bg-white/80 p-3"
                      }
                    >
                      <Typography
                        variant={"small"}
                        className={"font-semibold text-blue-gray-900"}



                      >
                        Einträge ohne Datum
                      </Typography>
                      <p className={"text-xs text-blue-gray-500"}>
                        Wählen Sie einen Eintrag aus und übernehmen Sie
                        anschließend einen Tag aus dem Kalender.
                      </p>
                      <div
                        className={
                          "mt-2 space-y-2 max-h-48 overflow-y-auto pr-1"
                        }
                      >
                        {undatedEvents.map((event) => {
                          const isActive = selectedEventId === event.id;
                          return (
                            <button
                              key={event.id}
                              type={"button"}
                              onClick={() => handleSelectEvent(event)}
                              className={`w-full rounded-xl border px-3 py-2 text-left transition hover:shadow-md ${
                                isActive
                                  ? "border-red-300 bg-white shadow-sm"
                                  : "border-white bg-blue-gray-50/70"
                              }`}
                            >
                              <div className={"flex items-center justify-between gap-2"}>
                                <p
                                  className={
                                    "text-sm font-semibold text-blue-gray-900 break-words"
                                  }
                                >
                                  {event.title.trim() || "Ohne Titel"}
                                </p>
                                {event.important && (
                                  <span
                                    className={
                                      "rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-semibold uppercase text-red-600"
                                    }
                                  >
                                    Wichtig
                                  </span>
                                )}
                              </div>
                              <p className={"text-xs text-blue-gray-500"}>
                                {resolveTimeLabel(event)}
                              </p>
                              {event.endDate &&
                                event.endDate.trim() &&
                                event.endDate.trim() !== event.date.trim() && (
                                  <p className={"text-[11px] text-blue-gray-400"}>
                                    Bis {formatDateLabel(event.endDate)}
                                  </p>
                                )}
                              <div className={"mt-2 flex justify-end"}>
                                <Button
                                  variant={"text"}
                                  size={"sm"}
                                  color={"gray"}
                                  className={"normal-case text-xs"}
                                  onClick={(evt) => {
                                    evt.stopPropagation();
                                    handleDeleteEvent(event.id);
                                  }}



                                >
                                  Entfernen
                                </Button>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className={"mt-2 text-sm text-blue-gray-500"}>
                  Bitte wählen Sie zuerst einen Tag aus.
                </p>
              )}
            </div>

            {draft && (
              <div
                className={
                  "rounded-2xl border border-blue-gray-100 bg-white p-4 shadow-sm space-y-4"
                }
              >
                <div className={"flex flex-col gap-2"}>
                  <Typography
                    variant={"small"}
                    className={"font-semibold text-blue-gray-900"}



                  >
                    {draft.id ? "Ereignis bearbeiten" : "Neues Ereignis"}
                  </Typography>
                  <div className={"rounded-lg bg-blue-gray-50/80 p-3 text-sm"}>
                    <p
                      className={
                        "text-xs uppercase tracking-wide text-blue-gray-500"
                      }
                    >
                      Zugewiesenes Datum
                    </p>
                    <p className={"font-semibold text-blue-gray-900"}>
                      {formatDateLabel(draft.date)}
                    </p>
                    {draft.endDate && draft.endDate !== draft.date && (
                      <div className={"mt-3"}>
                        <p
                          className={
                            "text-xs uppercase tracking-wide text-blue-gray-500"
                          }
                        >
                          Enddatum
                        </p>
                        <p className={"font-semibold text-blue-gray-900"}>
                          {formatDateLabel(draft.endDate)}
                        </p>
                      </div>
                    )}
                    {selectedDate && draft.date !== selectedDate && (
                      <Button
                        variant={"text"}
                        size={"sm"}
                        color={"red"}
                        className={"normal-case mt-2"}
                        onClick={() => handleDraftChange("date", selectedDate)}



                      >
                        Auswahl übernehmen
                      </Button>
                    )}
                  </div>
                </div>
                <Input
                  type={"date"}
                  label={"Enddatum"}
                  value={draft.endDate}
                  onChange={(event) =>
                    handleDraftChange("endDate", event.target.value)
                  }
                  min={draft.date || undefined}
                  crossOrigin={""}
                  error={!!errors.endDate}
                />
                {errors.endDate && <Typography color="red" className="text-xs mt-1">{errors.endDate}</Typography>}
                <Input
                  label={"Titel"}
                  value={draft.title}
                  onChange={(event) =>
                    handleDraftChange("title", event.target.value)
                  }
                  error={!!errors.title}
                  crossOrigin={""}


                  maxLength={50}
                />
                {errors.title ? (
                    <Typography color="red" className="text-xs mt-1">{errors.title}</Typography>
                  ) : (
                    <Typography color="gray" className="text-xs mt-1">Max. 50 Zeichen</Typography>
                  )}

                <div className={"space-y-3"}>
                  <div className={"space-y-3"}>
                    <Input
                      type={"time"}
                      label={"Startzeit"}
                      value={draft.startTime}
                      disabled={draft.allDay}
                      onChange={(event) =>
                        handleDraftChange("startTime", event.target.value)
                      }
                      crossOrigin={""}


                    />
                    <Input
                      type={"time"}
                      label={"Endzeit"}
                      value={draft.endTime}
                      disabled={draft.allDay}
                      onChange={(event) =>
                        handleDraftChange("endTime", event.target.value)
                      }
                      crossOrigin={""}
                      error={!!errors.time} />
                    {errors.time && <Typography color="red" className="text-xs mt-1">{errors.time}</Typography>}
                  </div>
                  <div className={"space-y-3"}>
                    <div className={"flex items-center justify-between rounded-xl bg-blue-gray-50/80 px-3 py-2"}>
                      <div className={"flex flex-col"}>
                        <Typography
                          variant={"small"}
                          className={"text-sm font-semibold text-blue-gray-700"}
                        >
                          Ganztägig
                        </Typography>
                        <span className={"text-[11px] text-blue-gray-500"}>
                          Markiere, wenn kein Zeitfenster gelten soll
                        </span>
                      </div>
                      <Switch
                        crossOrigin={""}
                        ripple={false}
                        label={""}
                        checked={draft.allDay}
                        onChange={(event) =>
                          handleAllDayToggle(event.target.checked)
                        }
                      />
                    </div>
                    <div className={"flex items-center justify-between rounded-xl bg-blue-gray-50/80 px-3 py-2"}>
                      <div className={"flex flex-col"}>
                        <Typography
                          variant={"small"}
                          className={"text-sm font-semibold text-blue-gray-700"}
                        >
                          Wichtig
                        </Typography>
                        <span className={"text-[11px] text-blue-gray-500"}>
                          Hebe hervor, damit das Event auffälliger angezeigt wird
                        </span>
                      </div>
                      <Switch
                        crossOrigin={""}
                        ripple={false}
                        label={""}
                        checked={draft.important}
                        onChange={(event) =>
                          handleDraftChange("important", event.target.checked)
                        }
                      />
                    </div>
                  </div>
                </div>
                <Input
                  type={"url"}
                  label={"Link für QR-Code"}
                  value={draft.qrLink}
                  onChange={(event) =>
                    handleDraftChange("qrLink", event.target.value)
                  }
                  placeholder={"https://..."}
                  crossOrigin={""}


                />
                <div
                  className={
                    "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
                  }
                >
                  {draft.id !== null && (
                    <Button
                      variant={"text"}
                      color={"gray"}
                      className={"normal-case w-full sm:w-auto"}
                      onClick={() => handleDeleteEvent(draft.id!)}



                    >
                      Löschen
                    </Button>
                  )}
                  <Button
                    variant={"filled"}
                    color={"red"}
                    className={"normal-case w-full sm:w-auto"}
                    onClick={handleSaveDraft}
                    disabled={saveDisabled}



                  >
                    Speichern
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogBody>
      <DialogFooter



      >
        <Button
          variant={"text"}
          color={"gray"}
          className={"normal-case"}
          onClick={onClose}



        >
          Schließen
        </Button>
      </DialogFooter>
    </Dialog>
  );
}

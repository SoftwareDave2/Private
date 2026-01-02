"use client";

import {useEffect, useMemo, useState} from "react";
import {Button, Dialog, DialogBody, DialogFooter, DialogHeader, Input, Switch, Typography} from "@material-tailwind/react";

import {BookingEntry} from "../../types";

type RoomBookingCalendarDialogProps = {
    open: boolean;
    entries: BookingEntry[];
    onClose: () => void;
    onSaveEntry: (entry: BookingEntry) => void;
    onDeleteEntry: (entryId: number) => void;
};

type CalendarDay = {
    iso: string;
    label: number;
    inCurrentMonth: boolean;
};

type BookingDraft = {
    id: number | null;
    title: string;
    date: string;
    endDate: string;
    startTime: string;
    endTime: string;
    allDay: boolean;
    weekly: boolean;
    weeklyUntil: string;
};

const WEEKDAY_LABELS = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

const toISODate = (date: Date) => {
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, "0");
    const day = `${date.getDate()}`.padStart(2, "0");
    return `${year}-${month}-${day}`;
};

const getMonthStart = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1);
const getMonthEnd = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0);

const getCalendarDays = (anchor: Date): CalendarDay[] => {
    const firstOfMonth = getMonthStart(anchor);
    const lastOfMonth = getMonthEnd(anchor);

    const startDay = (firstOfMonth.getDay() + 6) % 7;
    const daysBefore = startDay;

    const totalDays = daysBefore + lastOfMonth.getDate();
    const totalCells = Math.ceil(totalDays / 7) * 7;

    const startDate = new Date(firstOfMonth);
    startDate.setDate(firstOfMonth.getDate() - daysBefore);

    return Array.from({length: totalCells}).map((_, index) => {
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

const resolveTimeLabel = (entry: Pick<BookingEntry, "startTime" | "endTime" | "allDay">) => {
    if (entry.allDay) {
        return "Ganztägig";
    }
    const start = (entry.startTime ?? "").trim();
    const end = (entry.endTime ?? "").trim();
    if (start) {
        return end ? `${start} - ${end}` : start;
    }
    return end ? `Bis ${end}` : "Uhrzeit offen";
};

export function RoomBookingCalendarDialog({
    open,
    entries,
    onClose,
    onSaveEntry,
    onDeleteEntry,
}: RoomBookingCalendarDialogProps) {
    const [viewDate, setViewDate] = useState<Date>(new Date());
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [selectedEntryId, setSelectedEntryId] = useState<number | null>(null);
    const [draft, setDraft] = useState<BookingDraft | null>(null);
    const [showTitles, setShowTitles] = useState(true);
    const [errors, setErrors] = useState({title: "", endDate: "", time: ""});
    const [isValid, setIsValid] = useState(false);
    useEffect(() => {
        if (!open) {
            setSelectedDate(null);
            setSelectedEntryId(null);
            setDraft(null);
            setViewDate(new Date());
            return;
        }

        if (!selectedDate) {
            const firstEntryDate = entries.find((entry) => entry.date && entry.date.trim().length > 0)?.date;
            const baseDate = normalizeDateString(firstEntryDate) || toISODate(new Date());
            setSelectedDate(baseDate);
            const parsed = parseDate(baseDate);
            if (parsed) {
                setViewDate(parsed);
            }
        }
    }, [open, entries, selectedDate]);

    const entriesByDate = useMemo(() => {
        return entries.reduce<Record<string, BookingEntry[]>>((acc, entry) => {
            const dateKey = (entry.date ?? "").trim();
            if (!dateKey) {
                return acc;
            }
            if (!acc[dateKey]) {
                acc[dateKey] = [];
            }
            acc[dateKey].push(entry);
            return acc;
        }, {});
    }, [entries]);

    const undatedEntries = useMemo(
        () => entries.filter((entry) => !(entry.date && entry.date.trim().length > 0)),
        [entries],
    );

    const nextEntryId = useMemo(() => {
        if (entries.length === 0) {
            return 1;
        }
        return Math.max(...entries.map((entry) => entry.id)) + 1;
    }, [entries]);

    const calendarDays = useMemo(() => getCalendarDays(viewDate), [viewDate]);
    const selectedDayEntries = selectedDate ? entriesByDate[selectedDate] ?? [] : [];

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
        setSelectedEntryId(null);
        setDraft((prev) => {
            if (prev && prev.id === null) {
                const nextDraft = {...prev, date: iso};
                if (!nextDraft.endDate || nextDraft.endDate < iso) {
                    nextDraft.endDate = iso;
                }
                if (nextDraft.weekly && (!nextDraft.weeklyUntil || nextDraft.weeklyUntil < iso)) {
                    nextDraft.weeklyUntil = iso;
                }
                return nextDraft;
            }
            return prev;
        });
    };

    const handleDayClick = (dayIso: string) => {
        setSelectedDate(dayIso);
        setSelectedEntryId(null);
        setDraft((prev) => {
            if (prev && prev.id === null) {
                const nextDraft = {...prev, date: dayIso};
                if (!nextDraft.endDate || nextDraft.endDate < dayIso) {
                    nextDraft.endDate = dayIso;
                }
                if (nextDraft.weekly && (!nextDraft.weeklyUntil || nextDraft.weeklyUntil < dayIso)) {
                    nextDraft.weeklyUntil = dayIso;
                }
                return nextDraft;
            }
            return prev;
        });
    };

    const handleSelectEntry = (entry: BookingEntry) => {
        setSelectedEntryId(entry.id);
        const normalizedDate = normalizeDateString(entry.date);
        const normalizedEndDate = normalizeDateString(entry.endDate) || normalizedDate || "";
        if (normalizedDate) {
            setSelectedDate(normalizedDate);
            const parsed = parseDate(normalizedDate);
            if (parsed) {
                setViewDate(parsed);
            }
        }
        setDraft({
            id: entry.id,
            title: entry.title,
            date: normalizedDate || "",
            endDate: normalizedEndDate,
            startTime: entry.startTime,
            endTime: entry.endTime,
            allDay: Boolean(entry.allDay),
            weekly: false,
            weeklyUntil: normalizedEndDate || normalizedDate || "",
        });
    };

    const handleStartNewDraft = () => {
        if (!selectedDate) {
            return;
        }
        setSelectedEntryId(null);
        setDraft({
            id: null,
            title: "",
            date: selectedDate,
            endDate: selectedDate,
            startTime: "",
            endTime: "",
            allDay: false,
            weekly: false,
            weeklyUntil: selectedDate,
        });
    };

    const handleDraftChange = <K extends keyof BookingDraft>(key: K, value: BookingDraft[K]) => {
        setDraft((prev) => {
            if (!prev) {
                return prev;
            }
            const next = {...prev, [key]: value} as BookingDraft;
            if (key === "date") {
                const normalizedStart = typeof value === "string" ? normalizeDateString(value) : "";
                next.date = normalizedStart;
                if (!next.endDate || (normalizedStart && next.endDate < normalizedStart)) {
                    next.endDate = normalizedStart;
                }
                if (next.weekly && (!next.weeklyUntil || next.weeklyUntil < normalizedStart)) {
                    next.weeklyUntil = normalizedStart;
                }
            } else if (key === "endDate") {
                const normalizedEnd = typeof value === "string" ? normalizeDateString(value) : "";
                if (!normalizedEnd) {
                    next.endDate = next.date;
                } else if (next.date && normalizedEnd < next.date) {
                    next.endDate = next.date;
                } else {
                    next.endDate = normalizedEnd;
                }
            } else if (key === "weeklyUntil") {
                const normalized = typeof value === "string" ? normalizeDateString(value) : "";
                next.weeklyUntil = normalized;
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
                : prev,
        );
    };

    const handleWeeklyToggle = (checked: boolean) => {
        setDraft((prev) =>
            prev
                ? {
                    ...prev,
                    weekly: checked,
                    weeklyUntil: checked ? prev.weeklyUntil || prev.endDate || prev.date : "",
                }
                : prev,
        );
    };
    useEffect(() => {
        if (!draft) {
            setErrors({title: "", endDate: "", time: ""});
            setIsValid(false);
            return;
        }

        const newErrors = {title: "", endDate: "", time: ""};
        let valid = true;

        const title = (draft.title ?? "").trim();
        if (!title) {
            newErrors.title = "Titel ist erforderlich.";
            valid = false;
        } else if (title.length > 50) {
            newErrors.title = "Maximal 50 Zeichen.";
            valid = false;
        }

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

        if (draft.weekly) {
            const until = parseDate(draft.weeklyUntil);
            const startDate = parseDate(draft.date);
            if (!until || !startDate) {
                newErrors.endDate = newErrors.endDate || "Wiederholungsende erforderlich.";
                valid = false;
            } else if (until < startDate) {
                newErrors.endDate = newErrors.endDate || "Wiederholungsende muss nach dem Start liegen.";
                valid = false;
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
        const normalizedEndDate = rawEndDate && rawEndDate >= normalizedStartDate ? rawEndDate : normalizedStartDate;

        const occurrences: BookingEntry[] = [];
        const weeklyUntil = draft.weekly ? normalizeDateString(draft.weeklyUntil) : null;
        const baseId = draft.id ?? nextEntryId;

        const addOccurrence = (dateIso: string, offset: number) => {
            const entry: BookingEntry = {
                id: offset === 0 && draft.id !== null ? draft.id : baseId + offset,
                title: draft.title.trim(),
                date: dateIso,
                endDate: dateIso,
                startTime: draft.startTime.trim(),
                endTime: draft.endTime.trim(),
                allDay: draft.allDay,
            };
            occurrences.push(entry);
        };

        addOccurrence(normalizedStartDate, 0);

        if (draft.weekly && weeklyUntil) {
            const start = parseDate(normalizedStartDate);
            const until = parseDate(weeklyUntil);
            if (start && until) {
                let cursor = new Date(start);
                let offset = 0;
                while (true) {
                    cursor.setDate(cursor.getDate() + 7);
                    if (cursor > until) {
                        break;
                    }
                    offset += 1;
                    addOccurrence(toISODate(cursor), offset);
                }
            }
        }

        occurrences.forEach(onSaveEntry);

        const firstPayload = occurrences[0];
        setDraft({
            ...draft,
            id: firstPayload.id,
            title: firstPayload.title,
            date: firstPayload.date,
            endDate: firstPayload.endDate,
        });
        setSelectedEntryId(firstPayload.id);
        setSelectedDate(firstPayload.date);
    };

    const handleDeleteEntry = (entryId: number) => {
        onDeleteEntry(entryId);
        if (draft?.id === entryId) {
            setDraft(null);
        }
        if (selectedEntryId === entryId) {
            setSelectedEntryId(null);
        }
    };

    const monthLabel = viewDate.toLocaleDateString("de-DE", {
        month: "long",
        year: "numeric",
    });

    const saveDisabled = !draft || !isValid;
    return (
        <Dialog open={open} handler={onClose} size={"xl"}>
            <DialogHeader className={"flex flex-col gap-1"}>
                <Typography variant={"h5"} className={"text-red-700"}>
                    Kalenderübersicht
                </Typography>
                <Typography variant={"small"} color={"gray"} className={"font-normal"}>
                    Lege Raumbuchungen per Kalender an, bearbeite Zeitfenster und lösche nicht mehr benötigte Termine.
                </Typography>
            </DialogHeader>
            <DialogBody className={"space-y-6 max-h-[75vh] overflow-y-auto pr-1"}>
                <div className={"flex flex-col gap-6 lg:flex-row"}>
                    <div className={"lg:flex-1 space-y-4"}>
                        <div className={"flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"}>
                            <div className={"flex flex-wrap items-center justify-between gap-2 sm:justify-start"}>
                                <Button variant={"text"} color={"gray"} size={"sm"} className={"normal-case"} onClick={() => changeMonth(-1)}>
                                    Zurück
                                </Button>
                                <Typography variant={"h6"} className={"capitalize"}>
                                    {monthLabel}
                                </Typography>
                                <Button variant={"text"} color={"gray"} size={"sm"} className={"normal-case"} onClick={() => changeMonth(1)}>
                                    Weiter
                                </Button>
                                <Button variant={"outlined"} color={"red"} size={"sm"} className={"normal-case"} onClick={jumpToToday}>
                                    Heute
                                </Button>
                            </div>
                            <div className={"flex items-center justify-end gap-2"}>
                                <Typography variant={"small"} className={"text-xs font-medium text-blue-gray-600"}>
                                    Titel anzeigen
                                </Typography>
                                <Switch
                                    crossOrigin={""}
                                    label={""}
                                    checked={showTitles}
                                    onChange={(event) => setShowTitles(event.target.checked)}
                                    ripple={false}
                                />
                            </div>
                        </div>
                        <div className={"flex flex-wrap items-center gap-4 rounded-xl bg-blue-gray-50/80 px-3 py-2 text-xs text-blue-gray-600"}>
                            <div className={"flex items-center gap-1"}>
                                <span className={"h-2.5 w-2.5 rounded-full bg-red-400"}></span>
                                <span>Geplante Termine</span>
                            </div>
                            <div className={"flex items-center gap-1"}>
                                <span className={"h-2.5 w-2.5 rounded-full border border-blue-gray-200"}></span>
                                <span>Keine Einträge</span>
                            </div>
                        </div>
                        <div className={"overflow-x-auto"}>
                            <div className={"grid grid-cols-7 gap-2 min-w-[560px] text-center text-xs font-semibold uppercase text-blue-gray-400"}>
                                {WEEKDAY_LABELS.map((label) => (
                                    <span key={label}>{label}</span>
                                ))}
                            </div>
                        </div>
                        <div className={"overflow-x-auto pb-2"}>
                            <div className={"grid grid-cols-7 gap-2 min-w-[560px]"}>
                                {calendarDays.map((day) => {
                                    const dayEntries = entriesByDate[day.iso] ?? [];
                                    const hasEntries = dayEntries.length > 0;
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
                                        baseClasses.push("from-white", "to-red-50", "border-red-400", "shadow-lg", "ring-2", "ring-red-100");
                                    } else {
                                        baseClasses.push(
                                            "from-white",
                                            hasEntries ? "to-red-50/40" : "to-white",
                                            "border-blue-gray-100",
                                            "hover:-translate-y-1",
                                            "hover:shadow-md",
                                            "hover:border-red-200",
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
                                                <span className={"text-sm font-semibold text-blue-gray-800"}>{day.label}</span>
                                                {hasEntries && (
                                                    <span className={"rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-700"}>
                                                        {dayEntries.length}x
                                                    </span>
                                                )}
                                            </div>
                                            <div className={"mt-2 space-y-1"}>
                                                {showTitles ? (
                                                    <>
                                                        {dayEntries.slice(0, 3).map((entry) => {
                                                            const isActive = selectedEntryId === entry.id;
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
                                                                chipClasses.push("bg-red-500", "text-white", "shadow-md");
                                                            } else {
                                                                chipClasses.push("bg-red-50", "text-red-700", "hover:bg-red-100");
                                                            }
                                                            return (
                                                                <button
                                                                    key={entry.id}
                                                                    type={"button"}
                                                                    className={chipClasses.join(" ")}
                                                                    onClick={(evt) => {
                                                                        evt.stopPropagation();
                                                                        handleSelectEntry(entry);
                                                                    }}
                                                                >
                                                                    <span className={"block break-words"}>
                                                                        <span className={"flex items-center justify-between gap-1"}>
                                                                            <span>{entry.title.trim() || "Ohne Titel"}</span>
                                                                        </span>
                                                                    </span>
                                                                    <p className={"text-[10px] text-blue-gray-400"}>
                                                                        {(() => {
                                                                            const label = resolveTimeLabel(entry);
                                                                            return label === "Uhrzeit offen" ? "" : label;
                                                                        })()}
                                                                    </p>
                                                                </button>
                                                            );
                                                        })}
                                                        {dayEntries.length > 3 && (
                                                            <div className={"text-[10px] text-blue-gray-400"}>+{dayEntries.length - 3} weitere</div>
                                                        )}
                                                    </>
                                                ) : (
                                                    <div className={"flex flex-wrap gap-1"}>
                                                        {dayEntries.slice(0, 8).map((entry) => (
                                                            <button
                                                                key={entry.id}
                                                                type={"button"}
                                                                className={`h-2.5 w-2.5 rounded-full ${
                                                                    selectedEntryId === entry.id ? "bg-red-500 shadow-md shadow-red-200" : "bg-red-200 hover:bg-red-300"
                                                                } transition`}
                                                                onClick={(evt) => {
                                                                    evt.stopPropagation();
                                                                    handleSelectEntry(entry);
                                                                }}
                                                                title={entry.title.trim() || "Ohne Titel"}
                                                            />
                                                        ))}
                                                        {dayEntries.length > 8 && (
                                                            <span className={"text-[10px] text-blue-gray-400"}>+{dayEntries.length - 8}</span>
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
                        <div className={"rounded-2xl border border-blue-gray-100 bg-blue-gray-50/70 p-4"}>
                            <Typography variant={"small"} className={"font-semibold text-blue-gray-900"}>
                                Ausgewählter Tag
                            </Typography>
                            {selectedDate ? (
                                <div className={"mt-2 space-y-2"}>
                                    <p className={"text-sm text-blue-gray-600"}>{formatDateLabel(selectedDate)}</p>
                                    <div className={"flex items-center justify-between text-xs text-blue-gray-500"}>
                                        <span>Termine</span>
                                        <span>{selectedDayEntries.length}</span>
                                    </div>
                                    {selectedDayEntries.length > 0 ? (
                                        <div className={"space-y-2 max-h-64 overflow-y-auto pr-1"}>
                                            {selectedDayEntries.map((entry) => {
                                                const isActive = selectedEntryId === entry.id;
                                                return (
                                                    <div
                                                        key={entry.id}
                                                        className={`rounded-lg border p-3 transition ${
                                                            isActive ? "border-red-300 bg-red-50/70 shadow-sm" : "border-blue-gray-100 bg-white"
                                                        }`}
                                                    >
                                                        <div className={"flex items-start justify-between gap-2"}>
                                                            <div className={"space-y-1"}>
                                                                <p className={"text-sm font-semibold text-blue-gray-900"}>{entry.title.trim() || "Ohne Titel"}</p>
                                                                <p className={"text-[11px] text-blue-gray-500"}>{resolveTimeLabel(entry)}</p>
                                                            </div>
                                                            <div className={"flex items-center gap-2"}>
                                                                <Button
                                                                    variant={"text"}
                                                                    color={"gray"}
                                                                    size={"sm"}
                                                                    className={"normal-case"}
                                                                    onClick={() => handleSelectEntry(entry)}
                                                                >
                                                                    Bearbeiten
                                                                </Button>
                                                                <Button
                                                                    variant={"text"}
                                                                    color={"red"}
                                                                    size={"sm"}
                                                                    className={"normal-case"}
                                                                    onClick={() => handleDeleteEntry(entry.id)}
                                                                >
                                                                    Löschen
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <p className={"text-xs text-blue-gray-500"}>Keine Termine für diesen Tag.</p>
                                    )}
                                    <Button variant={"outlined"} color={"red"} size={"sm"} className={"normal-case w-full"} onClick={handleStartNewDraft}>
                                        Neuen Termin anlegen
                                    </Button>
                                </div>
                            ) : (
                                <p className={"text-xs text-blue-gray-500"}>Bitte wähle einen Tag im Kalender aus.</p>
                            )}
                        </div>

                        <div className={"rounded-2xl border border-blue-gray-100 bg-white p-4 shadow-sm space-y-3"}>
                            <div className={"flex items-center justify-between"}>
                                <Typography variant={"small"} className={"font-semibold text-blue-gray-900"}>
                                    Termin bearbeiten
                                </Typography>
                                {draft?.id !== null && (
                                    <Button
                                        variant={"text"}
                                        color={"gray"}
                                        size={"sm"}
                                        className={"normal-case"}
                                        onClick={() => draft?.id !== null && handleDeleteEntry(draft.id)}
                                    >
                                        Löschen
                                    </Button>
                                )}
                            </div>
                            {draft ? (
                                <div className={"space-y-3"}>
                                    <Input
                                        type={"date"}
                                        label={"Startdatum"}
                                        value={draft.date}
                                        onChange={(event) => handleDraftChange("date", event.target.value)}
                                        crossOrigin={""}
                                    />
                                    <Input
                                        type={"date"}
                                        label={"Enddatum"}
                                        value={draft.endDate}
                                        onChange={(event) => handleDraftChange("endDate", event.target.value)}
                                        min={draft.date || undefined}
                                        crossOrigin={""}
                                        error={!!errors.endDate}
                                    />
                                    {errors.endDate && (
                                        <Typography color="red" className="text-xs mt-1">
                                            {errors.endDate}
                                        </Typography>
                                    )}
                                    <Input
                                        label={"Titel"}
                                        value={draft.title}
                                        onChange={(event) => handleDraftChange("title", event.target.value)}
                                        error={!!errors.title}
                                        crossOrigin={""}
                                        maxLength={50}
                                    />
                                    {errors.title ? (
                                        <Typography color="red" className="text-xs mt-1">
                                            {errors.title}
                                        </Typography>
                                    ) : (
                                        <Typography color="gray" className="text-xs mt-1">
                                            Max. 50 Zeichen
                                        </Typography>
                                    )}

                                    <div className={"space-y-3"}>
                                        <div className={"space-y-3"}>
                                            <Input
                                                type={"time"}
                                                label={"Startzeit"}
                                                value={draft.startTime}
                                                disabled={draft.allDay}
                                                onChange={(event) => handleDraftChange("startTime", event.target.value)}
                                                crossOrigin={""}
                                            />
                                            <Input
                                                type={"time"}
                                                label={"Endzeit"}
                                                value={draft.endTime}
                                                disabled={draft.allDay}
                                                onChange={(event) => handleDraftChange("endTime", event.target.value)}
                                                crossOrigin={""}
                                                error={!!errors.time}
                                            />
                                            {errors.time && (
                                                <Typography color="red" className="text-xs mt-1">
                                                    {errors.time}
                                                </Typography>
                                            )}
                                        </div>
                                        <div className={"flex flex-col space-y-3"}>
                                            <div className={"flex items-center justify-between rounded-xl bg-blue-gray-50/80 px-3 py-2"}>
                                                <div className={"flex flex-col"}>
                                                    <Typography variant={"small"} className={"text-sm font-semibold text-blue-gray-700"}>
                                                        Ganztägig
                                                    </Typography>
                                                    <span className={"text-[11px] text-blue-gray-500"}>Markiere, wenn kein Zeitfenster gelten soll</span>
                                                </div>
                                                <Switch crossOrigin={""} ripple={false} label={""} checked={draft.allDay} onChange={(event) => handleAllDayToggle(event.target.checked)} />
                                            </div>
                                            <div className={"flex items-center justify-between rounded-xl bg-blue-gray-50/80 px-3 py-2"}>
                                                <div className={"flex flex-col"}>
                                                    <Typography variant={"small"} className={"text-sm font-semibold text-blue-gray-700"}>
                                                        Wöchentlich
                                                    </Typography>
                                                    <span className={"text-[11px] text-blue-gray-500"}>Wiederhole den Termin jede Woche</span>
                                                </div>
                                                <Switch crossOrigin={""} ripple={false} label={""} checked={draft.weekly} onChange={(event) => handleWeeklyToggle(event.target.checked)} />
                                            </div>
                                            {draft.weekly && (
                                                <div className={"space-y-2 rounded-xl border border-blue-gray-100 bg-blue-gray-50/60 p-3"}>
                                                    <Input
                                                        type={"date"}
                                                        label={"Wiederholen bis"}
                                                        value={draft.weeklyUntil}
                                                        min={draft.date || undefined}
                                                        onChange={(event) => handleDraftChange("weeklyUntil", event.target.value)}
                                                        crossOrigin={""}
                                                    />
                                                    <Typography variant={"small"} className={"text-[11px] text-blue-gray-600"}>
                                                        Der Termin wird jede Woche mit gleicher Uhrzeit und gleichem Titel angelegt, bis einschließlich diesem Datum.
                                                    </Typography>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className={"flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"}>
                                        {draft.id !== null && (
                                            <Button
                                                variant={"text"}
                                                color={"gray"}
                                                className={"normal-case w-full sm:w-auto"}
                                                onClick={() => handleDeleteEntry(draft.id!)}
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
                            ) : (
                                <p className={"text-xs text-blue-gray-500"}>
                                    Wähle einen Eintrag aus oder klicke auf "Neuen Termin anlegen", um loszulegen.
                                </p>
                            )}
                        </div>

                        {undatedEntries.length > 0 && (
                            <div className={"rounded-2xl border border-amber-200 bg-amber-50 p-4 space-y-2"}>
                                <Typography variant={"small"} className={"font-semibold text-amber-800"}>
                                    Termine ohne Datum
                                </Typography>
                                <p className={"text-xs text-amber-700"}>
                                    Diese Einträge haben kein Datum und werden nicht im Kalender angezeigt. Bitte ergänze ein Datum.
                                </p>
                                <div className={"space-y-2"}>
                                    {undatedEntries.map((entry) => (
                                        <div key={entry.id} className={"rounded-lg border border-amber-200 bg-white px-3 py-2"}>
                                            <div className={"flex items-center justify-between gap-2"}>
                                                <div>
                                                    <p className={"text-sm font-semibold text-amber-900"}>{entry.title.trim() || "Ohne Titel"}</p>
                                                    <p className={"text-[11px] text-amber-700"}>{resolveTimeLabel(entry)}</p>
                                                </div>
                                                <Button
                                                    variant={"text"}
                                                    color={"red"}
                                                    size={"sm"}
                                                    className={"normal-case"}
                                                    onClick={() => handleSelectEntry(entry)}
                                                >
                                                    Datum setzen
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </DialogBody>
            <DialogFooter>
                <Button variant={"text"} color={"gray"} className={"normal-case"} onClick={onClose}>
                    Schließen
                </Button>
            </DialogFooter>
        </Dialog>
    );
}

declare module "react-big-calendar" {
  import * as React from "react";

  export interface Event {
    allDay?: boolean;
    title?: React.ReactNode;
    start?: Date;
    end?: Date;
    resource?: any;
    [key: string]: any;
  }

  export interface DateFnsLocalizerArgs {
    format: any;
    parse: any;
    startOfWeek: any;
    getDay: any;
    locales: any;
  }

  export function dateFnsLocalizer(args: DateFnsLocalizerArgs): any;

  export interface CalendarProps<TEvent extends object = Event, TResource extends object = object> {
    localizer: any;
    events?: TEvent[];
    startAccessor?: string | ((event: TEvent) => Date);
    endAccessor?: string | ((event: TEvent) => Date);
    titleAccessor?: string | ((event: TEvent) => string);
    allDayAccessor?: string | ((event: TEvent) => boolean);
    style?: React.CSSProperties;
    className?: string;
    views?: any;
    defaultView?: string;
    view?: string;
    date?: Date;
    defaultDate?: Date;
    onSelectEvent?: (event: TEvent, e: React.SyntheticEvent) => void;
    onSelectSlot?: (slotInfo: any) => void;
    selectable?: boolean | "ignoreEvents";
    eventPropGetter?: (event: TEvent, start: Date, end: Date, isSelected: boolean) => { className?: string; style?: React.CSSProperties };
    components?: any;
    [key: string]: any;
  }

  export class Calendar<TEvent extends object = Event, TResource extends object = object> extends React.Component<CalendarProps<TEvent, TResource>> {}
}

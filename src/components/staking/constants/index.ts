export enum TypeLock {
  MONTH = "months",
  DAY = "days",
  MIN = "minutes",
}

export const LOCK_TIME_OPTIONS = [
  {
    label: "1 months",
    value: 1,
    type: TypeLock.MIN,
  },
  {
    label: "3 months",
    value: 3,
    type: TypeLock.MIN,
  },
  {
    label: "6 months",
    value: 6,
    type: TypeLock.MIN,
  },
];
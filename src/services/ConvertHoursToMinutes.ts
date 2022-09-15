export function ConvertHoursToMinutes(hourString: string) {
  const [hours, minutes] = hourString.split(":").map(Number);

  const MinutesAmount = hours * 60 + minutes;

  return MinutesAmount;
}

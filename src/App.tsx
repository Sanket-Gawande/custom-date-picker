import { useMemo, useState, useRef } from "react";
import ChevronLeft from "./assets/chevron-left";
import ChevronRight from "./assets/chevron-right";
import Calendar from "./assets/calendar";

function App() {
  const [month, setMonth] = useState(
    new Date().toLocaleString("en-us", { month: "long", year: "numeric" })
  );

  const [date, setDate] = useState<string>();
  const calendarRef = useRef<HTMLDivElement>(null);
  const datesMap = useRef<
    Map<
      string,
      { date: number; available: boolean; incMonth: number; key: string }[]
    >
  >(new Map());

  const dates = useMemo(() => {
    // returns saved dates if month is already computed
    const cachedDates = datesMap.current.get(month);
    if (cachedDates) return cachedDates;

    const date = new Date(month);

    // fill padding with prev dates if month starts with weekday other than Sunday (0)
    // prepend whole week if it starts with Sunday (0) (Calendar on ubuntu)

    const length = date.getDay() || 7;
    let temps = Array.from({ length }).map((_, index) => ({
      date: new Date(
        date.getTime() - (length - index) * 24 * 60 * 60 * 1000
      ).getDate(),
      available: false,
      key: Math.random().toString(32).substring(2),
      incMonth: -1,
    }));

    let temp_date = date.getTime();

    // add dates of current month
    while (new Date(temp_date).getMonth() === date.getMonth()) {
      const d = new Date(temp_date);
      temps.push({
        date: d.getDate(),
        available: true,
        key: Math.random().toString(32).substring(2),
        incMonth: 0,
      });
      temp_date += 24 * 60 * 60 * 1000;
    }

    // fill padding with dates of next month
    temps = temps.concat(
      Array.from({ length: 42 - temps.length }).map((_, index) => ({
        date: index + 1,
        available: false,
        key: Math.random().toString(32).substring(2),
        incMonth: 1,
      }))
    );

    // save computation to dates map (sort of caching)
    datesMap.current.set(month, temps);
    return temps;
  }, [month]);

  function changeMonth(step: number) {
    {
      const date = new Date(month);
      const m = date.getMonth();
      date.setMonth(m + step);
      setMonth(
        date.toLocaleString("en-us", { month: "long", year: "numeric" })
      );
    }
  }
  return (
    <section className="h-screen font-sans w-screen bg-neutral-900 flex items-center justify-center gap-4 flex-col">
      <div
        ref={calendarRef}
        tabIndex={0}
        className="group relative px-4 py-2 border w-11/12 max-w-72 rounded-lg text-slate-300 cursor-pointer
      hover:bg-neutral-800 flex justify-between items-center focus:border-b-sky-700"
      >
        <p>{date ?? "Choose date"}</p>
        <Calendar />
        <section className="border border-neutral-700 text-xs  w-68 rounded-lg absolute bg-neutral-800 transition-all top-[70%] pointer-events-none group-focus-within:pointer-events-auto opacity-0 group-focus-within:opacity-100 group-focus-within:top-[calc(100%+0.75rem)] shadow-xl shadow-black/30 overflow-hidden ">
          <section className="flex justify-between items-center border-b  border-neutral-700">
            <button
              className="hover:bg-neutral-900 py-2 px-4"
              onClick={() => changeMonth(-1)}
            >
              <ChevronLeft />
            </button>
            <p>{month}</p>
            <button
              className="hover:bg-neutral-900 py-2 px-4"
              onClick={() => changeMonth(1)}
            >
              <ChevronRight />
            </button>
          </section>
          <main className="min-w-fit text-center">
            <article className="grid grid-cols-7">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <p
                  className="p-1 border-b uppercase border-neutral-700"
                  key={day}
                >
                  {day}
                </p>
              ))}
              {dates.map((item) => (
                <p
                  onClick={() => {
                    if (item.incMonth) {
                      changeMonth(item.incMonth);
                      setDate(undefined);
                    } else {
                      calendarRef.current?.blur();
                      setDate(`${item.date} ${month}`);
                    }
                  }}
                  className="p-1 disabled:cursor-not-allowed disabled:opacity-80 hover:bg-neutral-700"
                  key={item.key}
                  style={{
                    opacity: item.available ? 1 : 0.6,
                  }}
                >
                  {item.date}
                </p>
              ))}
            </article>
          </main>
        </section>
      </div>
    </section>
  );
}

export default App;

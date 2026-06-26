import { prisma } from "@/lib/prisma";
import { formatDateTime } from "@/lib/format";
import { cancelBooking } from "./actions";

function statusLabel(status: string): string {
  switch (status) {
    case "CONFIRMED":
      return "Подтверждена";
    case "CANCELLED":
      return "Отменена";
    case "DONE":
      return "Завершена";
    default:
      return status;
  }
}

export default async function BookingsTab() {
  const bookings = await prisma.booking.findMany({
    where: { startAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } },
    orderBy: { startAt: "asc" },
    include: { service: true, master: true },
  });

  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold text-ink">Ближайшие записи</h2>
      {bookings.length === 0 ? (
        <p className="text-sm text-muted">Записей пока нет.</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-line bg-surface">
          <table className="w-full text-sm">
            <thead className="bg-bg text-left text-muted">
              <tr>
                <th className="px-4 py-2.5 font-medium">Когда</th>
                <th className="px-4 py-2.5 font-medium">Услуга</th>
                <th className="px-4 py-2.5 font-medium">Мастер</th>
                <th className="px-4 py-2.5 font-medium">Клиент</th>
                <th className="px-4 py-2.5 font-medium">Статус</th>
                <th className="px-4 py-2.5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {bookings.map((b) => (
                <tr key={b.id} className={b.status === "CANCELLED" ? "text-muted" : "text-ink"}>
                  <td className="whitespace-nowrap px-4 py-2.5">{formatDateTime(b.startAt)}</td>
                  <td className="px-4 py-2.5">{b.service.name}</td>
                  <td className="px-4 py-2.5">{b.master.name}</td>
                  <td className="px-4 py-2.5">
                    {b.clientName}
                    <div className="text-xs text-muted">{b.clientPhone}</div>
                  </td>
                  <td className="px-4 py-2.5">{statusLabel(b.status)}</td>
                  <td className="px-4 py-2.5 text-right">
                    {b.status !== "CANCELLED" && (
                      <form action={cancelBooking}>
                        <input type="hidden" name="id" value={b.id} />
                        <button className="-mx-2 inline-flex min-h-11 items-center px-2 text-xs font-medium text-red-600 hover:underline">
                          Отменить
                        </button>
                      </form>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

import api from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import { IoChevronBack, IoChevronForward } from "react-icons/io5";
import { DetailPengeluaranModal } from "@/app/(owner)/pengeluaran/modal/detailPengeluaranModal";

export type PengeluaranData = {
  id: number;
  nama_pengeluaran: string;
  tipe_pembayaran: string;
  tanggal_pengeluaran: string;
  description: string;
  kategori_pengeluaran: string;
  jumlah: number;
  tujuan: string;
};

function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

const daysOfWeek = [
  "Minggu",
  "Senin",
  "Selasa",
  "Rabu",
  "Kamis",
  "Jumat",
  "Sabtu",
];
const months = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

const formatTimeToGMTPlus7 = (date: string) => {
  const d = new Date(date);
  const options: Intl.DateTimeFormatOptions = {
    timeZone: "Asia/Bangkok",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  };

  return d.toLocaleString("en-US", options);
};

export default function PengeluaranTabs() {
  const now = new Date();
  now.setHours(new Date().getHours() + 7);

  const [selectedDate, setSelectedDate] = useState(formatDate(now));
  const [isMonthlyTab, setIsMonthlyTab] = useState(false);
  const [isFilterTab, setisFilterTab] = useState(false);
  const [filterStartDate, setFilterStartDate] = useState(formatDate(now));
  const [filterEndDate, setFilterEndDate] = useState(formatDate(now));

  const getStartAndEndOfMonth = (date: string) => {
    const d = new Date(date);
    d.setDate(1);
    const startDate = formatDate(d);

    d.setMonth(d.getMonth() + 1);
    d.setDate(0);
    const endDate = formatDate(d);

    return { startDate, endDate };
  };

  const { data, refetch: refetchPengeluaran } = useQuery({
    queryKey: [
      "pengeluaran",
      selectedDate,
      isMonthlyTab,
      isFilterTab,
      filterStartDate,
      filterEndDate,
    ],
    queryFn: async () => {
      let start_date = selectedDate;
      let end_date = selectedDate;

      if (isMonthlyTab) {
        const { startDate, endDate } = getStartAndEndOfMonth(selectedDate);
        start_date = startDate;
        end_date = endDate;
      }

      if (isFilterTab && filterStartDate && filterEndDate) {
        start_date = filterStartDate;
        end_date = filterEndDate;
      }

      const response = await api.get(`/api/pengeluaran`, {
        params: {
          start_date,
          end_date,
        },
      });
      return response.data;
    },
  });

  const dataPengeluaran = data?.data.data || [];

  useEffect(() => {
    refetchPengeluaran();
  }, [
    selectedDate,
    isMonthlyTab,
    refetchPengeluaran,
    isFilterTab,
    filterStartDate,
    filterEndDate,
  ]);

  const handlePrevious = () => {
    const newDate = new Date(selectedDate);
    if (isMonthlyTab) {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setDate(newDate.getDate() - 1);
    }
    setSelectedDate(formatDate(newDate));
  };

  const handleNext = () => {
    const today = new Date();
    const todayPlus7 = new Date(today);
    todayPlus7.setHours(today.getHours() + 7);

    const newDate = new Date(selectedDate);

    if (isMonthlyTab) {
      newDate.setMonth(newDate.getMonth() + 1);
    } else {
      newDate.setDate(newDate.getDate() + 1);
    }

    if (newDate <= todayPlus7) {
      setSelectedDate(formatDate(newDate));
    }
  };

  const isNextDisabled = new Date(selectedDate) >= new Date();

  const dateObj = new Date(selectedDate);
  const dayName = daysOfWeek[dateObj.getDay()];
  const dayNumber = dateObj.getDate();
  const monthName = months[dateObj.getMonth()];
  const year = dateObj.getFullYear();

  const total = dataPengeluaran.reduce(
    (sum: number, dataItem: any) =>
      sum + parseFloat((dataItem as any).jumlah || "0"),
    0
  );

  const groupedData = dataPengeluaran.reduce(
    (acc: any, curr: PengeluaranData) => {
      const date = curr.tanggal_pengeluaran.split("T")[0];
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(curr);
      return acc;
    },
    {}
  );

  const totalForDate = (date: string) => {
    return groupedData[date]?.reduce(
      (sum: number, dataItem: PengeluaranData) =>
        sum + parseFloat((dataItem as any).jumlah || "0"),
      0
    );
  };

  return (
    <>
      <div className="border-b border-gray-200">
        <nav
          className="-mb-0.5 flex justify-center space-x-6"
          aria-label="Tabs"
          role="tablist"
        >
          <button
            type="button"
            className={`hs-tab-active:font-semibold w-full hs-tab-active:border-brand-600 hs-tab-active:text-brand-600 py-4 px-1 inline-flex items-center justify-center gap-x-2 border-b-2 border-transparent text-S2 whitespace-nowrap text-gray-500 hover:text-brand-600 focus:outline-none focus:text-brand-600 disabled:opacity-50 disabled:pointer-events-none ${
              !isMonthlyTab && !isFilterTab && "active"
            }`}
            id="horizontal-alignment-item-1"
            data-hs-tab="#horizontal-alignment-1"
            aria-controls="horizontal-alignment-1"
            role="tab"
            onClick={() => {
              setIsMonthlyTab(false);
              setisFilterTab(false);
            }}
          >
            Harian
          </button>
          <button
            type="button"
            className={`hs-tab-active:font-semibold w-full hs-tab-active:border-brand-600 hs-tab-active:text-brand-600 py-4 px-1 inline-flex items-center justify-center gap-x-2 border-b-2 border-transparent text-S2 whitespace-nowrap text-gray-500 hover:text-brand-600 focus:outline-none focus:text-brand-600 disabled:opacity-50 disabled:pointer-events-none ${
              isMonthlyTab && "active"
            }`}
            id="horizontal-alignment-item-2"
            data-hs-tab="#horizontal-alignment-2"
            aria-controls="horizontal-alignment-2"
            role="tab"
            onClick={() => {
              setIsMonthlyTab(true);
              setisFilterTab(false);
            }}
          >
            Bulanan
          </button>
          <button
            type="button"
            className={`hs-tab-active:font-semibold w-full hs-tab-active:border-brand-600 hs-tab-active:text-brand-600 py-4 px-1 inline-flex items-center justify-center gap-x-2 border-b-2 border-transparent text-S2 whitespace-nowrap text-gray-500 hover:text-brand-600 focus:outline-none focus:text-brand-600 disabled:opacity-50 disabled:pointer-events-none ${
              isFilterTab && "active"
            }`}
            id="horizontal-alignment-item-3"
            data-hs-tab="#horizontal-alignment-3"
            aria-controls="horizontal-alignment-3"
            role="tab"
            onClick={() => {
              setIsMonthlyTab(false);
              setisFilterTab(true);
            }}
          >
            Filter
          </button>
        </nav>
      </div>

      <div className="mt-8">
        <div
          id="horizontal-alignment-1"
          role="tabpanel"
          aria-labelledby="horizontal-alignment-item-1"
          className={isMonthlyTab || isFilterTab ? "hidden" : ""}
        >
          <div className="table-section pb-4">
            <div className="flex justify-between items-center text-H3">
              <button onClick={handlePrevious} disabled={false}>
                <IoChevronBack className="text-3xl" />
              </button>
              <h2 className="text-H3">{selectedDate}</h2>
              <button onClick={handleNext} disabled={isNextDisabled}>
                <IoChevronForward className="text-3xl" />
              </button>
            </div>

            <div className="bg-[#EBEBEB] p-2 rounded-lg mt-4">
              <div className="border rounded-lg flex justify-between bg-white px-5">
                <div className="flex flex-row space-x-8 py-2 items-center">
                  <div className="text-D2">{dayNumber}</div>
                  <div className="flex flex-col">
                    <p>{dayName}</p>
                    <p>{`${monthName} ${year}`}</p>
                  </div>
                </div>

                <div className="text-S1 flex items-center">
                  Rp {total.toLocaleString("id-ID")}
                </div>
              </div>

              {dataPengeluaran && dataPengeluaran.length > 0 ? (
                dataPengeluaran.map(
                  (dataItem: PengeluaranData, idx: number) => (
                    <DetailPengeluaranModal data={dataItem} key={idx}>
                      {({ openModal }) => (
                        <div
                          className="my-1 bg-white rounded-lg px-10 py-2 grid grid-cols-5 justify-between items-center cursor-pointer"
                          onClick={openModal}
                        >
                          <div className="col-span-2 flex flex-row items-center">
                            <p className="w-[40%] text-S3">
                              {dataItem.kategori_pengeluaran}
                            </p>
                            <div className="flex flex-col">
                              <p className="text-S1">
                                <strong>{dataItem.nama_pengeluaran}</strong>
                              </p>
                              <p className="text-B2">
                                {dataItem.tipe_pembayaran}
                              </p>
                            </div>
                          </div>

                          <p className="col-span-1 text-center text-B2">
                            {dataItem.tujuan}
                          </p>

                          <div className="col-span-2 flex justify-end space-x-16">
                            <p className="text-danger-600 text-S3">
                              {dataItem.jumlah.toLocaleString("id-ID")}
                            </p>
                            <p className="w-[40%] text-end text-B2">
                              {formatTimeToGMTPlus7(
                                dataItem.tanggal_pengeluaran
                              )}
                            </p>
                          </div>
                        </div>
                      )}
                    </DetailPengeluaranModal>
                  )
                )
              ) : (
                <div className="text-center text-S2 text-gray-600 py-4">
                  Tidak ada transaksi.
                </div>
              )}
            </div>
          </div>
        </div>

        <div
          id="horizontal-alignment-2"
          className={isMonthlyTab ? "" : "hidden"}
          role="tabpanel"
          aria-labelledby="horizontal-alignment-item-2"
        >
          <div className="table-section pb-4">
            <div className="flex justify-between items-center text-H3">
              <button onClick={handlePrevious} disabled={false}>
                <IoChevronBack className="text-3xl" />
              </button>
              <h2 className="text-H3">{`${monthName} ${year}`}</h2>
              <button onClick={handleNext} disabled={isNextDisabled}>
                <IoChevronForward className="text-3xl" />
              </button>
            </div>

            <div className="bg-[#EBEBEB] p-2 rounded-lg mt-4">
              <div className="border rounded-lg flex justify-between bg-white px-5">
                <div className="flex flex-row space-x-4 py-2 items-center">
                  <div className="text-D2">{monthName}</div>
                  <div className="flex flex-col">
                    <p>{year}</p>
                  </div>
                </div>

                <div className="text-S1 flex items-center">
                  Rp {total.toLocaleString("id-ID")}
                </div>
              </div>
              {Object.keys(groupedData).length > 0 ? (
                Object.keys(groupedData)
                  .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
                  .map((date, idx) => {
                    const dateObj = new Date(date);
                    const dayName = daysOfWeek[dateObj.getDay()];
                    const dayNumber = dateObj.getDate();
                    const monthName = months[dateObj.getMonth()];
                    const year = dateObj.getFullYear();
                    const total = totalForDate(date);

                    return (
                      <div key={idx}>
                        <div className="border rounded-lg flex justify-between bg-white px-5 mt-4">
                          <div className="flex flex-row space-x-8 py-2 items-center">
                            <div className="text-D2">{dayNumber}</div>
                            <div className="flex flex-col">
                              <p>{dayName}</p>
                              <p>{`${monthName} ${year}`}</p>
                            </div>
                          </div>
                          <div className="text-S1 flex items-center">
                            Rp {total.toLocaleString("id-ID")}
                          </div>
                        </div>

                        {groupedData[date].map(
                          (dataItem: PengeluaranData, idx: number) => (
                            <DetailPengeluaranModal data={dataItem} key={idx}>
                              {({ openModal }) => (
                                <div
                                  onClick={openModal}
                                  className="my-1 bg-white rounded-lg px-10 py-2 grid grid-cols-5 justify-between items-center cursor-pointer"
                                >
                                  <div className="col-span-2 flex flex-row items-center">
                                    <p className="w-[40%] text-S3">
                                      {dataItem.kategori_pengeluaran}
                                    </p>
                                    <div className="flex flex-col">
                                      <p className="text-S1">
                                        <strong>
                                          {dataItem.nama_pengeluaran}
                                        </strong>
                                      </p>
                                      <p className="text-B2">
                                        {dataItem.tipe_pembayaran}
                                      </p>
                                    </div>
                                  </div>

                                  <p className="col-span-1 text-center text-B2">
                                    {dataItem.tujuan}
                                  </p>

                                  <div className="col-span-2 flex justify-end space-x-16">
                                    <p className="text-danger-600 text-S3">
                                      {dataItem.jumlah.toLocaleString("id-ID")}
                                    </p>
                                    <p className="w-[40%] text-end text-B2">
                                      {formatTimeToGMTPlus7(
                                        dataItem.tanggal_pengeluaran
                                      )}
                                    </p>
                                  </div>
                                </div>
                              )}
                            </DetailPengeluaranModal>
                          )
                        )}
                      </div>
                    );
                  })
              ) : (
                <div className="text-center mt-4">Tidak ada data</div>
              )}
            </div>
          </div>
        </div>

        <div
          id="horizontal-alignment-3"
          role="tabpanel"
          className={isFilterTab ? "" : "hidden"}
          aria-labelledby="horizontal-alignment-item-3"
        >
          <div className="flex justify-between items-center">
            <div className="flex space-x-4">
              <input
                type="date"
                value={filterStartDate}
                onChange={(e) => setFilterStartDate(e.target.value)}
                className="flex w-fit rounded-lg shadow-sm min-h-[2.25rem] md:min-h-[2.5rem] px-3.5 py-0 border border-gray-300 text-base-dark caret-brand-600"
              />
              <span className="">-</span>
              <input
                type="date"
                value={filterEndDate}
                onChange={(e) => setFilterEndDate(e.target.value)}
                className="flex w-fit rounded-lg shadow-sm min-h-[2.25rem] md:min-h-[2.5rem] px-3.5 py-0 border border-gray-300 text-base-dark caret-brand-600"
              />
            </div>
            <div className="text-S1 flex items-center">
              Rp {total.toLocaleString("id-ID")}
            </div>
          </div>
          {filterStartDate && filterEndDate ? (
            <div className="table-section mt-4 pb-6">
              <div className="bg-[#EBEBEB] p-2 rounded-lg mt-4">
                {Object.keys(groupedData).length > 0 ? (
                  Object.keys(groupedData)
                    .sort(
                      (a, b) => new Date(a).getTime() - new Date(b).getTime()
                    )
                    .map((date, idx) => {
                      const dateObj = new Date(date);
                      const dayName = daysOfWeek[dateObj.getDay()];
                      const dayNumber = dateObj.getDate();
                      const monthName = months[dateObj.getMonth()];
                      const year = dateObj.getFullYear();
                      const total = totalForDate(date);

                      return (
                        <div key={idx}>
                          <div className="border rounded-lg flex justify-between bg-white px-5 mt-4">
                            <div className="flex flex-row space-x-8 py-2 items-center">
                              <div className="text-D2">{dayNumber}</div>
                              <div className="flex flex-col">
                                <p>{dayName}</p>
                                <p>{`${monthName} ${year}`}</p>
                              </div>
                            </div>
                            <div className="text-S1 flex items-center">
                              Rp {total.toLocaleString("id-ID")}
                            </div>
                          </div>

                          {groupedData[date].map(
                            (dataItem: PengeluaranData, idx: number) => (
                              <DetailPengeluaranModal data={dataItem} key={idx}>
                                {({ openModal }) => (
                                  <div
                                    onClick={openModal}
                                    className="my-1 bg-white rounded-lg px-10 py-2 grid grid-cols-5 justify-between items-center cursor-pointer"
                                  >
                                    <div className="col-span-2 flex flex-row items-center">
                                      <p className="w-[40%] text-S3">
                                        {dataItem.kategori_pengeluaran}
                                      </p>
                                      <div className="flex flex-col">
                                        <p className="text-S1">
                                          <strong>
                                            {dataItem.nama_pengeluaran}
                                          </strong>
                                        </p>
                                        <p className="text-B2">
                                          {dataItem.tipe_pembayaran}
                                        </p>
                                      </div>
                                    </div>

                                    <p className="col-span-1 text-center text-B2">
                                      {dataItem.tujuan}
                                    </p>

                                    <div className="col-span-2 flex justify-end space-x-16">
                                      <p className="text-danger-600 text-S3">
                                        {dataItem.jumlah.toLocaleString(
                                          "id-ID"
                                        )}
                                      </p>
                                      <p className="w-[40%] text-end text-B2">
                                        {formatTimeToGMTPlus7(
                                          dataItem.tanggal_pengeluaran
                                        )}
                                      </p>
                                    </div>
                                  </div>
                                )}
                              </DetailPengeluaranModal>
                            )
                          )}
                        </div>
                      );
                    })
                ) : (
                  <div className="text-center mt-4">Tidak ada data</div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center mt-4">Select date filter</div>
          )}
        </div>
      </div>
    </>
  );
}

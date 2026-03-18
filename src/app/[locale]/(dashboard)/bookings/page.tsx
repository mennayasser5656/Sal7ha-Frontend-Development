"use client";

import { useState } from "react";
import styles from "./bookings.module.css";
import { HiOutlineTableCells } from "react-icons/hi2";
import { FaSortAmountDown } from "react-icons/fa";
import { FiFilter } from "react-icons/fi";
import { CgExport } from "react-icons/cg";
import { RiSearch2Line } from "react-icons/ri";
import { BsKanban } from "react-icons/bs";
import { FaListUl } from "react-icons/fa";
import { FaSortAlphaDown } from "react-icons/fa";
import TableView from "@/presentation/components/bookings/TableView/TableView";
import ListView from "@/presentation/components/bookings/ListView/ListView";
import DropdownButton from "@/presentation/components/common/DropdownButton/DropdownButton";
import { DropdownOption } from "@/presentation/components/common/DropdownButton/DropdownButton";
import { FaRegClock } from "react-icons/fa";
import { TbStatusChange } from "react-icons/tb";
import { useBookings } from "@/application/hooks/useBookings";

const VIEW_OPTIONS: DropdownOption[] = [
  { label: "Table View", icon: <HiOutlineTableCells /> },
  { label: "Kanban View", icon: <BsKanban /> },
  { label: "List View", icon: <FaListUl /> },
];

const FILTER_OPTIONS: DropdownOption[] = [
  { label: "Alphabetically", icon: <FaSortAlphaDown /> },
  { label: "Status", icon: <TbStatusChange /> },
];

const SORT_OPTIONS: DropdownOption[] = [
  {
    label: "Price",
    icon: <FaSortAmountDown />,
    submenu: [
      { label: "Price: Ascending", icon: <FaSortAmountDown /> },
      { label: "Price: Descending", icon: <FaSortAmountDown /> },
    ],
  },
  {
    label: "Time",
    icon: <FaRegClock />,
    submenu: [
      { label: "Time: Early", icon: <FaRegClock /> },
      { label: "Time: Late", icon: <FaRegClock /> },
    ],
  },
];

export default function BookingsView() {
  const [showStats, setShowStats] = useState(false);
  const [selectedView, setSelectedView] = useState<DropdownOption>(
    VIEW_OPTIONS[0],
  );
  const [selectedFilter, setSelectedFilter] = useState<DropdownOption>(
    FILTER_OPTIONS[0],
  );
  const [selectedSort, setSelectedSort] = useState<DropdownOption>(
    SORT_OPTIONS[0],
  );

  const {
    bookings: processedBookings,
    searchQuery,
    setSearchQuery,
  } = useBookings(selectedFilter.label, selectedSort.label);

  const renderView = () => {
    switch (selectedView.label) {
      case "Table View":
        return <TableView bookings={processedBookings} />;
      case "List View":
        return <ListView bookings={processedBookings} />;
      default:
        return null;
    }
  };

  return (
    <div className={styles.section}>
      <div className={styles.tools}>
        <div className={styles.toolsLeft}>
          <DropdownButton
            options={VIEW_OPTIONS}
            selected={selectedView}
            onSelect={setSelectedView}
          />
          <div className={styles.separator} />
          <DropdownButton
            options={FILTER_OPTIONS}
            selected={selectedFilter}
            onSelect={setSelectedFilter}
            fixedLabel="Filter"
            fixedIcon={<FiFilter />}
          />
          <DropdownButton
            options={SORT_OPTIONS}
            selected={selectedSort}
            onSelect={setSelectedSort}
            fixedLabel="Sort"
            fixedIcon={<FaSortAmountDown />}
          />
          <div className={styles.separator} />
          <div
            className={styles.showStats}
            onClick={() => setShowStats(!showStats)}
          >
            <span>Show Statistics</span>
            <div className={styles.toggle}>
              <div
                className={`${styles.toggleCircle} ${showStats ? styles.toggleActive : ""}`}
              />
            </div>
          </div>
        </div>

        <div className={styles.toolsRight}>
          <div className={styles.searchBar}>
            <RiSearch2Line />
            <input
              type="text"
              placeholder="Search For A Client"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className={styles.separator} />
          <div className={styles.actionButton}>
            <CgExport />
            <span>Export</span>
          </div>
        </div>
      </div>
      {renderView()}
    </div>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import { RiSearch2Line } from "react-icons/ri";
import { useToastNotifications } from "@/application/hooks/useToastNotifications";
import {
  deleteInventoryItem,
  listInventoryItems,
  sellInventoryItem,
  type InventoryItem,
} from "@/infrastructure/services/inventory.service";
import Dropdown from "@/presentation/components/Dropdown/Dropdown";
import TableView, {
  type ColumnDef,
} from "@/presentation/components/TableView/TableView";
import ToastContainer from "@/presentation/components/Toast/Toast";
import styles from "./overview.module.css";

interface StorageRow {
  id: string;
  category: string;
  name: string;
  image: string;
  brand: string;
  type: string;
  specification: string;
  volume: string;
  quantity: number;
  price: string;
  status: string;
}

const BRANDS = ["Shell", "Mobil", "Castrol", "Total"];
const TYPES = ["Fully Synthetic", "Semi-Synthetic", "Mineral"];
const SPECIFICATIONS = ["0W-20", "5W-30", "5W-40", "10W-40"];
const VOLUMES = ["1L", "4L", "5L"];

type StorageSortKey =
  | "name"
  | "category"
  | "brand"
  | "type"
  | "specification"
  | "volume"
  | "quantity"
  | "price"
  | "status";
type SortDirection = "asc" | "desc";

function toStorageRow(item: InventoryItem): StorageRow {
  return {
    id: item.id,
    category: item.category,
    name: item.name,
    image: item.imageUrl || "/assets/engine_service.svg",
    brand: item.brand ?? item.company ?? "",
    type: item.type ?? "",
    specification: item.viscosity ?? item.specification ?? "",
    volume: item.volume ?? item.capacity ?? "",
    quantity: item.quantity ?? 0,
    price: `$${item.purchasePrice ?? item.price}`,
    status: item.status ?? "active",
  };
}

function parseMoney(value: string) {
  const parsed = Number(value.replace(/[^0-9.]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

function sortRows(
  rows: StorageRow[],
  sortKey: StorageSortKey | null,
  sortDirection: SortDirection,
) {
  if (!sortKey) return rows;

  const direction = sortDirection === "asc" ? 1 : -1;

  return [...rows].sort((a, b) => {
    if (sortKey === "quantity") {
      return (a.quantity - b.quantity) * direction;
    }

    if (sortKey === "price") {
      return (parseMoney(a.price) - parseMoney(b.price)) * direction;
    }

    return a[sortKey].localeCompare(b[sortKey]) * direction;
  });
}

const COLUMNS: ColumnDef<StorageRow>[] = [
  {
    key: "name",
    label: "ITEM",
    sortable: true,
    render: (row) => (
      <div className={styles.itemNameCell}>
        <img src={row.image} alt="" />
        <span>{row.name}</span>
      </div>
    ),
  },
  {
    key: "category",
    label: "CATEGORY",
    sortable: true,
    render: (row) => row.category || "-",
  },
  {
    key: "brand",
    label: "BRAND",
    sortable: true,
    render: (row) => row.brand || "-",
  },
  {
    key: "type",
    label: "TYPE",
    sortable: true,
    render: (row) => row.type || "-",
  },
  {
    key: "specification",
    label: "SPECIFICATION",
    sortable: true,
    render: (row) => row.specification || "-",
  },
  {
    key: "volume",
    label: "VOLUME",
    sortable: true,
    render: (row) => row.volume || "-",
  },
  {
    key: "quantity",
    label: "QTY",
    sortable: true,
    render: (row) => <span className={styles.quantityBadge}>{row.quantity}</span>,
  },
  {
    key: "price",
    label: "PRICE",
    sortable: true,
    render: (row) => row.price,
  },
  {
    key: "status",
    label: "STATUS",
    sortable: true,
    render: (row) => (
      <span
        className={`${styles.statusBadge} ${
          row.status.toLowerCase() === "inactive"
            ? styles.statusInactive
            : styles.statusActive
        }`}
      >
        {row.status}
      </span>
    ),
  },
];

export default function StorageOverviewView() {
  const { notifications, dismissNotification, showNotification } =
    useToastNotifications();
  const [brand, setBrand] = useState<string | null>(null);
  const [type, setType] = useState<string | null>(null);
  const [specification, setSpecification] = useState<string | null>(null);
  const [volume, setVolume] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [rows, setRows] = useState<StorageRow[]>([]);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [sortKey, setSortKey] = useState<StorageSortKey | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    let ignore = false;

    async function loadRows() {
      const response = await listInventoryItems({
        brand,
        type,
        viscosity: specification,
        volume,
        search,
        page: 1,
        limit: 100,
      });

      if (!ignore) {
        setRows(response.data.map(toStorageRow));
      }
    }

    void loadRows();

    return () => {
      ignore = true;
    };
  }, [brand, search, specification, type, volume]);

  useEffect(() => {
    setCurrentPage(1);
    setSelectedRows(new Set());
  }, [brand, search, specification, type, volume]);

  const sortedRows = useMemo(
    () => sortRows(rows, sortKey, sortDirection),
    [rows, sortDirection, sortKey],
  );

  const totalPages = Math.max(1, Math.ceil(sortedRows.length / itemsPerPage));
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedRows.slice(start, start + itemsPerPage);
  }, [currentPage, itemsPerPage, sortedRows]);

  function handleSort(key: string) {
    const nextKey = key as StorageSortKey;

    if (nextKey === sortKey) {
      setSortDirection((direction) => (direction === "asc" ? "desc" : "asc"));
      return;
    }

    setSortKey(nextKey);
    setSortDirection("asc");
  }

  function handleSetPerPage(value: number) {
    const nextValue = Number.isFinite(value) && value > 0 ? value : 10;
    setItemsPerPage(nextValue);
    setCurrentPage(1);
  }

  async function handleSell(row: StorageRow) {
    await sellInventoryItem(row.id, {
      quantity: 1,
      paymentMethod: "Cash",
    });
    setRows((current) =>
      current.map((item) =>
        item.id === row.id
          ? { ...item, quantity: Math.max(0, item.quantity - 1) }
          : item,
      ),
    );
    showNotification(
      `${row.name} sold successfully.`,
      "success",
      "storageItemSold",
    );
  }

  async function handleDelete(row: StorageRow) {
    await deleteInventoryItem(row.id);
    setRows((current) => current.filter((item) => item.id !== row.id));
    setSelectedRows((current) => {
      const next = new Set(current);
      next.delete(row.id);
      return next;
    });
  }

  return (
    <div className={styles.wrapper}>
      <ToastContainer
        notifications={notifications}
        onDismiss={dismissNotification}
      />

      <div className={styles.filters}>
        <Dropdown options={BRANDS} selected={brand} onSelect={setBrand} label="Brand" />
        <Dropdown options={TYPES} selected={type} onSelect={setType} label="Type" />
        <Dropdown
          options={SPECIFICATIONS}
          selected={specification}
          onSelect={setSpecification}
          label="Specification"
        />
        <Dropdown options={VOLUMES} selected={volume} onSelect={setVolume} label="Volume" />
        <div className={styles.searchBar}>
          <RiSearch2Line />
          <input
            type="text"
            placeholder="Search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
      </div>

      <TableView
        columns={COLUMNS}
        data={paginatedRows}
        getRowId={(row) => row.id}
        selectedRows={selectedRows}
        setSelectedRows={setSelectedRows}
        currentPage={currentPage}
        totalPages={totalPages}
        itemsPerPage={itemsPerPage}
        setPerPage={handleSetPerPage}
        goToPage={(page) =>
          setCurrentPage(Math.min(totalPages, Math.max(1, page || 1)))
        }
        goToPreviousPage={() => setCurrentPage((page) => Math.max(1, page - 1))}
        goToNextPage={() =>
          setCurrentPage((page) => Math.min(totalPages, page + 1))
        }
        sortKey={sortKey ?? undefined}
        sortDirection={sortDirection}
        onSort={handleSort}
        rowActions={(row, close) => (
          <>
            <button
              type="button"
              className={styles.rowMenuItem}
              onClick={(event) => {
                event.stopPropagation();
                void handleSell(row);
                close();
              }}
            >
              Sell product
            </button>
            <button
              type="button"
              className={`${styles.rowMenuItem} ${styles.dangerMenuItem}`}
              onClick={(event) => {
                event.stopPropagation();
                void handleDelete(row);
                close();
              }}
            >
              Delete
            </button>
          </>
        )}
      />
    </div>
  );
}

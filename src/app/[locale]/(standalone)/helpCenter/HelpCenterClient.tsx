"use client";

import { useEffect, useState, type ComponentType } from "react";
import { useParams } from "next/navigation";
import {
  BookOpen,
  ChevronDown,
  Code2,
  FileJson,
  Globe2,
  Layers3,
  Menu,
  Rocket,
  ShieldCheck,
  Sparkles,
  TerminalSquare,
  Webhook,
} from "lucide-react";
import { getHelpCenter } from "@/infrastructure/services/support.service";
import styles from "./helpCenter.module.css";

type HelpPage =
  | "introduction"
  | "dashboard"
  | "bookings"
  | "calendar"
  | "storage"
  | "inbox"
  | "reports"
  | "growth"
  | "payments"
  | "exports"
  | "settings"
  | "business"
  | "services"
  | "billing"
  | "security"
  | "notifications";

type SidebarItem = {
  id: HelpPage;
  label: string;
  icon: ComponentType<{ className?: string; size?: number; strokeWidth?: number }>;
  badge?: string;
  children?: { id: HelpPage; label: string }[];
};

type ArticleSection = {
  id: string;
  title: string;
  paragraphs: string[];
};

type Article = {
  title: string;
  intro: string[];
  sections: ArticleSection[];
};

const sidebarItems: SidebarItem[] = [
  {
    id: "introduction",
    label: "Overview",
    icon: BookOpen,
    children: [
      { id: "introduction", label: "Getting started" },
      { id: "dashboard", label: "Dashboard basics" },
      { id: "bookings", label: "Daily workflow" },
      { id: "settings", label: "Account setup" },
    ],
  },
  { id: "dashboard", label: "Dashboard", icon: Layers3, children: [{ id: "dashboard", label: "Status cards" }, { id: "reports", label: "Quick insights" }] },
  { id: "bookings", label: "Bookings", icon: BookOpen, children: [{ id: "bookings", label: "Create booking" }, { id: "bookings", label: "Booking details" }, { id: "calendar", label: "Schedule view" }] },
  { id: "calendar", label: "Calendar", icon: Globe2, children: [{ id: "calendar", label: "Appointments" }, { id: "calendar", label: "Availability" }] },
  { id: "storage", label: "Storage", icon: FileJson, children: [{ id: "storage", label: "Inventory overview" }, { id: "storage", label: "Stock tracking" }] },
  { id: "inbox", label: "Inbox", icon: Webhook, children: [{ id: "inbox", label: "Customer messages" }, { id: "notifications", label: "Notifications" }] },
  { id: "reports", label: "Reports", icon: Sparkles, children: [{ id: "reports", label: "Performance" }, { id: "growth", label: "Growth trends" }] },
  { id: "payments", label: "Payments", icon: TerminalSquare, children: [{ id: "payments", label: "Transactions" }, { id: "exports", label: "Export payments" }] },
  { id: "settings", label: "Settings", icon: Code2, children: [{ id: "business", label: "Business profile" }, { id: "services", label: "Services" }, { id: "billing", label: "Billing account" }, { id: "security", label: "Security" }] },
  { id: "notifications", label: "Notifications", icon: Rocket, badge: "NEW" },
];

const fallbackArticle = (title: string): Article => ({
  title,
  intro: [
    "This page explains how this part of the Voro admin website fits into the repair shop workflow.",
    "Use it as a quick reference for what the screen is for, where to find key actions, and what to check before moving on.",
  ],
  sections: [
    {
      id: "overview",
      title: "Overview",
      paragraphs: [
        "Start with the main purpose of the screen, then review the actions your team uses most often during daily operations.",
      ],
    },
    {
      id: "tips",
      title: "Shop tips",
      paragraphs: [
        "Keep customer details, service status, and payment information up to date so the dashboard remains useful for the whole team.",
      ],
    },
  ],
});

const articles: Partial<Record<HelpPage, Article>> = {
  introduction: {
    title: "Help Center",
    intro: [
      "Welcome to the Voro admin help center. This guide is for repair shops managing bookings, customers, services, payments, and daily operations from the dashboard.",
      "Use the menu on the left to jump to the part of the website you are working with. Each page focuses on practical steps and common checks.",
    ],
    sections: [
      {
        id: "daily-workflow",
        title: "Daily workflow",
        paragraphs: [
          "Start the day from the dashboard, review today’s bookings, check unread inbox items, and confirm any pending payments or service updates.",
          "When a customer arrives, open the booking details, update the service status, and keep notes clear enough for the next team member to continue the job.",
        ],
      },
      {
        id: "navigation",
        title: "Navigation",
        paragraphs: [
          "The dashboard sidebar is organized around the main shop tasks: bookings, calendar, storage, inbox, reports, payments, and settings.",
          "Some longer workflows, like exports and billing setup, open in standalone pages so you can focus without the dashboard sidebar.",
        ],
      },
      {
        id: "team-handoff",
        title: "Team handoff",
        paragraphs: [
          "Before handing work to another staff member, make sure the booking status, customer contact details, assigned services, and payment notes are current.",
        ],
      },
    ],
  },
  dashboard: {
    title: "Dashboard",
    intro: [
      "The dashboard gives the shop a quick view of what needs attention now: active work, upcoming appointments, recent activity, and important alerts.",
    ],
    sections: [
      {
        id: "status-cards",
        title: "Status cards",
        paragraphs: [
          "Use the summary cards to spot pending bookings, completed jobs, delayed services, and payments that need review.",
        ],
      },
      {
        id: "quick-actions",
        title: "Quick actions",
        paragraphs: [
          "Move from the dashboard into the related page when something needs action, such as opening a booking, checking storage, or reviewing payments.",
        ],
      },
    ],
  },
  bookings: {
    title: "Bookings",
    intro: [
      "Bookings are the main record for customer visits, requested services, vehicle details, and job progress.",
    ],
    sections: [
      {
        id: "create-booking",
        title: "Create a booking",
        paragraphs: [
          "Add the customer information, choose the service, set the appointment time, and include notes that help the technician understand the request.",
        ],
      },
      {
        id: "update-status",
        title: "Update status",
        paragraphs: [
          "Keep the booking status current as the job moves from pending to in progress, completed, cancelled, or paid.",
        ],
      },
    ],
  },
  payments: {
    title: "Payments",
    intro: [
      "The payments area helps you review customer charges, payment status, and export records for accounting.",
    ],
    sections: [
      {
        id: "review-payments",
        title: "Review payments",
        paragraphs: [
          "Check payment status, customer name, amount, date, and related booking before closing out a job.",
        ],
      },
      {
        id: "export-records",
        title: "Export records",
        paragraphs: [
          "Use payment exports when you need a clean file for accounting, reporting, or bank reconciliation.",
        ],
      },
    ],
  },
  settings: {
    title: "Settings",
    intro: [
      "Settings control the business profile, services, billing account, notifications, and security preferences for the shop.",
    ],
    sections: [
      {
        id: "business-profile",
        title: "Business profile",
        paragraphs: [
          "Keep the shop name, address, contact details, and public-facing information accurate for customers and staff.",
        ],
      },
      {
        id: "service-catalog",
        title: "Service catalog",
        paragraphs: [
          "Review services regularly so booking options, prices, and descriptions match the work your shop actually provides.",
        ],
      },
    ],
  },
};

export default function HelpCenterClient() {
  const params = useParams<{ locale: string }>();
  const [currentPage, setCurrentPage] = useState<HelpPage>("introduction");
  const [activeNavKey, setActiveNavKey] = useState("primary:introduction");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    introduction: true,
  });
  const [backendOverview, setBackendOverview] = useState<Article | null>(null);

  useEffect(() => {
    async function loadHelpCenter() {
      const response = await getHelpCenter(params.locale);
      if (response.categories.length === 0) return;

      setBackendOverview({
        title: "Help Center",
        intro: response.categories.map((category) => category.title),
        sections: response.categories.flatMap((category) =>
          category.articles.map((article) => ({
            id: article.id,
            title: article.title,
            paragraphs: [article.body],
          })),
        ),
      });
    }

    void loadHelpCenter();
  }, [params.locale]);

  const activeArticle =
    (currentPage === "introduction" ? backendOverview : null) ??
    articles[currentPage] ??
    fallbackArticle(sidebarItems.find((item) => item.id === currentPage)?.label ?? "Documentation");

  const toggleSection = (id: HelpPage) => {
    setOpenSections((current) => ({ ...current, [id]: !current[id] }));
  };

  const navigate = (id: HelpPage, navKey: string) => {
    setCurrentPage(id);
    setActiveNavKey(navKey);
  };

  return (
    <div className={styles.shell}>
      <button
        type="button"
        className={`${styles.floatingBurger} ${sidebarOpen ? "" : styles.floatingBurgerClosed}`}
        onClick={() => setSidebarOpen((value) => !value)}
        aria-label="Toggle help center sidebar"
      >
        <Menu size={24} strokeWidth={1.8} />
      </button>

      <div className={styles.body}>
        <aside className={`${styles.sidebar} ${sidebarOpen ? "" : styles.sidebarClosed}`}>
          <nav className={styles.sidebarNav} aria-label="Help center sections">
            <button
              type="button"
              className={`${styles.primaryLabel} ${
                activeNavKey === "primary:introduction" ? styles.primaryLabelActive : ""
              }`}
              onClick={() => navigate("introduction", "primary:introduction")}
            >
              Introduction
            </button>

            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isOpen = openSections[item.id];
              const isActive = activeNavKey === item.id;

              return (
                <div key={item.id} className={styles.navGroup}>
                  <button
                    type="button"
                    className={`${styles.navParent} ${isActive ? styles.navParentActive : ""}`}
                    onClick={() => {
                      if (item.children) {
                        toggleSection(item.id);
                      }
                      navigate(item.id, item.id);
                    }}
                  >
                    <Icon className={styles.parentIcon} size={16} strokeWidth={1.9} />
                    <span className={styles.parentTitle}>
                      {item.badge && <span className={styles.newBadge}>{item.badge}</span>}
                      <span>{item.label}</span>
                    </span>
                    {item.children && (
                      <ChevronDown
                        className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ""}`}
                        size={17}
                        strokeWidth={2}
                      />
                    )}
                  </button>

                  {item.children && isOpen && (
                    <div className={styles.childList}>
                      {item.children.map((child) => {
                        const childKey = `${item.id}:${child.label}`;

                        return (
                          <button
                            type="button"
                            key={childKey}
                            className={`${styles.childItem} ${
                              activeNavKey === childKey ? styles.childItemActive : ""
                            }`}
                            onClick={() => navigate(child.id, childKey)}
                          >
                            {child.label}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </aside>

        <main className={styles.contentScroll}>
          <div className={styles.contentGrid}>
            <article className={styles.article}>
              <h1>{activeArticle.title}</h1>

              {activeArticle.intro.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}

              {activeArticle.sections.map((section) => (
                <section key={section.id} id={section.id} className={styles.articleSection}>
                  <h2>{section.title}</h2>
                  {section.paragraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </section>
              ))}
            </article>

            <aside className={styles.toc} aria-label="Current page sections">
              <button type="button" className={styles.editButton} aria-label="Edit page">
                <Code2 size={21} strokeWidth={1.9} />
              </button>
              <div className={styles.tocRail}>
                {activeArticle.sections.map((section, index) => (
                  <a key={section.id} href={`#${section.id}`} className={index === 0 ? styles.tocActive : ""}>
                    <span />
                    {section.title}
                  </a>
                ))}
              </div>
            </aside>
          </div>
        </main>
      </div>
    </div>
  );
}

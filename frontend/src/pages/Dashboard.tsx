import { useState } from "react";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  Bell,
  BriefcaseBusiness,
  ChartNoAxesCombined,
  CircleHelp,
  Command,
  LayoutDashboard,
  LogOut,
  Menu,
  Plus,
  Search,
  Settings2,
  ShieldCheck,
  Sparkles,
  Users,
  UserRoundCheck,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

import { getStoredCounselor, logout } from "../lib/auth";
import { createEnquiry } from "../lib/enquiries";
import { useClaimLead, usePublicLeads, useMyLeads } from "../hooks/useLeads";

type NavItem =
  | "Overview"
  | "Public leads"
  | "My leads"
  | "Analytics"
  | "Team"
  | "Settings";

const navigation: {
  title: string;
  items: { label: NavItem; icon: typeof LayoutDashboard }[];
}[] = [
  {
    title: "WORKSPACE",
    items: [
      { label: "Overview", icon: LayoutDashboard },
      { label: "Public leads", icon: BriefcaseBusiness },
      { label: "My leads", icon: UserRoundCheck },
    ],
  },
  {
    title: "INSIGHTS",
    items: [
      { label: "Analytics", icon: ChartNoAxesCombined },
      { label: "Team", icon: Users },
      { label: "Settings", icon: Settings2 },
    ],
  },
];

function formatDate(value: string) {
  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? "Recently"
    : date.toLocaleString([], {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      });
}

function getErrorMessage(error: unknown): string {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error
  ) {
    const response = (
      error as {
        response?: { data?: { message?: string } };
      }
    ).response;

    if (response?.data?.message) {
      return response.data.message;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Please try again.";
}

export default function Dashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const counselor = getStoredCounselor();

  const [activeNav, setActiveNav] = useState<NavItem>("Overview");
  const [mobileMenu, setMobileMenu] = useState(false);
  const [search, setSearch] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creatingLead, setCreatingLead] = useState(false);

  const [leadForm, setLeadForm] = useState({
    name: "",
    email: "",
    phone: "",
    courseInterest: "",
    message: "",
  });

  const publicQuery = usePublicLeads();
  const myLeadsQuery = useMyLeads();
  const claimMutation = useClaimLead();

  const publicLeads = publicQuery.data?.enquiries ?? [];
  const myLeads = myLeadsQuery.data?.enquiries ?? [];

  const unclaimedTotal = publicQuery.data?.pagination.total;
  const myLeadsTotal = myLeadsQuery.data?.pagination.total;

  const filteredPublicLeads = publicLeads.filter((lead) =>
    `${lead.name} ${lead.email} ${lead.courseInterest}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  const filteredMyLeads = myLeads.filter((lead) =>
    `${lead.name} ${lead.email} ${lead.courseInterest}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  const handleLogout = () => {
    logout();
    toast.success("You have been signed out.");
    navigate("/login", { replace: true });
  };

  const handleCreateLead = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (creatingLead) return;

    setCreatingLead(true);

    try {
      await createEnquiry({
        name: leadForm.name.trim(),
        email: leadForm.email.trim(),
        phone: leadForm.phone.trim() || undefined,
        courseInterest: leadForm.courseInterest.trim(),
        message: leadForm.message.trim() || undefined,
      });

      toast.success("Lead created successfully.");

      setLeadForm({
        name: "",
        email: "",
        phone: "",
        courseInterest: "",
        message: "",
      });

      setShowCreateForm(false);

      await queryClient.invalidateQueries({
        queryKey: ["leads"],
      });
    } catch (error: unknown) {
      toast.error(`Unable to create lead. ${getErrorMessage(error)}`);
    } finally {
      setCreatingLead(false);
    }
  };

  const claim = (id: string) => {
    claimMutation.mutate(id);
  };

  const isOverview = activeNav === "Overview";
  const showingMyLeads = activeNav === "My leads";
  const showingPublicLeads = activeNav === "Public leads";

  const visibleLeads = showingMyLeads
    ? filteredMyLeads
    : filteredPublicLeads;

  const leadsLoading = showingMyLeads
    ? myLeadsQuery.isLoading
    : publicQuery.isLoading;

  const leadsError = showingMyLeads
    ? myLeadsQuery.isError
    : publicQuery.isError;

  const stats = [
    {
      label: "Unclaimed leads",
      value: unclaimedTotal,
      note: "Available to claim",
      icon: BriefcaseBusiness,
      tone: "violet",
    },
    {
      label: "My leads",
      value: myLeadsTotal,
      note: "Assigned to you",
      icon: UserRoundCheck,
      tone: "blue",
    },
    {
      label: "Public leads loaded",
      value: publicLeads.length,
      note: "Current page",
      icon: Users,
      tone: "amber",
    },
    {
      label: "Workspace status",
      value: "Active",
      note: "API connected",
      icon: Activity,
      tone: "green",
    },
  ];

  const pageTitle = isOverview
    ? "Overview"
    : showingPublicLeads
      ? "Public leads"
      : showingMyLeads
        ? "My leads"
        : activeNav;

  return (
    <div className="min-h-screen bg-[#090B12] text-slate-100">
      {mobileMenu && (
        <button
          aria-label="Close navigation"
          className="fixed inset-0 z-40 bg-black/70 lg:hidden"
          onClick={() => setMobileMenu(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[258px] flex-col border-r border-white/[0.07] bg-[#0D0F19] transition-transform duration-200 lg:translate-x-0 ${
          mobileMenu ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-[76px] items-center gap-3 border-b border-white/[0.07] px-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-blue-600 shadow-lg shadow-violet-950/50">
            <Command size={21} />
          </div>

          <div>
            <p className="text-[15px] font-bold tracking-tight">
              Brahmaverse<span className="text-violet-400"> AI</span>
            </p>
            <p className="mt-0.5 text-[10px] tracking-[0.2em] text-slate-500">
              LEAD INTELLIGENCE
            </p>
          </div>

          <button
            className="ml-auto text-slate-500 lg:hidden"
            onClick={() => setMobileMenu(false)}
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        <div className="border-b border-white/[0.07] p-4">
          <button
            onClick={() => setShowCreateForm((value) => !value)}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-3 text-sm font-semibold shadow-lg shadow-violet-950/30 transition hover:bg-violet-500"
          >
            <Plus size={17} />
            Create Lead
          </button>
        </div>

        <nav className="flex-1 space-y-7 overflow-y-auto px-3 py-6">
          {navigation.map((group) => (
            <div key={group.title}>
              <p className="mb-3 px-3 text-[10px] font-semibold tracking-[0.18em] text-slate-600">
                {group.title}
              </p>

              <div className="space-y-1">
                {group.items.map(({ label, icon: Icon }) => {
                  const active = activeNav === label;

                  return (
                    <button
                      key={label}
                      onClick={() => {
                        setActiveNav(label);
                        setMobileMenu(false);
                        setSearch("");
                      }}
                      className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition ${
                        active
                          ? "bg-violet-500/10 font-medium text-violet-300"
                          : "text-slate-400 hover:bg-white/[0.04] hover:text-white"
                      }`}
                    >
                      <Icon size={17} />
                      <span className="flex-1">{label}</span>

                      {label === "Public leads" &&
                        unclaimedTotal !== undefined && (
                          <span className="rounded-md bg-white/[0.06] px-2 py-0.5 text-[10px] text-slate-400">
                            {unclaimedTotal}
                          </span>
                        )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="border-t border-white/[0.07] p-4">
          <div className="flex items-center gap-3 rounded-xl p-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-sm font-bold">
              {(counselor?.name?.[0] || "C").toUpperCase()}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">
                {counselor?.name || "Counselor"}
              </p>
              <p className="truncate text-xs text-slate-500">
                {counselor?.email || "Counselor account"}
              </p>
            </div>

            <button
              onClick={handleLogout}
              title="Sign out"
              className="rounded-lg p-2 text-slate-500 hover:bg-white/[0.06] hover:text-white"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      <main className="min-h-screen lg:pl-[258px]">
        <header className="sticky top-0 z-30 flex h-[76px] items-center justify-between border-b border-white/[0.07] bg-[#090B12]/90 px-4 backdrop-blur-xl sm:px-7 lg:px-9">
          <div className="flex items-center gap-3">
            <button
              className="rounded-lg p-2 text-slate-400 hover:bg-white/[0.06] lg:hidden"
              onClick={() => setMobileMenu(true)}
              aria-label="Open menu"
            >
              <Menu size={20} />
            </button>

            <div>
              <p className="text-[10px] text-slate-500">
                Workspace / {pageTitle}
              </p>
              <h1 className="mt-1 text-sm font-semibold sm:text-base">
                {pageTitle}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.02] px-3 py-2 text-xs text-slate-500 sm:flex">
              <ShieldCheck size={14} className="text-emerald-400" />
              Secure workspace
            </div>

            <button
              className="relative rounded-xl border border-white/[0.08] p-2.5 text-slate-400 hover:bg-white/[0.05] hover:text-white"
              aria-label="Notifications"
              onClick={() => toast.info("No new notifications.")}
            >
              <Bell size={17} />
              <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-violet-400" />
            </button>

            <button
              className="hidden rounded-xl border border-white/[0.08] p-2.5 text-slate-400 hover:bg-white/[0.05] hover:text-white sm:block"
              aria-label="Help"
              onClick={() =>
                toast.info("Contact your administrator for assistance.")
              }
            >
              <CircleHelp size={17} />
            </button>
          </div>
        </header>

        <div className="mx-auto max-w-[1500px] p-4 sm:p-7 lg:p-9">
          {isOverview && (
            <section className="relative mb-8 overflow-hidden rounded-3xl border border-violet-400/15 bg-gradient-to-br from-[#17132C] via-[#111323] to-[#101827] p-6 sm:p-9">
              <div className="pointer-events-none absolute -right-10 -top-24 h-72 w-72 rounded-full bg-violet-500/10 blur-3xl" />
              <div className="pointer-events-none absolute bottom-0 right-1/4 h-32 w-48 rounded-full bg-blue-500/10 blur-3xl" />

              <div className="relative max-w-2xl">
                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-violet-300/20 bg-violet-400/10 px-3 py-1.5 text-[11px] font-medium text-violet-200">
                  <Sparkles size={13} />
                  LEAD INTELLIGENCE WORKSPACE
                </div>

                <h2 className="text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
                  Good to see you,{" "}
                  <span className="bg-gradient-to-r from-violet-300 to-blue-300 bg-clip-text text-transparent">
                    {counselor?.name?.split(" ")[0] || "Counselor"}
                  </span>
                </h2>

                <p className="mt-3 max-w-xl text-sm leading-6 text-slate-400 sm:text-base">
                  Manage student enquiries, discover new opportunities, and
                  keep your admissions pipeline organized.
                </p>

                <div className="mt-7 flex flex-wrap gap-3">
                  <button
                    onClick={() => setShowCreateForm(true)}
                    className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-violet-500"
                  >
                    <Plus size={17} />
                    Create a lead
                  </button>

                  <button
                    onClick={() => setActiveNav("Public leads")}
                    className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-medium text-slate-200 transition hover:bg-white/[0.08]"
                  >
                    Explore public leads
                    <ArrowDownRight size={16} />
                  </button>
                </div>
              </div>
            </section>
          )}

          {showCreateForm && (
            <section className="mb-8 rounded-2xl border border-violet-400/20 bg-[#111420] p-5 sm:p-7">
              <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold tracking-widest text-violet-300">
                    NEW ENQUIRY
                  </p>
                  <h2 className="mt-2 text-xl font-semibold">
                    Create a new lead
                  </h2>
                  <p className="mt-1 text-sm text-slate-400">
                    Enter the prospective student's contact and course details.
                  </p>
                </div>

                <button
                  type="button"
                  aria-label="Close form"
                  onClick={() => setShowCreateForm(false)}
                  className="rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>

              <form
                onSubmit={handleCreateLead}
                className="grid gap-5 sm:grid-cols-2"
              >
                <div>
                  <label
                    htmlFor="lead-name"
                    className="mb-2 block text-sm font-medium text-slate-300"
                  >
                    Full name *
                  </label>
                  <input
                    id="lead-name"
                    required
                    minLength={2}
                    maxLength={100}
                    autoComplete="name"
                    value={leadForm.name}
                    onChange={(event) =>
                      setLeadForm({
                        ...leadForm,
                        name: event.target.value,
                      })
                    }
                    placeholder="Rahul Sharma"
                    className="w-full rounded-xl border border-white/10 bg-[#090B12] px-4 py-3 text-sm outline-none transition placeholder:text-slate-600 focus:border-violet-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="lead-email"
                    className="mb-2 block text-sm font-medium text-slate-300"
                  >
                    Email address *
                  </label>
                  <input
                    id="lead-email"
                    required
                    type="email"
                    maxLength={254}
                    autoComplete="email"
                    value={leadForm.email}
                    onChange={(event) =>
                      setLeadForm({
                        ...leadForm,
                        email: event.target.value,
                      })
                    }
                    placeholder="rahul@example.com"
                    className="w-full rounded-xl border border-white/10 bg-[#090B12] px-4 py-3 text-sm outline-none transition placeholder:text-slate-600 focus:border-violet-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="lead-phone"
                    className="mb-2 block text-sm font-medium text-slate-300"
                  >
                    Phone number
                  </label>
                  <input
                    id="lead-phone"
                    type="tel"
                    maxLength={25}
                    autoComplete="tel"
                    value={leadForm.phone}
                    onChange={(event) =>
                      setLeadForm({
                        ...leadForm,
                        phone: event.target.value,
                      })
                    }
                    placeholder="9876543210"
                    className="w-full rounded-xl border border-white/10 bg-[#090B12] px-4 py-3 text-sm outline-none transition placeholder:text-slate-600 focus:border-violet-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="lead-course"
                    className="mb-2 block text-sm font-medium text-slate-300"
                  >
                    Course interest *
                  </label>
                  <input
                    id="lead-course"
                    required
                    minLength={2}
                    maxLength={100}
                    value={leadForm.courseInterest}
                    onChange={(event) =>
                      setLeadForm({
                        ...leadForm,
                        courseInterest: event.target.value,
                      })
                    }
                    placeholder="MBA, B.Tech, MCA..."
                    className="w-full rounded-xl border border-white/10 bg-[#090B12] px-4 py-3 text-sm outline-none transition placeholder:text-slate-600 focus:border-violet-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label
                    htmlFor="lead-message"
                    className="mb-2 block text-sm font-medium text-slate-300"
                  >
                    Enquiry message
                  </label>
                  <textarea
                    id="lead-message"
                    rows={3}
                    maxLength={2000}
                    value={leadForm.message}
                    onChange={(event) =>
                      setLeadForm({
                        ...leadForm,
                        message: event.target.value,
                      })
                    }
                    placeholder="What does the student want to know?"
                    className="w-full resize-y rounded-xl border border-white/10 bg-[#090B12] px-4 py-3 text-sm outline-none transition placeholder:text-slate-600 focus:border-violet-500"
                  />
                </div>

                <div className="flex flex-wrap gap-3 sm:col-span-2">
                  <button
                    type="submit"
                    disabled={creatingLead}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Plus size={16} />
                    {creatingLead ? "Creating lead..." : "Submit lead"}
                  </button>

                  <button
                    type="button"
                    disabled={creatingLead}
                    onClick={() => setShowCreateForm(false)}
                    className="rounded-xl border border-white/10 px-5 py-3 text-sm font-medium text-slate-300 transition hover:bg-white/[0.05] disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </section>
          )}

          {isOverview && (
            <section className="mb-9">
              <div className="mb-5 flex items-end justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold">Workspace overview</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    A live summary of your lead pipeline.
                  </p>
                </div>

                <span className="flex items-center gap-2 text-xs text-slate-500">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  Live data
                </span>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {stats.map((stat, index) => {
                  const Icon = stat.icon;
                  const tones: Record<string, string> = {
                    violet: "bg-violet-500/10 text-violet-300",
                    blue: "bg-blue-500/10 text-blue-300",
                    amber: "bg-amber-500/10 text-amber-300",
                    green: "bg-emerald-500/10 text-emerald-300",
                  };

                  return (
                    <div
                      key={stat.label}
                      className="rounded-2xl border border-white/[0.07] bg-[#0D0F19] p-5 transition hover:border-white/[0.13]"
                    >
                      <div className="flex items-start justify-between">
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-xl ${tones[stat.tone]}`}
                        >
                          <Icon size={19} />
                        </div>

                        {index === 3 ? (
                          <ShieldCheck
                            size={16}
                            className="text-emerald-400"
                          />
                        ) : (
                          <ArrowUpRight
                            size={16}
                            className="text-slate-600"
                          />
                        )}
                      </div>

                      <p className="mt-5 text-sm text-slate-400">
                        {stat.label}
                      </p>

                      <p className="mt-1 text-3xl font-semibold tracking-tight">
                        {stat.value === undefined ? "—" : stat.value}
                      </p>

                      <p className="mt-2 text-xs text-slate-600">
                        {stat.note}
                      </p>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {!isOverview && (
            <section className="mb-7">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                <div>
                  <p className="text-xs font-medium tracking-widest text-violet-300">
                    WORKSPACE
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
                    {pageTitle}
                  </h2>
                  <p className="mt-2 text-sm text-slate-500">
                    {showingPublicLeads
                      ? "Discover and claim available student enquiries."
                      : showingMyLeads
                        ? "Manage enquiries assigned to you."
                        : "This workspace section is ready for future enhancements."}
                  </p>
                </div>

                {(showingPublicLeads || showingMyLeads) && (
                  <div className="relative w-full sm:max-w-xs">
                    <Search
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                    />
                    <input
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder="Search leads..."
                      className="w-full rounded-xl border border-white/[0.08] bg-[#0D0F19] py-2.5 pl-9 pr-4 text-sm outline-none placeholder:text-slate-600 focus:border-violet-500/50"
                    />
                  </div>
                )}
              </div>
            </section>
          )}

          {(isOverview || showingPublicLeads || showingMyLeads) && (
            <section className="overflow-hidden rounded-2xl border border-white/[0.07] bg-[#0D0F19]">
              <div className="flex flex-col justify-between gap-3 border-b border-white/[0.07] px-5 py-5 sm:flex-row sm:items-center sm:px-6">
                <div>
                  <h2 className="font-semibold">
                    {isOverview
                      ? "Recent public leads"
                      : showingMyLeads
                        ? "Your assigned leads"
                        : "Available leads"}
                  </h2>
                  <p className="mt-1 text-xs text-slate-500">
                    {isOverview
                      ? "Latest enquiries from your workspace"
                      : "Lead information from your CRM API"}
                  </p>
                </div>

                {isOverview && (
                  <button
                    onClick={() => setActiveNav("Public leads")}
                    className="inline-flex items-center gap-1 self-start text-xs font-medium text-violet-300 hover:text-violet-200 sm:self-auto"
                  >
                    View all leads
                    <ArrowUpRight size={14} />
                  </button>
                )}
              </div>

              {leadsLoading ? (
                <div className="p-12 text-center text-sm text-slate-500">
                  Loading leads...
                </div>
              ) : leadsError ? (
                <div className="p-10 text-center">
                  <p className="font-medium text-rose-300">
                    Unable to load leads
                  </p>
                  <p className="mt-2 text-sm text-slate-500">
                    Check your backend server and login session.
                  </p>
                  <button
                    onClick={() => {
                      void publicQuery.refetch();
                      void myLeadsQuery.refetch();
                    }}
                    className="mt-4 rounded-lg border border-white/10 px-4 py-2 text-sm hover:bg-white/[0.05]"
                  >
                    Retry
                  </button>
                </div>
              ) : visibleLeads.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-300">
                    <BriefcaseBusiness size={22} />
                  </div>
                  <p className="mt-4 font-medium">No leads found</p>
                  <p className="mt-2 text-sm text-slate-500">
                    {search
                      ? "Try a different search term."
                      : showingMyLeads
                        ? "Claim a public lead to see it here."
                        : "Create a lead to start building your pipeline."}
                  </p>
                  {!search && (
                    <button
                      onClick={() => setShowCreateForm(true)}
                      className="mt-4 inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold hover:bg-violet-500"
                    >
                      <Plus size={16} />
                      Create lead
                    </button>
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[720px] text-left">
                    <thead>
                      <tr className="border-b border-white/[0.06] text-[10px] uppercase tracking-[0.12em] text-slate-500">
                        <th className="px-6 py-4 font-medium">Student</th>
                        <th className="px-6 py-4 font-medium">Course</th>
                        <th className="px-6 py-4 font-medium">Created</th>
                        <th className="px-6 py-4 font-medium">Status</th>
                        <th className="px-6 py-4 text-right font-medium">
                          Action
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-white/[0.05]">
                      {(isOverview
                        ? filteredPublicLeads.slice(0, 5)
                        : visibleLeads
                      ).map((lead) => {
                        const isMine = Boolean(lead.claimedBy);

                        return (
                          <tr
                            key={lead._id}
                            className="transition hover:bg-white/[0.02]"
                          >
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/20 to-blue-500/20 text-xs font-semibold text-violet-200">
                                  {lead.name
                                    .split(" ")
                                    .map((part) => part[0])
                                    .join("")
                                    .slice(0, 2)
                                    .toUpperCase()}
                                </div>

                                <div>
                                  <p className="text-sm font-medium text-slate-200">
                                    {lead.name}
                                  </p>
                                  <p className="mt-1 text-xs text-slate-500">
                                    {lead.email}
                                  </p>
                                </div>
                              </div>
                            </td>

                            <td className="px-6 py-4">
                              <span className="inline-flex rounded-lg border border-white/[0.07] bg-white/[0.03] px-2.5 py-1 text-xs text-slate-300">
                                {lead.courseInterest}
                              </span>
                            </td>

                            <td className="px-6 py-4 text-xs text-slate-400">
                              {formatDate(lead.createdAt)}
                            </td>

                            <td className="px-6 py-4">
                              {isMine ? (
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-300">
                                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                                  Claimed
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-300">
                                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                                  Available
                                </span>
                              )}
                            </td>

                            <td className="px-6 py-4 text-right">
                              {showingMyLeads || (isOverview && isMine) ? (
                                <span className="text-xs text-slate-500">
                                  Assigned to you
                                </span>
                              ) : (
                                <button
                                  disabled={
                                    Boolean(lead.claimedBy) ||
                                    claimMutation.isPending
                                  }
                                  onClick={() => claim(lead._id)}
                                  className="inline-flex items-center gap-1.5 rounded-lg border border-violet-400/20 bg-violet-500/10 px-3 py-2 text-xs font-medium text-violet-200 transition hover:bg-violet-500/20 disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                  <UserRoundCheck size={14} />
                                  {claimMutation.isPending
                                    ? "Claiming..."
                                    : "Claim lead"}
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="flex flex-col justify-between gap-2 border-t border-white/[0.06] px-5 py-4 text-xs text-slate-500 sm:flex-row sm:items-center sm:px-6">
                <span>
                  Showing{" "}
                  {isOverview
                    ? Math.min(filteredPublicLeads.length, 5)
                    : visibleLeads.length}{" "}
                  loaded leads
                </span>
                <span className="flex items-center gap-1.5">
                  <Activity size={13} className="text-emerald-400" />
                  Connected to CRM API
                </span>
              </div>
            </section>
          )}

          {activeNav === "Analytics" && (
            <section className="rounded-2xl border border-white/[0.07] bg-[#0D0F19] p-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-500/10 text-violet-300">
                <ChartNoAxesCombined size={23} />
              </div>
              <h2 className="mt-5 text-xl font-semibold">Analytics</h2>
              <p className="mt-2 max-w-lg text-sm leading-6 text-slate-400">
                Your current backend provides lead lists and counts. Detailed
                conversion, response-time, and performance analytics require
                additional API support.
              </p>
            </section>
          )}

          {activeNav === "Team" && (
            <section className="rounded-2xl border border-white/[0.07] bg-[#0D0F19] p-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-300">
                <Users size={23} />
              </div>
              <h2 className="mt-5 text-xl font-semibold">Team workspace</h2>
              <p className="mt-2 max-w-lg text-sm leading-6 text-slate-400">
                Team management is not yet available in the current backend.
                Registration and individual counselor lead assignment are
                supported.
              </p>
            </section>
          )}

          {activeNav === "Settings" && (
            <section className="rounded-2xl border border-white/[0.07] bg-[#0D0F19] p-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 text-amber-300">
                <Settings2 size={23} />
              </div>
              <h2 className="mt-5 text-xl font-semibold">Settings</h2>
              <p className="mt-2 text-sm text-slate-400">
                Signed in as {counselor?.email || "your counselor account"}.
              </p>
              <button
                onClick={handleLogout}
                className="mt-5 inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm hover:bg-white/[0.05]"
              >
                <LogOut size={16} />
                Sign out
              </button>
            </section>
          )}

          <footer className="mt-8 flex flex-col justify-between gap-3 border-t border-white/[0.06] pt-5 text-xs text-slate-600 sm:flex-row">
            <p>© {new Date().getFullYear()} Brahmaverse AI</p>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <ShieldCheck size={13} />
                Secure workspace
              </span>
              <span>Lead Intelligence</span>
            </div>
          </footer>
        </div>
      </main>
    </div>
  );
}
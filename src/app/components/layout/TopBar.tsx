"use client";

import { ArrowLeft, Menu } from "lucide-react";
import { useAuthStore } from "@/app/context/auth-context";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { signOut } from "next-auth/react";
import { useSession } from "next-auth/react";
import { MeResponse } from "@/app/types/global";
import { useRouter, usePathname } from "next/navigation";
import { useNotificationCount } from "@/lib/hooks/useNotifications";
import NotificationModal from "./NotificationModal";
import { handleImageError, getProfileImageSrc } from "@/app/utils/imageUtils";
import LanguageSwitcher from "./LanguageSwitcher";
import { useLanguage } from "@/app/context/language-context";
import { t, LanguageCode } from "@/lib/i18n";

export default function TopBar({
  title,
  toggleSidebarAction,
  isMobile,
  isSidebarOpen,
}: {
  title: string;
  toggleSidebarAction: () => void;
  isMobile: boolean;
  isSidebarOpen: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { currentLanguage } = useLanguage();
  const [localUserdata, setLocalUserdata] = useState<MeResponse>(() => {
    // Initialize default user data
    const defaultUserData: MeResponse = {
      id: "",
      first_name: "",
      middle_name: "",
      last_name: "",
      email: "",
      phone_number: null,
      profile_picture: null,
      birth_date: "",
      gender: "",
      is_active: false,
      created_by: null,
      updated_by: null,
      created_date: "",
      updated_date: "",
      language_id: null,
      dialect_id: null,
      role_id: "",
      woreda: null,
      city: null,
      zone_id: null,
      region_id: null,
      sectors: null,
      role: {
        id: "",
        name: "",
        description: "",
        created_by: null,
        updated_by: null,
        created_date: "",
        updated_date: "",
      },
      wallet: null,
      dialect: null,
      language: null,
      score: null,
      referral_code: null,
    };

    if (typeof window !== "undefined") {
      const storedData = localStorage.getItem("userData");
      if (storedData) {
        try {
          const parsedData = JSON.parse(storedData);
          if (
            typeof parsedData === "object" &&
            "id" in parsedData &&
            "first_name" in parsedData &&
            "middle_name" in parsedData &&
            "last_name" in parsedData &&
            "email" in parsedData &&
            "role" in parsedData
          ) {
            return parsedData as MeResponse;
          }
        } catch (error) {
          console.error("Failed to parse userData from localStorage:", error);
        }
      }
    }

    return defaultUserData;
  });

  const { user } = useAuthStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalOpenLang, setIsModalOpenLang] = useState(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const { data: session, status } = useSession();
  const { data: notificationCount } = useNotificationCount();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const dropdownRefLang = useRef<HTMLDivElement>(null);
  const [lastProjectDetailPath, setLastProjectDetailPath] = useState<
    string | null
  >(null);
  const [isFetchingUserData, setIsFetchingUserData] = useState(false);

  // Fetch user data when dropdown opens
  const fetchUserData = async () => {
    if (!session?.access_token) return;

    setIsFetchingUserData(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/iam/users/me`,
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        },
      );

      if (response.ok) {
        const data = await response.json();
        if (data.data) {
          setLocalUserdata(data.data);
          // Update localStorage with fresh data
          if (typeof window !== "undefined") {
            localStorage.setItem("userData", JSON.stringify(data.data));
          }
        }
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setIsFetchingUserData(false);
    }
  };
  useEffect(() => {
    const handleClickOutsideLang = (event: MouseEvent) => {
      if (
        dropdownRefLang.current &&
        !dropdownRefLang.current.contains(event.target as Node)
      ) {
        const target = event.target as HTMLElement;

        const isSelectComponent =
          target.closest('[role="combobox"]') ||
          target.closest('[role="listbox"]') ||
          target.closest('[role="option"]');

        if (!isSelectComponent) {
          setIsModalOpenLang(false); // 👈 use your existing state
        }
      }
    };

    if (isModalOpenLang) {
      document.addEventListener("mousedown", handleClickOutsideLang);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutsideLang);
    };
  }, [isModalOpenLang]);
  // Fetch user data when modal opens
  useEffect(() => {
    if (isModalOpen) {
      fetchUserData();
    }
  }, [isModalOpen]);

  const handleLogout = async () => {
    localStorage.removeItem("userData");
    await signOut({ callbackUrl: "/login" });
  };

  // Handle clicks outside the dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        // Check if click is on a Select component (language switcher)
        const target = event.target as HTMLElement;
        const isSelectComponent =
          target.closest('[role="combobox"]') ||
          target.closest('[role="listbox"]') ||
          target.closest('[role="option"]');

        if (!isSelectComponent) {
          setIsModalOpen(false);
        }
      }
    };

    if (isModalOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isModalOpen]);
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  useEffect(() => {
    if (!mounted) return;

    const stored = localStorage.getItem("userData");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed?.id && parsed?.first_name && parsed?.role) {
          setLocalUserdata(parsed);
        }
      } catch (error) {
        console.error("Failed to parse userData from localStorage:", error);
      }
    }
  }, [mounted]);
  // Track last visited project detail page for smarter back navigation
  useEffect(() => {
    const projectManagerDetailMatch = pathname.match(
      /^\/projectmanager\/projectDetail\/([^/]+)$/,
    );
    const superadminDetailMatch = pathname.match(
      /^\/superadmin\/projectDetail\/([^/]+)$/,
    );

    if (projectManagerDetailMatch) {
      const path = `/projectmanager/projectDetail/${projectManagerDetailMatch[1]}`;
      setLastProjectDetailPath(path);
      if (typeof window !== "undefined") {
        try {
          sessionStorage.setItem("lastProjectDetailPath", path);
        } catch {}
      }
    } else if (superadminDetailMatch) {
      const path = `/superadmin/projectDetail/${superadminDetailMatch[1]}`;
      setLastProjectDetailPath(path);
      if (typeof window !== "undefined") {
        try {
          sessionStorage.setItem("lastProjectDetailPath", path);
        } catch {}
      }
    } else {
      // On non-projectDetail pages, try to hydrate from sessionStorage (once per mount/change)
      if (typeof window !== "undefined") {
        try {
          const stored = sessionStorage.getItem("lastProjectDetailPath");
          if (stored) setLastProjectDetailPath(stored);
        } catch {}
      }
    }
  }, [pathname]);
  const profilePic = mounted
    ? getProfileImageSrc(
        session?.user?.profile_picture || localUserdata.profile_picture,
      )
    : "/default-avatar.png";

  // Debug logging (including production for troubleshooting)
  useEffect(() => {
    if (mounted && session) {
      console.log("TopBar - Session user data:", {
        profile_picture: session.user?.profile_picture,
        first_name: session.user?.first_name,
        role: session.user?.role,
      });
      console.log("TopBar - Local user data:", {
        profile_picture: localUserdata.profile_picture,
        first_name: localUserdata.first_name,
      });
      console.log("TopBar - Final profile pic URL:", profilePic);
      console.log("TopBar - Environment:", process.env.NODE_ENV);
    }
  }, [mounted, session, localUserdata, profilePic]);
  // State for breadcrumb data
  const [breadcrumbData, setBreadcrumbData] = useState<{
    projectName?: string;
    projectId?: string;
    taskName?: string;
    taskId?: string;
  }>({});

  // Fetch and store breadcrumb data based on current path
  useEffect(() => {
    const fetchBreadcrumbData = async () => {
      if (!session?.access_token) return;

      // Extract IDs from pathname
      const projectDetailMatch = pathname.match(
        /\/(projectmanager|superadmin)\/projectDetail\/([^/]+)$/,
      );
      const taskMatch = pathname.match(
        /\/(projectmanager|superadmin|reviewer|facilitator)\/tasks\/([^/]+)/,
      );

      try {
        // Fetch project data if on project detail page
        if (projectDetailMatch) {
          const projectId = projectDetailMatch[2];
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/project-mgmt/project/${projectId}`,
            {
              headers: { Authorization: `Bearer ${session.access_token}` },
            },
          );
          const data = await response.json();
          const breadcrumb = {
            projectName: data.data?.name,
            projectId: projectId,
          };
          setBreadcrumbData(breadcrumb);
          // Store in sessionStorage for task pages
          if (typeof window !== "undefined") {
            sessionStorage.setItem(
              "currentProject",
              JSON.stringify(breadcrumb),
            );
          }
        }
        // Fetch task data if on task page
        else if (taskMatch) {
          const taskId = taskMatch[2];

          // First try to get project from sessionStorage
          let storedProject = null;
          if (typeof window !== "undefined") {
            const stored = sessionStorage.getItem("currentProject");
            if (stored) {
              try {
                storedProject = JSON.parse(stored);
              } catch (e) {}
            }
          }

          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/project-mgmt/task/${taskId}`,
            {
              headers: { Authorization: `Bearer ${session.access_token}` },
            },
          );
          const data = await response.json();

          // Use stored project if API doesn't return it, or fetch it
          let projectName = storedProject?.projectName;
          let projectId = data.data?.project_id;

          // If we don't have project name but have project_id, fetch it
          if (!projectName && projectId) {
            try {
              const projectResponse = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/project-mgmt/project/${projectId}`,
                {
                  headers: { Authorization: `Bearer ${session.access_token}` },
                },
              );
              const projectData = await projectResponse.json();
              projectName = projectData.data?.name;
            } catch (e) {
              console.error("Error fetching project:", e);
            }
          }

          setBreadcrumbData({
            projectName: projectName,
            projectId: projectId,
            taskName: data.data?.name,
            taskId: taskId,
          });
        }
      } catch (error) {
        console.error("Error fetching breadcrumb data:", error);
      }
    };

    fetchBreadcrumbData();
  }, [pathname, session?.access_token]);

  // Routes that should show BACK BUTTON (not breadcrumb)
  const backButtonRoutes = [
    {
      pattern: /^\/projectmanager\/projectDetail\/[^/]+$/,
      backTo: "/projectmanager/project",
    },
    {
      pattern: /^\/superadmin\/projectDetail\/[^/]+$/,
      backTo: "/superadmin/project",
    },
    {
      pattern: /^\/reviewer\/tasks\/[^/]+\/review$/,
      backTo: "/reviewer/tasks",
    },
    {
      pattern: /^\/qualityAssurance\/tasks\/[^/]+\/review$/,
      backTo: "/qualityAssurance/tasks",
    },
  ];

  // Routes that should show BREADCRUMB (not back button)
  const breadcrumbRoutes = [
    /^\/projectmanager\/tasks\/[^/]+$/,
    /^\/superadmin\/tasks\/[^/]+$/,
    /^\/reviewer\/tasks\/[^/]+$/,
    /^\/facilitator\/tasks\/[^/]+$/,
  ];

  const shouldShowBackButton = backButtonRoutes.some((route) =>
    route.pattern.test(pathname),
  );

  const shouldShowBreadcrumb = breadcrumbRoutes.some((route) =>
    route.test(pathname),
  );

  const backRoute = backButtonRoutes.find((route) =>
    route.pattern.test(pathname),
  )?.backTo;

  const handleBackClick = () => {
    if (backRoute) {
      router.push(backRoute);
    } else {
      router.back();
    }
  };

  return (
    <header className="py-4 px-4 mb-1 flex items-center justify-between z-20 bg-white">
      <div className="flex items-center gap-4">
        {/* Show BACK BUTTON + PROJECT NAME for project detail pages */}
        {shouldShowBackButton && (
          <div className="flex items-center gap-3">
            <button
              onClick={handleBackClick}
              className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="text-sm">{t("back")}</span>
            </button>
            {breadcrumbData.projectName && (
              <>
                <span className="text-gray-300">|</span>
                <span className="text-sm font-medium text-gray-800">
                  {breadcrumbData.projectName}
                </span>
              </>
            )}
          </div>
        )}

        {/* Show BREADCRUMB for task pages */}
        {shouldShowBreadcrumb &&
        (breadcrumbData.projectName || breadcrumbData.taskName) ? (
          <div className="flex items-center gap-1 text-sm">
            {breadcrumbData.projectName && (
              <>
                <button
                  onClick={() => {
                    const role = pathname.includes("superadmin")
                      ? "superadmin"
                      : "projectmanager";
                    router.push(
                      `/${role}/projectDetail/${breadcrumbData.projectId}`,
                    );
                  }}
                  className="text-gray-600 hover:text-primary hover:underline font-medium transition-colors"
                >
                  {breadcrumbData.projectName}
                </button>
                {breadcrumbData.taskName && (
                  <span className="text-gray-400">/</span>
                )}
              </>
            )}
            {breadcrumbData.taskName && (
              <span className="text-gray-800 font-medium">
                {breadcrumbData.taskName}
              </span>
            )}
          </div>
        ) : (
          !shouldShowBackButton &&
          !isMobile && (
            <h1 className="text-2xl px-2 font-bold text-gray-800">{title}</h1>
          )
        )}
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <button
              onClick={() => {
                setIsModalOpenLang(true);
              }}
            >
              <svg
                width="17"
                height="17"
                viewBox="0 0 17 17"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M8.5 1.4165C7.7549 1.4165 7.03963 1.54433 6.375 1.77926M6.375 1.77926V7.7915M6.375 1.77926C3.89895 2.65441 2.125 5.01579 2.125 7.7915C2.125 6.69771 4.60417 5.79692 7.79167 5.67947M10.625 9.21787V15.2301M10.625 15.2301C13.101 14.3549 14.875 11.9935 14.875 9.21787C14.875 10.3518 12.2102 11.2783 8.85417 11.3396M10.625 15.2301C10.0664 15.4275 9.47198 15.5493 8.85417 15.5832"
                  stroke="#2B6CB0"
                  strokeWidth="1.0625"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M13.2479 1.4165C14.0259 1.4165 14.4149 1.4165 14.7166 1.54923C15.0365 1.68999 15.2936 1.9326 15.4428 2.23446C15.5835 2.5191 15.5835 2.88614 15.5835 3.62021V4.24984C15.5835 5.58548 15.5835 6.25331 15.1437 6.66824C14.704 7.08317 13.9962 7.08317 12.5806 7.08317H10.9804C10.3629 7.08317 10.0542 7.08317 9.94805 6.89612C9.84196 6.70907 10.0132 6.46669 10.3557 5.98192L10.4079 5.90807C10.6582 5.55378 10.7834 5.37664 10.8478 5.17588C10.9123 4.97511 10.9123 4.76222 10.9123 4.33642V3.62021C10.9123 2.88614 10.9123 2.5191 11.0529 2.23446C11.2021 1.9326 11.4593 1.68999 11.7792 1.54923C12.0809 1.4165 12.4699 1.4165 13.2479 1.4165Z"
                  stroke="#2B6CB0"
                  strokeWidth="1.0625"
                />
                <path
                  d="M4.74791 15.5832C5.52587 15.5832 5.91489 15.5832 6.21657 15.4504C6.53652 15.3097 6.79365 15.0671 6.94282 14.7652C7.0835 14.4806 7.0835 14.1135 7.0835 13.3795V12.7498C7.0835 11.4142 7.0835 10.7464 6.64369 10.3314C6.20396 9.9165 5.49619 9.9165 4.08059 9.9165H2.48039C1.86287 9.9165 1.55418 9.9165 1.44807 10.1036C1.34196 10.2906 1.51323 10.533 1.85571 11.0177L1.90792 11.0916C2.15824 11.4459 2.2834 11.623 2.34786 11.8238C2.41225 12.0246 2.41225 12.2374 2.41225 12.6633V13.3795C2.41225 14.1135 2.41225 14.4806 2.55293 14.7652C2.7021 15.0671 2.95923 15.3097 3.27918 15.4504C3.58086 15.5832 3.96988 15.5832 4.74791 15.5832Z"
                  stroke="#2B6CB0"
                  strokeWidth="1.0625"
                />
              </svg>
            </button>
          </div>
        </div>
        <div className="relative">
          {isMobile && (
            <button
              onClick={toggleSidebarAction}
              className="p-2 text-gray-700 focus:outline-none justify-end"
            >
              <Menu className="h-6 w-6 text-gray-700" />
            </button>
          )}
          <button
            className="relative p-2 hover:bg-gray-100 rounded-md transition-colors"
            onClick={() => setIsNotificationModalOpen(true)}
          >
            {/* Notification Bell Icon */}

            <div className="relative">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M19.5 12.4395V10.5H18V12.75C18 12.9489 18.0791 13.1396 18.2197 13.2803L20.25 15.3105V16.5H3.75V15.3105L5.78025 13.2803C5.92091 13.1396 5.99996 12.9489 6 12.75V9.75C5.99791 8.6961 6.27398 7.6603 6.80032 6.74724C7.32665 5.83417 8.08463 5.07618 8.99767 4.5498C9.91072 4.02343 10.9465 3.74733 12.0004 3.74938C13.0543 3.75144 14.089 4.03157 15 4.5615V2.88525C14.2861 2.56914 13.5267 2.36766 12.75 2.28825V0.75H11.25V2.2875C9.40093 2.4757 7.68732 3.34284 6.44053 4.72124C5.19373 6.09964 4.50233 7.89138 4.5 9.75V12.4395L2.46975 14.4697C2.32909 14.6104 2.25004 14.8011 2.25 15V17.25C2.25 17.4489 2.32902 17.6397 2.46967 17.7803C2.61032 17.921 2.80109 18 3 18H8.25V18.75C8.25 19.7446 8.64509 20.6984 9.34835 21.4016C10.0516 22.1049 11.0054 22.5 12 22.5C12.9946 22.5 13.9484 22.1049 14.6517 21.4016C15.3549 20.6984 15.75 19.7446 15.75 18.75V18H21C21.1989 18 21.3897 17.921 21.5303 17.7803C21.671 17.6397 21.75 17.4489 21.75 17.25V15C21.75 14.8011 21.6709 14.6104 21.5303 14.4697L19.5 12.4395ZM14.25 18.75C14.25 19.3467 14.0129 19.919 13.591 20.341C13.169 20.7629 12.5967 21 12 21C11.4033 21 10.831 20.7629 10.409 20.341C9.98705 19.919 9.75 19.3467 9.75 18.75V18H14.25V18.75Z"
                  fill="#364957"
                />
              </svg>

              {/* Notification Count Badge */}
              {notificationCount?.data !== undefined &&
                notificationCount.data >= 0 && (
                  <span
                    className={
                      "absolute -top-2 -right-2 min-w-[18px] h-[18px] " +
                      (notificationCount.data > 0
                        ? "bg-red-500"
                        : "bg-gray-300") +
                      " text-white text-[10px] rounded-full flex items-center justify-center font-medium px-1 transform scale-100"
                    }
                  >
                    {notificationCount.data > 99
                      ? "99+"
                      : notificationCount.data}
                  </span>
                )}
            </div>
          </button>
          {isModalOpenLang && (
            <div
              ref={dropdownRefLang}
              className="absolute right-0 mt-2 bg-white shadow-lg rounded-md z-30"
            >
              <LanguageSwitcher />
            </div>
          )}
          {/* Notification Modal */}
          {isNotificationModalOpen && (
            <NotificationModal
              isOpen={isNotificationModalOpen}
              onClose={() => setIsNotificationModalOpen(false)}
            />
          )}
        </div>
        <div className="relative">
          <button onClick={() => setIsModalOpen(!isModalOpen)}>
            <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200">
              <img
                src={
                  localUserdata.profile_picture
                    ? localUserdata.profile_picture
                    : "/default-avatar.png"
                }
                alt="User"
                className="w-full h-full object-cover"
                onError={(e) => handleImageError(e, "/default-avatar.png")}
              />
            </div>
          </button>

          {/* Modal Popup */}
          {isModalOpen && (
            <div
              ref={dropdownRef}
              className={`
      absolute z-30 mt-2 bg-white rounded-md shadow-lg
      ${
        isMobile
          ? "left-1/2 -translate-x-1/2 w-48 max-w-[calc(100vw-1rem)]"
          : "right-0 w-70"
      }
    `}
            >
              <div className="py-1">
                <div className="px-4 py-2 text-sm text-gray-700 flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200">
                    <img
                      src={
                        localUserdata.profile_picture
                          ? localUserdata.profile_picture
                          : "/default-avatar.png"
                      }
                      alt="User"
                      className="w-full h-full object-cover"
                      onError={(e) =>
                        handleImageError(e, "/default-avatar.png")
                      }
                    />
                  </div>
                  <div>
                    <p className="font-semibold">
                      {session?.user?.first_name ||
                        localUserdata.first_name ||
                        t("nameLabel")}
                    </p>
                    <p className="text-xs text-gray-500">
                      {session?.user?.role ||
                        localUserdata.role?.name ||
                        t("userRoleLabel")}
                    </p>
                  </div>
                </div>

                {/* Score Section - Only for Reviewer and Facilitator */}
                {(localUserdata.role?.name === "Reviewer" ||
                  localUserdata.role?.name === "Facilitator") && (
                  <div className="px-4 py-3 text-xs ">
                    <div className="bg-gradient-to-r from-[#1A365D] via-[#2B6CB0] to-[#16A34A] rounded-2xl shadow-sm">
                      <div className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M3.51819 10.3058C3.13013 9.23176 2.9361 8.69476 3.01884 8.35065C3.10933 7.97427 3.377 7.68084 3.71913 7.58296C4.03193 7.49346 4.51853 7.70973 5.49173 8.14227C6.35253 8.52486 6.78293 8.71615 7.18732 8.70551C7.63257 8.69379 8.06088 8.51524 8.4016 8.19931C8.71105 7.91237 8.91861 7.45513 9.33373 6.54064L10.2486 4.52525C11.0128 2.84175 11.3949 2 12 2C12.6051 2 12.9872 2.84175 13.7514 4.52525L14.6663 6.54064C15.0814 7.45513 15.289 7.91237 15.5984 8.19931C15.9391 8.51524 16.3674 8.69379 16.8127 8.70551C17.2171 8.71615 17.6475 8.52486 18.5083 8.14227C19.4815 7.70973 19.9681 7.49346 20.2809 7.58296C20.623 7.68084 20.8907 7.97427 20.9812 8.35065C21.0639 8.69476 20.8699 9.23176 20.4818 10.3057L18.8138 14.9222C18.1002 16.897 17.7435 17.8844 16.9968 18.4422C16.2502 19 15.2854 19 13.3558 19H10.6442C8.71459 19 7.74977 19 7.00315 18.4422C6.25654 17.8844 5.89977 16.897 5.18622 14.9222L3.51819 10.3058Z"
                              stroke="white"
                              strokeWidth="1.5"
                            />
                            <path
                              d="M12 14H12.0045"
                              stroke="white"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M7 22H17"
                              stroke="white"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                            />
                          </svg>

                          {isFetchingUserData ? (
                            <div className="w-12 h-9 flex items-center justify-center">
                              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                            </div>
                          ) : (
                            <span className="text-xs font-bold text-white">
                              {localUserdata.score ?? 0}
                            </span>
                          )}
                        </div>
                        <div className="bg-white rounded-full px-4 py-1">
                          <span className="text-xs font-medium text-gray-700">
                            {t("score")}
                          </span>
                        </div>
                        <div></div>
                      </div>
                      {localUserdata.role?.name === "Facilitator" && (
                        <div className="px-4 py-3 text-xs ">
                          <div className=" p-4 flex items-center justify-between">
                            <div>
                              <div className="flex items-center gap-3">
                                {isFetchingUserData ? (
                                  <div className="w-12 h-9 flex items-center justify-center"></div>
                                ) : (
                                  <span className="text-xs font-bold text-white">
                                    Referral code :
                                    {localUserdata.referral_code
                                      ? localUserdata.referral_code
                                      : ""}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <Link href="/settings">
                  <button
                    className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsModalOpen(false)}
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 20 20"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="flex-shrink-0"
                    >
                      <path
                        d="M17.7647 5.95108L17.3534 5.23725C17.0423 4.69739 16.8868 4.42746 16.6222 4.31982C16.3575 4.21219 16.0582 4.29712 15.4596 4.46699L14.4427 4.7534C14.0606 4.84154 13.6596 4.79154 13.3107 4.61225L13.0299 4.45027C12.7307 4.25861 12.5005 3.97603 12.3731 3.64387L12.0948 2.81272C11.9118 2.2627 11.8203 1.9877 11.6025 1.8304C11.3847 1.6731 11.0954 1.6731 10.5167 1.6731H9.58775C9.00916 1.6731 8.71983 1.6731 8.50199 1.8304C8.2842 1.9877 8.19271 2.2627 8.00974 2.81272L7.73144 3.64387C7.60404 3.97603 7.37387 4.25861 7.07464 4.45027L6.7939 4.61225C6.44494 4.79154 6.04399 4.84154 5.66181 4.7534L4.64495 4.46699C4.04634 4.29712 3.74704 4.21219 3.48239 4.31982C3.21774 4.42746 3.0622 4.69739 2.75112 5.23725L2.3398 5.95108C2.04821 6.45712 1.90241 6.71015 1.93071 6.9795C1.959 7.24885 2.15419 7.4659 2.54455 7.90002L3.40375 8.86059C3.61374 9.12642 3.76284 9.58975 3.76284 10.0063C3.76284 10.4231 3.6138 10.8863 3.40377 11.1522L2.54455 12.1128C2.15419 12.5469 1.95901 12.7639 1.93071 13.0333C1.90241 13.3027 2.04821 13.5557 2.3398 14.0617L2.75111 14.7755C3.06219 15.3153 3.21774 15.5853 3.48239 15.6929C3.74704 15.8006 4.04634 15.7157 4.64497 15.5458L5.66178 15.2593C6.04402 15.1712 6.44505 15.2213 6.79405 15.4006L7.07474 15.5626C7.37392 15.7543 7.60403 16.0368 7.73141 16.3689L8.00974 17.2002C8.19271 17.7502 8.2842 18.0252 8.50199 18.1825C8.71983 18.3398 9.00916 18.3398 9.58775 18.3398H10.5167C11.0954 18.3398 11.3847 18.3398 11.6025 18.1825C11.8203 18.0252 11.9118 17.7502 12.0948 17.2002L12.3732 16.3689C12.5005 16.0368 12.7306 15.7543 13.0298 15.5626L13.3105 15.4006C13.6595 15.2213 14.0605 15.1712 14.4427 15.2593L15.4596 15.5458C16.0582 15.7157 16.3575 15.8006 16.6222 15.6929C16.8868 15.5853 17.0423 15.3153 17.3534 14.7755L17.7647 14.0617C18.0563 13.5557 18.2021 13.3027 18.1738 13.0333C18.1455 12.7639 17.9503 12.5469 17.56 12.1128L16.7007 11.1522C16.4907 10.8863 16.3417 10.4231 16.3417 10.0063C16.3417 9.58975 16.4908 9.12642 16.7007 8.86059L17.56 7.90002C17.9503 7.4659 18.1455 7.24885 18.1738 6.9795C18.2021 6.71015 18.0563 6.45712 17.7647 5.95108Z"
                        stroke="black"
                        strokeWidth="1.25"
                        strokeLinecap="round"
                      />
                      <path
                        d="M12.9329 9.99992C12.9329 11.6108 11.6271 12.9166 10.0163 12.9166C8.40542 12.9166 7.09961 11.6108 7.09961 9.99992C7.09961 8.38909 8.40542 7.08325 10.0163 7.08325C11.6271 7.08325 12.9329 8.38909 12.9329 9.99992Z"
                        stroke="black"
                        strokeWidth="1.25"
                      />
                    </svg>
                    <span>
                      {t("accountSetting", currentLanguage as LanguageCode)}
                    </span>
                  </button>
                </Link>
                <Link href="/help">
                  <button
                    className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsModalOpen(false)}
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 20 20"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="flex-shrink-0"
                    >
                      <path
                        d="M2.0835 9.99992C2.0835 6.26797 2.0835 4.40199 3.24286 3.24262C4.40224 2.08325 6.26821 2.08325 10.0002 2.08325C13.7321 2.08325 15.5981 2.08325 16.7575 3.24262C17.9168 4.40199 17.9168 6.26797 17.9168 9.99992C17.9168 13.7318 17.9168 15.5978 16.7575 16.7573C15.5981 17.9166 13.7321 17.9166 10.0002 17.9166C6.26821 17.9166 4.40224 17.9166 3.24286 16.7573C2.0835 15.5978 2.0835 13.7318 2.0835 9.99992Z"
                        stroke="#141B34"
                        strokeWidth="1.25"
                      />
                      <path
                        d="M8.3335 7.49992C8.3335 6.57944 9.07966 5.83325 10.0002 5.83325C10.9207 5.83325 11.6668 6.57944 11.6668 7.49992C11.6668 7.83171 11.5699 8.14086 11.4027 8.40059C10.9047 9.17467 10.0002 9.91275 10.0002 10.8333V11.2499"
                        stroke="#141B34"
                        strokeWidth="1.25"
                        strokeLinecap="round"
                      />
                      <path
                        d="M9.99316 14.1667H10.0007"
                        stroke="#141B34"
                        strokeWidth="1.66667"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span>{t("help", currentLanguage as LanguageCode)}</span>
                  </button>
                </Link>

                <button
                  className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                  onClick={() => {
                    setIsModalOpen(false);
                    handleLogout();
                  }}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 21 21"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="flex-shrink-0"
                  >
                    <path
                      d="M12.75 4.25C12.703 3.157 12.565 2.46 12.152 1.924C11.9923 1.71591 11.8061 1.52966 11.598 1.37C10.788 0.75 9.613 0.75 7.263 0.75H6.762C3.928 0.75 2.511 0.75 1.63 1.629C0.75 2.507 0.75 3.922 0.75 6.75V13.75C0.75 16.578 0.75 17.993 1.63 18.871C2.51 19.749 3.928 19.75 6.762 19.75H7.262C9.613 19.75 10.788 19.75 11.598 19.13C11.8073 18.9693 11.992 18.7847 12.152 18.576C12.565 18.04 12.703 17.343 12.75 16.25M18.75 10.25H6.75M16.25 13.75C16.25 13.75 19.75 11.172 19.75 10.25C19.75 9.328 16.25 6.75 16.25 6.75"
                      stroke="#D03710"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span>{t("logout", currentLanguage as LanguageCode)}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

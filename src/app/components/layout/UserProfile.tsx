import React from "react";
import { Session } from "next-auth";
import { handleImageError } from "@/app/utils/imageUtils";
import { MeResponse } from "@/app/types/global";
import { useState, useEffect } from "react";

interface UserProfileProps {
  session: Session | null;
  isSidebarOpen: boolean;
}

const UserProfile: React.FC<UserProfileProps> = ({
  session,
  isSidebarOpen,
}) => {
  // All hooks must be called before any conditional returns
  const [localUserdata, setLocalUserdata] = useState<MeResponse>(() => {
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
      referral_code:null
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

  // Update localStorage data when available
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedData = localStorage.getItem("userData");
      if (storedData) {
        try {
          const parsedData = JSON.parse(storedData);
          if (
            typeof parsedData === "object" &&
            "id" in parsedData &&
            "first_name" in parsedData
          ) {
            setLocalUserdata(parsedData as MeResponse);
          }
        } catch (error) {
          console.error("Failed to parse userData from localStorage:", error);
        }
      }
    }
  }, []);

  // Conditional rendering AFTER all hooks
  if (!session?.user) {
    return isSidebarOpen ? (
      <p className="text-gray-600">Not signed in</p>
    ) : null;
  }

  const { user } = session;

  return (
    <div className="flex items-center space-x-2">
      {isSidebarOpen && (
        <>
          <img
            src={
              localUserdata.profile_picture
                ? localUserdata.profile_picture
                : "/default-avatar.png"
            }
            alt="Profile"
            className="h-8 w-8 rounded-full"
            onError={(e) => handleImageError(e, "/default-avatar.png")}
          />
          <div>
            <p className="text-sm font-medium text-white truncate max-w-[140px]">{user.name || user.username}</p>
            <p className="text-xs text-sky-200 truncate">{user.role || " "}</p>
          </div>
        </>
      )}
    </div>
  );
};

export default UserProfile;

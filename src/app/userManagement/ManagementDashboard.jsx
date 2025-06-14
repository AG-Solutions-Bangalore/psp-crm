import React, { useContext, useState, useMemo, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Checkbox } from "@material-tailwind/react";
import axios from "axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ContextPanel } from "@/lib/ContextPanel";
import BASE_URL from "@/config/BaseUrl";
import Page from "../dashboard/page";
import {
  ErrorComponent,
  LoaderComponent,
  WithoutErrorComponent,
  WithoutLoaderComponent,
} from "@/components/LoaderComponent/LoaderComponent";

const ManagementDashboard = () => {
  const { id } = useParams();
  const userId = Number(id);
  const queryClient = useQueryClient();
  const { getStaticUsers, fetchPagePermission, fetchPermissions } =
    useContext(ContextPanel);
  const staticUsers = getStaticUsers();
  const [buttonPermissions, setButtonPermissions] = useState([]);
  const [pagePermissions, setPagePermissions] = useState([]);

  // Fetch button permissions
  const {
    data: buttonControlData,
    isLoading: isLoadingButtons,
    isError: isErrorButtons,
  } = useQuery({
    queryKey: ["usercontrol"],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${BASE_URL}/api/panel-fetch-usercontrol`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data.buttonPermissions;
    },
  });

  // Mutation for updating button permissions
  const updateButtonPermissionMutation = useMutation({
    mutationFn: async ({ permissionId, updatedData }) => {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `${BASE_URL}/api/panel-update-usercontrol/${permissionId}`,
        updatedData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["usercontrol"]);
      fetchPermissions();
    },
    onError: (error) => {
      console.error("Error updating button permissions:", error);
      setButtonPermissions(buttonControlData);
    },
  });

  // Mutation for updating page permissions
  const updatePagePermissionMutation = useMutation({
    mutationFn: async ({ permissionId, updatedData }) => {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `${BASE_URL}/api/panel-update-usercontrol-new/${permissionId}`,
        updatedData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["usercontrol-pages"]);
      fetchPagePermission();
    },
    onError: (error) => {
      console.error("Error updating page permissions:", error);
      setPagePermissions(pageControlData);
    },
  });

  // Fetch page permissions
  const {
    data: pageControlData,
    isLoading: isLoadingPages,
    isError: isErrorPages,
  } = useQuery({
    queryKey: ["usercontrol-pages"],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${BASE_URL}/api/panel-fetch-usercontrol-new`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data.pagePermissions;
    },
  });

  useEffect(() => {
    if (buttonControlData) {
      setButtonPermissions(buttonControlData);
    }
  }, [buttonControlData]);

  useEffect(() => {
    if (pageControlData) {
      setPagePermissions(pageControlData);
    }
  }, [pageControlData]);

  const user = staticUsers.find((u) => u.id === userId);

  const pages = useMemo(
    () => [...new Set(pagePermissions.map((p) => p.page))],
    [pagePermissions]
  );

  const handleButtonPermissionChange = async (
    button,
    isChecked,
    permissionId
  ) => {
    try {
      const currentPermission = buttonPermissions.find(
        (permission) => permission.id === permissionId
      );
      if (!currentPermission) return;

      const newUserIds = isChecked
        ? [...currentPermission.userIds, userId.toString()]
        : currentPermission.userIds.filter((id) => id !== userId.toString());

      const userIdsAsString = newUserIds.join(",");

      const updatedData = {
        pages: currentPermission.pages,
        button: currentPermission.button,
        status: "Active",
        userIds: userIdsAsString,
      };

      const updatedPermissions = buttonPermissions.map((permission) => {
        if (permission.id === permissionId) {
          return { ...permission, userIds: newUserIds };
        }
        return permission;
      });
      setButtonPermissions(updatedPermissions);

      await updateButtonPermissionMutation.mutateAsync({
        permissionId,
        updatedData,
      });
    } catch (error) {
      console.error("Error updating button permissions:", error);
    }
  };

  const handlePagePermissionChange = async (page, isChecked) => {
    try {
      const currentPermission = pagePermissions.find(
        (permission) => permission.page === page
      );
      if (!currentPermission) return;

      const newUserIds = isChecked
        ? [...currentPermission.userIds, userId.toString()]
        : currentPermission.userIds.filter((id) => id !== userId.toString());

      const userIdsAsString = newUserIds.join(",");

      const updatedData = {
        page: currentPermission.page,
        url: currentPermission.url,
        status: "Active",
        userIds: userIdsAsString,
      };

      const updatedPermissions = pagePermissions.map((permission) => {
        if (permission.page === page) {
          return { ...permission, userIds: newUserIds };
        }
        return permission;
      });
      setPagePermissions(updatedPermissions);

      await updatePagePermissionMutation.mutateAsync({
        permissionId: currentPermission.id,
        updatedData,
      });
    } catch (error) {
      console.error("Error updating page permissions:", error);
    }
  };

  if (!user) {
    return (
      <Page>
        <div className="container mx-auto p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg text-red-600">No User Found</div>
          </div>
        </div>
      </Page>
    );
  }

  if (isLoadingButtons || isLoadingPages) {
    return <LoaderComponent name="user management Data" />; // ✅ Correct prop usage
  }

  // Render error state
  if (isErrorPages || isErrorButtons) {
    return <ErrorComponent message="Error Teuser managementam Data" />;
  }
  return (
    <Page>
      <div className="container mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">{user.name}</h2>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-sm capitalize ${
                  user.user_type === 1
                    ? "bg-red-100 text-red-800"
                    : user.user_type === 2
                    ? "bg-blue-100 text-blue-800"
                    : user.user_type === 3
                    ? "bg-green-100 text-green-800"
                    : user.user_type === 4
                    ? "bg-purple-100 text-purple-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {user.user_type === 1
                  ? "User"
                  : user.user_type === 2
                  ? "Admin"
                  : user.user_type === 3
                  ? "Superadmin"
                  : user.user_type === 4
                  ? "Superadmins"
                  : "N/A"}
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {pages.map((page) => {
              const pagePermissionsForPage = pagePermissions.filter(
                (p) => p.page === page
              );

              return (
                <div key={page} className="mb-8">
                  {pagePermissionsForPage.map((permission) => (
                    <div key={permission.id} className="mb-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-xl font-semibold">
                            {permission.page}
                          </h3>
                          {/* Display the URL here */}
                          <p className="text-sm text-gray-600">
                            URL: {permission.url}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">
                            Page Access:
                          </span>
                          <Checkbox
                            color="blue"
                            checked={permission.userIds.includes(
                              userId.toString()
                            )}
                            onChange={(e) =>
                              handlePagePermissionChange(
                                permission.page,
                                e.target.checked
                              )
                            }
                            className="h-5 w-5"
                          />
                        </div>
                      </div>

                      {/* Button Permissions */}
                      {buttonPermissions.some((p) => p.pages === page) && (
                        <div className="bg-gray-200 rounded-lg p-4 mt-4">
                          <table className="w-full">
                            <thead>
                              <tr>
                                <th className="text-left pb-2 font-semibold text-gray-700">
                                  Button
                                </th>
                                <th className="text-left pb-2 font-semibold text-gray-700">
                                  Access
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {buttonPermissions
                                .filter((p) => p.pages === page)
                                .map((permission) => (
                                  <tr
                                    key={permission.id}
                                    className="border-t border-gray-200"
                                  >
                                    <td className="py-3 w-96">
                                      {permission.button}
                                    </td>
                                    <td className="py-3">
                                      <Checkbox
                                        color="blue"
                                        checked={permission.userIds.includes(
                                          userId.toString()
                                        )}
                                        onChange={(e) =>
                                          handleButtonPermissionChange(
                                            permission.button,
                                            e.target.checked,
                                            permission.id
                                          )
                                        }
                                        className="h-5 w-5 bg-white"
                                      />
                                    </td>
                                  </tr>
                                ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Page>
  );
};

export default ManagementDashboard;

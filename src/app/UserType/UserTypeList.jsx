import { LoaderComponent } from "@/components/LoaderComponent/LoaderComponent";
import BASE_URL from "@/config/BaseUrl";
import { encryptId } from "@/utils/encyrption/Encyrption";
import axios from "axios";
import { ChevronDown, ChevronUp, Edit } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Page from "../dashboard/page";

const UserTypeList = () => {
  const [userTypeData, setUserTypeData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedRows, setExpandedRows] = useState({});
  const navigate = useNavigate();

  const fetchUserTypeData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(`${BASE_URL}/api/panel-fetch-usertype`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUserTypeData(response.data?.userType || []);
    } catch (error) {
      console.error("Error fetching userType data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserTypeData();
  }, []);

  const toggleRow = (id) => {
    setExpandedRows((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const formatRoleList = (roles) => {
    if (!roles) return "N/A";
    return roles.split(",").map((role) => (
      <span
        key={role}
        className="inline-block bg-green-100 rounded px-2 py-1 m-1 text-sm"
      >
        {role.trim()}
      </span>
    ));
  };

  if (loading) {
    return <LoaderComponent name="UserType Data" />; // ✅ Correct prop usage
  }

  return (
    <Page>
      <div className="max-w-screen p-4">
        <div className="flex text-left text-2xl text-gray-800 font-[400] my-6">
          User Type List
        </div>

        <div className="overflow-x-auto bg-white shadow-md rounded-lg">
          <table className="min-w-full border-collapse border border-gray-200">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2 text-left">User Type</th>

                <th className="border p-2 text-left">Role</th>
                <th className="border p-2 text-left">User Position</th>
                <th className="border p-2 text-left">Default Button</th>
                <th className="border p-2 text-left">Default Page</th>
                <th className="border p-2 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {userTypeData.length > 0 ? (
                userTypeData.map((user) => (
                  <React.Fragment key={user.id}>
                    <tr className="border-b hover:bg-gray-50">
                      <td className="border p-2">{user.user_type}</td>
                      <td className="border p-2">{user.user_role}</td>
                      <td className="border p-2">{user.user_position}</td>
                      <td className="border p-2">
                        {user.default_button_role ? (
                          <div className="flex items-center space-x-2">
                            <span className="truncate max-w-xs">
                              {expandedRows[`button-${user.id}`]
                                ? user.default_button_role
                                : `${user.default_button_role.slice(0, 50)}...`}
                            </span>
                            <button
                              onClick={() => toggleRow(`button-${user.id}`)}
                              className="text-gray-600 hover:text-gray-800"
                            >
                              {expandedRows[`button-${user.id}`] ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        ) : (
                          "N/A"
                        )}
                      </td>
                      <td className="border p-2">
                        {user.default_page_role ? (
                          <div className="flex items-center space-x-2">
                            <span className="truncate max-w-xs">
                              {expandedRows[`page-${user.id}`]
                                ? user.default_page_role
                                : `${user.default_page_role.slice(0, 50)}...`}
                            </span>
                            <button
                              onClick={() => toggleRow(`page-${user.id}`)}
                              className="text-gray-600 hover:text-gray-800"
                            >
                              {expandedRows[`page-${user.id}`] ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        ) : (
                          "N/A"
                        )}
                      </td>
                      <td className="border p-2 text-center ">
                        <button
                          // onClick={() => navigate(`/edit-user-type/${user.id}`)}
                          onClick={() => {
                            const encryptedId = encryptId(user.id);

                            navigate(
                              `/edit-user-type/${encodeURIComponent(
                                encryptedId
                              )}`
                            );
                          }}
                          className="text-black hover:text-blue-700 flex items-center justify-center"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                    {expandedRows[`button-${user.id}`] &&
                      user.default_button_role && (
                        <tr>
                          <td colSpan="5" className="border p-4 bg-gray-50">
                            <div className="font-semibold mb-2">
                              Default Button Roles:
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {formatRoleList(user.default_button_role)}
                            </div>
                          </td>
                        </tr>
                      )}
                    {expandedRows[`page-${user.id}`] &&
                      user.default_page_role && (
                        <tr>
                          <td colSpan="5" className="border p-4 bg-gray-50">
                            <div className="font-semibold mb-2">
                              Default Page Roles:
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {formatRoleList(user.default_page_role)}
                            </div>
                          </td>
                        </tr>
                      )}
                  </React.Fragment>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="border p-2 text-center">
                    No data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Page>
  );
};

export default UserTypeList;

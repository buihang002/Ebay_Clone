import axiosInstance from "./axiosInstance";

export async function getUsers() {
  const response = await axiosInstance.get("/users");
  return response.data;
}

export async function getUserById(id) {
  const response = await axiosInstance.get(`/users/${id}`);
  return response.data;
}

export async function getUsersByRole(role) {
  const response = await axiosInstance.get(`/users`, { params: { role } });
  return response.data;
}

export async function deleteUser(userId) {
  try {
    const response = await axiosInstance.delete(`/users/${userId}`);
    return response.status === 200;
  } catch (error) {
    console.error("Error deleting user:", error);
    return false;
  }
}

export async function registerUser(userData) {
  try {
    const newUser = {
      ...userData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      storeInfo:
        userData.role === "seller"
          ? {
              name: userData.storeInfo?.name || "New Store",
              description:
                userData.storeInfo?.description || "Store Description",
              rating: 0,
              totalSales: 0,
            }
          : undefined,
    };
    const response = await axiosInstance.post("/users", newUser);
    return response.status === 201;
  } catch (error) {
    console.error("Registration error:", error);
    return false;
  }
}

import type {
  CreateUserData,
  PaginatedResponse,
  QueryParams,
  UpdateUserData,
  UserItem,
} from "./types";

const seedUsers: UserItem[] = [
  {
    id: 1,
    name: "张三",
    email: "zhangsan@example.com",
    role: "管理员",
    status: "active",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=zhangsan",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: 2,
    name: "李四",
    email: "lisi@example.com",
    role: "编辑",
    status: "active",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=lisi",
    createdAt: "2024-01-02T00:00:00Z",
    updatedAt: "2024-01-02T00:00:00Z",
  },
  {
    id: 3,
    name: "王五",
    email: "wangwu@example.com",
    role: "用户",
    status: "inactive",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=wangwu",
    createdAt: "2024-01-03T00:00:00Z",
    updatedAt: "2024-01-03T00:00:00Z",
  },
  {
    id: 4,
    name: "赵六",
    email: "zhaoliu@example.com",
    role: "用户",
    status: "pending",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=zhaoliu",
    createdAt: "2024-01-04T00:00:00Z",
    updatedAt: "2024-01-04T00:00:00Z",
  },
  {
    id: 5,
    name: "钱七",
    email: "qianqi@example.com",
    role: "编辑",
    status: "active",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=qianqi",
    createdAt: "2024-01-05T00:00:00Z",
    updatedAt: "2024-01-05T00:00:00Z",
  },
  {
    id: 6,
    name: "孙八",
    email: "sunba@example.com",
    role: "用户",
    status: "inactive",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sunba",
    createdAt: "2024-01-06T00:00:00Z",
    updatedAt: "2024-01-06T00:00:00Z",
  },
  {
    id: 7,
    name: "周九",
    email: "zhoujiu@example.com",
    role: "管理员",
    status: "active",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=zhoujiu",
    createdAt: "2024-01-07T00:00:00Z",
    updatedAt: "2024-01-07T00:00:00Z",
  },
  {
    id: 8,
    name: "吴十",
    email: "wushi@example.com",
    role: "用户",
    status: "pending",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=wushi",
    createdAt: "2024-01-08T00:00:00Z",
    updatedAt: "2024-01-08T00:00:00Z",
  },
  {
    id: 9,
    name: "郑十一",
    email: "zhengshiyi@example.com",
    role: "编辑",
    status: "active",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=zhengshiyi",
    createdAt: "2024-01-09T00:00:00Z",
    updatedAt: "2024-01-09T00:00:00Z",
  },
];

let users = [...seedUsers];

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const userApi = {
  async getUsers(params: QueryParams = {}): Promise<PaginatedResponse<UserItem>> {
    await delay(450);

    let filteredUsers = [...users];

    if (params.search) {
      const q = params.search.toLowerCase();
      filteredUsers = filteredUsers.filter(
        (user) =>
          user.name.toLowerCase().includes(q) ||
          user.email.toLowerCase().includes(q),
      );
    }

    if (params.status) {
      filteredUsers = filteredUsers.filter((user) => user.status === params.status);
    }

    if (params.role) {
      filteredUsers = filteredUsers.filter((user) => user.role === params.role);
    }

    const page = params.page || 1;
    const pageSize = params.pageSize || 10;
    const start = (page - 1) * pageSize;
    const paginatedUsers = filteredUsers.slice(start, start + pageSize);

    return {
      data: paginatedUsers,
      total: filteredUsers.length,
      page,
      pageSize,
      totalPages: Math.ceil(filteredUsers.length / pageSize),
    };
  },

  async getUser(id: number): Promise<UserItem> {
    await delay(300);
    const user = users.find((u) => u.id === id);
    if (!user) {
      throw new Error("用户不存在");
    }
    return user;
  },

  async createUser(data: CreateUserData): Promise<UserItem> {
    await delay(500);

    const newUser: UserItem = {
      id: Math.max(0, ...users.map((u) => u.id)) + 1,
      ...data,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(data.name)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    users = [...users, newUser];
    return newUser;
  },

  async updateUser(data: UpdateUserData): Promise<UserItem> {
    await delay(400);

    const index = users.findIndex((u) => u.id === data.id);
    if (index === -1) {
      throw new Error("用户不存在");
    }

    const updatedUser: UserItem = {
      ...users[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };

    users = users.map((user, i) => (i === index ? updatedUser : user));
    return updatedUser;
  },

  async deleteUser(id: number): Promise<void> {
    await delay(350);

    const exists = users.some((u) => u.id === id);
    if (!exists) {
      throw new Error("用户不存在");
    }

    users = users.filter((u) => u.id !== id);
  },
};

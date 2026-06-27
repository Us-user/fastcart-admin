export interface Role {
  id: string;
  name: string;
}

export interface UserListItem {
  id: string;
  userName: string;
  email: string | null;
  phoneNumber: string | null;
  roles: string[];
  createdAt: string | null;
}

export interface UserDetail extends UserListItem {
  firstName: string | null;
  lastName: string | null;
}

export interface AssignRoleRequest {
  roleId: string;
}

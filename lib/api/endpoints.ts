export const API = {
    AUTH: {
        LOGIN: 'http://localhost:5000/api/auth/login',
        REGISTER: 'http://localhost:5000/api/auth/register',
        LOGOUT: 'http://localhost:5000/api/auth/logout',
    },
    ADMIN: {
        USERS: 'http://localhost:5000/api/admin/users',
        USER_BY_ID: (id: string) => `http://localhost:5000/api/admin/users/${id}`,
    }
}
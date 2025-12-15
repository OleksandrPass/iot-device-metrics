export type LoginFormData = {
    email: string;
    password: string;
};

export type UserResponse = {
    token: string;
    user: {
        id: string;
        username: string;
        email: string;
    }
};
export interface User {
    email: string;
    profile: {
        first_name: string;
        last_name: string;
    };
    role: string;
}

export const userState = $state<{ me: User | null }>({
    me: null
});

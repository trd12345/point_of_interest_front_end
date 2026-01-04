export interface User {
    id: string;
    email: string;
    role: string;
    email_verified_at: string | null;
    profile: {
        first_name: string;
        last_name: string;
    };
}

export const userState = $state<{ me: User | null; restored: boolean }>({
    me: null,
    restored: false,
});

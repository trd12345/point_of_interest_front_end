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

class UserState {
    #me = $state<User | null>(null);
    #restored = $state(false);
    #loading = $state(true);

    get me() { return this.#me; }
    set me(value) { this.#me = value; }

    get restored() { return this.#restored; }
    set restored(value) { this.#restored = value; }

    get loading() { return this.#loading; }
    set loading(value) { this.#loading = value; }
}

export const userState = new UserState();

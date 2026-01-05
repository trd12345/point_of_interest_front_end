export interface User {
    id: string;
    email: string;
    role: string;
    email_verified_at: string | null;
    profile: {
        first_name: string;
        last_name: string;
        contact_email?: string | null;
        contact_phone?: string | null;
    };
}

class UserState {
    #me = $state<User | null>(null);
    #restored = $state(false);
    #loading = $state(true);

    get me() { return this.#me; }
    set me(value) { this.#me = value; }

    get maskedName() {
        if (!this.#me?.profile) return "";
        const firstInitial = this.#me.profile.first_name?.[0] || "";
        return `${firstInitial}. ${this.#me.profile.last_name}`;
    }

    get restored() { return this.#restored; }
    set restored(value) { this.#restored = value; }

    get loading() { return this.#loading; }
    set loading(value) { this.#loading = value; }
}

export const userState = new UserState();

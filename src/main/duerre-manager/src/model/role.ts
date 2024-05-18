export enum Role {
    HANDLE_DIE, HANDLE_ORDER, HANDLE_APP
}
export enum User {
    WORKER, SECRETARY
}

export class CompleteRole {
    constructor(
        public readonly role: Role,
        public readonly description: string,
    ) { }
}
export const roles: { [key: string]: CompleteRole } = {
    HANDLE_DIE: new CompleteRole(Role.HANDLE_DIE, "gestione stampi"),
    HANDLE_ORDER: new CompleteRole(Role.HANDLE_ORDER, "gestione ordini"),
    HANDLE_APP: new CompleteRole(Role.HANDLE_APP, "gestione applicazione"),
}

export class CompleteUser {
    constructor(
        public readonly name: User,
        public readonly roles: CompleteRole[],
        public readonly fullName: string,
        public readonly icon: string,
    ) { }

    public getDescription(): string {
        return "Abilità le seguenti funzionalità: " + this.roles.map(r => r.description).join(", ");
    }

    public hasRole(role: Role): boolean {
        return !!this.roles.find(r => r.role == role);
    }
}
export class UserHandler {
    constructor(
        public readonly users: CompleteUser[]
    ) { }

    getCompleteUser(user?: User) {
        return this.users.find(u => u.name == user);
    }
}

export const userHandler: UserHandler = new UserHandler([
    new CompleteUser(
        User.SECRETARY,
        [roles[Role[Role.HANDLE_ORDER]]],
        "Segretaria",
        "mdi-chair-rolling"
    ),
    new CompleteUser(
        User.WORKER,
        Object.values<CompleteRole>(roles),
        "Operaio",
        "mdi-account-hard-hat"
    ),
]);
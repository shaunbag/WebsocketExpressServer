export type User = {
    name: string;
    id: number;
}

export type Message = {
    type:string;
    from: User;
    content: string;
    createdAt: Date;
    reactions: string[];
}

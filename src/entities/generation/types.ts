export type TechStack = "react-ts" | "react" | "vanilla"

export interface Generation {
    id: string
    prompt: string
    code: string
    techStack: TechStack
    createdAt: Date
    isFavorite: boolean
}

export interface GenerateRequest {
    prompt: string
    techStack: TechStack
}
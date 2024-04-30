export interface Anchor {
    index: number;
    __type: string;
    anchor: string;
}

export interface Submission {
    correctness: number;
    count: number;
    label: string;
    data: Object;
    //item: SolutionItem;
}

interface Suggestion {
    correctness: number;
    confidence: number;
    label: string;
    data: Object;
}

export interface Solution {
    anchor: Anchor;
    suggestions: Suggestion[];
    submissions: Submission[];
}

export interface Submenu {
    label: string;
    data: any;
    icon: any;
    action: any;
    subMenu: Submenu[];
}
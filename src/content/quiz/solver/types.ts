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

export interface Suggestion {
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

type AutoFill = (data: Submenu)=> any;
export interface WidgetAnchor {
    button: HTMLElement;
    onClick: AutoFill;
}
// /**
// * @typedef  SolutionItem Represents single menu option (or answer option)
// * @type     {Object}
// * @property {string} label String representation of answer option
// * @property {Object} data  Question-specific data required to perform autofill
// */

//@property {SolutionItem} item        More detailed information about specific answer option



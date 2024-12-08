import Question from "../../../content/quiz/questions/Question"
import * as Strings from "../../../shared/utils/strings"
import * as Images from "../../../shared/utils/images"
import MagicButton from "../../../shared/widgets/MagicButton"
import {Anchor} from "../solver/types";

export function createMultichoiceRadioAnchor(anchor: Anchor, tag: HTMLDivElement, options: {
    [key: string]: HTMLInputElement
}) {
    const button = new MagicButton().element;
    tag.appendChild(button);

    const onClick = (data) => {
        let choice = options[data.anchor[0]];
        console.log("options", options);
        console.log("data", data);

        // Try to find similar node in case
        // the text of the question has changed
        if (!choice) {
            const candidate = Strings.findSimilar(data.anchor[0], Object.keys(options));

            if (!candidate) {
                return;
            }

            choice = options[candidate];
        }

        choice.checked = true;
    }

    return {onClick, button};
}

export function createMultichoiceCheckboxAnchor(anchor: Anchor, tag: HTMLDivElement, options: {
    [key: string]: HTMLInputElement
}) {
    const button = new MagicButton().element;
    let choice = options[anchor.anchor];
    // Try to find similar nodes in case
    // the text of the question has changed
    console.log("options:", options);
    console.log("anchor_string:", anchor.anchor);
    if (!choice) {
        const candidate = Strings.findSimilar(anchor.anchor, Object.keys(options));

        if (!candidate) {
            console.log("Could not find such answer:", anchor.anchor);
            return {
                onClick: (data: any) => {
                }, button
            };
        }

        choice = options[candidate];
    }


    choice.parentNode.insertBefore(button, choice.nextSibling);
    const onClick = (data) => {
        choice.checked = data.checked;//data.checked;
        //console.log(data)
    }

    return {onClick, button};
}

class Multichoice extends Question {
    container: any;
    private options: {};
    private type: any;
    questionType: string;
    private answer: any;

    constructor(args: { container: HTMLDivElement; }) {
        super(args);

        const answer = this.container.querySelector("div.answer");
        const inputs = answer.querySelectorAll("input[type=\"radio\"], input[type=\"checkbox\"]");

        this.options = {};
        this.answer = answer;
        this.type = inputs[0].type;
        this.questionType = "multichoice";

        for (const input of inputs) {
            const label = input.nextSibling;

            const sign = [
                Strings.removeInvisible(label.lastChild.textContent) || "[NO TEXT]",
                Images.serializeArray(label.querySelectorAll("img"))
            ];

            this.options[sign.join(";")] = input;
        }
    }

    createWidgetAnchor(anchor: Anchor) {
        if (this.type == "radio")
            return createMultichoiceRadioAnchor(anchor, this.answer, this.options);
        else if (this.type == "checkbox")
            return createMultichoiceCheckboxAnchor(anchor, this.answer, this.options);
        return null;
    }
}

export default Multichoice;